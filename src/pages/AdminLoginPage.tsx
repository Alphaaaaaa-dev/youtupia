import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { Lock, Eye, EyeOff } from 'lucide-react';

const AdminLoginPage = () => {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const [creds, setCreds] = useState({ username: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 500));
    const ok = login(creds.username, creds.password);
    if (ok) { navigate('/admin/dashboard'); }
    else { setError('Invalid credentials. Access denied.'); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'hsl(0 0% 6%)', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ width: '56px', height: '56px', background: '#ff0000', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Lock size={24} color="white" />
          </div>
          <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 800, fontSize: '22px', color: '#f1f5f9', letterSpacing: '-0.02em' }}>Admin Portal</div>
          <div style={{ fontFamily: 'monospace', fontSize: '11px', color: 'rgba(148,163,184,0.6)', letterSpacing: '0.15em', marginTop: '4px' }}>YOUTUPIA · STORE MANAGEMENT</div>
        </div>

        <form onSubmit={handleLogin} style={{ background: 'hsl(0 0% 10%)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '32px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'rgba(148,163,184,0.8)', marginBottom: '8px', letterSpacing: '0.05em' }}>USERNAME</label>
            <input type="text" required value={creds.username} onChange={e => setCreds(c => ({ ...c, username: e.target.value }))}
              placeholder="Admin@youtupia"
              style={{ width: '100%', padding: '11px 14px', background: 'hsl(0 0% 6%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f1f5f9', fontFamily: 'Roboto, sans-serif', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: '24px', position: 'relative' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'rgba(148,163,184,0.8)', marginBottom: '8px', letterSpacing: '0.05em' }}>PASSWORD</label>
            <input type={showPwd ? 'text' : 'password'} required value={creds.password} onChange={e => setCreds(c => ({ ...c, password: e.target.value }))}
              placeholder="••••••••••"
              style={{ width: '100%', padding: '11px 40px 11px 14px', background: 'hsl(0 0% 6%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f1f5f9', fontFamily: 'Roboto, sans-serif', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
            <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: '12px', top: '36px', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(148,163,184,0.5)', display: 'flex', alignItems: 'center' }}>
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#f87171' }}>{error}</div>
          )}

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: loading ? 'rgba(255,0,0,0.5)' : '#ff0000', border: 'none', borderRadius: '8px', color: 'white', fontFamily: 'Roboto, sans-serif', fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.15s' }}>
            {loading ? 'Verifying...' : 'Access Admin Panel'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '11px', color: 'rgba(148,163,184,0.35)', letterSpacing: '0.05em' }}>
            RESTRICTED ACCESS · AUTHORISED PERSONNEL ONLY
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
