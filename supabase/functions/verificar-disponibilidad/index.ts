import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface AvailabilityRequest {
  id: string;
  fecha_inicio: string; // YYYY-MM-DD
  fecha_fin: string; // YYYY-MM-DD
}

serve(async (req: Request) => {
  // CORS
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

  const { id, fecha_inicio, fecha_fin } =
    (await req.json()) as AvailabilityRequest;

  if (!id || !fecha_inicio || !fecha_fin) {
    return new Response(
      JSON.stringify({
        error: "Parámetros requeridos: id, fecha_inicio, fecha_fin",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  try {
    // 1. Validar que la pantalla existe y está activa
    const { data: pantalla, error: pantallaError } = await supabase
      .from("pantallas")
      .select("id, nombre, status")
      .eq("id", id)
      .single();

    if (pantallaError || !pantalla || pantalla.status !== "active") {
      return new Response(
        JSON.stringify({ error: "Pantalla no encontrada o inactiva" }),
        { status: 404, headers: { "Content-Type": "application/json" } },
      );
    }

    // 2. Inicializar todos los días con 6 spots disponibles
    const diasDisponibles: Record<string, number> = {};
    const startDate = new Date(fecha_inicio);
    const endDate = new Date(fecha_fin);

    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      const dateStr = d.toISOString().split("T")[0];
      diasDisponibles[dateStr] = 6;
    }

    // 3. Restar reservaciones activas
    const { data: reservaciones, error: reservacionesError } = await supabase
      .from("reservaciones")
      .select("fecha_inicio, fecha_fin, status")
      .eq("id_pantalla", id)
      .in("status", ["active", "pagado"]);

    if (reservacionesError) throw reservacionesError;

    const reservacionesEnRango =
      reservaciones?.filter(
        (res: { fecha_inicio: string; fecha_fin: string }) => {
          const resStart = new Date(res.fecha_inicio);
          const resEnd = new Date(res.fecha_fin);
          return startDate <= resEnd && endDate >= resStart;
        },
      ) || [];

    for (const res of reservacionesEnRango) {
      const currentDate = new Date(res.fecha_inicio);
      while (currentDate <= new Date(res.fecha_fin)) {
        const dateStr = currentDate.toISOString().split("T")[0];
        if (diasDisponibles[dateStr] !== undefined) {
          diasDisponibles[dateStr] = Math.max(0, diasDisponibles[dateStr] - 1);
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    // 4. Sobrescribir con disponibilidad_dia (fuente de verdad final)
    const { data: diasRegistrados, error: diasError } = await supabase
      .from("disponibilidad_dia")
      .select("dia, spots_disponibles")
      .eq("id_pantalla", id)
      .gte("dia", fecha_inicio)
      .lte("dia", fecha_fin);

    if (diasError) throw diasError;

    if (diasRegistrados && diasRegistrados.length > 0) {
      for (const dia of diasRegistrados) {
        diasDisponibles[dia.dia] = dia.spots_disponibles;
      }
    }

    return new Response(
      JSON.stringify({
        id,
        nombre_pantalla: pantalla.nombre,
        disponibilidad: diasDisponibles,
      }),
      {
        status: 200,
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
