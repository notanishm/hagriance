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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f8faf8 0%, #ffffff 100%)',
      padding: '2rem'
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="card"
        style={{
          maxWidth: '480px',
          width: '100%',
          padding: '4rem 3.5rem',
          background: 'white',
          border: '1px solid var(--border)',
          boxShadow: '0 40px 100px -20px rgba(0,0,0,0.08)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            width: '72px',
            height: '72px',
            background: 'var(--primary)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            color: 'white',
            boxShadow: '0 12px 24px rgba(45, 90, 39, 0.2)'
          }}>
            <LogIn size={32} />
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 900, marginBottom: '0.5rem', color: 'var(--primary)', letterSpacing: '-1px' }}>{t('auth.login_title')}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>{t('auth.login_subtitle')}</p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '1.25rem', background: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: '12px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#B91C1C' }}>
            <AlertCircle size={20} />
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.75rem' }}>
            <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: '800', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>{t('auth.email')}</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@agriance.com"
                required
                className="form-input-refined"
                style={{ paddingLeft: '3.25rem' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.75rem' }}>
            <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: '800', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>{t('auth.password')}</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="form-input-refined"
                style={{ paddingLeft: '3.25rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
              <input type="checkbox" style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', borderRadius: '4px' }} />
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('auth.remember_me')}</span>
            </label>
            <Link to="/forgot-password" style={{ fontSize: '0.9rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 800 }}>{t('auth.forgot_password')}</Link>
          </div>

          <button type="submit" disabled={isLoading} className="btn btn-primary" style={{ width: '100%', height: '56px', fontSize: '1.1rem', fontWeight: 800, borderRadius: '14px', marginBottom: '1.5rem', boxShadow: '0 8px 20px rgba(45, 90, 39, 0.15)' }}>
            {isLoading ? t('auth.signing_in') : t('auth.sign_in')}
          </button>

          {/* Quick Demo Login Section */}
          <div style={{ marginTop: '3rem', padding: '1.5rem', background: '#F8FAFC', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
              <Shield size={14} /> Quick Demo Access
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
                    padding: '0.75rem 0.25rem',
                    background: 'white',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: 'var(--primary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = role.color;
                    e.currentTarget.style.color = role.color;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.color = 'var(--primary)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {role.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '1rem', marginTop: '2.5rem' }}>
            {t('auth.no_account')}{' '}
            <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '800' }}>{t('auth.signup')}</Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
