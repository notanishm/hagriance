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
            padding: '2rem'
        }}>
            <div style={{ maxWidth: '1000px', width: '100%' }}>
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        textAlign: 'center',
                        fontSize: '2.5rem',
                        marginBottom: '3rem',
                        fontWeight: '700'
                    }}
                >
                    {t('roles.title')}
                </motion.h1>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '2rem'
                }}>
                    {roles.map((role, index) => (
                        <motion.div
                            key={role.id}
                            initial={{ opacity: 0, x: index === 0 ? -30 : 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="card"
                            onClick={() => navigate(role.path)}
                            style={{
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                padding: '3rem 2rem',
                                border: '1px solid var(--border)'
                            }}
                        >
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '20px',
                                background: `${role.color}15`,
                                color: role.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1.5rem'
                            }}>
                                {role.icon}
                            </div>

                            <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem', fontWeight: '600' }}>
                                {role.title}
                            </h2>

                            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', flex: 1 }}>
                                {role.description}
                            </p>

                            <button className="btn btn-primary" style={{ width: '100%' }}>
                                {t('roles.cta')} <ChevronRight size={18} />
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RoleSelection;
