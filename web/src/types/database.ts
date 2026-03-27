export interface Product {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  currency: string;
  category_id: string;
  brand: string;
  images: string[];
  sizes: string[];
  colors: string[];
  tags: string[];
  inventory_count: number;
  is_featured: boolean;
  is_live_exclusive: boolean;
  seller_id: string;
  status: "active" | "draft" | "archived";
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  parent_id: string | null;
}

export interface CartItem {
  id: string;
  product_id: string;
  product: Product;
  quantity: number;
  size: string | null;
  color: string | null;
}

export interface Order {
  id: string;
  created_at: string;
  user_id: string;
  items: OrderItem[];
  status: "placed" | "confirmed" | "packed" | "shipped" | "delivered" | "returned";
  subtotal: number;
  shipping: number;
  total: number;
  currency: string;
  shipping_address: Address;
  payment_method: string;
  tracking_number: string | null;
  carrier: string | null;
}

export interface OrderItem {
  product_id: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
  size: string | null;
  color: string | null;
}

export interface Address {
  full_name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  country: string;
  postal_code: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  role: "shopper" | "seller" | "admin";
  wallet_balance: number;
  tier: "bronze" | "silver" | "gold" | "platinum";
  preferred_language: "en" | "ar";
  addresses: Address[];
}

export interface Stream {
  id: string;
  created_at: string;
  seller_id: string;
  seller: {
    full_name: string;
    avatar_url: string | null;
  };
  title: string;
  description: string;
  category: string;
  thumbnail_url: string | null;
  status: "scheduled" | "live" | "ended";
  viewer_count: number;
  stream_url: string | null;
  scheduled_at: string | null;
  started_at: string | null;
  ended_at: string | null;
  country_flag: string;
}

export interface Auction {
  id: string;
  stream_id: string;
  product_id: string;
  product: Product;
  start_price: number;
  current_bid: number;
  bid_increment: number;
  currency: string;
  status: "pending" | "active" | "closing" | "closed" | "cancelled";
  winner_id: string | null;
  end_time: string;
  bid_count: number;
}

export interface Bid {
  id: string;
  auction_id: string;
  user_id: string;
  user_name: string;
  amount: number;
  created_at: string;
  status: "active" | "outbid" | "won" | "cancelled";
}

export interface ChatMessage {
  id: string;
  stream_id: string;
  user_id: string;
  user_name: string;
  user_avatar: string | null;
  message: string;
  created_at: string;
  is_seller: boolean;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  product: Product;
  created_at: string;
}
