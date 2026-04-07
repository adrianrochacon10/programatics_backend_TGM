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

  const { id_pantalla, id_plan, fecha_inicio, fecha_fin } =
    (await req.json()) as CreateReservationRequest;

  if (!id_pantalla || !id_plan || !fecha_inicio || !fecha_fin) {
    return new Response(
      JSON.stringify({
        success: false,
        error:
          "Parámetros requeridos: id_pantalla, id_plan, fecha_inicio, fecha_fin",
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

    // 4. Crear reservación
    const { data: newReservation, error: createError } = await supabase
      .from("reservaciones")
      .insert({
        id_pantalla,
        id_plan,
        fecha_inicio,
        fecha_fin,
        status: "pendiente",
      })
      .select("id")
      .single();

    if (createError || !newReservation) {
      throw createError || new Error("Error al crear reservación");
    }

    // 5. Decrementar spots por cada día usando función SQL atómica
    let dayCount = 0;
    const currentDate = new Date(fecha_inicio);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split("T")[0];

      const { error: rpcError } = await supabase.rpc("decrementar_spot", {
        p_pantalla: id_pantalla,
        p_dia: dateStr,
      });

      if (rpcError) {
        // Rollback: eliminar reservación creada
        await supabase
          .from("reservaciones")
          .delete()
          .eq("id", newReservation.id);
        throw rpcError;
      }

      dayCount++;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return new Response(
      JSON.stringify({
        success: true,
        reservation_id: newReservation.id,
        details: {
          pantalla: pantalla.nombre,
          fecha_inicio,
          fecha_fin,
          dias: dayCount,
          precio_total: plan.precio,
          status: "pendiente",
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
