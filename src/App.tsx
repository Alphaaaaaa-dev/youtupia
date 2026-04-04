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

const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [displayed, setDisplayed] = useState(children);
  const [phase, setPhase] = useState<'idle' | 'exit' | 'enter'>('idle');
  const prevPath = useRef(location.pathname);

  useEffect(() => {
    if (location.pathname === prevPath.current) return;
    prevPath.current = location.pathname;
    setPhase('exit');
    const t1 = setTimeout(() => { setDisplayed(children); setPhase('enter'); window.scrollTo({ top: 0, behavior: 'instant' }); }, 220);
    const t2 = setTimeout(() => setPhase('idle'), 520);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [location.pathname, children]);

  const style: React.CSSProperties = {
    opacity: phase === 'exit' ? 0 : 1,
    transform: phase === 'exit' ? 'translateY(-8px)' : phase === 'enter' ? 'translateY(0)' : 'none',
    transition: phase === 'exit' ? 'opacity 0.22s ease, transform 0.22s ease' : 'opacity 0.35s cubic-bezier(0.22,1,0.36,1), transform 0.35s cubic-bezier(0.22,1,0.36,1)',
  };

  return <div style={style}>{displayed}</div>;
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
