import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, AlertCircle, ArrowLeft, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/LanguageContext';

const Login = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/roles';

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError(null);
    setIsLoading(true);

    const { data, error } = await signIn(email, password);

    if (error) {
      setError(error);
      setIsLoading(false);
    } else {
      navigate(from, { replace: true });
    }
  };

  const handleQuickLogin = async (roleEmail) => {
    setError(null);
    setIsLoading(true);
    // Supabase password for all test accounts is test1test1
    const { data, error } = await signIn(roleEmail, 'test1test1');

    if (error) {
      setError(error);
      setIsLoading(false);
    } else {
      // Redirect based on role
      const rolePaths = {
        'farmer@agriance.com': '/farmer/dashboard',
        'business@agriance.com': '/business/dashboard',
        'bank@agriance.com': '/bank/dashboard'
      };
      navigate(rolePaths[roleEmail] || '/roles', { replace: true });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      const { error } = await signInWithGoogle();
      if (error) {
        setError(error);
      }
    } catch (err) {
      setError(err.message || 'Failed to sign in with Google');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', padding: '2rem' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="card" style={{ maxWidth: '450px', width: '100%', padding: '3rem', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '64px', height: '64px', background: 'var(--primary)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'white' }}>
            <LogIn size={32} />
          </div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>{t('auth.login_title')}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{t('auth.login_subtitle')}</p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#EF4444' }}>
            <AlertCircle size={20} />
            <span style={{ fontSize: '0.9rem' }}>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>{t('auth.email')}</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '1rem' }} />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>{t('auth.password')}</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '1rem' }} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" style={{ accentColor: 'var(--primary)' }} />
              <span style={{ fontSize: '0.9rem' }}>{t('auth.remember_me')}</span>
            </label>
            <Link to="/forgot-password" style={{ fontSize: '0.9rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>{t('auth.forgot_password')}</Link>
          </div>

          <button type="submit" disabled={isLoading} className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1rem', marginBottom: '1rem' }}>
            {isLoading ? t('auth.signing_in') : t('auth.sign_in')}
          </button>

          {/* Quick Demo Login Section */}
          <div style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }}></div>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Shield size={14} /> Quick Demo Access
              </span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }}></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              {[
                { label: 'Farmer', email: 'farmer@agriance.com', color: 'var(--primary)' },
                { label: 'Business', email: 'business@agriance.com', color: '#B8860B' },
                { label: 'Bank', email: 'bank@agriance.com', color: '#2563EB' }
              ].map(role => (
                <button
                  key={role.label}
                  type="button"
                  onClick={() => handleQuickLogin(role.email)}
                  disabled={isLoading}
                  style={{
                    padding: '0.75rem 0.5rem',
                    background: 'white',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: role.color,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = role.color;
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.color = role.color;
                  }}
                >
                  {role.label}
                </button>
              ))}
            </div>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '1rem' }}>
              Password: <strong>test1test1</strong>
            </p>
          </div>

          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '2rem' }}>
            {t('auth.no_account')}{' '}
            <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '700' }}>{t('auth.signup')}</Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
