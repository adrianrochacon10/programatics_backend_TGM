import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const MP_ACCESS_TOKEN = Deno.env.get("MP_ACCESS_TOKEN")!;

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        ...headers,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
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
      JSON.stringify({ success: false, error: "Body inválido" }),
      { status: 400, headers },
    );
  }

  const {
    token,
    id_reservacion,
    monto,
    installments,
    payment_method_id,
    payer_email,
  } = body;

  if (!token || !id_reservacion || !monto || !payer_email) {
    return new Response(
      JSON.stringify({ success: false, error: "Faltan parámetros requeridos" }),
      { status: 400, headers },
    );
  }

  // ── PASO 5: Validar que la reservación existe y no está pagada ──
  const { data: reservacion, error: resError } = await supabase
    .from("reservaciones")
    .select("id, monto_total, estado_pago")
    .eq("id", id_reservacion)
    .single();

  if (resError || !reservacion) {
    return new Response(
      JSON.stringify({ success: false, error: "Reservación no encontrada" }),
      { status: 404, headers },
    );
  }

  if (reservacion.estado_pago === "pagado") {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Esta reservación ya fue pagada",
      }),
      { status: 409, headers },
    );
  }

  if (Number(reservacion.monto_total) !== Number(monto)) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "El monto no coincide con la reservación",
      }),
      { status: 400, headers },
    );
  }

  // ── PASO 6: Crear el pago en Mercado Pago ──
  let mpResponse;
  try {
    const mpRes = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
        "X-Idempotency-Key": id_reservacion, // ← PASO 9: evita duplicados
      },
      body: JSON.stringify({
        transaction_amount: Number(monto),
        token,
        installments: installments ?? 1,
        payment_method_id,
        payer: { email: payer_email },
      }),
    });

    mpResponse = await mpRes.json();

    if (!mpResponse || typeof mpResponse !== "object") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Respuesta inválida de Mercado Pago",
        }),
        { status: 502, headers },
      );
    }

    console.log("[Info] MP Response:", JSON.stringify(mpResponse));
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Error al conectar con Mercado Pago",
      }),
      { status: 502, headers },
    );
  }

  // ── PASO 8: Manejar errores de MP ──
  if (mpResponse.status === "rejected" || mpResponse.error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Pago rechazado",
        detalle:
          mpResponse.status_detail ??
          mpResponse.message ??
          "Intenta con otra tarjeta",
        reintentable: true,
      }),
      { status: 402, headers },
    );
  }

  const { error: updateError } = await supabase
    .from("reservaciones")
    .update({
      estado_pago: mpResponse.status,
      mp_payment_id: String(mpResponse.id),
    })
    .eq("id", id_reservacion);

  if (updateError) {
    console.error(
      "Error al actualizar reservación:",
      JSON.stringify(updateError),
    );
    return new Response(
      JSON.stringify({
        success: true,
        payment_id: mpResponse.id,
        status: mpResponse.status,
        status_detail: mpResponse.status_detail,
        warning:
          "Pago procesado pero error al actualizar BD: " + updateError.message,
      }),
      { status: 201, headers },
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      payment_id: mpResponse.id,
      status: mpResponse.status,
      status_detail: mpResponse.status_detail,
    }),
    { status: 201, headers },
  );
});
