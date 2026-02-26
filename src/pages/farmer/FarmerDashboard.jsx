import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Bell, Wallet, FileCheck, Tractor, TrendingUp, ShieldCheck, Microscope, ThermometerSun, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { farmerService } from '../../services/database';

const FarmerDashboard = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [contracts, setContracts] = useState([]);
    const [loans, setLoans] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
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

        fetchData();
    }, [user]);

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
            {/* Header section removed - using global Header */}

            <main style={{ padding: '3rem 4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1>Welcome back, {profile?.full_name || user?.email || 'Farmer'}</h1>
                    <div style={{ display: 'flex', gap: '1rem' }}>
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
                            <FileCheck size={24} color="var(--primary)" /> Active Contracts
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
                                    const statusDisplay = contract.status === 'active' || contract.status === 'in_progress' ? 'In Progress' : 
                                                         contract.status === 'pending' ? 'Verification' :
                                                         contract.status === 'completed' ? 'Completed' : contract.status;
                                    const progress = contract.progress || (contract.status === 'completed' ? 100 : 50);
                                    
                                    return (
                                        <div key={contract.id} className="card" style={{ padding: '2rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                                <div>
                                                    <h3 style={{ fontSize: '1.25rem' }}>{contract.business_name || 'Business Contract'}</h3>
                                                    <p style={{ color: 'var(--text-muted)' }}>
                                                        {contract.crop_name} • {contract.quantity} Quintals
                                                    </p>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <span style={{
                                                        padding: '0.4rem 1rem',
                                                        borderRadius: 'var(--radius-full)',
                                                        background: statusDisplay === 'In Progress' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(212, 175, 55, 0.1)',
                                                        color: statusDisplay === 'In Progress' ? 'var(--success)' : '#B8860B',
                                                        fontSize: '0.8rem',
                                                        fontWeight: 700
                                                    }}>
                                                        {statusDisplay}
                                                    </span>
                                                    <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                        Value: ₹{contract.total_value?.toLocaleString() || '0'}
                                                    </div>
                                                </div>
                                            </div>

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
                            <div className="card" style={{ background: 'var(--primary)', color: 'white', padding: '2rem' }}>
                                <TrendingUp style={{ marginBottom: '1rem' }} />
                                <h3 style={{ marginBottom: '0.5rem' }}>Wheat Demand is Up!</h3>
                                <p style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '1.5rem' }}>
                                    Businesses are looking for Premium Organic Wheat in your region. Contracts offering 15% better prices.
                                </p>
                                <button className="btn" style={{ background: 'white', color: 'var(--primary)', width: '100%' }}>View Offers</button>
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


        </div>
    );
};

export default FarmerDashboard;
