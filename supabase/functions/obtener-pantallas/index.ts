import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface Pantalla {
  id: string;
  nombre: string;
  direccion: string;
  url_direccion: string;
  lat: number;
  lng: number;
  resolucion: string;
  hora_inicio: string;
  hora_fin: string;
  impactos: number;
  precio: number;
  status: string;
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
    const id_pantalla = url.searchParams.get("id_pantalla");
    const nombre = url.searchParams.get("nombre");
    const status = url.searchParams.get("status") || "active";

    // Construir query base
    let query = supabase
      .from("pantallas")
      .select("*")
      .eq("status", status);

    // Aplicar filtros opcionales
    if (id_pantalla) {
      query = query.eq("id", id_pantalla);
    }
    if (nombre) {
      query = query.ilike("nombre", `%${nombre}%`);
    }

    const { data: pantallas, error } = await query;

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({
        success: true,
        count: pantallas?.length || 0,
        data: pantallas,
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
        error: "Error al obtener pantallas",
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
