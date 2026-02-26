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
            {/* Dark Green Hero Banner */}
            <header className="hero-banner">
                <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}
                        >
                            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', border: '1px solid rgba(255,255,255,0.2)' }}>👨‍🌾</div>
                            <div>
                                <h1 style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0 }}>{t('dashboard.welcome')}, {profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Farmer'}</h1>
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                    {(profile?.crops_history || ['Wheat', 'Corn']).map(crop => (
                                        <span key={crop} style={{ padding: '0.2rem 0.8rem', background: 'rgba(255,255,255,0.1)', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>{crop}</span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        {/* Trust Score Circle */}
                        <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--secondary)' }}>{profile?.trust_score || 850}</div>
                            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7 }}>Credit Trust Score</div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                className="btn btn-secondary"
                                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', position: 'relative', padding: '0.75rem' }}
                                onClick={() => setShowNotifications(!showNotifications)}
                            >
                                <Bell size={20} />
                                {notifications.filter(n => n.unread).length > 0 && (
                                    <span style={{ position: 'absolute', top: '5px', right: '5px', width: '8px', height: '8px', background: 'var(--error)', borderRadius: '50%' }}></span>
                                )}
                            </button>
                            <button className="gold-gradient-btn" onClick={() => setShowLoanModal(true)}>
                                <Wallet size={18} /> {t('loan.apply')}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 4rem 4rem 4rem' }}>
                <AnimatePresence>
                    {showNotifications && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="card"
                            style={{ position: 'absolute', top: '100px', right: '4rem', width: '350px', padding: '1.5rem', zIndex: 100 }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '1rem', margin: 0 }}>{t('common.notifications')}</h3>
                                <button onClick={() => setShowNotifications(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>&times;</button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {notifications.map(n => (
                                    <div key={n.id} style={{ paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{n.title}</div>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.25rem 0' }}>{n.message}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Stat Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="stat-card"
                            style={{ borderLeftColor: i === 0 ? 'var(--primary)' : i === 1 ? 'var(--warning)' : i === 2 ? 'var(--success)' : 'var(--primary-light)' }}
                        >
                            <div style={{ padding: '0.75rem', background: 'var(--bg-hover)', borderRadius: '12px' }}>{stat.icon}</div>
                            <div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{stat.label}</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{stat.value}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="dashboard-grid">
                    <section>
                        <div className="section-header-refined">
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{t('dashboard.contracts_title')}</h2>
                        </div>

                        {contracts.length === 0 ? (
                            <div className="card" style={{ padding: '4rem', textAlign: 'center' }}>
                                <FileCheck size={64} color="var(--border)" style={{ marginBottom: '1.5rem' }} />
                                <h3 style={{ marginBottom: '0.5rem' }}>{t('dashboard.no_contracts')}</h3>
                                <p style={{ color: 'var(--text-muted)' }}>{t('dashboard.no_contracts_desc')}</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {contracts.map(contract => {
                                    const progress = contract.progress || (contract.status === 'completed' ? 100 : 50);
                                    const statusClass = `status-${contract.status.toLowerCase()}`;

                                    return (
                                        <motion.div key={contract.id} whileHover={{ y: -5 }} className="card" style={{ padding: '2rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                                <div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>#{contract.id?.slice(0, 8) || 'D4A017'}</div>
                                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{contract.business_name || 'Business Contract'}</h3>
                                                    <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0', fontWeight: 500 }}>
                                                        {contract.crop_name} • {contract.quantity} {contract.unit || 'Quintals'} @ ₹{contract.price}/q
                                                    </p>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <span className={`status-badge ${statusClass}`}>
                                                        {contract.status === 'active' || contract.status === 'in_progress' ? t('dashboard.in_progress') :
                                                            contract.status === 'pending' ? t('dashboard.pending_offer') : contract.status}
                                                    </span>
                                                    <div style={{ marginTop: '1rem', fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                                                        ₹{(contract.total_value / 100000).toFixed(2)} Lakh
                                                    </div>
                                                </div>
                                            </div>

                                            {contract.status === 'pending' ? (
                                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                                    <button
                                                        className="btn btn-secondary"
                                                        style={{ flex: 1, color: 'var(--error)', border: '1px solid var(--border)' }}
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
                                                <div style={{ background: 'var(--bg-hover)', padding: '1.5rem', borderRadius: '16px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                                        <div style={{ display: 'flex', gap: '2rem' }}>
                                                            <div>
                                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Sowing</div>
                                                                <CheckCircle size={16} color="var(--success)" style={{ marginTop: '0.25rem' }} />
                                                            </div>
                                                            <div>
                                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Flowering</div>
                                                                <CheckCircle size={16} color="var(--success)" style={{ marginTop: '0.25rem' }} />
                                                            </div>
                                                            <div>
                                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Harvest</div>
                                                                <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid var(--border)', marginTop: '0.25rem' }}></div>
                                                            </div>
                                                        </div>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{progress}% Complete</div>
                                                        </div>
                                                    </div>
                                                    <div style={{ height: '8px', background: 'white', borderRadius: '4px', overflow: 'hidden' }}>
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${progress}%` }}
                                                            style={{ height: '100%', background: 'var(--primary)' }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div className="section-header-refined">
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{t('dashboard.market_insights')}</h2>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {mockMarketInsights.map((insight, i) => (
                                <div key={i} className="card" style={{
                                    padding: '1.5rem',
                                    background: insight.trend === 'up' ? 'linear-gradient(135deg, #2d5a27 0%, #1a3c1a 100%)' : insight.trend === 'alert' ? 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)' : 'white',
                                    color: insight.trend === 'up' || insight.trend === 'alert' ? 'white' : 'var(--text-main)',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                        {insight.trend === 'up' ? <TrendingUp size={20} /> : insight.trend === 'alert' ? <AlertCircle size={20} /> : <TrendingUp size={20} stroke="var(--primary)" />}
                                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{insight.title}</h3>
                                    </div>
                                    <p style={{ fontSize: '0.9rem', opacity: insight.trend === 'up' || insight.trend === 'alert' ? 0.9 : 0.7, margin: 0 }}>
                                        {insight.desc}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="card" style={{ padding: '2rem', border: '1px solid rgba(45, 90, 39, 0.1)', background: '#F8FBF8' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Microscope size={20} color="white" />
                                    </div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{t('quality.title')}</h3>
                                </div>
                                <div style={{ padding: '0.5rem', background: 'white', borderRadius: '8px', boxShadow: 'var(--shadow-sm)' }}>
                                    <ThermometerSun size={20} color="var(--warning)" />
                                </div>
                            </div>

                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{t('quality.desc')}</p>

                            <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid var(--border-light)' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Yield Estimate</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>8.5 <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Quintals / Acre</span></div>
                                <div style={{ height: '4px', background: 'var(--border-light)', borderRadius: '2px', marginTop: '1rem', overflow: 'hidden' }}>
                                    <div style={{ width: '85%', height: '100%', background: 'var(--success)' }}></div>
                                </div>
                            </div>

                            <button className="btn btn-secondary" style={{ width: '100%', padding: '1rem' }}>
                                {t('quality.viewReport')} <ArrowRight size={16} />
                            </button>
                        </div>
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
