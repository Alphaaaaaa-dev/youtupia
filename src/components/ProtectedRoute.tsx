import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * ProtectedRoute — wraps any page that requires a logged-in user.
 * If not authenticated, redirects to /login?redirect=<current path>
 * so the user is sent back after signing in.
 */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth() as any;
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`, { replace: true });
    }
  }, [user, loading, navigate, location]);

  // While auth is loading show nothing (splash is already handled by app)
  if (loading) return null;

  // Not logged in — will redirect via useEffect, render nothing meanwhile
  if (!user) return null;

  return <>{children}</>;
};

export default ProtectedRoute;
