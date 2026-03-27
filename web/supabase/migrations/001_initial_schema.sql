-- LET'S LVL Database Schema
-- Run this in the Supabase SQL Editor

-- ============================================
-- PROFILES (extends auth.users)
-- ============================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text not null default '',
  avatar_url text,
  phone text,
  role text not null default 'shopper' check (role in ('shopper', 'seller', 'admin')),
  wallet_balance numeric(10,2) not null default 0,
  tier text not null default 'bronze' check (tier in ('bronze', 'silver', 'gold', 'platinum')),
  preferred_language text not null default 'en' check (preferred_language in ('en', 'ar')),
  country text default 'AE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Public profiles readable" on public.profiles
  for select using (true);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- CATEGORIES
-- ============================================
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text default '',
  image_url text,
  parent_id uuid references public.categories(id),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy "Categories are public" on public.categories
  for select using (true);

-- Seed categories
insert into public.categories (name, slug, description, sort_order) values
  ('Streetwear', 'streetwear', 'Bold street style for the culture', 1),
  ('Vintage', 'vintage', 'Rare finds from past decades', 2),
  ('Sneakers', 'sneakers', 'Limited drops and grails', 3),
  ('Trading Card Games', 'trading-card-games', 'Pokemon, Magic, Yu-Gi-Oh and more', 4),
  ('Sports Cards', 'sports-cards', 'NBA, UFC, Football collectibles', 5),
  ('Activewear', 'activewear', 'Performance meets style', 6),
  ('Accessories', 'accessories', 'Caps, bags, jewelry and more', 7),
  ('Toys & Collectibles', 'toys-collectibles', 'Funko Pops, figures, and rare collectibles', 8);

-- ============================================
-- PRODUCTS
-- ============================================
create table public.products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id),
  title text not null,
  slug text not null,
  description text default '',
  price numeric(10,2) not null,
  compare_at_price numeric(10,2),
  currency text not null default 'AED',
  category_id uuid references public.categories(id),
  brand text default '',
  images text[] default '{}',
  sizes text[] default '{}',
  colors text[] default '{}',
  tags text[] default '{}',
  sku text default '',
  inventory_count int not null default 0,
  is_featured boolean not null default false,
  is_live_exclusive boolean not null default false,
  status text not null default 'draft' check (status in ('active', 'draft', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "Products are publicly readable" on public.products
  for select using (status = 'active' or auth.uid() = seller_id);

create policy "Sellers can insert own products" on public.products
  for insert with check (auth.uid() = seller_id);

create policy "Sellers can update own products" on public.products
  for update using (auth.uid() = seller_id);

create policy "Sellers can delete own products" on public.products
  for delete using (auth.uid() = seller_id);

create index idx_products_seller on public.products(seller_id);
create index idx_products_category on public.products(category_id);
create index idx_products_status on public.products(status);
create index idx_products_featured on public.products(is_featured) where is_featured = true;

-- ============================================
-- ADDRESSES
-- ============================================
create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  full_name text not null,
  phone text not null,
  line1 text not null,
  line2 text,
  city text not null,
  state text default '',
  country text not null default 'AE',
  postal_code text default '',
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.addresses enable row level security;

create policy "Users manage own addresses" on public.addresses
  for all using (auth.uid() = user_id);

-- ============================================
-- ORDERS
-- ============================================
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid not null references public.profiles(id),
  items jsonb not null default '[]',
  status text not null default 'placed' check (status in ('placed', 'confirmed', 'packed', 'shipped', 'delivered', 'returned', 'cancelled')),
  subtotal numeric(10,2) not null,
  shipping numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  currency text not null default 'AED',
  shipping_address jsonb not null,
  payment_method text not null default 'card',
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  tracking_number text,
  carrier text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy "Users can read own orders" on public.orders
  for select using (auth.uid() = user_id);

create policy "Users can create orders" on public.orders
  for insert with check (auth.uid() = user_id);

create index idx_orders_user on public.orders(user_id);
create index idx_orders_status on public.orders(status);

-- ============================================
-- WISHLIST
-- ============================================
create table public.wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, product_id)
);

alter table public.wishlist enable row level security;

create policy "Users manage own wishlist" on public.wishlist
  for all using (auth.uid() = user_id);

-- ============================================
-- STREAMS
-- ============================================
create table public.streams (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id),
  title text not null,
  description text default '',
  category text not null,
  thumbnail_url text,
  status text not null default 'scheduled' check (status in ('scheduled', 'live', 'ended')),
  viewer_count int not null default 0,
  stream_url text,
  scheduled_at timestamptz,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.streams enable row level security;

create policy "Streams are publicly readable" on public.streams
  for select using (true);

create policy "Sellers manage own streams" on public.streams
  for all using (auth.uid() = seller_id);

-- ============================================
-- AUCTIONS
-- ============================================
create table public.auctions (
  id uuid primary key default gen_random_uuid(),
  stream_id uuid not null references public.streams(id),
  product_id uuid not null references public.products(id),
  start_price numeric(10,2) not null,
  current_bid numeric(10,2) not null,
  bid_increment numeric(10,2) not null default 25,
  currency text not null default 'AED',
  status text not null default 'pending' check (status in ('pending', 'active', 'closing', 'closed', 'cancelled')),
  winner_id uuid references public.profiles(id),
  end_time timestamptz not null,
  bid_count int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.auctions enable row level security;

create policy "Auctions are publicly readable" on public.auctions
  for select using (true);

create policy "Sellers manage own auctions" on public.auctions
  for all using (
    auth.uid() = (select seller_id from public.streams where id = stream_id)
  );

-- ============================================
-- BIDS
-- ============================================
create table public.bids (
  id uuid primary key default gen_random_uuid(),
  auction_id uuid not null references public.auctions(id),
  user_id uuid not null references public.profiles(id),
  amount numeric(10,2) not null,
  status text not null default 'active' check (status in ('active', 'outbid', 'won', 'cancelled')),
  created_at timestamptz not null default now()
);

alter table public.bids enable row level security;

create policy "Bids are publicly readable" on public.bids
  for select using (true);

create policy "Users can place bids" on public.bids
  for insert with check (auth.uid() = user_id);

create index idx_bids_auction on public.bids(auction_id);

-- ============================================
-- CHAT MESSAGES
-- ============================================
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  stream_id uuid not null references public.streams(id) on delete cascade,
  user_id uuid not null references public.profiles(id),
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.chat_messages enable row level security;

create policy "Chat messages are publicly readable" on public.chat_messages
  for select using (true);

create policy "Authenticated users can send messages" on public.chat_messages
  for insert with check (auth.uid() = user_id);

create index idx_chat_stream on public.chat_messages(stream_id, created_at);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on public.profiles
  for each row execute procedure public.update_updated_at();

create trigger set_updated_at before update on public.products
  for each row execute procedure public.update_updated_at();

create trigger set_updated_at before update on public.orders
  for each row execute procedure public.update_updated_at();

-- ============================================
-- ENABLE REALTIME for live features
-- ============================================
alter publication supabase_realtime add table public.chat_messages;
alter publication supabase_realtime add table public.bids;
alter publication supabase_realtime add table public.auctions;
alter publication supabase_realtime add table public.streams;
