import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, RefreshCw } from 'lucide-react';

type Step = 'login' | 'signup' | 'otp';

const LoginPage = () => {
  const { login, signup, verifyOtp, user } = useAuth() as any;
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirectTo = params.get('redirect') || '/';

  const [step, setStep] = useState<Step>(params.get('mode') === 'signup' ? 'signup' : 'login');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [userId, setUserId] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => { if (user) navigate(redirectTo, { replace: true }); }, [user]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const set = (k: string, v: string) => { setForm(f => ({ ...f, [k]: v })); setError(''); };

  const inp = (icon: React.ReactNode, key: string, label: string, type = 'text', ph = '', extra?: React.ReactNode) => (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, marginBottom: '7px', color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</label>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'absolute', left: '13px', color: 'hsl(var(--muted-foreground))', display: 'flex', pointerEvents: 'none', zIndex: 1 }}>{icon}</div>
        <input type={type} value={(form as any)[key]} onChange={e => set(key, e.target.value)} placeholder={ph} required
          style={{ width: '100%', padding: '11px 14px 11px 40px', background: isDark ? 'hsl(0 0% 8%)' : 'hsl(var(--secondary))', border: '1.5px solid hsl(var(--border))', borderRadius: '10px', color: 'hsl(var(--foreground))', fontFamily: 'Roboto, sans-serif', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const, transition: 'border-color 0.2s, box-shadow 0.2s' }}
          onFocus={e => { e.target.style.borderColor = '#ff0000'; e.target.style.boxShadow = '0 0 0 3px rgba(255,0,0,0.08)'; }}
          onBlur={e => { e.target.style.borderColor = 'hsl(var(--border))'; e.target.style.boxShadow = 'none'; }}
        />
        {extra && <div style={{ position: 'absolute', right: '12px' }}>{extra}</div>}
      </div>
    </div>
  );

  // ── OTP input boxes ──────────────────────────────────────────────────────
  const handleOtpChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    setError('');
    if (val && i < 5) {
      const el = document.getElementById(`otp-${i + 1}`);
      el?.focus();
    }
  };
  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      document.getElementById(`otp-${i - 1}`)?.focus();
    }
  };
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      document.getElementById('otp-5')?.focus();
    }
    e.preventDefault();
  };

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    setLoading(true); setError('');
    const res = await login(form.email, form.password);
    if (res?.error) setError(res.error);
    else navigate(redirectTo, { replace: true });
    setLoading(false);
  };

  const handleSignup = async () => {
    if (!form.name.trim()) { setError('Please enter your full name.'); return; }
    if (!form.email.includes('@')) { setError('Please enter a valid email address.'); return; }
    const phoneDigits = form.phone.replace(/\D/g, '');
    if (form.phone && phoneDigits.length !== 10) { setError('Phone number must be 10 digits.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true); setError('');
    const res = await signup(form.email, form.password, form.name, form.phone);
    if (res?.error) { setError(res.error); setLoading(false); return; }
    if (res?.needsOTP) {
      setUserId(res.userId);
      setStep('otp');
      setSuccess(`OTP sent to ${form.email}`);
      setResendTimer(60);
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    const code = otp.join('');
    if (code.length !== 6) { setError('Please enter the complete 6-digit OTP.'); return; }
    setLoading(true); setError('');
    const res = await verifyOtp(userId, code, form.email, form.password);
    if (res?.error) { setError(res.error); setLoading(false); return; }
    navigate(redirectTo, { replace: true });
    setLoading(false);
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setLoading(true); setError(''); setSuccess('');
    const res = await signup(form.email, form.password, form.name, form.phone);
    if (res?.error) { setError(res.error); }
    else { setSuccess('New OTP sent to your email.'); setResendTimer(60); setOtp(['', '', '', '', '', '']); }
    setLoading(false);
  };

  const card: React.CSSProperties = { background: isDark ? 'hsl(0 0% 10%)' : 'white', border: '1px solid hsl(var(--border))', borderRadius: '18px', padding: '28px', boxShadow: '0 8px 40px rgba(0,0,0,0.12)' };
  const btnPrimary: React.CSSProperties = { width: '100%', padding: '13px', background: loading ? 'rgba(255,0,0,0.6)' : '#ff0000', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 700, fontFamily: 'Roboto, sans-serif', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background 0.2s', marginTop: '4px' };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'hsl(var(--background))' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '16px' }}>
            <img src="/favicon.ico" alt="Youtupia" style={{ width: '38px', height: '38px', borderRadius: '9px', objectFit: 'contain' }} />
            <span style={{ fontWeight: 900, fontSize: '22px', color: 'hsl(var(--foreground))', letterSpacing: '-0.5px' }}>Youtupia</span>
          </Link>
          <h1 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 6px', color: 'hsl(var(--foreground))' }}>
            {step === 'login' ? 'Welcome back 👋' : step === 'signup' ? 'Join the culture 🔥' : 'Verify your email 📧'}
          </h1>
          <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '13px', margin: 0 }}>
            {step === 'login' ? 'Sign in to your account to continue'
              : step === 'signup' ? 'Create an account to shop & track orders'
              : `Enter the 6-digit code sent to ${form.email}`}
          </p>
          {params.get('redirect')?.includes('checkout') && (
            <div style={{ marginTop: '14px', background: 'rgba(255,165,0,0.1)', border: '1px solid rgba(255,165,0,0.3)', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#f59e0b' }}>
              🔒 Please sign in to complete your order
            </div>
          )}
        </div>

        <div style={card}>

          {/* ── LOGIN ── */}
          {step === 'login' && (
            <>
              {inp(<Mail size={15} />, 'email', 'Email Address', 'email', 'you@example.com')}
              {inp(<Lock size={15} />, 'password', 'Password', showPass ? 'text' : 'password', 'Min. 6 characters',
                <button type="button" onClick={() => setShowPass(s => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--muted-foreground))', display: 'flex', padding: '2px' }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              )}
              {error && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '10px 14px', marginBottom: '14px', fontSize: '13px', color: '#ef4444' }}>⚠️ {error}</div>}
              <button onClick={handleLogin} disabled={loading} style={btnPrimary}>
                {loading ? 'Signing in...' : <><ArrowRight size={16} /> Sign In</>}
              </button>
              <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>
                Don't have an account?{' '}
                <button onClick={() => { setStep('signup'); setError(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff0000', fontWeight: 700, fontSize: '13px', padding: 0 }}>
                  Sign up free
                </button>
              </div>
            </>
          )}

          {/* ── SIGNUP ── */}
          {step === 'signup' && (
            <>
              {inp(<User size={15} />, 'name', 'Full Name', 'text', 'Rahul Kumar')}
              {inp(<Mail size={15} />, 'email', 'Email Address', 'email', 'you@example.com')}

              {/* Phone with +91 prefix */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, marginBottom: '7px', color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Phone Number <span style={{ color: '#64748b', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '11px 12px', background: isDark ? 'hsl(0 0% 8%)' : 'hsl(var(--secondary))', border: '1.5px solid hsl(var(--border))', borderRadius: '10px', flexShrink: 0, fontSize: '14px', color: 'hsl(var(--foreground))', fontFamily: 'Roboto, sans-serif' }}>
                    <span>🇮🇳</span> <span style={{ fontWeight: 600 }}>+91</span>
                  </div>
                  <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                    <div style={{ position: 'absolute', left: '13px', color: 'hsl(var(--muted-foreground))', display: 'flex', pointerEvents: 'none' }}><Phone size={15} /></div>
                    <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="9999999999"
                      style={{ width: '100%', padding: '11px 14px 11px 40px', background: isDark ? 'hsl(0 0% 8%)' : 'hsl(var(--secondary))', border: '1.5px solid hsl(var(--border))', borderRadius: '10px', color: 'hsl(var(--foreground))', fontFamily: 'Roboto, sans-serif', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const, transition: 'border-color 0.2s, box-shadow 0.2s' }}
                      onFocus={e => { e.target.style.borderColor = '#ff0000'; e.target.style.boxShadow = '0 0 0 3px rgba(255,0,0,0.08)'; }}
                      onBlur={e => { e.target.style.borderColor = 'hsl(var(--border))'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '5px' }}>Used for delivery updates & order tracking</div>
              </div>

              {inp(<Lock size={15} />, 'password', 'Password', showPass ? 'text' : 'password', 'Min. 6 characters',
                <button type="button" onClick={() => setShowPass(s => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--muted-foreground))', display: 'flex', padding: '2px' }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              )}
              {inp(<Lock size={15} />, 'confirmPassword', 'Confirm Password', showConfirm ? 'text' : 'password', 'Re-enter password',
                <button type="button" onClick={() => setShowConfirm(s => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--muted-foreground))', display: 'flex', padding: '2px' }}>
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              )}

              {/* Password strength indicator */}
              {form.password.length > 0 && (
                <div style={{ marginBottom: '14px', marginTop: '-8px' }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                    {[1, 2, 3, 4].map(i => {
                      const strength = form.password.length >= 6 ? (form.password.length >= 10 ? ((/[A-Z]/.test(form.password) && /\d/.test(form.password)) ? 4 : 3) : 2) : 1;
                      return <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: i <= strength ? (strength <= 1 ? '#ef4444' : strength <= 2 ? '#f59e0b' : strength <= 3 ? '#3b82f6' : '#22c55e') : 'hsl(var(--border))' }} />;
                    })}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>
                    {form.password.length < 6 ? 'Too short' : form.password.length < 10 ? 'Weak — try adding numbers or symbols' : (/[A-Z]/.test(form.password) && /\d/.test(form.password)) ? 'Strong password ✓' : 'Good — add uppercase for strong'}
                  </div>
                </div>
              )}

              {error && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '10px 14px', marginBottom: '14px', fontSize: '13px', color: '#ef4444' }}>⚠️ {error}</div>}

              <button onClick={handleSignup} disabled={loading} style={btnPrimary}>
                {loading ? 'Creating account...' : <><ArrowRight size={16} /> Create Account</>}
              </button>

              <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>
                Already have an account?{' '}
                <button onClick={() => { setStep('login'); setError(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff0000', fontWeight: 700, fontSize: '13px', padding: 0 }}>
                  Sign in
                </button>
              </div>
            </>
          )}

          {/* ── OTP VERIFICATION ── */}
          {step === 'otp' && (
            <>
              {/* Email badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', borderRadius: '12px', marginBottom: '24px', border: '1px solid hsl(var(--border))' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(255,0,0,0.1)', border: '2px solid rgba(255,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Mail size={16} style={{ color: '#ff0000' }} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>OTP sent to</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'hsl(var(--foreground))' }}>{form.email}</div>
                </div>
              </div>

              {/* 6-box OTP input */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '24px' }} onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    style={{
                      width: '48px', height: '56px', textAlign: 'center', fontSize: '22px', fontWeight: 800,
                      background: isDark ? 'hsl(0 0% 8%)' : 'hsl(var(--secondary))',
                      border: `2px solid ${digit ? '#ff0000' : 'hsl(var(--border))'}`,
                      borderRadius: '12px', color: 'hsl(var(--foreground))',
                      outline: 'none', fontFamily: 'monospace', transition: 'border-color 0.15s, box-shadow 0.15s',
                      boxShadow: digit ? '0 0 0 3px rgba(255,0,0,0.1)' : 'none',
                    }}
                    onFocus={e => { e.target.style.borderColor = '#ff0000'; e.target.style.boxShadow = '0 0 0 3px rgba(255,0,0,0.12)'; }}
                    onBlur={e => { if (!digit) { e.target.style.borderColor = 'hsl(var(--border))'; e.target.style.boxShadow = 'none'; } }}
                  />
                ))}
              </div>

              {error && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '10px 14px', marginBottom: '14px', fontSize: '13px', color: '#ef4444' }}>⚠️ {error}</div>}
              {success && <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '10px', padding: '10px 14px', marginBottom: '14px', fontSize: '13px', color: '#16a34a' }}>✅ {success}</div>}

              <button onClick={handleVerifyOtp} disabled={loading || otp.join('').length < 6} style={{ ...btnPrimary, opacity: (loading || otp.join('').length < 6) ? 0.6 : 1 }}>
                {loading ? 'Verifying...' : <><ArrowRight size={16} /> Verify & Create Account</>}
              </button>

              {/* Resend */}
              <div style={{ textAlign: 'center', marginTop: '18px' }}>
                {resendTimer > 0 ? (
                  <div style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>
                    Resend OTP in <span style={{ color: '#ff0000', fontWeight: 700 }}>{resendTimer}s</span>
                  </div>
                ) : (
                  <button onClick={handleResend} disabled={loading} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff0000', fontWeight: 700, fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <RefreshCw size={13} /> Resend OTP
                  </button>
                )}
              </div>

              <button onClick={() => { setStep('signup'); setOtp(['', '', '', '', '', '']); setError(''); }} style={{ width: '100%', marginTop: '10px', padding: '9px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: 'hsl(var(--muted-foreground))', fontFamily: 'Roboto, sans-serif' }}>
                ← Back to sign up
              </button>
            </>
          )}
        </div>

        {step === 'signup' && (
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
