-- Plate Date — initial schema
-- Money is ALWAYS integer paise. Never floats, never numeric rupees.

-- ---------------------------------------------------------------- enums

create type order_status as enum
  ('new', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled');

create type payment_status as enum
  ('pending', 'paid', 'refunded');

create type enquiry_status as enum
  ('new', 'replied', 'converted', 'closed');

create type enquiry_kind as enum
  ('party', 'bulk', 'custom');

-- ---------------------------------------------------------------- catalogue

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sort_order int not null default 0,
  is_active boolean not null default true
);

create table menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories(id),
  name text not null,
  slug text not null unique,
  description text,
  price_paise int not null check (price_paise >= 0),
  image_url text,
  is_active boolean not null default true,
  is_hero boolean not null default false,
  sort_order int not null default 0,
  lead_time_hours int not null default 24 check (lead_time_hours >= 0),
  min_quantity int not null default 1 check (min_quantity >= 1),
  serves_count int check (serves_count >= 1)
);

create index menu_items_category_idx on menu_items (category_id, sort_order);

create table menu_item_variants (
  id uuid primary key default gen_random_uuid(),
  menu_item_id uuid not null references menu_items(id) on delete cascade,
  label text not null,
  price_paise int not null check (price_paise >= 0),
  sort_order int not null default 0
);

create index menu_item_variants_item_idx on menu_item_variants (menu_item_id);

create table dietary_tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null
);

create table menu_item_dietary_tags (
  menu_item_id uuid not null references menu_items(id) on delete cascade,
  dietary_tag_id uuid not null references dietary_tags(id) on delete cascade,
  primary key (menu_item_id, dietary_tag_id)
);

create index menu_item_dietary_tags_tag_idx on menu_item_dietary_tags (dietary_tag_id);

-- ---------------------------------------------------------------- capacity

-- rows are overrides; an absent date means "open, default capacity"
-- (default lives in create_order / get_date_availability below)
create table capacity (
  date date primary key,
  max_orders int not null default 6 check (max_orders >= 0),
  is_blackout boolean not null default false,
  note text
);

-- ---------------------------------------------------------------- festivals

create table festival_menus (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  starts_on date not null,
  ends_on date not null,
  hero_copy text,
  is_published boolean not null default false,
  check (ends_on >= starts_on)
);

create table festival_menu_items (
  festival_id uuid not null references festival_menus(id) on delete cascade,
  menu_item_id uuid not null references menu_items(id) on delete cascade,
  festival_price_paise int check (festival_price_paise >= 0),
  sort_order int not null default 0,
  primary key (festival_id, menu_item_id)
);

create index festival_menu_items_item_idx on festival_menu_items (menu_item_id);

-- ---------------------------------------------------------------- delivery

create table delivery_areas (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  fee_paise int not null default 0 check (fee_paise >= 0),
  is_active boolean not null default true
);

-- ---------------------------------------------------------------- orders

create sequence order_number_seq;

create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_name text not null,
  phone text not null,
  email text,
  delivery_date date not null,
  delivery_slot text,
  area_id uuid references delivery_areas(id),
  address text not null,
  order_status order_status not null default 'new',
  payment_status payment_status not null default 'pending',
  subtotal_paise int not null check (subtotal_paise >= 0),
  delivery_fee_paise int not null default 0 check (delivery_fee_paise >= 0),
  total_paise int not null check (total_paise >= 0),
  notes text,
  created_at timestamptz not null default now()
);

create index orders_delivery_date_idx on orders (delivery_date);
create index orders_status_idx on orders (order_status);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  -- snapshot columns: history must never change when the menu does
  menu_item_id uuid references menu_items(id) on delete set null,
  item_name text not null,
  unit_price_paise int not null check (unit_price_paise >= 0),
  quantity int not null default 1 check (quantity >= 1),
  line_note text
);

create index order_items_order_idx on order_items (order_id);

-- ---------------------------------------------------------------- enquiries

create table enquiries (
  id uuid primary key default gen_random_uuid(),
  kind enquiry_kind not null default 'party',
  name text not null,
  phone text not null,
  event_date date,
  headcount int check (headcount >= 1),
  budget_paise int check (budget_paise >= 0),
  message text,
  status enquiry_status not null default 'new',
  created_at timestamptz not null default now()
);

create index enquiries_status_idx on enquiries (status);

-- ---------------------------------------------------------------- RLS

alter table categories enable row level security;
alter table menu_items enable row level security;
alter table menu_item_variants enable row level security;
alter table dietary_tags enable row level security;
alter table menu_item_dietary_tags enable row level security;
alter table capacity enable row level security;
alter table festival_menus enable row level security;
alter table festival_menu_items enable row level security;
alter table delivery_areas enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table enquiries enable row level security;

-- public catalogue reads (active/published rows only)
create policy "anon read active categories"
  on categories for select to anon using (is_active);

create policy "anon read active menu items"
  on menu_items for select to anon using (is_active);

create policy "anon read variants of active items"
  on menu_item_variants for select to anon
  using (exists (
    select 1 from menu_items mi
    where mi.id = menu_item_variants.menu_item_id and mi.is_active
  ));

create policy "anon read dietary tags"
  on dietary_tags for select to anon using (true);

create policy "anon read tags of active items"
  on menu_item_dietary_tags for select to anon
  using (exists (
    select 1 from menu_items mi
    where mi.id = menu_item_dietary_tags.menu_item_id and mi.is_active
  ));

create policy "anon read capacity"
  on capacity for select to anon using (true);

create policy "anon read published festivals"
  on festival_menus for select to anon using (is_published);

create policy "anon read items of published festivals"
  on festival_menu_items for select to anon
  using (exists (
    select 1 from festival_menus f
    where f.id = festival_menu_items.festival_id and f.is_published
  ));

create policy "anon read active delivery areas"
  on delivery_areas for select to anon using (is_active);

-- public writes: enquiries only. Orders go through the create_order RPC
-- below (security definer) so prices, capacity and lead times are enforced
-- server-side; there is NO direct anon insert on orders/order_items.
create policy "anon create enquiries"
  on enquiries for insert to anon with check (status = 'new');

-- admin (any authenticated user — only Rhea gets an account): everything
create policy "admin all categories" on categories
  for all to authenticated using (true) with check (true);
create policy "admin all menu items" on menu_items
  for all to authenticated using (true) with check (true);
create policy "admin all variants" on menu_item_variants
  for all to authenticated using (true) with check (true);
create policy "admin all dietary tags" on dietary_tags
  for all to authenticated using (true) with check (true);
create policy "admin all item tags" on menu_item_dietary_tags
  for all to authenticated using (true) with check (true);
create policy "admin all capacity" on capacity
  for all to authenticated using (true) with check (true);
create policy "admin all festivals" on festival_menus
  for all to authenticated using (true) with check (true);
create policy "admin all festival items" on festival_menu_items
  for all to authenticated using (true) with check (true);
create policy "admin all delivery areas" on delivery_areas
  for all to authenticated using (true) with check (true);
create policy "admin all orders" on orders
  for all to authenticated using (true) with check (true);
create policy "admin all order items" on order_items
  for all to authenticated using (true) with check (true);
create policy "admin all enquiries" on enquiries
  for all to authenticated using (true) with check (true);

-- ---------------------------------------------------------------- RPCs

-- Public capacity view without exposing order rows: how full is each day?
create or replace function public.get_date_availability(p_from date, p_to date)
returns table (day date, is_blackout boolean, max_orders int, orders_booked bigint)
language sql
stable
security definer
set search_path = public
as $$
  select
    d.day::date,
    coalesce(c.is_blackout, false),
    coalesce(c.max_orders, 6),
    (
      select count(*) from orders o
      where o.delivery_date = d.day::date and o.order_status <> 'cancelled'
    )
  from generate_series(p_from, p_to, interval '1 day') as d(day)
  left join capacity c on c.date = d.day::date
$$;

-- The ONLY write path for public orders. Validates capacity, lead times and
-- min quantities, prices every line from the live menu (never trusting the
-- client), snapshots name+price into order_items, and returns the order number.
-- p_items: [{ "menu_item_id": uuid, "variant_id"?: uuid, "quantity": int, "line_note"?: text }]
create or replace function public.create_order(
  p_customer_name text,
  p_phone text,
  p_email text,
  p_delivery_date date,
  p_delivery_slot text,
  p_area_id uuid,
  p_address text,
  p_notes text,
  p_items jsonb
) returns table (order_id uuid, order_number text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_default_daily_capacity constant int := 6;
  v_is_blackout boolean;
  v_max_orders int;
  v_booked int;
  v_days_ahead int;
  v_subtotal int := 0;
  v_fee int := 0;
  v_order_id uuid;
  v_order_number text;
  v_seq text;
  v_line jsonb;
  v_mi menu_items%rowtype;
  v_variant menu_item_variants%rowtype;
  v_qty int;
begin
  if p_customer_name is null or btrim(p_customer_name) = '' then
    raise exception 'NAME_REQUIRED';
  end if;
  if p_phone is null or btrim(p_phone) = '' then
    raise exception 'PHONE_REQUIRED';
  end if;
  if p_address is null or btrim(p_address) = '' then
    raise exception 'ADDRESS_REQUIRED';
  end if;
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'ORDER_EMPTY';
  end if;
  if p_delivery_date < current_date then
    raise exception 'DATE_IN_PAST';
  end if;

  -- serialise capacity checks for this date (two simultaneous orders
  -- must not both squeeze into the last slot)
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

  -- price + validate every line from the live menu
  for v_line in select * from jsonb_array_elements(p_items) loop
    select * into v_mi
    from menu_items
    where id = (v_line ->> 'menu_item_id')::uuid and is_active;

    if not found then
      raise exception 'ITEM_UNAVAILABLE';
    end if;
    if v_mi.lead_time_hours > v_days_ahead * 24 then
      raise exception 'LEAD_TIME:%', v_mi.slug;
    end if;

    v_qty := coalesce((v_line ->> 'quantity')::int, 1);
    if v_qty < v_mi.min_quantity then
      raise exception 'MIN_QTY:%', v_mi.slug;
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

  if p_area_id is not null then
    select fee_paise into v_fee
    from delivery_areas
    where id = p_area_id and is_active;
    if not found then
      raise exception 'AREA_INVALID';
    end if;
  end if;

  v_seq := nextval('order_number_seq')::text;
  v_order_number := 'PD-'
    || to_char(now() at time zone 'Asia/Kolkata', 'YYMMDD')
    || '-' || lpad(v_seq, greatest(length(v_seq), 4), '0');

  insert into orders (
    order_number, customer_name, phone, email,
    delivery_date, delivery_slot, area_id, address,
    subtotal_paise, delivery_fee_paise, total_paise, notes
  ) values (
    v_order_number, btrim(p_customer_name), btrim(p_phone), nullif(btrim(coalesce(p_email, '')), ''),
    p_delivery_date, p_delivery_slot, p_area_id, btrim(p_address),
    v_subtotal, v_fee, v_subtotal + v_fee, p_notes
  ) returning id into v_order_id;

  for v_line in select * from jsonb_array_elements(p_items) loop
    select * into v_mi from menu_items where id = (v_line ->> 'menu_item_id')::uuid;
    v_qty := coalesce((v_line ->> 'quantity')::int, 1);

    if (v_line ->> 'variant_id') is not null then
      select * into v_variant
      from menu_item_variants where id = (v_line ->> 'variant_id')::uuid;
      insert into order_items (order_id, menu_item_id, item_name, unit_price_paise, quantity, line_note)
      values (v_order_id, v_mi.id, v_mi.name || ' — ' || v_variant.label,
              v_variant.price_paise, v_qty, v_line ->> 'line_note');
    else
      insert into order_items (order_id, menu_item_id, item_name, unit_price_paise, quantity, line_note)
      values (v_order_id, v_mi.id, v_mi.name, v_mi.price_paise, v_qty, v_line ->> 'line_note');
    end if;
  end loop;

  return query select v_order_id, v_order_number;
end;
$$;

grant execute on function public.get_date_availability(date, date) to anon, authenticated;
grant execute on function public.create_order(text, text, text, date, text, uuid, text, text, jsonb) to anon, authenticated;
