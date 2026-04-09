import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface Planes {
  id: string;
  nombre_paquete: string;
  spots_totales: number;
  dias: number;
  precio: number;
  spots_dia: string;
  activo: boolean;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (req.method !== "GET") {
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

  try {
    // Obtener parámetros de query (opcionales)
    const url = new URL(req.url);
    const id_plan = url.searchParams.get("id_plan");
    const nombre = url.searchParams.get("nombre_plan");
    const status = url.searchParams.get("activo") || "true";

    // Construir query base
    let query = supabase
      .from("planes")
      .select("*")
      .eq("activo", activo);

    // Aplicar filtros opcionales
    if (id_plan) {
      query = query.eq("id", id_pantalla);
    }
    if (nombre_plan) {
      query = query.ilike("nombre", `%${nombre_plan}%`);
    }

    const { data: planes, error } = await query;

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({
        success: true,
        count: planes?.length || 0,
        data: planes,
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
        success: false,
        error: "Error al obtener Planes",
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
