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
            padding: '4rem 2rem',
            background: 'linear-gradient(135deg, #f8faf8 0%, #ffffff 100%)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Decorative Element */}
            <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '40vw', height: '40vw', background: 'rgba(45, 90, 39, 0.03)', borderRadius: '50%', filter: 'blur(80px)', zIndex: 0 }}></div>
            <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '30vw', height: '30vw', background: 'rgba(212, 175, 55, 0.03)', borderRadius: '50%', filter: 'blur(60px)', zIndex: 0 }}></div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                style={{ textAlign: 'center', maxWidth: '1000px', position: 'relative', zIndex: 1 }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        marginBottom: '2rem',
                        padding: '0.6rem 1.25rem',
                        background: 'white',
                        border: '1px solid rgba(45, 90, 39, 0.1)',
                        boxShadow: '0 4px 12px rgba(45, 90, 39, 0.05)',
                        borderRadius: 'var(--radius-full)',
                        color: 'var(--primary)',
                        fontSize: '0.85rem',
                        fontWeight: '800',
                        letterSpacing: '1px',
                        textTransform: 'uppercase'
                    }}
                >
                    <Globe size={18} />
                    <span>Global Standards • local impact</span>
                </motion.div>

                <h1 style={{
                    fontSize: '4.5rem',
                    fontWeight: '900',
                    marginBottom: '1.5rem',
                    letterSpacing: '-2.5px',
                    lineHeight: 1.1,
                    color: 'var(--primary)'
                }}>
                    Bridging Trust in <br />
                    <span className="gradient-text">Agricultural Trade.</span>
                </h1>

                <p style={{
                    fontSize: '1.4rem',
                    color: 'var(--text-muted)',
                    marginBottom: '4.5rem',
                    maxWidth: '650px',
                    marginInline: 'auto',
                    lineHeight: 1.6
                }}>
                    Empowering farmers and businesses with secure smart contracts, verified identities, and instant capital.
                </p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="card"
                    style={{
                        padding: '3rem',
                        maxWidth: '550px',
                        margin: '0 auto',
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid var(--border)'
                    }}
                >
                    <h2 style={{ marginBottom: '2.5rem', fontSize: '1.1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--primary)' }}>
                        {t('landing.choose_language')}
                    </h2>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
                        {[
                            { code: 'en', label: 'English' },
                            { code: 'hi', label: 'हिन्दी' },
                            { code: 'mr', label: 'मराठी' },
                            { code: 'te', label: 'తెలుగు' },
                            { code: 'ta', label: 'தமிழ்' }
                        ].map((lang, idx) => (
                            <button
                                key={lang.code}
                                className="btn btn-secondary"
                                onClick={() => handleLanguageSelect(lang.code)}
                                style={{
                                    justifyContent: 'center',
                                    padding: '1rem',
                                    fontSize: '1.1rem',
                                    borderRadius: '12px',
                                    border: '1px solid var(--border)',
                                    background: 'white',
                                    gridColumn: lang.code === 'en' ? 'span 2' : 'auto'
                                }}
                            >
                                <span style={{ fontWeight: 700 }}>{lang.label}</span>
                                <ArrowRight size={18} style={{ marginLeft: '1rem', opacity: 0.5 }} />
                            </button>
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default LandingPage;
