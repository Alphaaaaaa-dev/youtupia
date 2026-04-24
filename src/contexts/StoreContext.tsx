import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { toast as sonnerToast } from '@/components/ui/sonner';

export interface ProductVariant { size: string; stock: number; }
export interface Review { id: string; userName: string; rating: number; comment: string; createdAt: string; verified: boolean; }
export interface Product {
  id: string; name: string; series: string; seriesId: string; creatorId?: string;
  price: number; originalPrice?: number; description: string; images: string[];
  variants: ProductVariant[]; tags: string[]; featured: boolean; createdAt: string;
  reviews?: Review[]; viewerCount?: number; limitedEdition?: boolean; preorder?: boolean;
}
export interface Series { id: string; name: string; description: string; logo: string; banner: string; color: string; }
export interface Creator {
  id: string; name: string; handle: string; bio: string; avatar: string; banner: string;
  youtubeUrl?: string; youtubeVideoId?: string; subscribers?: string; productIds: string[];
  dropCountdownEnd?: string;
}
export interface CartItem { productId: string; size: string; quantity: number; product: Product; }
export interface Order {
  id: string; items: CartItem[]; total: number;
  status: 'processing' | 'preorder_confirmed' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  customerName: string; customerEmail: string; customerPhone: string; address: string;
  paymentId?: string; createdAt: string; discountCode?: string; discountAmount?: number;
  paymentMethod: 'razorpay' | 'cod';
  codCharge?: number; trackingId?: string; trackingUrl?: string; notes?: string; cancelReason?: string;
  userId?: string;
}
export interface HomePromo { videoUrl: string; posterUrl?: string; title: string; subtitle: string; ctaText: string; ctaLink: string; }
export interface DiscountCoupon { id: string; code: string; type: 'percentage' | 'fixed'; value: number; active: boolean; description?: string; }
export interface TopBanner { enabled: boolean; messages: string[]; bgColor: string; textColor: string; }

const DEFAULT_COUPONS: DiscountCoupon[] = [
  { id: 'c1', code: 'YOUTUPIA10', type: 'percentage', value: 10, active: true, description: '10% off for Youtupia community' },
];
const DEFAULT_HOME_PROMO: HomePromo = {
  videoUrl: '', posterUrl: '', title: 'Promotion Video', subtitle: 'Creator drop preview', ctaText: 'Watch Drop', ctaLink: '/shop',
};
const DEFAULT_TOP_BANNER: TopBanner = {
  enabled: true,
  messages: [
    '🔥 Free shipping on all orders!',
    '⚡ New drops every Friday',
    '🎁 Use code YOUTUPIA10 for 10% off',
    '🚚 COD available across India',
  ],
  bgColor: '#ff0000', textColor: '#ffffff',
};

async function globalGet(key: string): Promise<any> {
  try {
    const res = await fetch(`/api/global-settings?key=${encodeURIComponent(key)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.value ?? null;
  } catch { return null; }
}

async function globalSet(key: string, value: any): Promise<void> {
  try {
    await fetch(`/api/global-settings?key=${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value }),
    });
  } catch (e) { console.error('globalSet failed:', e); }
}

type TableName = 'yt_products' | 'yt_series' | 'yt_creators';

async function dbLoad<T>(table: TableName): Promise<T[] | null> {
  try {
    const res = await fetch(`/api/store-data?table=${table}`);
    if (!res.ok) return null;
    const { data } = await res.json();
    if (!Array.isArray(data)) return null;
    return data as T[];
  } catch { return null; }
}

async function dbSaveSingleRow<T extends { id: string }>(table: TableName, item: T): Promise<void> {
  try {
    await fetch(`/api/store-data?table=${table}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ row: { id: item.id, payload: item } }),
    });
  } catch (e) { console.error(`dbSaveSingleRow(${table}) failed:`, e); }
}

async function dbSaveAll<T extends { id: string }>(table: TableName, items: T[]): Promise<void> {
  try {
    const rows = items.map(item => ({ id: item.id, payload: item }));
    await fetch(`/api/store-data?table=${table}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows }),
    });
  } catch (e) { console.error(`dbSaveAll(${table}) failed:`, e); }
}

async function dbDeleteSingleRow(table: TableName, id: string): Promise<void> {
  try {
    await fetch(`/api/store-data?table=${table}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
  } catch (e) { console.error(`dbDeleteSingleRow(${table}) failed:`, e); }
}

async function dbSaveOrder(order: Order, userId?: string | null): Promise<void> {
  try {
    await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order, userId: userId || null }),
    });
  } catch (e) { console.error('dbSaveOrder failed:', e); }
}

async function dbUpdateOrder(orderId: string, updates: Partial<Order>): Promise<void> {
  try {
    await fetch('/api/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: orderId, ...updates }),
    });
  } catch (e) { console.error('dbUpdateOrder failed:', e); }
}

async function dbDeleteOrder(orderId: string): Promise<void> {
  try {
    await fetch('/api/orders', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: orderId }),
    });
  } catch (e) { console.error('dbDeleteOrder failed:', e); }
}

async function dbLoadOrders(userId?: string | null): Promise<Order[] | null> {
  try {
    const url = userId ? `/api/orders?userId=${userId}` : '/api/orders';
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data.orders) ? data.orders : null;
  } catch { return null; }
}

function lsGet<T>(key: string, fallback: T): T {
  try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : fallback; }
  catch { return fallback; }
}
function lsSet(key: string, val: unknown) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

interface StoreContextType {
  products: Product[]; series: Series[]; creators: Creator[];
  cart: CartItem[]; orders: Order[]; wishlist: string[]; recentlyViewed: string[];
  homePromo: HomePromo; coupons: DiscountCoupon[]; topBanner: TopBanner;
  hydrating: boolean; dbLoading: boolean;
  setProducts: (p: Product[]) => void;
  setProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  setSeries: (s: Series[]) => void;
  setCreators: (c: Creator[]) => void;
  setHomePromo: (p: HomePromo) => void;
  setCoupons: (c: DiscountCoupon[]) => void;
  setTopBanner: (b: TopBanner) => void;
  addToCart: (product: Product, size: string, qty?: number) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateCartQty: (productId: string, size: string, qty: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  deleteOrder: (orderId: string) => void;
  toggleWishlist: (productId: string) => void;
  addRecentlyViewed: (productId: string) => void;
  addReview: (productId: string, review: Omit<Review, 'id' | 'createdAt'>) => void;
  validateDiscountCode: (code: string) => { valid: boolean; pct: number; amount: number; type: 'percentage' | 'fixed'; coupon?: DiscountCoupon };
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  syncOrdersForUser: (userId: string) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | null>(null);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProductsState] = useState<Product[]>([]);
  const [series, setSeriesState] = useState<Series[]>([]);
  const [creators, setCreatorsState] = useState<Creator[]>([]);

  const [cart, setCart] = useState<CartItem[]>(() => lsGet('youtupia_cart', []));
  const [orders, setOrdersState] = useState<Order[]>(() => lsGet('youtupia_orders', []));
  const [wishlist, setWishlist] = useState<string[]>(() => lsGet('youtupia_wishlist', []));
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(() => lsGet('youtupia_recent', []));
  const [coupons, setCouponsState] = useState<DiscountCoupon[]>(() => lsGet('youtupia_coupons', DEFAULT_COUPONS));

  const [homePromo, setHomePromoState] = useState<HomePromo>(DEFAULT_HOME_PROMO);
  const [topBanner, setTopBannerState] = useState<TopBanner>(DEFAULT_TOP_BANNER);

  const [hydrating, setHydrating] = useState(true);
  const [dbLoading, setDbLoading] = useState(true);

  // FIX: Upserts DB orders over local state — DB is the source of truth for status.
  // Existing orders are updated (not skipped) so stale local statuses get corrected.
  const mergeOrders = useCallback((dbOrders: Order[]) => {
    setOrdersState(prev => {
      const map = new Map<string, Order>();
      // Local orders go in first as the base
      prev.forEach(o => map.set(o.id, o));
      // DB orders overwrite — DB wins on every field (including status)
      dbOrders.forEach(o => map.set(o.id, o));
      const merged = Array.from(map.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      lsSet('youtupia_orders', merged);
      return merged;
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadFromDb = async () => {
      setDbLoading(true);

      try {
        const [dbProducts, dbSeries, dbCreators] = await Promise.all([
          dbLoad<Product>('yt_products'),
          dbLoad<Series>('yt_series'),
          dbLoad<Creator>('yt_creators'),
        ]);

        if (cancelled) return;

        if (dbProducts !== null) {
          console.log('[Store] Loaded', dbProducts.length, 'products from Supabase');
          setProductsState(dbProducts);
        }
        if (dbSeries !== null) setSeriesState(dbSeries);
        if (dbCreators !== null) setCreatorsState(dbCreators);

        if (!cancelled) {
          setDbLoading(false);
          setHydrating(false);
        }

        Promise.all([
          globalGet('home_promo'),
          globalGet('top_banner'),
        ]).then(([dbHomePromo, dbTopBanner]) => {
          if (cancelled) return;
          if (dbHomePromo) setHomePromoState(dbHomePromo);
          if (dbTopBanner) setTopBannerState(dbTopBanner);
        }).catch(() => {});

      } catch (e) {
        console.warn('[Store] DB load failed:', e);
        if (!cancelled) {
          setDbLoading(false);
          setHydrating(false);
        }
      }
    };

    loadFromDb();
    return () => { cancelled = true; };
  }, [mergeOrders]);

  // FIX: Exposed so OrdersPage (and any auth-aware component) can trigger a
  // user-scoped order sync after login, without duplicating fetch logic.
  const syncOrdersForUser = useCallback(async (userId: string) => {
    const dbOrders = await dbLoadOrders(userId);
    if (dbOrders) mergeOrders(dbOrders);
  }, [mergeOrders]);

  const setProducts = useCallback((p: Product[]) => {
    setProductsState(p);
    dbSaveAll('yt_products', p);
  }, []);

  const setProduct = useCallback((p: Product) => {
    setProductsState(prev => {
      const exists = prev.find(x => x.id === p.id);
      return exists ? prev.map(x => x.id === p.id ? p : x) : [...prev, p];
    });
    dbSaveSingleRow('yt_products', p);
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProductsState(prev => prev.filter(x => x.id !== id));
    dbDeleteSingleRow('yt_products', id);
  }, []);

  const setSeries = useCallback((s: Series[]) => {
    setSeriesState(s);
    dbSaveAll('yt_series', s);
  }, []);

  const setCreators = useCallback((c: Creator[]) => {
    setCreatorsState(c);
    dbSaveAll('yt_creators', c);
  }, []);

  const setHomePromo = useCallback((p: HomePromo) => {
    setHomePromoState(p);
    globalSet('home_promo', p);
  }, []);

  const setCoupons = useCallback((c: DiscountCoupon[]) => {
    setCouponsState(c);
    lsSet('youtupia_coupons', c);
  }, []);

  const setTopBanner = useCallback((b: TopBanner) => {
    setTopBannerState(b);
    globalSet('top_banner', b);
  }, []);

  useEffect(() => { lsSet('youtupia_cart', cart); }, [cart]);
  useEffect(() => { lsSet('youtupia_wishlist', wishlist); }, [wishlist]);
  useEffect(() => { lsSet('youtupia_recent', recentlyViewed); }, [recentlyViewed]);

  const addToCart = (product: Product, size: string, qty = 1) => {
    const variant = product.variants.find(v => v.size === size);
    const variantStock = variant?.stock ?? 0;
    const isPreorder = Boolean(product.preorder);

    if (!isPreorder && variantStock <= 0) {
      sonnerToast.message('Out of stock', { description: `${product.name} (${size}) is unavailable.` });
      return;
    }

    setCart(prev => {
      const ex = prev.find(i => i.productId === product.id && i.size === size);
      if (ex) {
        const nextQty = ex.quantity + qty;
        if (!isPreorder && nextQty > variantStock) {
          sonnerToast.message('Stock limit reached', { description: `Only ${variantStock} left.` });
          return prev;
        }
        return prev.map(i =>
          i.productId === product.id && i.size === size ? { ...i, quantity: nextQty } : i
        );
      }
      if (!isPreorder && qty > variantStock) {
        sonnerToast.message('Stock limit reached', { description: `Only ${variantStock} left.` });
        return prev;
      }
      return [...prev, { productId: product.id, size, quantity: qty, product }];
    });
    sonnerToast.success('Added to cart', {
      description: `${product.name} · ${size}${isPreorder ? ' (Preorder)' : ''}`,
    });
  };

  const removeFromCart = (productId: string, size: string) =>
    setCart(prev => prev.filter(i => !(i.productId === productId && i.size === size)));

  const updateCartQty = (productId: string, size: string, qty: number) => {
    if (qty <= 0) { removeFromCart(productId, size); return; }
    setCart(prev => prev.map(i => {
      if (!(i.productId === productId && i.size === size)) return i;
      const liveProduct = products.find(p => p.id === productId);
      const liveVariant = liveProduct?.variants.find(v => v.size === size);
      if (liveProduct?.preorder) return { ...i, quantity: qty };
      const maxStock = liveVariant?.stock ?? i.quantity;
      if (qty > maxStock) {
        sonnerToast.message('Stock limit reached', { description: `Only ${maxStock} left.` });
        return { ...i, quantity: maxStock };
      }
      return { ...i, quantity: qty };
    }));
  };

  const clearCart = () => setCart([]);
  const cartTotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const addOrder = useCallback((order: Order) => {
    setOrdersState(prev => {
      const next = [order, ...prev.filter(o => o.id !== order.id)];
      lsSet('youtupia_orders', next);
      return next;
    });
    dbSaveOrder(order);
  }, []);

  const updateOrderStatus = useCallback((orderId: string, status: Order['status']) => {
    setOrdersState(prev => {
      const next = prev.map(o => o.id === orderId ? { ...o, status } : o);
      lsSet('youtupia_orders', next);
      return next;
    });
    dbUpdateOrder(orderId, { status });
  }, []);

  const updateOrder = useCallback((orderId: string, updates: Partial<Order>) => {
    setOrdersState(prev => {
      const next = prev.map(o => o.id === orderId ? { ...o, ...updates } : o);
      lsSet('youtupia_orders', next);
      return next;
    });
    dbUpdateOrder(orderId, updates);
  }, []);

  const deleteOrder = useCallback((orderId: string) => {
    setOrdersState(prev => {
      const next = prev.filter(o => o.id !== orderId);
      lsSet('youtupia_orders', next);
      return next;
    });
    dbDeleteOrder(orderId);
  }, []);

  const toggleWishlist = (productId: string) => setWishlist(prev => {
    const exists = prev.includes(productId);
    const next = exists ? prev.filter(id => id !== productId) : [...prev, productId];
    sonnerToast.message(exists ? 'Removed from wishlist' : 'Saved to wishlist');
    return next;
  });

  const addRecentlyViewed = (productId: string) =>
    setRecentlyViewed(prev =>
      [productId, ...prev.filter(id => id !== productId)].slice(0, 10)
    );

  const addReview = (productId: string, review: Omit<Review, 'id' | 'createdAt'>) => {
    const nr: Review = { ...review, id: `r${Date.now()}`, createdAt: new Date().toISOString() };
    setProductsState(prev => {
      const updated = prev.map(p =>
        p.id === productId ? { ...p, reviews: [...(p.reviews || []), nr] } : p
      );
      const updatedProduct = updated.find(p => p.id === productId);
      if (updatedProduct) dbSaveSingleRow('yt_products', updatedProduct);
      return updated;
    });
  };

  const validateDiscountCode = (code: string) => {
    const upper = code.trim().toUpperCase();
    const coupon = coupons.find(c => c.code.toUpperCase() === upper && c.active);
    if (!coupon) return { valid: false, pct: 0, amount: 0, type: 'percentage' as const };
    return {
      valid: true,
      pct: coupon.type === 'percentage' ? coupon.value : 0,
      amount: coupon.type === 'fixed' ? coupon.value : 0,
      type: coupon.type,
      coupon,
    };
  };

  return (
    <StoreContext.Provider value={{
      products, series, creators, cart, orders, wishlist, recentlyViewed,
      homePromo, coupons, topBanner, hydrating, dbLoading,
      setProducts, setProduct, deleteProduct, setSeries, setCreators,
      setHomePromo, setCoupons, setTopBanner,
      addToCart, removeFromCart, updateCartQty, clearCart, cartTotal, cartCount,
      addOrder, updateOrderStatus, updateOrder, deleteOrder,
      toggleWishlist, addRecentlyViewed, addReview, validateDiscountCode,
      syncOrdersForUser,
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
};
