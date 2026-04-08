import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
};

interface ValidarCuponRequest {
  codigo: string;
  id_reservacion: string;
}

interface Cupon {
  id: string;
  codigo: string;
  porcentaje_descuento: number;
  activo: boolean;
  fecha_expiracion: string | null;
  usos_maximos: number | null;
  usos_actuales: number;
}

interface Reservacion {
  id: string;
  monto_total: number;
  estado_pago: string;
  codigo_descuento: string | null;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        ...headers,
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Método no permitido" }),
      { status: 405, headers },
    );
  }

  let body;
  try {
    body = await req.json();
  } catch (_) {
    return new Response(
      JSON.stringify({ success: false, error: "Body JSON inválido" }),
      { status: 400, headers },
    );
  }

  // ── 6.4: DESESTRUCTURAR Y VALIDAR PARÁMETROS ──
  const { codigo, id_reservacion } = body as ValidarCuponRequest;

  // Validar parámetros requeridos
  if (!codigo || !id_reservacion) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Parámetros requeridos: codigo, id_reservacion",
      }),
      { status: 400, headers },
    );
  }

  // Validar formato de código
  if (typeof codigo !== "string" || codigo.trim().length === 0) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "El código debe ser una cadena de texto válida",
      }),
      { status: 400, headers },
    );
  }

  // ── 6.5: TRY-CATCH PARA LÓGICA PRINCIPAL ──
  try {
    // ── PASO 1: Validar que la reservación exista ──
    const { data: reservacion, error: resError } = await supabase
      .from("reservaciones")
      .select("id, monto_total, estado_pago, codigo_descuento")
      .eq("id", id_reservacion)
      .single();

    if (resError || !reservacion) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Reservación no encontrada",
        }),
        { status: 404, headers },
      );
    }

    // ── PASO 2: Validar que no esté pagada ──
    if (reservacion.estado_pago === "pagado") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "No se puede aplicar cupón a una reservación ya pagada",
        }),
        { status: 409, headers },
      );
    }

    // ── PASO 3: Validar que el cupón exista ──
    const { data: cupon, error: cuponError } = await supabase
      .from("cupones")
      .select("id, codigo, porcentaje_descuento, activo, fecha_expiracion, usos_maximos, usos_actuales")
      .ilike("codigo", codigo.toUpperCase())
      .single();

    if (cuponError || !cupon) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Código de cupón inválido o no existe",
          valido: false,
        }),
        { status: 404, headers },
      );
    }

    // ── PASO 4: Validaciones de lógica de negocio ──

    // Validar que el cupón esté activo
    if (!cupon.activo) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Este cupón ya no está disponible",
          valido: false,
        }),
        { status: 409, headers },
      );
    }

    // Validar que no esté expirado
    if (cupon.fecha_expiracion) {
      const fechaExpiracion = new Date(cupon.fecha_expiracion);
      const hoy = new Date();
      if (hoy > fechaExpiracion) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Este cupón ha expirado",
            valido: false,
          }),
          { status: 409, headers },
        );
      }
    }

    // Validar usos máximos
    if (cupon.usos_maximos !== null && cupon.usos_actuales >= cupon.usos_maximos) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Este cupón ha alcanzado el máximo de usos",
          valido: false,
        }),
        { status: 409, headers },
      );
    }

    // Validar que no tenga otro cupón aplicado
    if (reservacion.codigo_descuento && reservacion.codigo_descuento !== cupon.codigo) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Esta reservación ya tiene un cupón aplicado",
          cupon_actual: reservacion.codigo_descuento,
          valido: false,
        }),
        { status: 409, headers },
      );
    }

    // ── PASO 5: Calcular descuento ──
    const montoOriginal = Number(reservacion.monto_total);
    const descuentoAplicado = Math.floor(montoOriginal * (cupon.porcentaje_descuento / 100));
    const montoFinal = montoOriginal - descuentoAplicado;

    // ── PASO 6: Actualizar reservación con descuento ──
    const { error: updateError } = await supabase
      .from("reservaciones")
      .update({
        codigo_descuento: cupon.codigo,
        monto_con_descuento: montoFinal,
      })
      .eq("id", id_reservacion);

    if (updateError) {
      throw updateError;
    }

    // ── PASO 7: Incrementar usos del cupón ──
    const { error: usosError } = await supabase.rpc("incrementar_usos_cupon", {
      p_id_cupon: cupon.id,
    });

    if (usosError) {
      console.warn("Advertencia: No se pudo registrar el uso del cupón", usosError);
    }

    // ── PASO 8: RESPUESTA EXITOSA ──
    return new Response(
      JSON.stringify({
        success: true,
        valido: true,
        cupon_codigo: cupon.codigo,
        porcentaje_descuento: cupon.porcentaje_descuento,
        monto_original: montoOriginal,
        descuento_aplicado: descuentoAplicado,
        monto_final: montoFinal,
        ahorro: `$${descuentoAplicado}`,
      }),
      { status: 200, headers },
    );
  } catch (error) {
    // ── 6.6: ERROR HANDLING ──
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";

    console.error("[validar-cupon] Error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: "Error interno del servidor",
        details: errorMessage,
      }),
      { status: 500, headers },
    );
  }
});