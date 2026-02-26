import React from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Globe, ArrowRight } from 'lucide-react';

const LandingPage = () => {
    const { setLanguage, t } = useTranslation();
    const navigate = useNavigate();

    const handleLanguageSelect = (lang) => {
        setLanguage(lang);
        navigate('/roles');
    };

    return (
        <div className="landing-page" style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            background: 'radial-gradient(circle at top right, #f7f9f6, #fdfcf8)'
        }}>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                style={{ textAlign: 'center', maxWidth: '800px' }}
            >
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '1.5rem',
                    padding: '0.5rem 1rem',
                    background: 'rgba(45, 90, 39, 0.05)',
                    borderRadius: 'var(--radius-full)',
                    color: 'var(--primary)',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                }}>
                    <Globe size={18} />
                    <span>Agriance Platform</span>
                </div>

                <h1 className="gradient-text" style={{
                    fontSize: '4rem',
                    fontWeight: '700',
                    marginBottom: '1rem',
                    letterSpacing: '-0.02em'
                }}>
                    {t('landing.title')}
                </h1>

                <p style={{
                    fontSize: '1.25rem',
                    color: 'var(--text-muted)',
                    marginBottom: '4rem',
                    maxWidth: '600px',
                    marginInline: 'auto'
                }}>
                    {t('landing.subtitle')}
                </p>

                <div className="glass" style={{
                    padding: '3rem',
                    borderRadius: 'var(--radius-lg)',
                    maxWidth: '500px',
                    margin: '0 auto'
                }}>
                    <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem' }}>{t('landing.choose_language')}</h2>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                        {[
                            { code: 'en', label: 'English' },
                            { code: 'hi', label: 'हिन्दी' },
                            { code: 'mr', label: 'मराठी' },
                            { code: 'te', label: 'తెలుగు' },
                            { code: 'ta', label: 'தமிழ்' }
                        ].map((lang) => (
                            <button
                                key={lang.code}
                                className="btn btn-secondary"
                                onClick={() => handleLanguageSelect(lang.code)}
                                style={{
                                    justifyContent: 'space-between',
                                    padding: '1.25rem 2rem',
                                    fontSize: '1.1rem'
                                }}
                            >
                                <span>{lang.label}</span>
                                <ArrowRight size={20} />
                            </button>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default LandingPage;
