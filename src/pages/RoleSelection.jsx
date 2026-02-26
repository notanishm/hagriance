import React from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Building2, ChevronRight, Landmark } from 'lucide-react';

const RoleSelection = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const roles = [
        {
            id: 'farmer',
            title: t('roles.farmer'),
            description: t('roles.farmer_desc'),
            icon: <User size={40} />,
            color: 'var(--primary)',
            path: '/farmer/register'
        },
        {
            id: 'business',
            title: t('roles.business'),
            description: t('roles.business_desc'),
            icon: <Building2 size={40} />,
            color: '#B8860B',
            path: '/business/register'
        },
        {
            id: 'bank',
            title: t('roles.bank') || 'Partner Bank / NBFC',
            description: t('roles.bank_desc') || 'Evaluate and approve agricultural loans using verified platform data',
            icon: <Landmark size={40} />,
            color: '#2563EB',
            path: '/bank/register'
        }
    ];

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4rem 2rem',
            background: 'linear-gradient(135deg, #f8faf8 0%, #ffffff 100%)'
        }}>
            <div style={{ maxWidth: '1200px', width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ display: 'inline-block', padding: '0.5rem 1.25rem', background: 'rgba(45, 90, 39, 0.05)', borderRadius: 'var(--radius-full)', color: 'var(--primary)', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '1.5rem', border: '1px solid rgba(45, 90, 39, 0.1)' }}
                    >
                        Welcome to Agriance
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            fontSize: '3.5rem',
                            fontWeight: '900',
                            margin: 0,
                            letterSpacing: '-1.5px',
                            color: 'var(--primary)'
                        }}
                    >
                        How will you <span style={{ color: 'var(--secondary)' }}>grow</span> today?
                    </motion.h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', marginTop: '1rem', maxWidth: '600px', margin: '1rem auto 0' }}>
                        Select your bridge to a more secure and transparent agricultural future.
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: '2.5rem'
                }}>
                    {roles.map((role, index) => (
                        <motion.div
                            key={role.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            whileHover={{ y: -10, boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.1)' }}
                            className="card"
                            onClick={() => navigate(role.path)}
                            style={{
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                padding: '4rem 2.5rem',
                                border: '1px solid var(--border)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <div style={{
                                width: '100px',
                                height: '100px',
                                borderRadius: '24px',
                                background: `${role.color}10`,
                                color: role.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '2.5rem',
                                position: 'relative',
                                zIndex: 2
                            }}>
                                {role.icon}
                            </div>

                            <h2 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: '800', position: 'relative', zIndex: 2 }}>
                                {role.title}
                            </h2>

                            <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', flex: 1, fontSize: '1.05rem', lineHeight: '1.6', position: 'relative', zIndex: 2 }}>
                                {role.description}
                            </p>

                            <button className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontWeight: 700, borderRadius: '12px', background: role.color, border: 'none', position: 'relative', zIndex: 2 }}>
                                {t('roles.cta')} <ChevronRight size={18} style={{ marginLeft: '0.5rem' }} />
                            </button>

                            {/* Decorative background element */}
                            <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', borderRadius: '50%', background: `${role.color}05`, zIndex: 1 }}></div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RoleSelection;
