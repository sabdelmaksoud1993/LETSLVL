// ---------------------------------------------------------------------------
// Seller Product Store – localStorage-based CRUD with event broadcasting
// ---------------------------------------------------------------------------

export interface SellerProduct {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly price: number;
  readonly compare_at_price: number | null;
  readonly currency: string;
  readonly category: string;
  readonly brand: string;
  readonly images: readonly string[];
  readonly sizes: readonly string[];
  readonly colors: readonly string[];
  readonly tags: readonly string[];
  readonly inventory_count: number;
  readonly sku: string;
  readonly status: "active" | "draft" | "archived";
  readonly is_live_exclusive: boolean;
  readonly created_at: string;
  readonly updated_at: string;
}

const STORAGE_KEY = "lvl_seller_products";
const UPDATE_EVENT = "seller-products-updated";

// ---- helpers ----------------------------------------------------------------

function generateId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

function readProducts(): SellerProduct[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as SellerProduct[];
  } catch {
    return [];
  }
}

function writeProducts(products: readonly SellerProduct[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
}

// ---- seed data --------------------------------------------------------------

const SEED_PRODUCTS: readonly SellerProduct[] = [
  {
    id: generateId(),
    title: "Vintage Nike Air Jordan 1 Retro High OG",
    description:
      "Deadstock pair in original box. Bred colorway, size EU 43. Minor yellowing on sole — displayed only.",
    price: 2800,
    compare_at_price: 3200,
    currency: "AED",
    category: "Sneakers",
    brand: "Nike",
    images: [
      "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=600",
      "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600",
    ],
    sizes: ["43"],
    colors: ["Black", "Red"],
    tags: ["retro", "jordan", "deadstock"],
    inventory_count: 1,
    sku: "SNK-AJ1-001",
    status: "active",
    is_live_exclusive: false,
    created_at: "2026-03-20T10:00:00Z",
    updated_at: "2026-03-20T10:00:00Z",
  },
  {
    id: generateId(),
    title: "Pokemon Scarlet & Violet 151 Booster Box",
    description:
      "Factory sealed Japanese booster box — 20 packs. Highly sought after for the original 151 artwork set.",
    price: 950,
    compare_at_price: 1100,
    currency: "AED",
    category: "Trading Card Games",
    brand: "Pokemon",
    images: [
      "https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=600",
    ],
    sizes: [],
    colors: [],
    tags: ["pokemon", "tcg", "sealed", "japanese"],
    inventory_count: 8,
    sku: "TCG-PKM-151",
    status: "active",
    is_live_exclusive: true,
    created_at: "2026-03-18T14:30:00Z",
    updated_at: "2026-03-18T14:30:00Z",
  },
  {
    id: generateId(),
    title: "Essentials Fear of God Hoodie — Cement",
    description:
      "Brand new with tags. Oversized fit, heavyweight fleece. Season 2025 release.",
    price: 680,
    compare_at_price: null,
    currency: "AED",
    category: "Streetwear",
    brand: "Fear of God",
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600",
      "https://images.unsplash.com/photo-1578768079470-fa690a5e3ed3?w=600",
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Cement"],
    tags: ["essentials", "hoodie", "oversized"],
    inventory_count: 15,
    sku: "STR-FOG-H01",
    status: "active",
    is_live_exclusive: false,
    created_at: "2026-03-15T09:00:00Z",
    updated_at: "2026-03-15T09:00:00Z",
  },
  {
    id: generateId(),
    title: "One Piece TCG Romance Dawn Booster Display",
    description:
      "English edition display box — 24 packs. Includes OP-01 set with Luffy leader promos.",
    price: 2100,
    compare_at_price: 2400,
    currency: "AED",
    category: "Trading Card Games",
    brand: "Bandai",
    images: [
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600",
    ],
    sizes: [],
    colors: [],
    tags: ["one piece", "tcg", "booster", "english"],
    inventory_count: 4,
    sku: "TCG-OP-RD01",
    status: "active",
    is_live_exclusive: false,
    created_at: "2026-03-10T16:00:00Z",
    updated_at: "2026-03-10T16:00:00Z",
  },
  {
    id: generateId(),
    title: "Corteiz Spring Cargo Pants — Olive",
    description:
      "Limited drop cargo. Adjustable waist, parachute cut, embroidered Alcatraz logo.",
    price: 520,
    compare_at_price: null,
    currency: "AED",
    category: "Streetwear",
    brand: "Corteiz",
    images: [
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600",
    ],
    sizes: ["M", "L", "XL"],
    colors: ["Olive"],
    tags: ["cargo", "corteiz", "limited"],
    inventory_count: 6,
    sku: "STR-CRZ-CP1",
    status: "draft",
    is_live_exclusive: false,
    created_at: "2026-03-05T11:45:00Z",
    updated_at: "2026-03-05T11:45:00Z",
  },
  {
    id: generateId(),
    title: "Dragon Ball Z Ichiban Kuji Vegeta Figure",
    description:
      "A-Prize figure from Bandai Spirits lottery. 25 cm, mint condition in original packaging.",
    price: 380,
    compare_at_price: 450,
    currency: "AED",
    category: "Toys & Collectibles",
    brand: "Bandai Spirits",
    images: [
      "https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?w=600",
    ],
    sizes: [],
    colors: [],
    tags: ["dragon ball", "figure", "ichiban kuji", "bandai"],
    inventory_count: 2,
    sku: "TOY-DBZ-VG1",
    status: "active",
    is_live_exclusive: true,
    created_at: "2026-02-28T08:20:00Z",
    updated_at: "2026-02-28T08:20:00Z",
  },
];

// ---- public API -------------------------------------------------------------

export function getSellerProducts(): SellerProduct[] {
  const existing = readProducts();
  if (existing.length > 0) return existing;

  // Seed on first access
  writeProducts(SEED_PRODUCTS);
  return [...SEED_PRODUCTS];
}

export function getSellerProduct(id: string): SellerProduct | null {
  const products = getSellerProducts();
  return products.find((p) => p.id === id) ?? null;
}

export function createSellerProduct(
  data: Omit<SellerProduct, "id" | "created_at" | "updated_at">
): SellerProduct {
  const product: SellerProduct = {
    ...data,
    id: generateId(),
    created_at: now(),
    updated_at: now(),
  };
  const products = getSellerProducts();
  writeProducts([...products, product]);
  return product;
}

export function updateSellerProduct(
  id: string,
  data: Partial<SellerProduct>
): SellerProduct | null {
  const products = getSellerProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const updated: SellerProduct = {
    ...products[index],
    ...data,
    id: products[index].id, // prevent id overwrite
    created_at: products[index].created_at, // preserve original
    updated_at: now(),
  };

  const next = products.map((p, i) => (i === index ? updated : p));
  writeProducts(next);
  return updated;
}

export function deleteSellerProduct(id: string): boolean {
  const products = getSellerProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return false;

  const archived: SellerProduct = {
    ...products[index],
    status: "archived",
    updated_at: now(),
  };

  const next = products.map((p, i) => (i === index ? archived : p));
  writeProducts(next);
  return true;
}

export function getSellerStats(): {
  totalProducts: number;
  activeProducts: number;
  totalInventory: number;
  totalValue: number;
} {
  const products = getSellerProducts().filter((p) => p.status !== "archived");
  return {
    totalProducts: products.length,
    activeProducts: products.filter((p) => p.status === "active").length,
    totalInventory: products.reduce((sum, p) => sum + p.inventory_count, 0),
    totalValue: products.reduce(
      (sum, p) => sum + p.price * p.inventory_count,
      0
    ),
  };
}
