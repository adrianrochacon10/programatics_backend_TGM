import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface CreateReservationRequest {
  id_pantalla: string;
  id_plan: string;
  fecha_inicio: string; // YYYY-MM-DD
  fecha_fin: string; // YYYY-MM-DD
  // id_usuario: string;
}

interface ReservationResponse {
  success: boolean;
  reservation_id?: string;
  error?: string;
  details?: string;
}

serve(async (req: Request) => {
  // CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
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

  // Validar parámetros requeridos
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

  // Validar fechas
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
    // 1. Validar que la pantalla existe y está activa
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

    // 2. Validar que el plan existe
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

    // 3. Validar que el usuario existe
    // const { data: usuario, error: usuarioError } = await supabase
    //   .from("usuarios")
    //   .select("id, email")
    //   .eq("id", id_usuario)
    //   .single();

    // if (usuarioError || !usuario) {
    //   return new Response(
    //     JSON.stringify({ success: false, error: "Usuario no encontrado" }),
    //     {
    //       status: 404,
    //       headers: {
    //         "Content-Type": "application/json",
    //         "Access-Control-Allow-Origin": "*",
    //       },
    //     },
    //   );
    // }

    // 4. Verificar disponibilidad (máx 6 spots por día)
    const { data: reservacionesExistentes, error: queryError } = await supabase
      .from("reservaciones")
      .select("id, fecha_inicio, fecha_fin")
      .eq("id_pantalla", id_pantalla)
      .in("status", ["active", "pagado"]);

    if (queryError) {
      throw queryError;
    }

    // Contar spots ocupados por día en el rango solicitado
    const spotsOcupados: Record<string, number> = {};

    if (reservacionesExistentes) {
      for (const res of reservacionesExistentes) {
        const currentDate = new Date(res.fecha_inicio);
        while (currentDate <= new Date(res.fecha_fin)) {
          const dateStr = currentDate.toISOString().split("T")[0];
          spotsOcupados[dateStr] = (spotsOcupados[dateStr] || 0) + 1;
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }
    }

    // Verificar que no hay más de 6 spots ocupados en ningún día
    const currentDate = new Date(fecha_inicio);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const ocupados = spotsOcupados[dateStr] || 0;

      if (ocupados >= 6) {
        return new Response(
          JSON.stringify({
            success: false,
            error: `No hay disponibilidad el ${dateStr}. Máximo 6 spots por día.`,
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

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // 5. Crear reservación
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

    // 6. Actualizar disponibilidad_dia
    const availabilityUpdates: Array<{
      dia: string;
      id_reservacion: string;
      id_pantalla: string;
      limite_maximo: number;
      status_dia: string;
    }> = [];
    const currentDate2 = new Date(fecha_inicio);
    let dayCount = 0;

    while (currentDate2 <= endDate) {
      const dateStr = currentDate2.toISOString().split("T")[0];
      availabilityUpdates.push({
        dia: dateStr,
        id_reservacion: newReservation.id,
        limite_maximo: 6,
        status_dia: "reservado",
      });
      dayCount++;
      currentDate2.setDate(currentDate2.getDate() + 1);
    }

    if (availabilityUpdates.length > 0) {
      const { error: updateError } = await supabase
        .from("disponibilidad_dia")
        .insert(availabilityUpdates);

      if (updateError) {
        // Si falla, eliminar la reservación creada
        await supabase
          .from("reservaciones")
          .delete()
          .eq("id", newReservation.id);
        throw updateError;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        reservation_id: newReservation.id,
        details: {
          pantalla: pantalla.nombre,
          // usuario: usuario.email,
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
