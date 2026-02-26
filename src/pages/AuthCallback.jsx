import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from the URL hash
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (session) {
          // User is authenticated
          setStatus('success');
          setMessage('Authentication successful! Redirecting...');
          
          // Get user profile to determine role
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role, onboarding_completed')
            .eq('id', session.user.id)
            .single();
          
          if (profileError || !profile) {
            // New user - need to complete onboarding
            setTimeout(() => {
              navigate('/roles');
            }, 1500);
          } else if (!profile.onboarding_completed) {
            // User exists but hasn't completed onboarding
            setTimeout(() => {
              navigate(`/${profile.role}/register`);
            }, 1500);
          } else {
            // User is fully set up - go to dashboard
            setTimeout(() => {
              navigate(`/${profile.role}/dashboard`);
            }, 1500);
          }
        } else {
          // No session found
          setStatus('error');
          setMessage('Authentication failed. Please try again.');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage(error.message || 'Authentication failed');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
          textAlign: 'center',
          maxWidth: '400px',
          width: '100%'
        }}
      >
        {status === 'loading' && (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{ marginBottom: '1.5rem' }}
            >
              <Loader2 size={48} color="var(--primary)" />
            </motion.div>
            <h2 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>Please Wait</h2>
          </>
        )}

        {status === 'success' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              style={{ marginBottom: '1.5rem' }}
            >
              <CheckCircle size={48} color="var(--success)" />
            </motion.div>
            <h2 style={{ marginBottom: '0.5rem', color: 'var(--success)' }}>Success!</h2>
          </>
        )}

        {status === 'error' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              style={{ marginBottom: '1.5rem' }}
            >
              <AlertCircle size={48} color="#ef4444" />
            </motion.div>
            <h2 style={{ marginBottom: '0.5rem', color: '#ef4444' }}>Error</h2>
          </>
        )}

        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>{message}</p>
      </motion.div>
    </div>
  );
};

export default AuthCallback;
