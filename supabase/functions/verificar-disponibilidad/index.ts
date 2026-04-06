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
    return new Response(JSON.stringify({ error: "Método no permitido" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { id, fecha_inicio, fecha_fin } = (await req.json()) as AvailabilityRequest;

  if (!id || !fecha_inicio || !fecha_fin) {
    return new Response(
      JSON.stringify({
        error: "Parámetros requeridos: id, fecha_inicio, fecha_fin",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    // Validar que la pantalla existe y está activa
    const { data: pantalla, error: pantallError } = await supabase
      .from("pantallas")
      .select("id, nombre, status")
      .eq("id", id)
      .single();

    if (pantallError || !pantalla || pantalla.status !== "active") {
      return new Response(
        JSON.stringify({ error: "Pantalla no encontrada o inactiva" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Contar reservaciones activas por día
    const diasDisponibles: Record<string, number> = {};

    // Inicializar todos los días con 6 spots disponibles
    const startDate = new Date(fecha_inicio);
    const endDate = new Date(fecha_fin);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split("T")[0];
      diasDisponibles[dateStr] = 6; // Máximo 6 spots por día
    }

    // Restar reservaciones activas
    const { data: reservaciones, error: reservacionesError } = await supabase
      .from("reservaciones")
      .select("fecha_inicio, fecha_fin, status")
      .eq("id_pantalla", id)
      .in("status", ["active", "pagado"]);

    if (reservacionesError) {
      throw reservacionesError;
    }

    // Filtrar reservaciones que se superponen con el rango solicitado
    const reservacionesEnRango = reservaciones?.filter((res: {fecha_inicio: string; fecha_fin: string}) => {
      const resStart = new Date(res.fecha_inicio);
      const resEnd = new Date(res.fecha_fin);
      // Dos rangos se superponen si: start1 <= end2 AND end1 >= start2
      return startDate <= resEnd && endDate >= resStart;
    }) || [];

    // Calcular spots ocupados por día
    if (reservacionesEnRango.length > 0) {
      for (const res of reservacionesEnRango) {
        const currentDate = new Date(res.fecha_inicio);
        while (currentDate <= new Date(res.fecha_fin)) {
          const dateStr = currentDate.toISOString().split("T")[0];
          if (diasDisponibles[dateStr] !== undefined) {
            diasDisponibles[dateStr]--;
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
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
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor", details: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
