import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// ── TYPES ──────────────────────────────────────────────
export interface ProductVariant {
  size: string;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  series: string;
  seriesId: string;
  price: number;
  originalPrice?: number;
  description: string;
  images: string[];
  variants: ProductVariant[];
  tags: string[];
  featured: boolean;
  createdAt: string;
}

export interface Series {
  id: string;
  name: string;
  description: string;
  logo: string;
  banner: string;
  color: string;
}

export interface CartItem {
  productId: string;
  size: string;
  quantity: number;
  product: Product;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'processing' | 'confirmed' | 'shipped' | 'delivered';
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  paymentId?: string;
  createdAt: string;
}

// ── DEFAULT DATA ────────────────────────────────────────
const DEFAULT_SERIES: Series[] = [
  {
    id: 'classic',
    name: 'Classic Drop',
    description: 'The OG collection. Timeless pieces that started it all.',
    logo: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=80&h=80&fit=crop',
    banner: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1200&h=400&fit=crop',
    color: '#3b82f6',
  },
  {
    id: 'streetwear',
    name: 'Street Series',
    description: 'Bold, unapologetic streetwear for the culture.',
    logo: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=80&h=80&fit=crop',
    banner: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&h=400&fit=crop',
    color: '#f97316',
  },
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'OG Logo Tee',
    series: 'Classic Drop',
    seriesId: 'classic',
    price: 799,
    originalPrice: 999,
    description: 'The original Youtupia logo tee. 100% cotton, heavyweight 240gsm. Drop-shoulder fit.',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=700&fit=crop',
      'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&h=700&fit=crop',
    ],
    variants: [
      { size: 'S', stock: 10 },
      { size: 'M', stock: 15 },
      { size: 'L', stock: 8 },
      { size: 'XL', stock: 5 },
      { size: 'XXL', stock: 3 },
    ],
    tags: ['tshirt', 'logo', 'bestseller'],
    featured: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'p2',
    name: 'Street Hoodie Black',
    series: 'Street Series',
    seriesId: 'streetwear',
    price: 1799,
    originalPrice: 2199,
    description: 'Heavyweight 380gsm fleece hoodie. Oversized fit. Kangaroo pocket. Ribbed cuffs.',
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&h=700&fit=crop',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=700&fit=crop',
    ],
    variants: [
      { size: 'S', stock: 5 },
      { size: 'M', stock: 12 },
      { size: 'L', stock: 10 },
      { size: 'XL', stock: 7 },
      { size: 'XXL', stock: 2 },
    ],
    tags: ['hoodie', 'street', 'bestseller'],
    featured: true,
    createdAt: '2026-01-15',
  },
  {
    id: 'p3',
    name: 'Classic Cap',
    series: 'Classic Drop',
    seriesId: 'classic',
    price: 499,
    description: '6-panel structured cap. Embroidered logo. One size fits all.',
    images: [
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&h=700&fit=crop',
    ],
    variants: [
      { size: 'One Size', stock: 20 },
    ],
    tags: ['cap', 'accessory'],
    featured: false,
    createdAt: '2026-02-01',
  },
  {
    id: 'p4',
    name: 'Street Cargo Tee',
    series: 'Street Series',
    seriesId: 'streetwear',
    price: 999,
    description: 'Washed cotton tee with cargo pocket detail. Relaxed fit. Vintage feel.',
    images: [
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=700&fit=crop',
      'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&h=700&fit=crop',
    ],
    variants: [
      { size: 'S', stock: 8 },
      { size: 'M', stock: 14 },
      { size: 'L', stock: 11 },
      { size: 'XL', stock: 6 },
    ],
    tags: ['tshirt', 'street'],
    featured: true,
    createdAt: '2026-02-10',
  },
  {
    id: 'p5',
    name: 'OG Sticker Pack',
    series: 'Classic Drop',
    seriesId: 'classic',
    price: 199,
    description: 'Pack of 6 vinyl stickers. Waterproof. Perfect for laptops, bottles, skateboards.',
    images: [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=700&fit=crop',
    ],
    variants: [
      { size: 'Pack of 6', stock: 50 },
    ],
    tags: ['sticker', 'accessory'],
    featured: false,
    createdAt: '2026-02-20',
  },
  {
    id: 'p6',
    name: 'Street Bomber Jacket',
    series: 'Street Series',
    seriesId: 'streetwear',
    price: 2999,
    originalPrice: 3499,
    description: 'Premium bomber jacket. Satin shell. Embroidered patches. Limited run.',
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=700&fit=crop',
    ],
    variants: [
      { size: 'S', stock: 3 },
      { size: 'M', stock: 5 },
      { size: 'L', stock: 4 },
      { size: 'XL', stock: 2 },
    ],
    tags: ['jacket', 'street', 'limited'],
    featured: true,
    createdAt: '2026-03-01',
  },
];

// ── CONTEXT ─────────────────────────────────────────────
interface StoreContextType {
  products: Product[];
  series: Series[];
  cart: CartItem[];
  orders: Order[];
  setProducts: (p: Product[]) => void;
  setSeries: (s: Series[]) => void;
  addToCart: (product: Product, size: string, qty?: number) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateCartQty: (productId: string, size: string, qty: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProductsState] = useState<Product[]>(() => {
    try {
      const stored = localStorage.getItem('youtupia_products');
      return stored ? JSON.parse(stored) : DEFAULT_PRODUCTS;
    } catch { return DEFAULT_PRODUCTS; }
  });

  const [series, setSeriesState] = useState<Series[]>(() => {
    try {
      const stored = localStorage.getItem('youtupia_series');
      return stored ? JSON.parse(stored) : DEFAULT_SERIES;
    } catch { return DEFAULT_SERIES; }
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem('youtupia_cart');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const stored = localStorage.getItem('youtupia_orders');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  // Persist to localStorage
  const setProducts = (p: Product[]) => {
    setProductsState(p);
    localStorage.setItem('youtupia_products', JSON.stringify(p));
  };
  const setSeries = (s: Series[]) => {
    setSeriesState(s);
    localStorage.setItem('youtupia_series', JSON.stringify(s));
  };

  useEffect(() => {
    localStorage.setItem('youtupia_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('youtupia_orders', JSON.stringify(orders));
  }, [orders]);

  const addToCart = (product: Product, size: string, qty = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.productId === product.id && i.size === size);
      if (existing) {
        return prev.map(i =>
          i.productId === product.id && i.size === size
            ? { ...i, quantity: i.quantity + qty }
            : i
        );
      }
      return [...prev, { productId: product.id, size, quantity: qty, product }];
    });
  };

  const removeFromCart = (productId: string, size: string) => {
    setCart(prev => prev.filter(i => !(i.productId === productId && i.size === size)));
  };

  const updateCartQty = (productId: string, size: string, qty: number) => {
    if (qty <= 0) { removeFromCart(productId, size); return; }
    setCart(prev => prev.map(i =>
      i.productId === productId && i.size === size ? { ...i, quantity: qty } : i
    ));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const addOrder = (order: Order) => {
    setOrders(prev => [order, ...prev]);
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  return (
    <StoreContext.Provider value={{
      products, series, cart, orders,
      setProducts, setSeries,
      addToCart, removeFromCart, updateCartQty, clearCart,
      cartTotal, cartCount,
      addOrder, updateOrderStatus,
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
