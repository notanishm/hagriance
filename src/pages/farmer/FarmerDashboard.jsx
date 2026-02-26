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

            // Fetch farmer contracts
            const { data: contractsData, error: contractsError } = await farmerService.getFarmerContracts(user.id);
            if (contractsError) throw contractsError;
            setContracts(contractsData || []);

            // Fetch farmer loans
            const { data: loansData, error: loansError } = await farmerService.getFarmerLoans(user.id);
            if (loansError) throw loansError;
            setLoans(loansData || []);

            // Fetch farmer profile
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

            // Update local state
            setContracts(prev => prev.map(c => c.id === contractId ? { ...c, status } : c));
        } catch (err) {
            console.error('Error updating contract:', err);
            alert('Failed to update contract status');
        }
    };

    // Calculate stats from real data
    const activeContractsCount = contracts.filter(c => c.status === 'active' || c.status === 'in_progress').length;
    const pendingOffersCount = contracts.filter(c => c.status === 'pending').length;
    const totalEarnings = contracts
        .filter(c => c.status === 'completed')
        .reduce((sum, c) => sum + (c.total_value || 0), 0);

    const stats = [
        { label: 'Active Contracts', value: activeContractsCount.toString(), icon: <FileCheck color="var(--primary)" /> },
        { label: 'Pending Offers', value: pendingOffersCount.toString(), icon: <Bell color="#B8860B" /> },
        { label: 'Total Earnings', value: `₹${(totalEarnings / 100000).toFixed(1)}L`, icon: <Wallet color="var(--success)" /> },
        { label: 'Upcoming Harvest', value: '15 Days', icon: <Tractor color="#4A8B3F" /> }
    ];

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: '#fcfdfa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                    <p style={{ color: 'var(--text-muted)' }}>Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ minHeight: '100vh', background: '#fcfdfa', padding: '3rem 4rem' }}>
                <div className="card" style={{ padding: '2rem', maxWidth: '600px', margin: '2rem auto', border: '1px solid #ef4444' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', marginBottom: '1rem' }}>
                        <AlertCircle size={24} />
                        <h3 style={{ margin: 0 }}>Error Loading Dashboard</h3>
                    </div>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error}</p>
                    <button className="btn btn-primary" onClick={() => window.location.reload()}>Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#fcfdfa' }}>
            <main style={{ padding: '3rem 4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{ marginBottom: '0.25rem' }}>Welcome back, {profile?.full_name || user?.email || 'Farmer'}</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Here's what's happening with your farm today.</p>
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
                                    background: '#ef4444', color: 'white', fontSize: '10px',
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
                                <ShieldCheck size={16} /> KYC Verified
                            </div>
                        )}
                    </div>
                </div>

                {/* Notifications Panel */}
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
                                <h3 style={{ fontSize: '1rem', margin: 0 }}>Notifications</h3>
                                <button onClick={() => setShowNotifications(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {notifications.length === 0 ? (
                                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.9rem' }}>No new notifications</p>
                                ) : (
                                    notifications.map(n => (
                                        <div key={n.id} style={{ paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
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

                {/* Stats Grid */}
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
                            <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.03)', borderRadius: '12px' }}>{stat.icon}</div>
                            <div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{stat.label}</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stat.value}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                    {/* Active Contracts */}
                    <section>
                        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FileCheck size={24} color="var(--primary)" /> Contracts & Offers
                        </h2>
                        {contracts.length === 0 ? (
                            <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                                <FileCheck size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
                                <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-muted)' }}>No Active Contracts</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    Start by exploring contract opportunities in the marketplace
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
                                                            contract.status === 'pending' ? '#F59E0B' : 'var(--text-muted)',
                                                        fontSize: '0.8rem',
                                                        fontWeight: 700
                                                    }}>
                                                        {contract.status === 'active' || contract.status === 'in_progress' ? 'In Progress' :
                                                            contract.status === 'pending' ? 'Pending Offer' : contract.status.toUpperCase()}
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
                                                        style={{ flex: 1, color: '#ef4444' }}
                                                        onClick={() => handleContractAction(contract.id, 'reject')}
                                                    >
                                                        Decline
                                                    </button>
                                                    <button
                                                        className="btn btn-primary"
                                                        style={{ flex: 1 }}
                                                        onClick={() => handleContractAction(contract.id, 'accept')}
                                                    >
                                                        Accept Offer
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                                        <span>Growth Progress</span>
                                                        <span style={{ fontWeight: 600 }}>{progress}%</span>
                                                    </div>
                                                    <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
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

                    {/* Sidebar */}
                    <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {/* Market Insights */}
                        <section>
                            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                Market Insights
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {mockMarketInsights.map((insight, i) => (
                                    <div key={i} className="card" style={{
                                        background: insight.trend === 'up' ? 'var(--primary)' : insight.trend === 'alert' ? '#ef4444' : 'white',
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

                        {/* Quality & Growth Monitoring */}
                        <section>
                            <div className="card" style={{ padding: '1.5rem', border: '1px solid rgba(45, 90, 39, 0.1)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 700 }}>
                                        <Microscope size={18} /> {t('quality.title')}
                                    </div>
                                    <ThermometerSun size={18} color="#B8860B" />
                                </div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                                    {t('quality.desc')}
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
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
                                            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--success)' }}>Optimal</div>
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
