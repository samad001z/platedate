-- Plate Date, seed data (realistic, all-eggless, south Kolkata pricing)
-- Money is integer paise: ₹550 = 55000.
-- Idempotent-ish: run against a fresh database.

-- ---------------------------------------------------------------- tags

insert into dietary_tags (slug, name) values
  ('eggless', '100% eggless'),
  ('jain_no_onion_garlic', 'Jain, no onion, no garlic'),
  ('vegan', 'Vegan'),
  ('gluten_free', 'Gluten-free'),
  ('contains_nuts', 'Contains nuts');

-- ---------------------------------------------------------------- categories

insert into categories (name, slug, sort_order) values
  ('Desserts', 'desserts', 1),
  ('Cakes', 'cakes', 2),
  ('Savoury Bakes', 'savoury-bakes', 3),
  ('Platters', 'platters', 4),
  ('Party Boxes', 'party-boxes', 5);

-- ---------------------------------------------------------------- menu items

insert into menu_items
  (category_id, name, slug, description, price_paise, is_hero, sort_order, lead_time_hours, min_quantity, serves_count)
values
  -- Desserts
  ((select id from categories where slug = 'desserts'),
   'Kolkata''s Best Tiramisu', 'kolkatas-best-tiramisu',
   'The one the DMs are about. Coffee-soaked layers, airy mascarpone cream, dusted dark cocoa, and not an egg in sight.',
   65000, true, 1, 24, 1, 2),
  ((select id from categories where slug = 'desserts'),
   'Brownie Bites Box', 'brownie-bites-box',
   'Nine fudgy, crackle-topped eggless brownie bites. The box that never makes it past the car ride home.',
   55000, true, 2, 24, 1, 4),
  ((select id from categories where slug = 'desserts'),
   'Rasmalai Tres Leches', 'rasmalai-tres-leches',
   'Saffron-milk-soaked sponge with rasmalai cream and a pistachio crown. East meets postre.',
   85000, false, 3, 24, 1, 4),

  -- Cakes
  ((select id from categories where slug = 'cakes'),
   'Chocolate Almond Tea Cake', 'chocolate-almond-tea-cake',
   'Dense, dark and almond-rich, flourless, so it happens to be gluten-free too. Made for chai o''clock.',
   75000, true, 1, 24, 1, 8),
  ((select id from categories where slug = 'cakes'),
   'Dark Chocolate Truffle Cake', 'dark-chocolate-truffle-cake',
   'Layers of eggless chocolate sponge under a glossy dark ganache. The birthday default for a reason.',
   105000, false, 2, 48, 1, 8),
  ((select id from categories where slug = 'cakes'),
   'Fresh Fruit & Cream Cake', 'fresh-fruit-cream-cake',
   'Light vanilla sponge, softly whipped cream and whatever fruit is best at New Market that morning.',
   115000, false, 3, 48, 1, 8),

  -- Savoury Bakes
  ((select id from categories where slug = 'savoury-bakes'),
   'Cheese Chilli Pull-Apart', 'cheese-chilli-pull-apart',
   'Soft milk-bread knots baked around molten cheese and green chilli. Serve warm, watch it vanish.',
   45000, false, 1, 24, 1, 4),
  ((select id from categories where slug = 'savoury-bakes'),
   'Veg Puff Box (6 pieces)', 'veg-puff-box',
   'Flaky handmade puffs with a spiced vegetable filling. Jain filling (no onion, no garlic) on request.',
   48000, false, 2, 24, 2, 3),
  ((select id from categories where slug = 'savoury-bakes'),
   'Spinach & Corn Quiche', 'spinach-corn-quiche',
   'Buttery shortcrust, creamy spinach-corn filling, fully eggless. Brunch table centrepiece.',
   55000, false, 3, 24, 1, 4),

  -- Platters
  ((select id from categories where slug = 'platters'),
   'High-Tea Platter', 'high-tea-platter',
   'Finger sandwiches, mini quiches, tea cake slices and two sweet bites per head. The Sunday-visit flex.',
   160000, false, 1, 48, 1, 6),
  ((select id from categories where slug = 'platters'),
   'Jain Celebration Platter', 'jain-celebration-platter',
   'A full celebration spread with strictly no onion, no garlic, no root vegetables. Built for the family pujo.',
   210000, false, 2, 72, 1, 8),

  -- Party Boxes
  ((select id from categories where slug = 'party-boxes'),
   'Dessert Party Box (24 minis)', 'dessert-party-box',
   'Twenty-four assorted minis, tiramisu cups, brownie bites, cheesecake squares and seasonal surprises.',
   240000, false, 1, 72, 1, 12),
  ((select id from categories where slug = 'party-boxes'),
   'Brownie Party Box (30 bites)', 'brownie-party-box',
   'Thirty brownie bites, three ways: classic fudge, salted caramel and double chocolate.',
   150000, false, 2, 48, 1, 15),
  ((select id from categories where slug = 'party-boxes'),
   'Mini Sandwich & Bakes Box', 'mini-sandwich-bakes-box',
   'Twenty mini sandwiches and ten savoury bakes for the kitty, the meeting or the merciless card party. Jain option available.',
   120000, false, 3, 48, 1, 10);

-- ---------------------------------------------------------------- variants

insert into menu_item_variants (menu_item_id, label, price_paise, sort_order) values
  ((select id from menu_items where slug = 'kolkatas-best-tiramisu'), 'Tub for two', 65000, 1),
  ((select id from menu_items where slug = 'kolkatas-best-tiramisu'), 'Family tub (serves 6)', 165000, 2),
  ((select id from menu_items where slug = 'dark-chocolate-truffle-cake'), 'Half kg', 105000, 1),
  ((select id from menu_items where slug = 'dark-chocolate-truffle-cake'), 'One kg', 195000, 2),
  ((select id from menu_items where slug = 'fresh-fruit-cream-cake'), 'Half kg', 115000, 1),
  ((select id from menu_items where slug = 'fresh-fruit-cream-cake'), 'One kg', 215000, 2);

-- ---------------------------------------------------------------- item tags
-- everything Plate Date makes is eggless

insert into menu_item_dietary_tags (menu_item_id, dietary_tag_id)
select mi.id, dt.id from menu_items mi, dietary_tags dt where dt.slug = 'eggless';

insert into menu_item_dietary_tags (menu_item_id, dietary_tag_id)
select mi.id, dt.id from menu_items mi, dietary_tags dt
where dt.slug = 'jain_no_onion_garlic'
  and mi.slug in ('veg-puff-box', 'high-tea-platter', 'jain-celebration-platter', 'mini-sandwich-bakes-box');

insert into menu_item_dietary_tags (menu_item_id, dietary_tag_id)
select mi.id, dt.id from menu_items mi, dietary_tags dt
where dt.slug = 'contains_nuts'
  and mi.slug in ('rasmalai-tres-leches', 'chocolate-almond-tea-cake', 'dessert-party-box');

insert into menu_item_dietary_tags (menu_item_id, dietary_tag_id)
select mi.id, dt.id from menu_items mi, dietary_tags dt
where dt.slug = 'gluten_free' and mi.slug = 'chocolate-almond-tea-cake';

-- ---------------------------------------------------------------- delivery areas

insert into delivery_areas (name, fee_paise) values
  ('Ballygunge', 0),
  ('Gariahat', 4000),
  ('Southern Avenue', 5000),
  ('Bhawanipore', 6000),
  ('Kasba', 7000),
  ('Alipore', 8000),
  ('New Alipore', 9000);

-- ---------------------------------------------------------------- capacity samples

insert into capacity (date, max_orders, is_blackout, note) values
  (current_date + 3, 2, false, 'Big party booking, only 2 slots left'),
  (current_date + 5, 6, true, 'Kitchen closed, family function');

-- ---------------------------------------------------------------- festival menu

insert into festival_menus (name, slug, starts_on, ends_on, hero_copy, is_published) values
  ('Paryushan Menu 2026', 'paryushan-2026', '2026-09-07', '2026-09-14',
   'Satvik, Jain-friendly plates for the eight days of Paryushan: strictly no onion, no garlic, no root vegetables. Order a day ahead so everything is made fresh that morning.',
   true);

insert into festival_menu_items (festival_id, menu_item_id, festival_price_paise, sort_order) values
  ((select id from festival_menus where slug = 'paryushan-2026'),
   (select id from menu_items where slug = 'jain-celebration-platter'), null, 1),
  ((select id from festival_menus where slug = 'paryushan-2026'),
   (select id from menu_items where slug = 'veg-puff-box'), null, 2),
  ((select id from festival_menus where slug = 'paryushan-2026'),
   (select id from menu_items where slug = 'mini-sandwich-bakes-box'), null, 3),
  ((select id from festival_menus where slug = 'paryushan-2026'),
   (select id from menu_items where slug = 'high-tea-platter'), 150000, 4);

-- ---------------------------------------------------------------- item images
-- Real product photos live in public/menu/<slug>.webp (converted from Images/).
-- High-Tea Platter has no photo yet and keeps the branded plate placeholder.

update menu_items as m
set image_url = v.url
from (values
  ('kolkatas-best-tiramisu', '/menu/kolkatas-best-tiramisu.webp'),
  ('brownie-bites-box', '/menu/brownie-bites-box.webp'),
  ('rasmalai-tres-leches', '/menu/rasmalai-tres-leches.webp'),
  ('chocolate-almond-tea-cake', '/menu/chocolate-almond-tea-cake.webp'),
  ('dark-chocolate-truffle-cake', '/menu/dark-chocolate-truffle-cake.webp'),
  ('fresh-fruit-cream-cake', '/menu/fresh-fruit-cream-cake.webp'),
  ('cheese-chilli-pull-apart', '/menu/cheese-chilli-pull-apart.webp'),
  ('veg-puff-box', '/menu/veg-puff-box.webp'),
  ('spinach-corn-quiche', '/menu/spinach-corn-quiche.webp'),
  ('high-tea-platter', '/menu/high-tea-platter.webp'),
  ('jain-celebration-platter', '/menu/jain-celebration-platter.webp'),
  ('dessert-party-box', '/menu/dessert-party-box.webp'),
  ('brownie-party-box', '/menu/brownie-party-box.webp'),
  ('mini-sandwich-bakes-box', '/menu/mini-sandwich-bakes-box.webp')
) as v(slug, url)
where m.slug = v.slug;
