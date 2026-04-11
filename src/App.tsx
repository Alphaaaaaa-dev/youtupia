import { useState, useEffect, useRef } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { StoreProvider } from './contexts/StoreContext';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import { AuthProvider } from './contexts/AuthContext';

import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import ProtectedRoute from './components/ProtectedRoute';
import PromoBanner from './components/PromoBanner';

import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductPage from './pages/ProductPage';
import CataloguePage from './pages/CataloguePage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import OrdersPage from './pages/OrdersPage';
import AboutPage from './pages/AboutPage';
import FAQPage from './pages/FAQPage';
import PolicyPage from './pages/PolicyPage';
import ContactSupportPage from './pages/ContactSupportPage';
import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import CreatorPage from './pages/CreatorPage';
import DropsPage from './pages/DropsPage';
import WishlistPage from './pages/WishlistPage';
import TrackOrderPage from './pages/TrackOrderPage';
import { useStore } from './contexts/StoreContext';

const queryClient = new QueryClient();

// FIX: PageWrapper now only animates the container — it does NOT try to freeze/swap children.
// The old approach stored `children` in state and swapped them after a delay, which caused
// the product page to be blank because <Routes> returns a new JSX object every render,
// making the stale `displayed` state show the old page while the URL had already changed.
const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [visible, setVisible] = useState(true);
  const prevPath = useRef(location.pathname);

  useEffect(() => {
    if (location.pathname === prevPath.current) return;
    prevPath.current = location.pathname;
    setVisible(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, [location.pathname]);

  const style: React.CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(6px)',
    transition: visible
      ? 'opacity 0.3s cubic-bezier(0.22,1,0.36,1), transform 0.3s cubic-bezier(0.22,1,0.36,1)'
      : 'opacity 0.08s ease, transform 0.08s ease',
  };

  return <div style={style}>{children}</div>;
};

export const useReveal = () => {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.12 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  });
};

const StoreLayout = () => {
  const [cartOpen, setCartOpen] = useState(false);
  const { topBanner } = useStore();

  const bannerHeight = topBanner.enabled ? 32 : 0;
  // Navbar has two rows: top bar (58px) + nav links bar (~40px) = ~98px total
  const navbarHeight = 98;
  const topOffset = bannerHeight + navbarHeight;

  return (
    <>
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <PromoBanner />
      <Navbar onCartOpen={() => setCartOpen(true)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Page content — offset from fixed navbar */}
      <div style={{ marginTop: `${topOffset}px` }}>
        <PageWrapper>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/catalogue" element={<CataloguePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/policy" element={<PolicyPage />} />
            <Route path="/contact" element={<ContactSupportPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/creator/:handle" element={<CreatorPage />} />
            <Route path="/drops" element={<DropsPage />} />
            <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            <Route path="/order-success" element={<ProtectedRoute><OrderSuccessPage /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
            <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
            <Route path="/track-order" element={<ProtectedRoute><TrackOrderPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </PageWrapper>
      </div>
    </>
  );
};

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <AdminAuthProvider>
        <StoreProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/admin" element={<AdminLoginPage />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/*" element={<StoreLayout />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </QueryClientProvider>
        </StoreProvider>
      </AdminAuthProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
