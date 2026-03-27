-- ============================================
-- SEED: House Seller Profile + 30 Products
-- LET'S LVL Dubai Fashion & Collectibles Marketplace
-- ============================================

-- Fixed UUID for the house seller account
DO $$
DECLARE
  v_seller_id uuid := 'a0000000-0000-0000-0000-000000000001';
  v_cat_streetwear uuid;
  v_cat_vintage uuid;
  v_cat_sneakers uuid;
  v_cat_tcg uuid;
  v_cat_sports uuid;
  v_cat_activewear uuid;
  v_cat_accessories uuid;
  v_cat_toys uuid;
BEGIN

  -- ============================================
  -- 1. Create house seller profile
  -- ============================================
  INSERT INTO public.profiles (id, email, full_name, role, tier, country)
  VALUES (
    v_seller_id,
    'house@letslvl.com',
    'LVL Official Store',
    'seller',
    'platinum',
    'AE'
  )
  ON CONFLICT (id) DO NOTHING;

  -- ============================================
  -- 2. Look up category IDs
  -- ============================================
  SELECT id INTO v_cat_streetwear FROM public.categories WHERE slug = 'streetwear';
  SELECT id INTO v_cat_vintage FROM public.categories WHERE slug = 'vintage';
  SELECT id INTO v_cat_sneakers FROM public.categories WHERE slug = 'sneakers';
  SELECT id INTO v_cat_tcg FROM public.categories WHERE slug = 'trading-card-games';
  SELECT id INTO v_cat_sports FROM public.categories WHERE slug = 'sports-cards';
  SELECT id INTO v_cat_activewear FROM public.categories WHERE slug = 'activewear';
  SELECT id INTO v_cat_accessories FROM public.categories WHERE slug = 'accessories';
  SELECT id INTO v_cat_toys FROM public.categories WHERE slug = 'toys-collectibles';

  -- ============================================
  -- 3. Seed 30 products
  -- ============================================

  -- ─── STREETWEAR (5) ───────────────────────
  INSERT INTO public.products (
    seller_id, title, slug, description, price, compare_at_price, currency,
    category_id, brand, images, sizes, colors, tags,
    inventory_count, is_featured, is_live_exclusive, status
  ) VALUES
  (
    v_seller_id,
    'LVL x Dubai Oversized Tee',
    'lvl-x-dubai-oversized-tee',
    'Exclusive LVL collaboration oversized tee with Dubai skyline graphic. Premium heavyweight cotton, dropped shoulders, and a relaxed boxy fit.',
    289, 350, 'AED',
    v_cat_streetwear, 'LVL',
    ARRAY['https://picsum.photos/seed/lvl-dubai-tee/800/1000'],
    ARRAY['S', 'M', 'L', 'XL'],
    ARRAY['Black', 'White'],
    ARRAY['streetwear', 'tee', 'oversized', 'dubai', 'lvl', 'collaboration'],
    35, true, false, 'active'
  ),
  (
    v_seller_id,
    'Essentials Fear of God Hoodie',
    'essentials-fear-of-god-hoodie',
    'Fear of God Essentials pullover hoodie in a neutral earth tone. Signature rubber logo on chest, heavyweight fleece, kangaroo pocket.',
    459, 520, 'AED',
    v_cat_streetwear, 'Fear of God',
    ARRAY['https://picsum.photos/seed/fog-essentials-hoodie/800/1000'],
    ARRAY['S', 'M', 'L', 'XL'],
    ARRAY['Taupe', 'Black'],
    ARRAY['streetwear', 'hoodie', 'essentials', 'fear of god', 'fog'],
    18, true, false, 'active'
  ),
  (
    v_seller_id,
    'Corteiz Alcatraz Cargo Pants',
    'corteiz-alcatraz-cargo-pants',
    'Corteiz Alcatraz cargo pants with oversized pockets and adjustable ankle cuffs. Durable ripstop fabric, elastic waistband.',
    389, NULL, 'AED',
    v_cat_streetwear, 'Corteiz',
    ARRAY['https://picsum.photos/seed/corteiz-cargo-pants/800/1000'],
    ARRAY['S', 'M', 'L', 'XL'],
    ARRAY['Khaki', 'Black'],
    ARRAY['streetwear', 'cargo', 'pants', 'corteiz', 'alcatraz'],
    12, false, false, 'active'
  ),
  (
    v_seller_id,
    'Stussy World Tour Tee',
    'stussy-world-tour-tee',
    'Classic Stussy World Tour graphic tee. Screen-printed front and back logos on soft combed cotton jersey.',
    249, NULL, 'AED',
    v_cat_streetwear, 'Stussy',
    ARRAY['https://picsum.photos/seed/stussy-world-tour-tee/800/1000'],
    ARRAY['S', 'M', 'L', 'XL'],
    ARRAY['White', 'Black'],
    ARRAY['streetwear', 'tee', 'stussy', 'world tour', 'graphic'],
    42, false, false, 'active'
  ),
  (
    v_seller_id,
    'Broken Planet Hoodie',
    'broken-planet-hoodie',
    'Broken Planet Market heavyweight hoodie with puff-print graphic. Made from organic cotton fleece, oversized fit with ribbed cuffs.',
    520, NULL, 'AED',
    v_cat_streetwear, 'Broken Planet',
    ARRAY['https://picsum.photos/seed/broken-planet-hoodie/800/1000'],
    ARRAY['S', 'M', 'L', 'XL'],
    ARRAY['Green', 'Brown'],
    ARRAY['streetwear', 'hoodie', 'broken planet', 'organic', 'heavyweight'],
    8, true, false, 'active'
  ),

  -- ─── VINTAGE (3) ──────────────────────────
  (
    v_seller_id,
    'Vintage 90s Racing Jacket',
    'vintage-90s-racing-jacket',
    'Authentic 1990s motorsport racing jacket with bold color-blocked panels. Nylon shell with polyester lining, full zip, and embroidered patches.',
    549, 699, 'AED',
    v_cat_vintage, 'Vintage',
    ARRAY['https://picsum.photos/seed/vintage-racing-jacket/800/1000'],
    ARRAY['M', 'L', 'XL'],
    ARRAY['Multi'],
    ARRAY['vintage', 'racing', 'jacket', '90s', 'retro', 'motorsport'],
    4, true, false, 'active'
  ),
  (
    v_seller_id,
    'Vintage NFL Starter Jacket',
    'vintage-nfl-starter-jacket',
    'Rare vintage NFL Starter satin jacket from the early 90s. Embroidered team logos, snap-button front, quilted lining for warmth.',
    650, NULL, 'AED',
    v_cat_vintage, 'Starter',
    ARRAY['https://picsum.photos/seed/vintage-nfl-starter/800/1000'],
    ARRAY['L', 'XL'],
    ARRAY['Blue', 'Red'],
    ARRAY['vintage', 'nfl', 'starter', 'jacket', '90s', 'satin'],
    3, false, false, 'active'
  ),
  (
    v_seller_id,
    'Vintage Levis 501 Distressed',
    'vintage-levis-501-distressed',
    'Authentic vintage Levi''s 501 jeans with natural distressing and fading. Button-fly closure, straight-leg fit from the late 80s.',
    320, NULL, 'AED',
    v_cat_vintage, 'Levi''s',
    ARRAY['https://picsum.photos/seed/vintage-levis-501/800/1000'],
    ARRAY['30', '32', '34', '36'],
    ARRAY['Indigo'],
    ARRAY['vintage', 'levis', '501', 'denim', 'jeans', 'distressed'],
    7, false, false, 'active'
  ),

  -- ─── SNEAKERS (5) ─────────────────────────
  (
    v_seller_id,
    'Air Jordan 4 Retro Thunder',
    'air-jordan-4-retro-thunder',
    'Air Jordan 4 Retro "Thunder" in the iconic black and tour yellow colorway. Full-grain leather upper, visible Air-Sole unit, classic cement details.',
    1299, NULL, 'AED',
    v_cat_sneakers, 'Jordan',
    ARRAY['https://picsum.photos/seed/jordan4-thunder/800/1000'],
    ARRAY['40', '41', '42', '43', '44', '45'],
    ARRAY['Black', 'Yellow'],
    ARRAY['sneakers', 'jordan', 'air jordan 4', 'thunder', 'retro', 'nike'],
    6, true, false, 'active'
  ),
  (
    v_seller_id,
    'Nike Dunk Low Panda',
    'nike-dunk-low-panda',
    'Nike Dunk Low "Panda" in the timeless black and white colorway. Leather upper, padded collar, and classic rubber cupsole.',
    599, NULL, 'AED',
    v_cat_sneakers, 'Nike',
    ARRAY['https://picsum.photos/seed/nike-dunk-panda/800/1000'],
    ARRAY['38', '39', '40', '41', '42', '43', '44'],
    ARRAY['Black', 'White'],
    ARRAY['sneakers', 'nike', 'dunk', 'panda', 'low', 'black white'],
    22, true, false, 'active'
  ),
  (
    v_seller_id,
    'Stussy x Nike Air Force 1',
    'stussy-x-nike-air-force-1',
    'Limited Stussy x Nike Air Force 1 collaboration. Hemp-textured upper, co-branded tongue labels, off-white midsole.',
    1099, 1399, 'AED',
    v_cat_sneakers, 'Nike',
    ARRAY['https://picsum.photos/seed/stussy-af1-low/800/1000'],
    ARRAY['40', '41', '42', '43', '44'],
    ARRAY['Fossil'],
    ARRAY['sneakers', 'nike', 'air force 1', 'stussy', 'collaboration', 'limited'],
    5, true, true, 'active'
  ),
  (
    v_seller_id,
    'New Balance 550 White Green',
    'new-balance-550-white-green',
    'New Balance 550 in a clean white and green colorway. Leather upper with perforated toe box, ENCAP midsole cushioning.',
    489, NULL, 'AED',
    v_cat_sneakers, 'New Balance',
    ARRAY['https://picsum.photos/seed/nb-550-white-green/800/1000'],
    ARRAY['39', '40', '41', '42', '43', '44'],
    ARRAY['White', 'Green'],
    ARRAY['sneakers', 'new balance', '550', 'white green', 'retro basketball'],
    30, false, false, 'active'
  ),
  (
    v_seller_id,
    'Adidas Samba OG',
    'adidas-samba-og',
    'Adidas Samba OG in the classic black and white colorway. Full-grain leather upper, suede T-toe overlay, gum rubber outsole.',
    449, NULL, 'AED',
    v_cat_sneakers, 'Adidas',
    ARRAY['https://picsum.photos/seed/adidas-samba-og/800/1000'],
    ARRAY['38', '39', '40', '41', '42', '43', '44', '45', '46'],
    ARRAY['Black', 'White'],
    ARRAY['sneakers', 'adidas', 'samba', 'og', 'classic', 'gum sole'],
    48, false, false, 'active'
  ),

  -- ─── TRADING CARD GAMES (5) ───────────────
  (
    v_seller_id,
    'Pokemon Scarlet & Violet Booster Box',
    'pokemon-scarlet-violet-booster-box',
    'Sealed Pokemon Scarlet & Violet base set booster box. Contains 36 booster packs with a chance at rare ex and illustration rare cards.',
    799, NULL, 'AED',
    v_cat_tcg, 'Pokemon',
    ARRAY['https://picsum.photos/seed/pokemon-sv-booster/800/1000'],
    ARRAY[]::text[],
    ARRAY[]::text[],
    ARRAY['tcg', 'pokemon', 'scarlet violet', 'booster box', 'sealed', 'cards'],
    15, true, true, 'active'
  ),
  (
    v_seller_id,
    'One Piece TCG Romance Dawn Box',
    'one-piece-tcg-romance-dawn-box',
    'One Piece Trading Card Game Romance Dawn booster box. 24 packs per box, chase leader and secret rare cards. English edition.',
    2100, NULL, 'AED',
    v_cat_tcg, 'One Piece',
    ARRAY['https://picsum.photos/seed/onepiece-romance-dawn/800/1000'],
    ARRAY[]::text[],
    ARRAY[]::text[],
    ARRAY['tcg', 'one piece', 'romance dawn', 'booster box', 'anime', 'cards'],
    4, false, true, 'active'
  ),
  (
    v_seller_id,
    'Yu-Gi-Oh! Structure Deck',
    'yu-gi-oh-structure-deck',
    'Yu-Gi-Oh! latest structure deck with 40+ cards including ultra rares. Ready to play out of the box with a competitive strategy guide.',
    180, NULL, 'AED',
    v_cat_tcg, 'Yu-Gi-Oh!',
    ARRAY['https://picsum.photos/seed/yugioh-structure-deck/800/1000'],
    ARRAY[]::text[],
    ARRAY[]::text[],
    ARRAY['tcg', 'yugioh', 'yu-gi-oh', 'structure deck', 'cards'],
    28, false, false, 'active'
  ),
  (
    v_seller_id,
    'Magic: The Gathering Foundations Booster',
    'magic-the-gathering-foundations-booster',
    'Magic: The Gathering Foundations set play booster box. 36 packs with curated reprints and new art perfect for new and returning players.',
    450, NULL, 'AED',
    v_cat_tcg, 'Magic: The Gathering',
    ARRAY['https://picsum.photos/seed/mtg-foundations-booster/800/1000'],
    ARRAY[]::text[],
    ARRAY[]::text[],
    ARRAY['tcg', 'magic', 'mtg', 'foundations', 'booster', 'cards'],
    20, false, false, 'active'
  ),
  (
    v_seller_id,
    'Dragon Ball Super Zenkai Set 7',
    'dragon-ball-super-zenkai-set-7',
    'Dragon Ball Super Card Game Zenkai Series Set 7 booster box. 24 packs featuring new God Rare and Secret Rare cards.',
    320, NULL, 'AED',
    v_cat_tcg, 'Dragon Ball Super',
    ARRAY['https://picsum.photos/seed/dbs-zenkai-set7/800/1000'],
    ARRAY[]::text[],
    ARRAY[]::text[],
    ARRAY['tcg', 'dragon ball', 'dbs', 'zenkai', 'booster box', 'anime', 'cards'],
    11, false, false, 'active'
  ),

  -- ─── SPORTS CARDS (3) ─────────────────────
  (
    v_seller_id,
    'NBA Panini Prizm Blaster Box',
    'nba-panini-prizm-blaster-box',
    'Panini Prizm NBA basketball blaster box. Chase silver, gold, and color prizm parallels of the latest rookie class.',
    349, NULL, 'AED',
    v_cat_sports, 'Panini',
    ARRAY['https://picsum.photos/seed/nba-panini-prizm/800/1000'],
    ARRAY[]::text[],
    ARRAY[]::text[],
    ARRAY['sports cards', 'nba', 'panini', 'prizm', 'basketball', 'blaster'],
    19, false, false, 'active'
  ),
  (
    v_seller_id,
    'UFC Topps Chrome Hobby Box',
    'ufc-topps-chrome-hobby-box',
    'Topps Chrome UFC hobby box with on-card autographs. Chromium technology cards featuring top fighters and rising prospects.',
    890, NULL, 'AED',
    v_cat_sports, 'Topps',
    ARRAY['https://picsum.photos/seed/ufc-topps-chrome/800/1000'],
    ARRAY[]::text[],
    ARRAY[]::text[],
    ARRAY['sports cards', 'ufc', 'topps', 'chrome', 'hobby box', 'mma'],
    9, false, true, 'active'
  ),
  (
    v_seller_id,
    'Topps Chrome Football Hobby',
    'topps-chrome-football-hobby',
    'Topps Chrome Football hobby box with refractor parallels and autographs. Chromium finish cards of the latest Premier League season.',
    750, NULL, 'AED',
    v_cat_sports, 'Topps',
    ARRAY['https://picsum.photos/seed/topps-chrome-football/800/1000'],
    ARRAY[]::text[],
    ARRAY[]::text[],
    ARRAY['sports cards', 'football', 'topps', 'chrome', 'soccer', 'hobby box'],
    14, false, false, 'active'
  ),

  -- ─── ACTIVEWEAR (3) ───────────────────────
  (
    v_seller_id,
    'Nike Dri-FIT Training Set',
    'nike-dri-fit-training-set',
    'Nike Dri-FIT two-piece training set with moisture-wicking tee and tapered joggers. Lightweight, breathable fabric for high-intensity sessions.',
    379, NULL, 'AED',
    v_cat_activewear, 'Nike',
    ARRAY['https://picsum.photos/seed/nike-drifit-training/800/1000'],
    ARRAY['S', 'M', 'L', 'XL'],
    ARRAY['Black', 'Grey'],
    ARRAY['activewear', 'nike', 'dri-fit', 'training', 'gym', 'workout'],
    25, false, false, 'active'
  ),
  (
    v_seller_id,
    'Under Armour Project Rock Tee',
    'under-armour-project-rock-tee',
    'Under Armour Project Rock training tee with HeatGear fabric and anti-odor technology. Graphic print inspired by The Rock.',
    199, NULL, 'AED',
    v_cat_activewear, 'Under Armour',
    ARRAY['https://picsum.photos/seed/ua-project-rock-tee/800/1000'],
    ARRAY['S', 'M', 'L', 'XL'],
    ARRAY['Black', 'White'],
    ARRAY['activewear', 'under armour', 'project rock', 'training', 'gym'],
    38, false, false, 'active'
  ),
  (
    v_seller_id,
    'Gymshark Seamless Shorts',
    'gymshark-seamless-shorts',
    'Gymshark Vital Seamless shorts with high waist and squat-proof fabric. Seamless knit construction for zero-distraction training.',
    169, NULL, 'AED',
    v_cat_activewear, 'Gymshark',
    ARRAY['https://picsum.photos/seed/gymshark-seamless-shorts/800/1000'],
    ARRAY['XS', 'S', 'M', 'L'],
    ARRAY['Black', 'Mauve'],
    ARRAY['activewear', 'gymshark', 'shorts', 'seamless', 'gym', 'workout'],
    50, false, false, 'active'
  ),

  -- ─── ACCESSORIES (3) ──────────────────────
  (
    v_seller_id,
    'Chrome Hearts Trucker Cap',
    'chrome-hearts-trucker-cap',
    'Authentic Chrome Hearts trucker cap with signature cross patch and leather strap. Mesh back panel, adjustable closure.',
    1850, NULL, 'AED',
    v_cat_accessories, 'Chrome Hearts',
    ARRAY['https://picsum.photos/seed/chrome-hearts-cap/800/1000'],
    ARRAY['One Size'],
    ARRAY['Black'],
    ARRAY['accessories', 'chrome hearts', 'cap', 'trucker', 'luxury', 'hat'],
    3, false, true, 'active'
  ),
  (
    v_seller_id,
    'Off-White Industrial Belt',
    'off-white-industrial-belt',
    'Off-White signature yellow industrial belt with "INDUSTRIAL" branding. Jacquard woven nylon, metal buckle closure.',
    620, NULL, 'AED',
    v_cat_accessories, 'Off-White',
    ARRAY['https://picsum.photos/seed/offwhite-industrial-belt/800/1000'],
    ARRAY['One Size'],
    ARRAY['Yellow'],
    ARRAY['accessories', 'off-white', 'belt', 'industrial', 'designer'],
    10, false, false, 'active'
  ),
  (
    v_seller_id,
    'Casio G-Shock DW-5600',
    'casio-g-shock-dw-5600',
    'Casio G-Shock DW-5600 classic square digital watch. Shock-resistant, 200m water resistance, multi-function alarm, and EL backlight.',
    399, NULL, 'AED',
    v_cat_accessories, 'Casio',
    ARRAY['https://picsum.photos/seed/casio-gshock-dw5600/800/1000'],
    ARRAY['One Size'],
    ARRAY['Black'],
    ARRAY['accessories', 'casio', 'g-shock', 'watch', 'digital', 'dw5600'],
    17, false, false, 'active'
  ),

  -- ─── TOYS & COLLECTIBLES (3) ──────────────
  (
    v_seller_id,
    'Funko Pop! Dragon Ball Z Vegeta',
    'funko-pop-dragon-ball-z-vegeta',
    'Funko Pop! Animation Dragon Ball Z Vegeta vinyl figure. Standing at 3.75 inches with detailed sculpt in his Saiyan armor.',
    89, NULL, 'AED',
    v_cat_toys, 'Funko',
    ARRAY['https://picsum.photos/seed/funko-dbz-vegeta/800/1000'],
    ARRAY[]::text[],
    ARRAY[]::text[],
    ARRAY['toys', 'collectibles', 'funko pop', 'dragon ball z', 'vegeta', 'anime', 'figure'],
    45, false, false, 'active'
  ),
  (
    v_seller_id,
    'One Piece Ichiban Kuji Figure',
    'one-piece-ichiban-kuji-figure',
    'Bandai Spirits Ichiban Kuji One Piece prize figure. Highly detailed PVC statue of Monkey D. Luffy in Gear 5 form.',
    450, NULL, 'AED',
    v_cat_toys, 'Bandai',
    ARRAY['https://picsum.photos/seed/onepiece-ichiban-luffy/800/1000'],
    ARRAY[]::text[],
    ARRAY[]::text[],
    ARRAY['toys', 'collectibles', 'one piece', 'ichiban kuji', 'luffy', 'anime', 'figure', 'bandai'],
    6, false, false, 'active'
  ),
  (
    v_seller_id,
    'Bearbrick 400% Medicom Toy',
    'bearbrick-400-medicom-toy',
    'Medicom Toy Bearbrick 400% designer vinyl figure. Standing at 28cm, this limited edition piece is a staple of art toy culture.',
    1200, NULL, 'AED',
    v_cat_toys, 'Medicom',
    ARRAY['https://picsum.photos/seed/bearbrick-400-medicom/800/1000'],
    ARRAY[]::text[],
    ARRAY[]::text[],
    ARRAY['toys', 'collectibles', 'bearbrick', 'medicom', 'art toy', 'designer', 'vinyl'],
    2, true, false, 'active'
  );

END $$;
