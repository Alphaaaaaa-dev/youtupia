import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast as sonnerToast } from '@/components/ui/sonner';

export interface ProductVariant { size: string; stock: number; }
export interface Review { id: string; userName: string; rating: number; comment: string; createdAt: string; verified: boolean; }
export interface Product {
  id: string; name: string; series: string; seriesId: string; creatorId?: string; dropId?: string;
  price: number; originalPrice?: number; description: string; images: string[];
  variants: ProductVariant[]; tags: string[]; featured: boolean; createdAt: string;
  reviews?: Review[]; viewerCount?: number; limitedEdition?: boolean; dropEndsAt?: string;
}
export interface Series { id: string; name: string; description: string; logo: string; banner: string; color: string; }
export interface Creator {
  id: string; name: string; handle: string; bio: string; avatar: string; banner: string;
  youtubeUrl?: string; youtubeVideoId?: string; subscribers?: string; productIds: string[]; dropCountdownEnd?: string;
}
export interface Drop {
  id: string; name: string; description: string; dropNumber: number; theme: string;
  banner: string; endsAt?: string; productIds: string[]; limited: boolean;
}
export interface CartItem { productId: string; size: string; quantity: number; product: Product; }
export interface Order {
  id: string; items: CartItem[]; total: number;
  status: 'processing' | 'confirmed' | 'shipped' | 'delivered';
  customerName: string; customerEmail: string; customerPhone: string; address: string;
  paymentId?: string; createdAt: string; discountCode?: string; discountAmount?: number;
  paymentMethod: 'razorpay' | 'cod';
  codCharge?: number;
  trackingId?: string;
  trackingUrl?: string;
  notes?: string;
}
export interface HomePromo {
  videoUrl: string;
  posterUrl?: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
}
export interface DiscountCoupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  active: boolean;
  description?: string;
}
export interface TopBanner {
  enabled: boolean;
  messages: string[];
  bgColor: string;
  textColor: string;
}

const DEFAULT_CREATORS: Creator[] = [
  { id: 'creator1', name: 'Carry Minati', handle: 'carryminati', bio: "India's biggest YouTuber.", avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face', banner: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=1200&h=400&fit=crop', subscribers: '41M', productIds: ['p1', 'p3'], dropCountdownEnd: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'creator2', name: 'Techno Gamerz', handle: 'technogamerz', bio: 'Gaming king of India.', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=face', banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&h=400&fit=crop', subscribers: '36M', productIds: ['p2', 'p6'], dropCountdownEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() },
];
const DEFAULT_DROPS: Drop[] = [
  { id: 'drop001', name: 'Drop 001 — The OG', description: 'Where it all started.', dropNumber: 1, theme: 'Streetwear Classics', banner: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1200&h=400&fit=crop', productIds: ['p1', 'p3', 'p5'], limited: false },
  { id: 'drop002', name: 'Drop 002 — Street', description: 'Bold. Unapologetic.', dropNumber: 2, theme: 'Urban Streetwear', banner: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&h=400&fit=crop', endsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), productIds: ['p2', 'p4', 'p6'], limited: true },
];
const DEFAULT_SERIES: Series[] = [
  { id: 'classic', name: 'Classic Drop', description: 'The OG collection.', logo: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=80&h=80&fit=crop', banner: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1200&h=400&fit=crop', color: '#3b82f6' },
  { id: 'streetwear', name: 'Street Series', description: 'Bold streetwear.', logo: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=80&h=80&fit=crop', banner: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&h=400&fit=crop', color: '#f97316' },
];
const DEFAULT_PRODUCTS: Product[] = [
  { id: 'p1', name: 'OG Logo Tee', series: 'Classic Drop', seriesId: 'classic', creatorId: 'creator1', dropId: 'drop001', price: 799, originalPrice: 999, description: 'The original Youtupia logo tee. 100% cotton, heavyweight 240gsm.', images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=700&fit=crop', 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&h=700&fit=crop'], variants: [{ size: 'S', stock: 10 }, { size: 'M', stock: 15 }, { size: 'L', stock: 8 }, { size: 'XL', stock: 5 }, { size: 'XXL', stock: 3 }], tags: ['tshirt', 'logo', 'bestseller'], featured: true, createdAt: '2026-01-01', viewerCount: 14, reviews: [{ id: 'r1', userName: 'Rahul K.', rating: 5, comment: 'Absolute fire quality!', createdAt: '2026-02-15', verified: true }, { id: 'r2', userName: 'Priya M.', rating: 4, comment: 'Great tee, runs slightly large.', createdAt: '2026-03-01', verified: true }] },
  { id: 'p2', name: 'Street Hoodie Black', series: 'Street Series', seriesId: 'streetwear', creatorId: 'creator2', dropId: 'drop002', price: 1799, originalPrice: 2199, description: 'Heavyweight 380gsm fleece hoodie. Oversized fit.', images: ['https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&h=700&fit=crop', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=700&fit=crop'], variants: [{ size: 'S', stock: 5 }, { size: 'M', stock: 12 }, { size: 'L', stock: 10 }, { size: 'XL', stock: 7 }, { size: 'XXL', stock: 2 }], tags: ['hoodie', 'street', 'bestseller'], featured: true, createdAt: '2026-01-15', viewerCount: 27, limitedEdition: true, dropEndsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), reviews: [{ id: 'r3', userName: 'Arjun S.', rating: 5, comment: "Best hoodie ever.", createdAt: '2026-02-20', verified: true }] },
  { id: 'p3', name: 'Classic Cap', series: 'Classic Drop', seriesId: 'classic', creatorId: 'creator1', dropId: 'drop001', price: 499, description: '6-panel structured cap. Embroidered logo.', images: ['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&h=700&fit=crop'], variants: [{ size: 'One Size', stock: 20 }], tags: ['cap', 'accessory'], featured: false, createdAt: '2026-02-01', viewerCount: 6 },
  { id: 'p4', name: 'Street Cargo Tee', series: 'Street Series', seriesId: 'streetwear', dropId: 'drop002', price: 999, description: 'Washed cotton tee with cargo pocket detail.', images: ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=700&fit=crop', 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&h=700&fit=crop'], variants: [{ size: 'S', stock: 8 }, { size: 'M', stock: 14 }, { size: 'L', stock: 11 }, { size: 'XL', stock: 6 }], tags: ['tshirt', 'street'], featured: true, createdAt: '2026-02-10', viewerCount: 9 },
  { id: 'p5', name: 'OG Sticker Pack', series: 'Classic Drop', seriesId: 'classic', dropId: 'drop001', price: 199, description: 'Pack of 6 vinyl stickers. Waterproof.', images: ['https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=700&fit=crop'], variants: [{ size: 'Pack of 6', stock: 50 }], tags: ['sticker', 'accessory'], featured: false, createdAt: '2026-02-20', viewerCount: 3 },
  { id: 'p6', name: 'Street Bomber Jacket', series: 'Street Series', seriesId: 'streetwear', creatorId: 'creator2', dropId: 'drop002', price: 2999, originalPrice: 3499, description: 'Premium bomber jacket. Satin shell. Embroidered patches.', images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=700&fit=crop'], variants: [{ size: 'S', stock: 3 }, { size: 'M', stock: 5 }, { size: 'L', stock: 4 }, { size: 'XL', stock: 2 }], tags: ['jacket', 'street', 'limited'], featured: true, createdAt: '2026-03-01', viewerCount: 31, limitedEdition: true, dropEndsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() },
];

const DEFAULT_COUPONS: DiscountCoupon[] = [
  { id: 'c1', code: 'YOUTUPIA10', type: 'percentage', value: 10, active: true, description: '10% off for Youtupia community' },
];

const DEFAULT_HOME_PROMO: HomePromo = {
  videoUrl: '', posterUrl: '', title: 'Promotion Video', subtitle: 'Creator drop preview', ctaText: 'Watch Drop', ctaLink: '/drops',
};

const DEFAULT_TOP_BANNER: TopBanner = {
  enabled: true,
  messages: [
    '🔥 Free shipping on orders above ₹999',
    '⚡ New drops every Friday — Follow us to stay updated',
    '🎁 Use code YOUTUPIA10 for 10% off your first order',
    '🚚 COD available across India',
  ],
  bgColor: '#ff0000',
  textColor: '#ffffff',
};

interface StoreContextType {
  products: Product[]; series: Series[]; creators: Creator[]; drops: Drop[];
  cart: CartItem[]; orders: Order[]; wishlist: string[]; recentlyViewed: string[];
  homePromo: HomePromo; coupons: DiscountCoupon[]; topBanner: TopBanner;
  hydrating: boolean;
  setProducts: (p: Product[]) => void; setSeries: (s: Series[]) => void;
  setCreators: (c: Creator[]) => void; setDrops: (d: Drop[]) => void;
  setHomePromo: (p: HomePromo) => void; setCoupons: (c: DiscountCoupon[]) => void; setTopBanner: (b: TopBanner) => void;
  addToCart: (product: Product, size: string, qty?: number) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateCartQty: (productId: string, size: string, qty: number) => void;
  clearCart: () => void; cartTotal: number; cartCount: number;
  addOrder: (order: Order) => void; updateOrderStatus: (orderId: string, status: Order['status']) => void;
  toggleWishlist: (productId: string) => void; addRecentlyViewed: (productId: string) => void;
  addReview: (productId: string, review: Omit<Review, 'id' | 'createdAt'>) => void;
  validateDiscountCode: (code: string) => { valid: boolean; pct: number; amount: number; type: 'percentage' | 'fixed'; coupon?: DiscountCoupon };
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [hydrating, setHydrating] = useState(true);
  useEffect(() => { const t = setTimeout(() => setHydrating(false), 520); return () => clearTimeout(t); }, []);

  const [products, setProductsState] = useState<Product[]>(() => { try { const s = localStorage.getItem('youtupia_products'); return s ? JSON.parse(s) : DEFAULT_PRODUCTS; } catch { return DEFAULT_PRODUCTS; } });
  const [series, setSeriesState] = useState<Series[]>(() => { try { const s = localStorage.getItem('youtupia_series'); return s ? JSON.parse(s) : DEFAULT_SERIES; } catch { return DEFAULT_SERIES; } });
  const [creators, setCreatorsState] = useState<Creator[]>(() => { try { const s = localStorage.getItem('youtupia_creators'); return s ? JSON.parse(s) : DEFAULT_CREATORS; } catch { return DEFAULT_CREATORS; } });
  const [drops, setDropsState] = useState<Drop[]>(() => { try { const s = localStorage.getItem('youtupia_drops'); return s ? JSON.parse(s) : DEFAULT_DROPS; } catch { return DEFAULT_DROPS; } });
  const [cart, setCart] = useState<CartItem[]>(() => { try { const s = localStorage.getItem('youtupia_cart'); return s ? JSON.parse(s) : []; } catch { return []; } });
  const [orders, setOrders] = useState<Order[]>(() => { try { const s = localStorage.getItem('youtupia_orders'); return s ? JSON.parse(s) : []; } catch { return []; } });
  const [wishlist, setWishlist] = useState<string[]>(() => { try { const s = localStorage.getItem('youtupia_wishlist'); return s ? JSON.parse(s) : []; } catch { return []; } });
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(() => { try { const s = localStorage.getItem('youtupia_recent'); return s ? JSON.parse(s) : []; } catch { return []; } });
  const [homePromo, setHomePromoState] = useState<HomePromo>(() => { try { const s = localStorage.getItem('youtupia_home_promo'); return s ? JSON.parse(s) : DEFAULT_HOME_PROMO; } catch { return DEFAULT_HOME_PROMO; } });
  const [coupons, setCouponsState] = useState<DiscountCoupon[]>(() => { try { const s = localStorage.getItem('youtupia_coupons'); return s ? JSON.parse(s) : DEFAULT_COUPONS; } catch { return DEFAULT_COUPONS; } });
  const [topBanner, setTopBannerState] = useState<TopBanner>(() => { try { const s = localStorage.getItem('youtupia_top_banner'); return s ? JSON.parse(s) : DEFAULT_TOP_BANNER; } catch { return DEFAULT_TOP_BANNER; } });

  const setProducts = (p: Product[]) => { setProductsState(p); localStorage.setItem('youtupia_products', JSON.stringify(p)); };
  const setSeries = (s: Series[]) => { setSeriesState(s); localStorage.setItem('youtupia_series', JSON.stringify(s)); };
  const setCreators = (c: Creator[]) => { setCreatorsState(c); localStorage.setItem('youtupia_creators', JSON.stringify(c)); };
  const setDrops = (d: Drop[]) => { setDropsState(d); localStorage.setItem('youtupia_drops', JSON.stringify(d)); };
  const setHomePromo = (p: HomePromo) => { setHomePromoState(p); localStorage.setItem('youtupia_home_promo', JSON.stringify(p)); };
  const setCoupons = (c: DiscountCoupon[]) => { setCouponsState(c); localStorage.setItem('youtupia_coupons', JSON.stringify(c)); };
  const setTopBanner = (b: TopBanner) => { setTopBannerState(b); localStorage.setItem('youtupia_top_banner', JSON.stringify(b)); };

  useEffect(() => { localStorage.setItem('youtupia_cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('youtupia_orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('youtupia_wishlist', JSON.stringify(wishlist)); }, [wishlist]);
  useEffect(() => { localStorage.setItem('youtupia_recent', JSON.stringify(recentlyViewed)); }, [recentlyViewed]);

  const addToCart = (product: Product, size: string, qty = 1) => {
    const variant = product.variants.find(v => v.size === size);
    const variantStock = variant?.stock ?? 0;
    if (variantStock <= 0) { sonnerToast.message('Out of stock', { description: `${product.name} (${size}) is unavailable.` }); return; }
    setCart(prev => {
      const ex = prev.find(i => i.productId === product.id && i.size === size);
      if (ex) {
        const nextQty = ex.quantity + qty;
        if (nextQty > variantStock) { sonnerToast.message('Stock limit reached', { description: `Only ${variantStock} left for ${product.name} (${size}).` }); return prev; }
        return prev.map(i => i.productId === product.id && i.size === size ? { ...i, quantity: nextQty } : i);
      }
      if (qty > variantStock) { sonnerToast.message('Stock limit reached', { description: `Only ${variantStock} left for ${product.name} (${size}).` }); return prev; }
      return [...prev, { productId: product.id, size, quantity: qty, product }];
    });
    sonnerToast.success('Added to cart', { description: `${product.name} · ${size}` });
  };
  const removeFromCart = (productId: string, size: string) => setCart(prev => prev.filter(i => !(i.productId === productId && i.size === size)));
  const updateCartQty = (productId: string, size: string, qty: number) => {
    if (qty <= 0) { removeFromCart(productId, size); return; }
    setCart(prev => prev.map(i => {
      if (!(i.productId === productId && i.size === size)) return i;
      const liveProduct = products.find(p => p.id === productId);
      const liveVariant = liveProduct?.variants.find(v => v.size === size);
      const maxStock = liveVariant?.stock ?? i.quantity;
      if (qty > maxStock) { sonnerToast.message('Stock limit reached', { description: `Only ${maxStock} left for ${i.product.name} (${size}).` }); return { ...i, quantity: maxStock }; }
      return { ...i, quantity: qty };
    }));
  };
  const clearCart = () => setCart([]);
  const cartTotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const addOrder = (order: Order) => setOrders(prev => [order, ...prev]);
  const updateOrderStatus = (orderId: string, status: Order['status']) => setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  const toggleWishlist = (productId: string) => setWishlist(prev => {
    const exists = prev.includes(productId);
    const next = exists ? prev.filter(id => id !== productId) : [...prev, productId];
    sonnerToast.message(exists ? 'Removed from wishlist' : 'Saved to wishlist', { description: exists ? 'Your favorites have been updated.' : 'We\u2019ll keep this one ready for you.' });
    return next;
  });
  const addRecentlyViewed = (productId: string) => setRecentlyViewed(prev => [productId, ...prev.filter(id => id !== productId)].slice(0, 10));
  const addReview = (productId: string, review: Omit<Review, 'id' | 'createdAt'>) => { const nr: Review = { ...review, id: `r${Date.now()}`, createdAt: new Date().toISOString() }; setProducts(products.map(p => p.id === productId ? { ...p, reviews: [...(p.reviews || []), nr] } : p)); };

  const validateDiscountCode = (code: string) => {
    const upper = code.trim().toUpperCase();
    const coupon = coupons.find(c => c.code.toUpperCase() === upper && c.active);
    if (!coupon) return { valid: false, pct: 0, amount: 0, type: 'percentage' as const };
    return { valid: true, pct: coupon.type === 'percentage' ? coupon.value : 0, amount: coupon.type === 'fixed' ? coupon.value : 0, type: coupon.type, coupon };
  };

  const updateOrder = (orderId: string, updates: Partial<Order>) => setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updates } : o));

  return (
    <StoreContext.Provider value={{ products, series, creators, drops, cart, orders, wishlist, recentlyViewed, homePromo, coupons, topBanner, hydrating, setProducts, setSeries, setCreators, setDrops, setHomePromo, setCoupons, setTopBanner, addToCart, removeFromCart, updateCartQty, clearCart, cartTotal, cartCount, addOrder, updateOrderStatus, updateOrder, toggleWishlist, addRecentlyViewed, addReview, validateDiscountCode }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => { const ctx = useContext(StoreContext); if (!ctx) throw new Error('useStore must be used within StoreProvider'); return ctx; };
