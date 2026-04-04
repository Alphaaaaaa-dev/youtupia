import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const LoginPage = () => {
  const { login, signup, user } = useAuth() as any;
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirectTo = params.get('redirect') || '/';
  const [mode, setMode] = useState(params.get('mode') === 'signup' ? 'signup' : 'login');
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  // If already logged in, redirect immediately
  useEffect(() => {
    if (user) navigate(redirectTo, { replace: true });
  }, [user]);

  const inp: React.CSSProperties = {
    width: '100%', padding: '11px 14px',
    background: isDark ? 'hsl(0 0% 8%)' : 'hsl(var(--secondary))',
    border: '1.5px solid hsl(var(--border))', borderRadius: '10px',
    color: 'hsl(var(--foreground))', fontFamily: 'Roboto, sans-serif',
    fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const,
    transition: 'border-color 0.2s',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      if (mode === 'login') {
        const res = await login(form.email, form.password);
        if (res?.error) { setError(res.error); }
        else { navigate(redirectTo, { replace: true }); }
      } else {
        const res = await signup(form.email, form.password, form.name);
        if (res?.error) { setError(res.error); }
        else if (res?.needsConfirmation) {
          setSuccess('Check your email for a confirmation link, then sign in.');
          setMode('login');
        } else if (res?.needsOTP) {
          setSuccess('OTP sent to your email. Please verify to continue.');
        } else {
          navigate(redirectTo, { replace: true });
        }
      }
    } catch (err: any) { setError(err.message || 'Something went wrong'); }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', background: 'hsl(var(--background))',
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', marginBottom: '20px' }}>
            <img src="/favicon.ico" alt="Youtupia" style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'contain', display: 'block' }} />
            <span style={{ fontWeight: 800, fontSize: '20px', color: 'hsl(var(--foreground))' }}>Youtupia</span>
          </Link>
          <h1 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 6px' }}>
            {mode === 'login' ? 'Welcome back 👋' : 'Join the culture 🔥'}
          </h1>
          <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '13px', margin: 0 }}>
            {mode === 'login' ? 'Sign in to your account to continue' : 'Create an account to shop & track orders'}
          </p>

          {/* Redirect hint — shown when user was sent here to checkout */}
          {params.get('redirect')?.includes('checkout') && (
            <div style={{
              marginTop: '14px', background: 'rgba(255,165,0,0.1)',
              border: '1px solid rgba(255,165,0,0.3)', borderRadius: '10px',
              padding: '10px 14px', fontSize: '13px', color: '#f59e0b',
            }}>
              🔒 Please sign in to complete your order
            </div>
          )}
        </div>

        <div style={{
          background: isDark ? 'hsl(0 0% 10%)' : 'white',
          border: '1px solid hsl(var(--border))', borderRadius: '18px', padding: '28px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
        }}>
          <form onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Full Name</label>
                <input
                  type="text" required value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Rahul Kumar" style={inp}
                  onFocus={e => (e.target.style.borderColor = '#ff0000')}
                  onBlur={e => (e.target.style.borderColor = 'hsl(var(--border))')}
                />
              </div>
            )}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email</label>
              <input
                type="email" required value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@example.com" style={inp}
                onFocus={e => (e.target.style.borderColor = '#ff0000')}
                onBlur={e => (e.target.style.borderColor = 'hsl(var(--border))')}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Password</label>
              <input
                type="password" required value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Min. 6 characters" style={inp}
                onFocus={e => (e.target.style.borderColor = '#ff0000')}
                onBlur={e => (e.target.style.borderColor = 'hsl(var(--border))')}
              />
            </div>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#ef4444' }}>
                ⚠️ {error}
              </div>
            )}
            {success && (
              <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#16a34a' }}>
                ✅ {success}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="btn-yt"
              style={{ width: '100%', justifyContent: 'center', borderRadius: '10px', padding: '13px', fontSize: '15px', fontWeight: 700, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Please wait...' : mode === 'login' ? '→ Sign in' : '→ Create account'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setSuccess(''); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff0000', fontWeight: 700, fontSize: '13px', padding: 0 }}
            >
              {mode === 'login' ? 'Sign up free' : 'Sign in'}
            </button>
          </div>
        </div>

        {mode === 'signup' && (
          <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>
            By creating an account you agree to our{' '}
            <Link to="/policy" style={{ color: '#ff0000', textDecoration: 'none' }}>Terms & Privacy Policy</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
