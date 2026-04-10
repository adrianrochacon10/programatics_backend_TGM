import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface CreateReservationRequest {
  id_pantalla: string;
  id_plan: string;
  fecha_inicio: string;
  fecha_fin: string;
  email: string;
  nombre: string;
  telefono: string;
  codigo_descuento?: string | null;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Método no permitido" }),
      {
        status: 405,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }

  let body: CreateReservationRequest;
  try {
    body = (await req.json()) as CreateReservationRequest;
  } catch (_) {
    return new Response(
      JSON.stringify({ success: false, error: "Body JSON inválido" }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }

  const {
    id_pantalla,
    id_plan,
    fecha_inicio,
    fecha_fin,
    email,
    nombre,
    telefono,
    codigo_descuento,
  } = body;

  if (!id_pantalla || !id_plan || !fecha_inicio || !fecha_fin || !email || !nombre || !telefono) {
    return new Response(
      JSON.stringify({
        success: false,
        error:
          "Parámetros requeridos: id_pantalla, id_plan, fecha_inicio, fecha_fin, email, nombre, telefono",
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }

  const startDate = new Date(fecha_inicio);
  const endDate = new Date(fecha_fin);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Formato de fecha inválido. Usa YYYY-MM-DD",
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }

  if (startDate >= endDate) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "fecha_inicio debe ser anterior a fecha_fin",
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }

  try {
    // 1. Validar pantalla
    const { data: pantalla, error: pantallError } = await supabase
      .from("pantallas")
      .select("id, nombre, status")
      .eq("id", id_pantalla)
      .single();

    if (pantallError || !pantalla || pantalla.status !== "active") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Pantalla no encontrada o inactiva",
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    // 2. Validar plan
    const { data: plan, error: planError } = await supabase
      .from("planes")
      .select("id, dias, spots_dia, precio, activo")
      .eq("id", id_plan)
      .single();


    console.log("Plan encontrado:", plan);
    if (planError || !plan || !plan.activo) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Plan no encontrado o inactivo",
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    // 3. Verificar disponibilidad desde disponibilidad_dia
    const { data: diasOcupados, error: dispError } = await supabase
      .from("disponibilidad_dia")
      .select("dia, spots_disponibles")
      .eq("id_pantalla", id_pantalla)
      .gte("dia", fecha_inicio)
      .lte("dia", fecha_fin)
      .eq("status_dia", "lleno");

    if (dispError) throw dispError;

    if (diasOcupados && diasOcupados.length > 0) {
      const diaLleno = diasOcupados[0].dia;
      return new Response(
        JSON.stringify({
          success: false,
          error: `No hay disponibilidad el ${diaLleno}. Día lleno.`,
        }),
        {
          status: 409,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    // 4. Crear reservación + venta + descuento en una sola transacción SQL
    const normalizedCoupon =
      typeof codigo_descuento === "string" && codigo_descuento.trim().length > 0
        ? codigo_descuento.trim().toUpperCase()
        : null;

    const { data: id_reservacion, error: txError } = await supabase.rpc(
      "crear_reservacion_transaccion",
      {
        p_id_pantalla: id_pantalla,
        p_id_plan: id_plan,
        p_fecha_inicio: fecha_inicio,
        p_fecha_fin: fecha_fin,
        p_email: email.trim().toLowerCase(),
        p_nombre: nombre.trim(),
        p_telefono: telefono.trim(),
        p_codigo_descuento: normalizedCoupon,
      },
    );

    if (txError || !id_reservacion) {
      throw txError || new Error("Error al crear reservación en transacción");
    }

    const dayCount =
      Math.floor(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      ) + 1;

    const { data: reservationData } = await supabase
      .from("reservaciones")
      .select("status, estado_pago, monto_total, monto_con_descuento, codigo_descuento")
      .eq("id", id_reservacion)
      .single();

    return new Response(
      JSON.stringify({
        success: true,
        id_reservacion,
        reservation_id: id_reservacion,
        details: {
          pantalla: pantalla.nombre,
          contacto: {
            email: email.trim().toLowerCase(),
            nombre: nombre.trim(),
            telefono: telefono.trim(),
          },
          fecha_inicio,
          fecha_fin,
          dias: dayCount,
          precio_total: reservationData?.monto_total ?? plan.precio,
          precio_final: reservationData?.monto_con_descuento ?? plan.precio,
          codigo_descuento: reservationData?.codigo_descuento ?? normalizedCoupon,
          status: reservationData?.status ?? "pendiente",
          estado_pago: reservationData?.estado_pago ?? "pendiente",
        },
      }),
      {
        status: 201,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Error interno del servidor",
        details: errorMessage,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }
});
