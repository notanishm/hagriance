import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Wallet, FileCheck, Tractor, TrendingUp, ShieldCheck, Microscope, ThermometerSun, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { farmerService, businessService } from '../../services/database';
import LoanApplicationFlow from '../../components/LoanApplicationFlow';
import { mockMarketInsights, mockNotifications } from '../../data/mockData';

const FarmerDashboard = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [contracts, setContracts] = useState([]);
    const [loans, setLoans] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showLoanModal, setShowLoanModal] = useState(false);
    const [notifications, setNotifications] = useState(mockNotifications);
    const [showNotifications, setShowNotifications] = useState(false);

    const fetchData = async () => {
        if (!user) return;

        try {
            setLoading(true);
            setError(null);

            const { data: contractsData, error: contractsError } = await farmerService.getFarmerContracts(user.id);
            if (contractsError) throw contractsError;
            setContracts(contractsData || []);

            const { data: loansData, error: loansError } = await farmerService.getFarmerLoans(user.id);
            if (loansError) throw loansError;
            setLoans(loansData || []);

            const { data: profileData, error: profileError } = await farmerService.getFarmerProfile(user.id);
            if (profileError) throw profileError;
            setProfile(profileData);

        } catch (err) {
            console.error('Error fetching farmer data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const handleContractAction = async (contractId, action) => {
        try {
            const status = action === 'accept' ? 'active' : 'rejected';
            const { error } = await businessService.updateContractStatus(contractId, status);
            if (error) throw error;
            setContracts(prev => prev.map(c => c.id === contractId ? { ...c, status } : c));
        } catch (err) {
            console.error('Error updating contract:', err);
        }
    };

    const activeContractsCount = contracts.filter(c => c.status === 'active' || c.status === 'in_progress').length;
    const pendingOffersCount = contracts.filter(c => c.status === 'pending').length;
    const totalEarnings = contracts
        .filter(c => c.status === 'completed')
        .reduce((sum, c) => sum + (c.total_value || 0), 0);

    const stats = [
        { label: t('stats.active_contracts'), value: activeContractsCount.toString(), icon: <FileCheck color="var(--primary)" /> },
        { label: t('stats.pending_offers'), value: pendingOffersCount.toString(), icon: <Bell color="#B8860B" /> },
        { label: t('stats.total_earnings'), value: `₹${(totalEarnings / 100000).toFixed(1)}L`, icon: <Wallet color="var(--success)" /> },
        { label: t('stats.upcoming_harvest'), value: '15 Days', icon: <Tractor color="#4A8B3F" /> }
    ];

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚙️</motion.div>
                    <p style={{ color: 'var(--text-muted)' }}>{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--bg-main)', padding: '3rem 4rem' }}>
                <div className="card" style={{ padding: '2rem', maxWidth: '600px', margin: '2rem auto', border: '1px solid var(--error)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--error)', marginBottom: '1rem' }}>
                        <AlertCircle size={24} />
                        <h3 style={{ margin: 0 }}>{t('common.error')}</h3>
                    </div>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error}</p>
                    <button className="btn btn-primary" onClick={() => window.location.reload()}>{t('common.retry')}</button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
            <main style={{ padding: '3rem 4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{ marginBottom: '0.25rem' }}>{t('dashboard.welcome')} {profile?.full_name || user?.email || 'Farmer'}</h1>
                        <p style={{ color: 'var(--text-muted)' }}>{t('dashboard.subtitle')}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <button
                            className="btn btn-secondary"
                            style={{ position: 'relative', padding: '0.75rem' }}
                            onClick={() => setShowNotifications(!showNotifications)}
                        >
                            <Bell size={20} />
                            {notifications.filter(n => n.unread).length > 0 && (
                                <span style={{
                                    position: 'absolute', top: '-5px', right: '-5px',
                                    background: 'var(--error)', color: 'white', fontSize: '10px',
                                    padding: '2px 6px', borderRadius: '10px', fontWeight: 800
                                }}>
                                    {notifications.filter(n => n.unread).length}
                                </span>
                            )}
                        </button>
                        <button className="btn btn-primary" onClick={() => setShowLoanModal(true)}>
                            <Wallet size={18} /> {t('loan.apply')}
                        </button>
                        {profile?.kyc_status === 'verified' && (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.5rem 1rem', background: 'rgba(16, 185, 129, 0.1)',
                                color: 'var(--success)', borderRadius: 'var(--radius-full)',
                                fontSize: '0.85rem', fontWeight: 700
                            }}>
                                <ShieldCheck size={16} /> {t('dashboard.kyc_verified')}
                            </div>
                        )}
                    </div>
                </div>

                <AnimatePresence>
                    {showNotifications && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="card"
                            style={{
                                position: 'absolute', top: '160px', right: '4rem',
                                width: '350px', padding: '1.5rem', boxShadow: 'var(--shadow-lg)',
                                border: '1px solid var(--border)', zIndex: 100
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '1rem', margin: 0 }}>{t('common.notifications')}</h3>
                                <button onClick={() => setShowNotifications(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {notifications.length === 0 ? (
                                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.9rem' }}>{t('common.no_notifications')}</p>
                                ) : (
                                    notifications.map(n => (
                                        <div key={n.id} style={{ paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{n.title}</span>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{n.time}</span>
                                            </div>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>{n.message}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="card"
                            style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}
                        >
                            <div style={{ padding: '0.75rem', background: 'var(--bg-hover)', borderRadius: '12px' }}>{stat.icon}</div>
                            <div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{stat.label}</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stat.value}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                    <section>
                        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FileCheck size={24} color="var(--primary)" /> {t('dashboard.contracts_title')}
                        </h2>
                        {contracts.length === 0 ? (
                            <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                                <FileCheck size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
                                <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-muted)' }}>{t('dashboard.no_contracts')}</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    {t('dashboard.no_contracts_desc')}
                                </p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {contracts.map(contract => {
                                    const progress = contract.progress || (contract.status === 'completed' ? 100 : 50);

                                    return (
                                        <div key={contract.id} className="card" style={{ padding: '2rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                                <div>
                                                    <h3 style={{ fontSize: '1.25rem', margin: 0 }}>{contract.business_name || 'Business Contract'}</h3>
                                                    <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
                                                        {contract.crop_name} • {contract.quantity} {contract.unit || 'Quintals'}
                                                    </p>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <span style={{
                                                        padding: '0.4rem 1rem',
                                                        borderRadius: 'var(--radius-full)',
                                                        background: contract.status === 'active' || contract.status === 'in_progress' ? 'rgba(16, 185, 129, 0.1)' :
                                                            contract.status === 'pending' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(0,0,0,0.05)',
                                                        color: contract.status === 'active' || contract.status === 'in_progress' ? 'var(--success)' :
                                                            contract.status === 'pending' ? 'var(--warning)' : 'var(--text-muted)',
                                                        fontSize: '0.8rem',
                                                        fontWeight: 700
                                                    }}>
                                                        {contract.status === 'active' || contract.status === 'in_progress' ? t('dashboard.in_progress') :
                                                            contract.status === 'pending' ? t('dashboard.pending_offer') : contract.status.toUpperCase()}
                                                    </span>
                                                    <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                        Value: ₹{contract.total_value?.toLocaleString() || '0'}
                                                    </div>
                                                </div>
                                            </div>

                                            {contract.status === 'pending' ? (
                                                <div style={{ display: 'flex', gap: '1rem' }}>
                                                    <button
                                                        className="btn btn-secondary"
                                                        style={{ flex: 1, color: 'var(--error)' }}
                                                        onClick={() => handleContractAction(contract.id, 'reject')}
                                                    >
                                                        {t('dashboard.decline')}
                                                    </button>
                                                    <button
                                                        className="btn btn-primary"
                                                        style={{ flex: 1 }}
                                                        onClick={() => handleContractAction(contract.id, 'accept')}
                                                    >
                                                        {t('dashboard.accept_offer')}
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                                        <span>{t('dashboard.growth_progress')}</span>
                                                        <span style={{ fontWeight: 600 }}>{progress}%</span>
                                                    </div>
                                                    <div style={{ height: '8px', background: 'var(--border-light)', borderRadius: '4px', overflow: 'hidden' }}>
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${progress}%` }}
                                                            style={{ height: '100%', background: 'var(--primary)' }}
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <section>
                            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {t('dashboard.market_insights')}
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {mockMarketInsights.map((insight, i) => (
                                    <div key={i} className="card" style={{
                                        background: insight.trend === 'up' ? 'var(--primary)' : insight.trend === 'alert' ? 'var(--error)' : 'white',
                                        color: insight.trend === 'up' || insight.trend === 'alert' ? 'white' : 'var(--text-main)',
                                        padding: '1.5rem'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                            {insight.trend === 'up' ? <TrendingUp size={20} /> : insight.trend === 'alert' ? <AlertCircle size={20} /> : <Bell size={20} />}
                                            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{insight.title}</h3>
                                        </div>
                                        <p style={{ fontSize: '0.85rem', opacity: 0.9, margin: 0 }}>
                                            {insight.desc}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section>
                            <div className="card" style={{ padding: '1.5rem', border: '1px solid rgba(45, 90, 39, 0.1)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 700 }}>
                                        <Microscope size={18} /> {t('quality.title')}
                                    </div>
                                    <ThermometerSun size={18} color="var(--secondary)" />
                                </div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                                    {t('quality.desc')}
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div style={{ background: 'var(--bg-hover)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{t('quality.estimate')}</div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>8.5 Quintals / Acre</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('quality.moisture')}</div>
                                            <div style={{ fontSize: '1rem', fontWeight: 600 }}>12.4%</div>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('quality.health')}</div>
                                            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--success)' }}>{t('dashboard.optimal')}</div>
                                        </div>
                                    </div>
                                </div>
                                <button className="btn btn-secondary" style={{ width: '100%', fontSize: '0.85rem' }}>
                                    {t('quality.viewReport')}
                                </button>
                            </div>
                        </section>
                    </aside>
                </div>
            </main>

            <AnimatePresence>
                {showLoanModal && <LoanApplicationFlow onClose={() => setShowLoanModal(false)} onComplete={fetchData} />}
            </AnimatePresence>
        </div>
    );
};

export default FarmerDashboard;
