import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
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

    if (!email || !password) {
      setError('Please provide both email address and password.');
      return;
    }

    try {
      setSubmitting(true);
      await signIn(email, password);
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
            <label className="form-label">Admin Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@sreecollections.com"
              className="form-input"
              required
              autoComplete="email"
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
            <span>{submitting ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
          </button>
        </form>

        {/* Demo Mode / Supabase Notice */}
        <div className="login-demo-notice" style={{ marginTop: '1.5rem' }}>
          <strong>⚙️ Supabase Integration:</strong><br />
          {isSupabaseConfigured() ? (
            <span>Supabase is connected. Sign in with your registered admin email.</span>
          ) : (
            <span>
              Configure your Supabase credentials in <code>.env</code>. You can also explore all inventory features right now via <strong>Demo Admin Mode</strong>!
            </span>
          )}
        </div>

        <div style={{ marginTop: '1rem', borderTop: '1px dashed #e2d7c7', paddingTop: '1rem' }}>
          <button
            type="button"
            onClick={handleDemoBypass}
            className="btn-admin-secondary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <span>⚡ Explore Admin with Demo Inventory (LocalStorage)</span>
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
