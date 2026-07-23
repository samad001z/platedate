-- Plate Date, migration 2: the ordering flow.
-- Adds payment method, a short public reference code, a minimum order value,
-- and a limited public lookup for the confirmation page.

create type payment_method as enum ('upi', 'cod');

alter table orders
  add column payment_method payment_method not null default 'cod',
  add column reference_code text not null unique;

-- old signature is replaced (new args + new return shape)
drop function if exists public.create_order(text, text, text, date, text, uuid, text, text, jsonb);

-- The ONLY public write path for orders. Validates everything server-side,
-- prices every line from the live menu, enforces the minimum order value,
-- re-checks capacity under a per-date advisory lock, and generates both the
-- internal order number and the short public reference (PD-XXXXX).
create or replace function public.create_order(
  p_customer_name text,
  p_phone text,
  p_email text,
  p_delivery_date date,
  p_delivery_slot text,
  p_area_id uuid,
  p_address text,
  p_notes text,
  p_payment_method text,
  p_items jsonb
) returns table (order_id uuid, order_number text, reference_code text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_default_daily_capacity constant int := 6;
  v_min_order_paise constant int := 50000; -- keep in sync with MIN_ORDER_PAISE in lib/site.ts
  v_ref_alphabet constant text := '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  v_is_blackout boolean;
  v_max_orders int;
  v_booked int;
  v_days_ahead int;
  v_subtotal int := 0;
  v_fee int := 0;
  v_order_id uuid;
  v_order_number text;
  v_reference text;
  v_seq text;
  v_line jsonb;
  v_mi menu_items%rowtype;
  v_variant menu_item_variants%rowtype;
  v_qty int;
  v_try int;
begin
  if p_customer_name is null or btrim(p_customer_name) = '' then
    raise exception 'NAME_REQUIRED';
  end if;
  if p_phone is null or p_phone !~ '^[6-9][0-9]{9}$' then
    raise exception 'PHONE_INVALID';
  end if;
  if p_address is null or length(btrim(p_address)) < 10 then
    raise exception 'ADDRESS_REQUIRED';
  end if;
  if p_payment_method not in ('upi', 'cod') then
    raise exception 'PAYMENT_METHOD_INVALID';
  end if;
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'ORDER_EMPTY';
  end if;
  if p_delivery_date < current_date then
    raise exception 'DATE_IN_PAST';
  end if;

  perform pg_advisory_xact_lock(hashtext('plate-date-capacity-' || p_delivery_date::text));

  select coalesce(c.is_blackout, false), coalesce(c.max_orders, v_default_daily_capacity)
    into v_is_blackout, v_max_orders
  from (select 1) one
  left join capacity c on c.date = p_delivery_date;

  if v_is_blackout then
    raise exception 'DATE_CLOSED';
  end if;

  select count(*) into v_booked
  from orders o
  where o.delivery_date = p_delivery_date and o.order_status <> 'cancelled';

  if v_booked >= v_max_orders then
    raise exception 'DATE_FULL';
  end if;

  v_days_ahead := p_delivery_date - current_date;

  for v_line in select * from jsonb_array_elements(p_items) loop
    select * into v_mi
    from menu_items
    where id = (v_line ->> 'menu_item_id')::uuid and is_active;

    if not found then
      raise exception 'ITEM_UNAVAILABLE';
    end if;
    if v_mi.lead_time_hours > v_days_ahead * 24 then
      raise exception 'LEAD_TIME:%', v_mi.name;
    end if;

    v_qty := coalesce((v_line ->> 'quantity')::int, 1);
    if v_qty < v_mi.min_quantity then
      raise exception 'MIN_QTY:%', v_mi.name;
    end if;

    if (v_line ->> 'variant_id') is not null then
      select * into v_variant
      from menu_item_variants
      where id = (v_line ->> 'variant_id')::uuid and menu_item_id = v_mi.id;
      if not found then
        raise exception 'VARIANT_INVALID';
      end if;
      v_subtotal := v_subtotal + v_variant.price_paise * v_qty;
    else
      v_subtotal := v_subtotal + v_mi.price_paise * v_qty;
    end if;
  end loop;

  if v_subtotal < v_min_order_paise then
    raise exception 'MIN_ORDER:%', v_min_order_paise - v_subtotal;
  end if;

  if p_area_id is not null then
    select fee_paise into v_fee
    from delivery_areas
    where id = p_area_id and is_active;
    if not found then
      raise exception 'AREA_INVALID';
    end if;
  end if;

  -- short public reference: PD- + 5 chars, no 0/O/1/I/L
  v_try := 0;
  loop
    v_reference := 'PD-' || (
      select string_agg(substr(v_ref_alphabet, (floor(random() * 31))::int + 1, 1), '')
      from generate_series(1, 5)
    );
    exit when not exists (select 1 from orders o where o.reference_code = v_reference);
    v_try := v_try + 1;
    if v_try > 10 then
      raise exception 'REFERENCE_EXHAUSTED';
    end if;
  end loop;

  v_seq := nextval('order_number_seq')::text;
  v_order_number := 'PD-'
    || to_char(now() at time zone 'Asia/Kolkata', 'YYMMDD')
    || '-' || lpad(v_seq, greatest(length(v_seq), 4), '0');

  insert into orders (
    order_number, reference_code, customer_name, phone, email,
    delivery_date, delivery_slot, area_id, address,
    payment_method, subtotal_paise, delivery_fee_paise, total_paise, notes
  ) values (
    v_order_number, v_reference, btrim(p_customer_name), p_phone,
    nullif(btrim(coalesce(p_email, '')), ''),
    p_delivery_date, p_delivery_slot, p_area_id, btrim(p_address),
    p_payment_method::payment_method,
    v_subtotal, v_fee, v_subtotal + v_fee, nullif(btrim(coalesce(p_notes, '')), '')
  ) returning id into v_order_id;

  for v_line in select * from jsonb_array_elements(p_items) loop
    select * into v_mi from menu_items where id = (v_line ->> 'menu_item_id')::uuid;
    v_qty := coalesce((v_line ->> 'quantity')::int, 1);

    if (v_line ->> 'variant_id') is not null then
      select * into v_variant
      from menu_item_variants where id = (v_line ->> 'variant_id')::uuid;
      insert into order_items (order_id, menu_item_id, item_name, unit_price_paise, quantity, line_note)
      values (v_order_id, v_mi.id, v_mi.name || ' (' || v_variant.label || ')',
              v_variant.price_paise, v_qty, v_line ->> 'line_note');
    else
      insert into order_items (order_id, menu_item_id, item_name, unit_price_paise, quantity, line_note)
      values (v_order_id, v_mi.id, v_mi.name, v_mi.price_paise, v_qty, v_line ->> 'line_note');
    end if;
  end loop;

  return query select v_order_id, v_order_number, v_reference;
end;
$$;

grant execute on function public.create_order(text, text, text, date, text, uuid, text, text, text, jsonb)
  to anon, authenticated;

-- Public confirmation lookup: everything the confirmation page shows and
-- nothing more. No phone, no email, no street address; the reference is the
-- only key. Returns null when the reference does not exist.
create or replace function public.get_order_by_reference(p_reference text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'reference_code', o.reference_code,
    'customer_name', o.customer_name,
    'created_at', o.created_at,
    'delivery_date', o.delivery_date,
    'delivery_slot', o.delivery_slot,
    'area_name', da.name,
    'order_status', o.order_status,
    'payment_status', o.payment_status,
    'payment_method', o.payment_method,
    'subtotal_paise', o.subtotal_paise,
    'delivery_fee_paise', o.delivery_fee_paise,
    'total_paise', o.total_paise,
    'items', (
      select jsonb_agg(
        jsonb_build_object(
          'name', oi.item_name,
          'quantity', oi.quantity,
          'unit_price_paise', oi.unit_price_paise
        ) order by oi.item_name
      )
      from order_items oi where oi.order_id = o.id
    )
  )
  from orders o
  left join delivery_areas da on da.id = o.area_id
  where o.reference_code = upper(btrim(p_reference));
$$;

grant execute on function public.get_order_by_reference(text) to anon, authenticated;
