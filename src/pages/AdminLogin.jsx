import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, ArrowRight, ShieldCheck, AlertCircle, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { signIn, enterDemoAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    navigate('/admin', { replace: true });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please provide both admin username and password.');
      return;
    }

    try {
      setSubmitting(true);
      await signIn(username, password);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Failed to authenticate. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoBypass = () => {
    enterDemoAdmin();
    navigate('/admin');
  };

  return (
    <div className="login-view-wrapper">
      <div className="login-card">
        <img src="/assets/icons/logo.svg" alt="Sree Collections Logo" className="login-logo" />
        <h2 className="login-title">SREE COLLECTIONS</h2>
        <p className="login-sub">Showroom Administration &amp; Inventory Portal</p>

        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid #ef4444', color: '#b91c1c', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textAlign: 'left' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">Admin Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="balubalaji or deva049"
              className="form-input"
              required
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="form-input"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn-admin-primary"
            disabled={submitting}
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            <Lock size={16} />
            <span>{submitting ? 'Authenticating...' : 'Sign In as Showroom Admin'}</span>
          </button>
        </form>

        {/* Authorized Admins Badge */}
        <div style={{
          marginTop: '1.25rem',
          padding: '0.75rem',
          background: 'rgba(212, 175, 55, 0.08)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          borderRadius: '8px',
          fontSize: '0.8rem',
          color: 'var(--color-maroon-dark)',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600', marginBottom: '0.35rem' }}>
            <UserCheck size={15} color="var(--color-gold-dark)" />
            <span>Configured Showroom Administrators:</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.35rem' }}>
            <span style={{ background: '#fff', padding: '2px 8px', borderRadius: '4px', border: '1px solid #e0d5c1', fontWeight: '600' }}>
              👤 balubalaji
            </span>
            <span style={{ background: '#fff', padding: '2px 8px', borderRadius: '4px', border: '1px solid #e0d5c1', fontWeight: '600' }}>
              👤 deva049
            </span>
          </div>
        </div>

        {/* Demo Mode / Supabase Notice */}
        <div className="login-demo-notice" style={{ marginTop: '1rem' }}>
          <strong>⚙️ Database Status:</strong><br />
          {isSupabaseConfigured() ? (
            <span>Connected to Supabase. Realtime changes sync with PostgreSQL.</span>
          ) : (
            <span>Using local storage fallback. Configure Supabase in <code>.env</code> when ready.</span>
          )}
        </div>

        <div style={{ marginTop: '0.85rem', borderTop: '1px dashed #e2d7c7', paddingTop: '0.85rem' }}>
          <button
            type="button"
            onClick={handleDemoBypass}
            className="btn-admin-secondary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <span>⚡ Instant Demo Access (LocalStorage)</span>
          </button>
        </div>

        <div style={{ marginTop: '1.25rem' }}>
          <Link to="/" style={{ fontSize: '0.85rem', color: 'var(--color-maroon-primary)', textDecoration: 'underline' }}>
            &larr; Return to Customer Storefront
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
