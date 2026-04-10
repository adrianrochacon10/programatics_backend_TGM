create or replace function crear_reservacion_transaccion(
    p_id_pantalla text,
    p_id_plan uuid,
    p_fecha_inicio date,
    p_fecha_fin date,
    p_email text,
    p_nombre text,
    p_telefono text,
    p_codigo_descuento text
)
returns uuid
language plpgsql
as $$
declare
    v_reservacion_id uuid;
    v_precio_plan numeric;
    v_total numeric;
    v_descuento integer;
    v_total_final numeric;
begin

    -- obtener precio del plan
    select precio into v_precio_plan
    from planes
    where id = p_id_plan;

    v_total := v_precio_plan;

    -- aplicar cupón si existe
    if p_codigo_descuento is not null then
        select porcentaje_descuento into v_descuento
        from cupones
        where codigo = p_codigo_descuento
        and activo = true;

        if v_descuento is not null then
            v_total_final := v_total - (v_total * v_descuento / 100);

            update cupones
            set usos_actuales = usos_actuales + 1
            where codigo = p_codigo_descuento;
        else
            v_total_final := v_total;
        end if;
    else
        v_total_final := v_total;
    end if;

    -- crear reservacion
    insert into reservaciones(
        id_pantalla,
        id_plan,
        fecha_inicio,
        fecha_fin,
        monto_total,
        monto_con_descuento,
        codigo_descuento
    )
    values(
        p_id_pantalla,
        p_id_plan,
        p_fecha_inicio,
        p_fecha_fin,
        v_total,
        v_total_final,
        p_codigo_descuento
    )
    returning id into v_reservacion_id;

    -- crear venta
    insert into ventas(
        id,
        id_pantalla,
        id_reservacion,
        email_contacto,
        nombre_contacto,
        telefono_contacto,
        fecha_inicio,
        fecha_fin
    )
    values(
        gen_random_uuid(),
        p_id_pantalla,
        v_reservacion_id,
        p_email,
        p_nombre,
        p_telefono,
        p_fecha_inicio,
        p_fecha_fin
    );

    return v_reservacion_id;

end;
$$;