import { createClient } from "@/lib/supabase-browser";
import type { Product, Category, Order, WishlistItem } from "@/types/database";

// =============================================================================
// Products
// =============================================================================

export async function getProducts(options?: {
  category?: string;
  featured?: boolean;
  limit?: number;
  search?: string;
}): Promise<Product[]> {
  const supabase = createClient();

  let query = supabase
    .from("products")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (options?.featured) {
    query = query.eq("is_featured", true);
  }

  if (options?.search) {
    query = query.ilike("title", `%${options.search}%`);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  // If category slug is provided, we need to look up the category first
  if (options?.category) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", options.category)
      .single();

    if (!cat) return [];
    query = query.eq("category_id", cat.id);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch products:", error.message);
    return [];
  }

  return (data ?? []) as Product[];
}

export async function getProduct(id: string): Promise<Product | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Failed to fetch product:", error.message);
    return null;
  }

  return data as Product;
}

export async function getCategories(): Promise<Category[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description, image_url, sort_order")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Failed to fetch categories:", error.message);
    return [];
  }

  // Map image_url to image for compatibility with Category type
  return (data ?? []).map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description ?? "",
    image: cat.image_url ?? null,
    parent_id: null,
  })) as Category[];
}

// =============================================================================
// Seller Products (requires auth)
// =============================================================================

export async function getSellerProducts(sellerId: string): Promise<Product[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch seller products:", error.message);
    return [];
  }

  return (data ?? []) as Product[];
}

export async function createProduct(
  product: Omit<Product, "id" | "created_at" | "updated_at">
): Promise<Product> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("products")
    .insert(product)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create product: ${error.message}`);
  }

  return data as Product;
}

export async function updateProduct(
  id: string,
  updates: Partial<Product>
): Promise<Product> {
  const supabase = createClient();

  // Remove fields that shouldn't be updated directly
  const { id: _id, created_at: _ca, ...safeUpdates } = updates as Record<string, unknown>;

  const { data, error } = await supabase
    .from("products")
    .update({ ...safeUpdates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update product: ${error.message}`);
  }

  return data as Product;
}

export async function archiveProduct(id: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("products")
    .update({ status: "archived", updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to archive product: ${error.message}`);
  }
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
  const supabase = createClient();

  const orderNumber = `LVL-${Date.now().toString(36).toUpperCase()}`;

  const { data, error } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      user_id: order.user_id,
      items: order.items,
      subtotal: order.subtotal,
      shipping: order.shipping,
      total: order.total,
      shipping_address: order.shipping_address,
      payment_method: order.payment_method,
      payment_status: "pending",
      status: "placed",
      currency: "AED",
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create order: ${error.message}`);
  }

  return data as Order;
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch user orders:", error.message);
    return [];
  }

  return (data ?? []) as Order[];
}

export async function getOrder(id: string): Promise<Order | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Failed to fetch order:", error.message);
    return null;
  }

  return data as Order;
}

// =============================================================================
// Wishlist
// =============================================================================

export async function getWishlist(userId: string): Promise<WishlistItem[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("wishlist")
    .select("id, user_id, product_id, created_at, products:product_id (*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch wishlist:", error.message);
    return [];
  }

  // Map the joined product data to the WishlistItem shape
  return (data ?? []).map((item) => ({
    id: item.id,
    user_id: item.user_id,
    product_id: item.product_id,
    product: item.products as unknown as Product,
    created_at: item.created_at,
  })) as WishlistItem[];
}

export async function addToWishlist(
  userId: string,
  productId: string
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("wishlist")
    .upsert(
      { user_id: userId, product_id: productId },
      { onConflict: "user_id,product_id" }
    );

  if (error) {
    throw new Error(`Failed to add to wishlist: ${error.message}`);
  }
}

export async function removeFromWishlist(
  userId: string,
  productId: string
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("wishlist")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);

  if (error) {
    throw new Error(`Failed to remove from wishlist: ${error.message}`);
  }
}

export async function isInWishlist(
  userId: string,
  productId: string
): Promise<boolean> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from("wishlist")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("product_id", productId);

  if (error) {
    console.error("Failed to check wishlist:", error.message);
    return false;
  }

  return (count ?? 0) > 0;
}
