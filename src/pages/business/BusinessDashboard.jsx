import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, MapPin, Star, Filter,
    ArrowRight, CheckCircle, Globe, Banknote,
    ShieldCheck, ChevronDown, Landmark, Briefcase, Microscope, ThermometerSun, AlertCircle, User
} from 'lucide-react';
import ContractFlow from './ContractFlow';
import LoanApplicationFlow from '../../components/LoanApplicationFlow';
import { cropCategories } from '../../data/crops';
import { useAuth } from '../../contexts/AuthContext';
import { businessService } from '../../services/database';

const BusinessDashboard = () => {
    const { t, setLanguage, language } = useTranslation();
    const { user } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [selectedFarmer, setSelectedFarmer] = useState(null);
    const [showContract, setShowContract] = useState(false);
    const [showLoanFlow, setShowLoanFlow] = useState(false);
    const [activeTab, setActiveTab] = useState('marketplace'); // marketplace, financing, quality
    
    // Real data from Supabase
    const [farmers, setFarmers] = useState([]);
    const [contracts, setContracts] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) {
                setLoading(false);
                return;
            }
            
            try {
                setLoading(true);
                setError(null);

                // Debug: log businessService keys
                console.log('businessService keys:', Object.keys(businessService || {}));
                console.log('searchFarmers type:', typeof businessService?.searchFarmers);

                // Fetch available farmers (for marketplace) - with defensive check
                if (typeof businessService?.searchFarmers === 'function') {
                    const { data: farmersData, error: farmersError } = await businessService.searchFarmers('');
                    if (farmersError) {
                        console.error('Farmers fetch error:', farmersError);
                        setFarmers([]);
                    } else {
                        setFarmers(farmersData || []);
                    }
                } else {
                    console.error('searchFarmers missing on businessService', businessService);
                    setFarmers([]);
                }

                // Fetch business contracts
                if (typeof businessService?.getBusinessContracts === 'function') {
                    const { data: contractsData, error: contractsError } = await businessService.getBusinessContracts(user.id);
                    if (contractsError) {
                        console.error('Contracts fetch error:', contractsError);
                        setContracts([]);
                    } else {
                        setContracts(contractsData || []);
                    }
                } else {
                    setContracts([]);
                }

                // Fetch business profile
                if (typeof businessService?.getBusinessProfile === 'function') {
                    const { data: profileData, error: profileError } = await businessService.getBusinessProfile(user.id);
                    if (profileError) {
                        console.error('Profile fetch error:', profileError);
                        setProfile(null);
                    } else {
                        setProfile(profileData);
                    }
                } else {
                    setProfile(null);
                }

            } catch (err) {
                console.error('Error fetching business data:', err);
                setError(err.message || 'Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        // Add timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
            setLoading(false);
        }, 10000); // 10 second timeout

        fetchData();

        return () => clearTimeout(timeoutId);
    }, [user]);

    // Calculate stats from real data
    const activeContractsCount = contracts.filter(c => c.status === 'active' || c.status === 'in_progress').length;
    const totalContractValue = contracts.reduce((sum, c) => sum + (c.total_value || 0), 0);
    const trustScore = profile?.trust_score || 84;

    const qualityBatches = [
        { id: 'BAT-001', farmer: 'Ramesh Patil', crop: 'Organic Wheat', status: 'Optimal', moisture: '12.4%', purity: '99.2%', health: 'Excellent', lastUpdate: '2h ago' },
        { id: 'BAT-002', farmer: 'Suresh Jadhav', crop: 'Rice', status: 'Monitoring', moisture: '14.1%', purity: '98.5%', health: 'Good', lastUpdate: '5h ago' },
        { id: 'BAT-003', farmer: 'Arjun More', crop: 'Soybean', status: 'Certified', moisture: '11.8%', purity: '99.8%', health: 'Standard', lastUpdate: '1d ago' },
    ];

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                    <p style={{ color: 'var(--text-muted)' }}>Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--bg-main)', padding: '3rem 4rem' }}>
                <div className="card" style={{ padding: '2rem', maxWidth: '600px', margin: '2rem auto', border: '1px solid #ef4444', background: 'var(--bg-card)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', marginBottom: '1rem' }}>
                        <AlertCircle size={24} />
                        <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Error Loading Dashboard</h3>
                    </div>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error}</p>
                    <button className="btn btn-primary" onClick={() => window.location.reload()}>Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
            {/* Tab Navigation */}
            <div style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '0 4rem' }}>
                <div style={{ display: 'flex', gap: '2rem' }}>
                    <button
                        onClick={() => setActiveTab('marketplace')}
                        style={{
                            padding: '1.5rem 0.5rem',
                            border: 'none',
                            background: 'none',
                            color: activeTab === 'marketplace' ? 'var(--primary)' : 'var(--text-muted)',
                            fontWeight: 700,
                            borderBottom: activeTab === 'marketplace' ? '3px solid var(--primary)' : '3px solid transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <Briefcase size={18} /> Farmer Marketplace
                    </button>
                    <button
                        onClick={() => setActiveTab('financing')}
                        style={{
                            padding: '1.5rem 0.5rem',
                            border: 'none',
                            background: 'none',
                            color: activeTab === 'financing' ? 'var(--primary)' : 'var(--text-muted)',
                            fontWeight: 700,
                            borderBottom: activeTab === 'financing' ? '3px solid var(--primary)' : '3px solid transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <Landmark size={18} /> Business Financing
                    </button>
                    <button
                        onClick={() => setActiveTab('quality')}
                        style={{
                            padding: '1.5rem 0.5rem',
                            border: 'none',
                            background: 'none',
                            color: activeTab === 'quality' ? 'var(--primary)' : 'var(--text-muted)',
                            fontWeight: 700,
                            borderBottom: activeTab === 'quality' ? '3px solid var(--primary)' : '3px solid transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <ShieldCheck size={18} /> {t('quality.title')}
                    </button>
                </div>
            </div>

            <main style={{ padding: '3rem 4rem' }}>
                {activeTab === 'marketplace' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                            <div>
                                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Marketplace</h1>
                                <p style={{ color: 'var(--text-muted)' }}>Browse verified farmers and establish direct trade contracts.</p>
                            </div>
                            <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ padding: '1rem 2rem', borderRadius: 'var(--radius-md)' }}>
                                <Plus size={20} /> Post New Requirement
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '3rem' }}>
                            {/* Filters Sidebar */}
                            <aside>
                                <div className="card" style={{ padding: '1.5rem' }}>
                                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Filter size={18} /> Filters
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Crop Category</label>
                                            <select style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                                                <option>All Categories</option>
                                                {cropCategories.map(cat => (
                                                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Specific Crop</label>
                                            <select style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                                                <option>All Crops</option>
                                                {cropCategories.map(cat => (
                                                    <optgroup key={cat.name} label={cat.name}>
                                                        {cat.crops.map(crop => (
                                                            <option key={crop} value={crop}>{crop}</option>
                                                        ))}
                                                    </optgroup>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </aside>

                            {/* Main Content: Farmer List */}
                            <section>
                                <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
                                    <div style={{ position: 'relative', flex: 1 }}>
                                        <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
                                        <input type="text" placeholder="Search farmers by name, location, or crop..." style={{
                                            width: '100%',
                                            padding: '1rem 1rem 1rem 3rem',
                                            borderRadius: 'var(--radius-md)',
                                            border: '1px solid var(--border)',
                                            boxShadow: 'var(--shadow-sm)'
                                        }} />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {farmers.length === 0 ? (
                                        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                                            <User size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
                                            <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-muted)' }}>No Farmers Available</h3>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                                Check back later for verified farmers in your region
                                            </p>
                                        </div>
                                    ) : (
                                        farmers.map(farmer => (
                                            <motion.div
                                                key={farmer.id}
                                                whileHover={{ x: 5 }}
                                                className="card"
                                                style={{ display: 'flex', alignItems: 'center', gap: '2rem', padding: '1.5rem' }}
                                            >
                                                <div style={{ fontSize: '3rem' }}>👨‍🌾</div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.25rem' }}>
                                                        <h3 style={{ fontSize: '1.25rem' }}>{farmer.full_name || 'Farmer'}</h3>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#B8860B', fontSize: '0.9rem', fontWeight: 700 }}>
                                                            <Star size={16} fill="#B8860B" /> {farmer.rating || '4.5'}
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                            <MapPin size={14} /> {farmer.location || 'Location N/A'}
                                                        </span>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                            🌾 {farmer.land_size ? `${farmer.land_size} Acres` : 'N/A'}
                                                        </span>
                                                    </div>
                                                    <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                                                        {(farmer.crops_history || []).slice(0, 3).map((crop, idx) => (
                                                            <span key={idx} style={{ padding: '0.25rem 0.75rem', background: 'rgba(45, 90, 39, 0.05)', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>{crop}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <button className="btn btn-secondary">View Profile</button>
                                                <button className="btn btn-primary" onClick={() => { setSelectedFarmer(farmer); setShowContract(true); }}>
                                                    Select Farmer <ArrowRight size={18} />
                                                </button>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </section>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'financing' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '900px', margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                            <div style={{
                                width: '80px', height: '80px', background: 'rgba(45, 90, 39, 0.1)',
                                color: 'var(--primary)', borderRadius: '50%', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem'
                            }}>
                                <Landmark size={40} />
                            </div>
                            <h1 style={{ fontSize: '2.5rem' }}>Institutional Credit</h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '1rem auto' }}>
                                Access low-interest working capital by leveraging your active platform contracts as collateral.
                            </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
                            <div className="card" style={{ padding: '2rem', border: '1px solid var(--primary)', background: 'white' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <ShieldCheck color="var(--primary)" />
                                    <h3 style={{ margin: 0 }}>Trust Indicators</h3>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Platform Trust Score</span>
                                        <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{trustScore}/100</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>KYC Status</span>
                                        <span style={{ fontWeight: 700, color: profile?.kyc_status === 'verified' ? 'var(--success)' : '#F59E0B', fontSize: '0.8rem' }}>
                                            {profile?.kyc_status === 'verified' ? 'VERIFIED' : 'PENDING'}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Contract Reliability</span>
                                        <span style={{ fontWeight: 700 }}>96%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="card" style={{ padding: '2rem', border: '1px solid var(--primary)', background: 'white' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <Banknote color="var(--primary)" />
                                    <h3 style={{ margin: 0 }}>Collateral Value</h3>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Active Contracts</span>
                                        <span style={{ fontWeight: 700 }}>{activeContractsCount} Active</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Contract Value</span>
                                        <span style={{ fontWeight: 700 }}>₹{(totalContractValue / 100000).toFixed(1)}L</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Eligibility Coverage</span>
                                        <span style={{ fontWeight: 800, color: 'var(--primary)' }}>₹{(totalContractValue * 0.4 / 100000).toFixed(1)}L</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card" style={{ padding: '3rem', textAlign: 'center', background: '#f8fafc' }}>
                            <h3 style={{ marginBottom: '1rem' }}>Ready to fuel your growth?</h3>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Apply for a business loan today and get approved within 24 hours based on your platform performance.</p>
                            <button className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.1rem' }} onClick={() => setShowLoanFlow(true)}>
                                Initialize Loan Application
                            </button>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'quality' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div style={{ marginBottom: '3rem' }}>
                            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{t('quality.title')}</h1>
                            <p style={{ color: 'var(--text-muted)' }}>{t('quality.desc')}</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
                            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                                            <th style={{ padding: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('quality.batchId')}</th>
                                            <th style={{ padding: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Farmer / {t('quality.crop')}</th>
                                            <th style={{ padding: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('quality.status')}</th>
                                            <th style={{ padding: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('quality.params')}</th>
                                            <th style={{ padding: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {qualityBatches.map(batch => (
                                            <tr key={batch.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                <td style={{ padding: '1.25rem', fontWeight: 600, fontSize: '0.9rem' }}>{batch.id}</td>
                                                <td style={{ padding: '1.25rem' }}>
                                                    <div style={{ fontWeight: 600 }}>{batch.farmer}</div>
                                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{batch.crop}</div>
                                                </td>
                                                <td style={{ padding: '1.25rem' }}>
                                                    <span style={{
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: 'var(--radius-full)',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 700,
                                                        background: batch.status === 'Optimal' ? 'rgba(16, 185, 129, 0.1)' :
                                                            batch.status === 'Certified' ? 'rgba(45, 90, 39, 0.1)' : 'rgba(212, 175, 55, 0.1)',
                                                        color: batch.status === 'Optimal' ? 'var(--success)' :
                                                            batch.status === 'Certified' ? 'var(--primary)' : '#B8860B'
                                                    }}>
                                                        {batch.status === 'Certified' ? t('quality.certified') :
                                                            batch.status === 'Monitoring' ? t('quality.monitored') : batch.status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1.25rem' }}>
                                                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
                                                        <div><span style={{ color: 'var(--text-muted)' }}>{t('quality.moisture')}:</span> {batch.moisture}</div>
                                                        <div><span style={{ color: 'var(--text-muted)' }}>{t('quality.purity')}:</span> {batch.purity}</div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                                                    <button style={{
                                                        background: 'none', border: 'none', color: 'var(--primary)',
                                                        fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                                                        display: 'flex', alignItems: 'center', gap: '0.25rem'
                                                    }}>
                                                        {t('quality.viewReport')} <ArrowRight size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div className="card" style={{ padding: '1.5rem', background: 'var(--primary)', color: 'white' }}>
                                    <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>{t('quality.estimate')}</h3>
                                    <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>45.2 Tons</div>
                                    <p style={{ fontSize: '0.85rem', opacity: 0.8 }}>Expected total yield across all active tracked contracts.</p>
                                </div>
                                <div className="card" style={{ padding: '1.5rem' }}>
                                    <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>{t('quality.lastUpdate')}</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        <CheckCircle size={16} color="var(--success)" />
                                        All sensors active
                                    </div>
                                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        Satellite data refreshed 45 mins ago.
                                    </div>
                                </div>
                            </aside>
                        </div>
                    </motion.div>
                )}
            </main>

            {/* Modals */}
            <AnimatePresence>
                {showModal && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem'
                    }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="card" style={{ maxWidth: '600px', width: '100%', padding: '3rem' }}>
                            <h2 style={{ marginBottom: '2rem' }}>Post Crop Requirement</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div className="input-group">
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Crops Needed</label>
                                    <select style={{ width: '100%', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                                        {cropCategories.map(cat => (
                                            <optgroup key={cat.name} label={cat.name}>
                                                {cat.crops.map(crop => (
                                                    <option key={crop} value={crop}>{crop}</option>
                                                ))}
                                            </optgroup>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <input type="number" placeholder="Quantity (Quintals)" style={{ width: '100%', padding: '1rem', border: '1px solid var(--border)' }} />
                                    <input type="number" placeholder="Price ₹" style={{ width: '100%', padding: '1rem', border: '1px solid var(--border)' }} />
                                </div>
                                <textarea rows="3" placeholder="Describe organic methods, seed variety..." style={{ width: '100%', padding: '1rem', border: '1px solid var(--border)', fontFamily: 'inherit' }} />
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                                    <button className="btn btn-primary" style={{ flex: 2 }} onClick={() => setShowModal(false)}>Post Requirement</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showLoanFlow && (
                    <LoanApplicationFlow onClose={() => setShowLoanFlow(false)} onComplete={() => setShowLoanFlow(false)} />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showContract && selectedFarmer && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '2rem'
                    }}>
                        <ContractFlow farmer={selectedFarmer} onComplete={() => { setShowContract(false); setSelectedFarmer(null); }} />
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BusinessDashboard;
