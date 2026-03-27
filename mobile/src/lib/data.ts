import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

// =============================================================================
// Types (mirroring web types)
// =============================================================================

export interface Product {
  readonly id: string;
  readonly title: string;
  readonly slug: string;
  readonly description: string | null;
  readonly price: number;
  readonly compare_at_price: number | null;
  readonly currency: string;
  readonly images: readonly string[];
  readonly category_id: string | null;
  readonly brand: string | null;
  readonly seller_id: string | null;
  readonly status: string;
  readonly is_featured: boolean;
  readonly sizes: readonly string[] | null;
  readonly colors: readonly string[] | null;
  readonly tags: readonly string[] | null;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface Category {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly description: string;
  readonly image: string | null;
  readonly parent_id: string | null;
}

export interface WishlistItem {
  readonly id: string;
  readonly user_id: string;
  readonly product_id: string;
  readonly product: Product;
  readonly created_at: string;
}

export interface Order {
  readonly id: string;
  readonly order_number: string;
  readonly user_id: string;
  readonly items: unknown[];
  readonly subtotal: number;
  readonly shipping: number;
  readonly total: number;
  readonly shipping_address: unknown;
  readonly payment_method: string;
  readonly payment_status: string;
  readonly status: string;
  readonly currency: string;
  readonly created_at: string;
}

export interface Stream {
  readonly id: string;
  readonly title: string;
  readonly seller_id: string;
  readonly seller_name: string | null;
  readonly status: string;
  readonly viewer_count: number;
  readonly category: string | null;
  readonly thumbnail_url: string | null;
  readonly created_at: string;
}

export interface CartItem {
  readonly id: string;
  readonly product_id: string;
  readonly title: string;
  readonly brand: string;
  readonly price: number;
  readonly size: string;
  readonly color: string;
  readonly image: string | null;
  readonly quantity: number;
}

// =============================================================================
// Products
// =============================================================================

export async function getProducts(options?: {
  category?: string;
  featured?: boolean;
  limit?: number;
  search?: string;
}): Promise<readonly Product[]> {
  let query = supabase
    .from('products')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (options?.featured) {
    query = query.eq('is_featured', true);
  }

  if (options?.search) {
    query = query.ilike('title', `%${options.search}%`);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.category) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', options.category)
      .single();

    if (!cat) return [];
    query = query.eq('category_id', cat.id);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to fetch products:', error.message);
    return [];
  }

  return (data ?? []) as Product[];
}

export async function getProduct(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Failed to fetch product:', error.message);
    return null;
  }

  return data as Product;
}

export async function getCategories(): Promise<readonly Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, description, image_url, sort_order')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Failed to fetch categories:', error.message);
    return [];
  }

  return (data ?? []).map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description ?? '',
    image: cat.image_url ?? null,
    parent_id: null,
  })) as readonly Category[];
}

// =============================================================================
// Wishlist
// =============================================================================

export async function getWishlist(userId: string): Promise<readonly WishlistItem[]> {
  const { data, error } = await supabase
    .from('wishlist')
    .select('id, user_id, product_id, created_at, products:product_id (*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch wishlist:', error.message);
    return [];
  }

  return (data ?? []).map((item) => ({
    id: item.id,
    user_id: item.user_id,
    product_id: item.product_id,
    product: item.products as unknown as Product,
    created_at: item.created_at,
  })) as readonly WishlistItem[];
}

export async function addToWishlist(
  userId: string,
  productId: string,
): Promise<void> {
  const { error } = await supabase
    .from('wishlist')
    .upsert(
      { user_id: userId, product_id: productId },
      { onConflict: 'user_id,product_id' },
    );

  if (error) {
    throw new Error(`Failed to add to wishlist: ${error.message}`);
  }
}

export async function removeFromWishlist(
  userId: string,
  productId: string,
): Promise<void> {
  const { error } = await supabase
    .from('wishlist')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);

  if (error) {
    throw new Error(`Failed to remove from wishlist: ${error.message}`);
  }
}

export async function isInWishlist(
  userId: string,
  productId: string,
): Promise<boolean> {
  const { count, error } = await supabase
    .from('wishlist')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('product_id', productId);

  if (error) {
    console.error('Failed to check wishlist:', error.message);
    return false;
  }

  return (count ?? 0) > 0;
}

// =============================================================================
// Orders
// =============================================================================

export async function createOrder(order: {
  user_id: string;
  items: unknown[];
  subtotal: number;
  shipping: number;
  total: number;
  shipping_address: unknown;
  payment_method: string;
}): Promise<Order> {
  const orderNumber = `LVL-${Date.now().toString(36).toUpperCase()}`;

  const { data, error } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      user_id: order.user_id,
      items: order.items,
      subtotal: order.subtotal,
      shipping: order.shipping,
      total: order.total,
      shipping_address: order.shipping_address,
      payment_method: order.payment_method,
      payment_status: 'pending',
      status: 'placed',
      currency: 'AED',
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create order: ${error.message}`);
  }

  return data as Order;
}

export async function getUserOrders(userId: string): Promise<readonly Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch user orders:', error.message);
    return [];
  }

  return (data ?? []) as Order[];
}

// =============================================================================
// Streams
// =============================================================================

export async function getStreams(options?: {
  category?: string;
  status?: string;
  limit?: number;
}): Promise<readonly Stream[]> {
  let query = supabase
    .from('streams')
    .select('*')
    .order('viewer_count', { ascending: false });

  if (options?.status) {
    query = query.eq('status', options.status);
  }

  if (options?.category) {
    query = query.eq('category', options.category);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to fetch streams:', error.message);
    return [];
  }

  return (data ?? []) as Stream[];
}

export async function getStream(id: string): Promise<Stream | null> {
  const { data, error } = await supabase
    .from('streams')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Failed to fetch stream:', error.message);
    return null;
  }

  return data as Stream;
}

// =============================================================================
// Cart (AsyncStorage-based, same pattern as web localStorage)
// =============================================================================

const CART_STORAGE_KEY = 'letslvl_cart';

export async function getCartFromStorage(): Promise<readonly CartItem[]> {
  try {
    const stored = await AsyncStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as readonly CartItem[];
  } catch (error) {
    console.error('Failed to load cart from storage:', error);
    return [];
  }
}

export async function saveCartToStorage(items: readonly CartItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Failed to save cart to storage:', error);
  }
}

export async function clearCart(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CART_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear cart:', error);
  }
}
