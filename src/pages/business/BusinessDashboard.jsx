import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, MapPin, Star, Filter,
    ArrowRight, CheckCircle, Globe, Banknote,
    ShieldCheck, ChevronDown, Landmark, Briefcase, Microscope, ThermometerSun, AlertCircle, User, FileText
} from 'lucide-react';
import ContractFlow from './ContractFlow';
import LoanApplicationFlow from '../../components/LoanApplicationFlow';
import { cropCategories } from '../../data/crops';
import { useAuth } from '../../contexts/AuthContext';
import { mockFarmers, mockContracts, mockUsers } from '../../data/mockData';

const PROFILE_CACHE_KEY = 'agriance_cached_profile';

const BusinessDashboard = () => {
    const { t } = useTranslation();
    const { user, userProfile } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [selectedFarmer, setSelectedFarmer] = useState(null);
    const [showContract, setShowContract] = useState(false);
    const [showLoanFlow, setShowLoanFlow] = useState(false);
    const [activeTab, setActiveTab] = useState('marketplace'); // marketplace, contracts, financing, quality

    const [farmers, setFarmers] = useState([]);
    const [contracts, setContracts] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Load data from mock + localStorage (bypass Supabase for demo)
        const loadData = () => {
            try {
                // Load profile: try cached → userProfile → mock fallback
                let cachedProfile = null;
                try {
                    const cached = localStorage.getItem(PROFILE_CACHE_KEY);
                    if (cached) cachedProfile = JSON.parse(cached);
                } catch (e) { /* ignore */ }

                setProfile(cachedProfile || userProfile || mockUsers.business);

                // Use mock data directly
                setFarmers(mockFarmers);
                setContracts(mockContracts);
            } catch (err) {
                console.error('Error loading business data:', err);
                setError(t('common.error'));
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(loadData, 300);
        return () => clearTimeout(timer);
    }, [user, userProfile]);

    // Filter farmers by search term (client-side)
    const filteredFarmers = farmers.filter(f =>
        !searchTerm || f.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const activeContractsCount = contracts.filter(c => c.status === 'active' || c.status === 'in_progress').length;
    const totalContractValue = contracts.reduce((sum, c) => sum + (c.total_value || 0), 0);
    const trustScore = profile?.trust_score || 84;

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

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
            {/* Header / Hero Area */}
            <header className="hero-banner" style={{ padding: '3rem 4rem 5rem 4rem', borderRadius: 0, marginBottom: 0 }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.8, marginBottom: '0.5rem', color: 'var(--secondary)' }}>Procurement Management</div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0 }}>{t('common.welcome')}, {profile?.business_name || 'AgriCorp'}</h1>
                        <p style={{ margin: '0.5rem 0 0 0', opacity: 0.8 }}>Managing {activeContractsCount} active supply chains across {filteredFarmers.length} verified farmers.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <div style={{ textAlign: 'right', paddingRight: '1.5rem', borderRight: '1px solid rgba(255,255,255,0.2)' }}>
                            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7 }}>Portfolio Value</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>₹{(totalContractValue / 100000).toFixed(1)}L</div>
                        </div>
                        <button className="gold-gradient-btn" onClick={() => setShowModal(true)}>
                            <Plus size={18} /> {t('marketplace.post_requirement')}
                        </button>
                    </div>
                </div>
            </header>

            {/* Sticky Navigation */}
            <nav style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '0 4rem', position: 'sticky', top: 0, zIndex: 10 }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', gap: '3rem' }}>
                    {[
                        { id: 'marketplace', icon: <Briefcase size={18} />, label: t('dashboard.marketplace') },
                        { id: 'contracts', icon: <FileText size={18} />, label: t('dashboard.my_contracts') },
                        { id: 'financing', icon: <Landmark size={18} />, label: t('dashboard.financing') },
                        { id: 'quality', icon: <ShieldCheck size={18} />, label: t('dashboard.live_monitoring') }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '1.25rem 0',
                                border: 'none',
                                background: 'none',
                                color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                                fontWeight: 700,
                                borderBottom: activeTab === tab.id ? '3px solid var(--primary)' : '3px solid transparent',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.6rem',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>
            </nav>

            <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '3rem 4rem' }}>
                {activeTab === 'marketplace' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '3rem' }}>
                            <aside>
                                <div className="card" style={{ padding: '2rem', sticky: 'top 100px' }}>
                                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem' }}>
                                        <Filter size={18} color="var(--primary)" /> Smart Filters
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Crop Category</label>
                                            <select className="form-input-refined" style={{ padding: '0.6rem' }}>
                                                <option>{t('marketplace.all_categories')}</option>
                                                {cropCategories.map(cat => <option key={cat.name} value={cat.name}>{cat.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Min. Trust Score</label>
                                            <input type="range" style={{ width: '100%', accentColor: 'var(--primary)' }} />
                                        </div>
                                    </div>
                                </div>
                            </aside>

                            <section>
                                <div style={{ marginBottom: '2.5rem', display: 'flex', gap: '1rem' }}>
                                    <div style={{ position: 'relative', flex: 1 }}>
                                        <Search style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
                                        <input
                                            type="text"
                                            className="form-input-refined"
                                            placeholder={t('marketplace.search_placeholder')}
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            style={{ paddingLeft: '3.5rem', height: '56px', fontSize: '1rem', background: 'white' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {filteredFarmers.length === 0 ? (
                                        <div className="card" style={{ padding: '5rem', textAlign: 'center' }}>
                                            <User size={64} color="var(--border)" style={{ marginBottom: '1.5rem' }} />
                                            <h3 style={{ color: 'var(--text-muted)' }}>{t('marketplace.no_farmers')}</h3>
                                        </div>
                                    ) : (
                                        filteredFarmers.map(farmer => (
                                            <motion.div key={farmer.id} whileHover={{ x: 5, boxShadow: 'var(--shadow-md)' }} className="card" style={{ display: 'flex', alignItems: 'center', gap: '2.5rem', padding: '2rem' }}>
                                                <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', border: '1px solid var(--border-light)' }}>
                                                    {farmer.full_name?.charAt(0) || '👨‍🌾'}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                                        <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>{farmer.full_name}</h3>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(212, 175, 55, 0.1)', color: '#B8860B', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 800 }}>
                                                            <Star size={14} fill="#B8860B" /> {farmer.rating || '4.8'}
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(45, 90, 39, 0.1)', color: 'var(--primary)', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 800 }}>
                                                            <ShieldCheck size={14} /> Aadhaar Verified
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '2rem', color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 500 }}>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><MapPin size={16} color="var(--primary)" /> {farmer.location}</span>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Briefcase size={16} color="var(--primary)" /> {farmer.land_size} Acres</span>
                                                    </div>
                                                    <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.6rem' }}>
                                                        {(farmer.crops_history || ['Wheat', 'Corn']).map((crop, idx) => (
                                                            <span key={idx} style={{ padding: '0.4rem 1rem', background: '#F8FAF8', border: '1px solid rgba(45, 90, 39, 0.1)', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase' }}>{crop}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <button className="gold-gradient-btn" onClick={() => { setSelectedFarmer(farmer); setShowContract(true); }} style={{ height: 'fit-content', padding: '1rem 2rem' }}>
                                                    Establish Contract <ArrowRight size={18} />
                                                </button>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </section>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'contracts' && (
                    <motion.div initial={{ opacity: 0, scale: 0.99 }} animate={{ opacity: 1, scale: 1 }}>
                        <div className="section-header-refined">
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>Active Procurement Contracts</h2>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            {contracts.length === 0 ? (
                                <div className="card" style={{ gridColumn: 'span 2', padding: '5rem', textAlign: 'center' }}>
                                    <FileText size={64} color="var(--border)" style={{ marginBottom: '1.5rem' }} />
                                    <h3>{t('contracts.no_contracts')}</h3>
                                </div>
                            ) : (
                                contracts.map(contract => (
                                    <motion.div key={contract.id} whileHover={{ y: -5 }} className="card" style={{ padding: '2rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                            <div style={{ display: 'flex', gap: '1.25rem' }}>
                                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🌾</div>
                                                <div>
                                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{contract.farmer_name || 'Farmer Contract'}</h3>
                                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.25rem 0' }}>{contract.crop_name} • {contract.contract_number}</p>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <span className={`status-badge status-${contract.status.toLowerCase()}`}>
                                                    {contract.status === 'active' || contract.status === 'in_progress' ? 'Healthy' : contract.status}
                                                </span>
                                                <div style={{ marginTop: '0.75rem', fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>₹{(contract.total_value / 100000).toFixed(2)}L</div>
                                            </div>
                                        </div>

                                        <div style={{ background: '#F8FAFC', padding: '1.5rem', borderRadius: '16px' }}>
                                            <div style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                                                <span>Fulfillment Progress</span>
                                                <span style={{ color: 'var(--primary)' }}>{contract.progress || 45}%</span>
                                            </div>
                                            <div style={{ height: '8px', background: 'white', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                                                <motion.div initial={{ width: 0 }} animate={{ width: `${contract.progress || 45}%` }} style={{ height: '100%', background: 'var(--primary)' }} />
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                                                <button style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <ShieldCheck size={16} /> View Trust Audit
                                                </button>
                                                <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                                                    Live Cam Tracking
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'financing' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '900px', margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                            <div style={{ width: '80px', height: '80px', background: 'rgba(45, 90, 39, 0.1)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                <Landmark size={40} />
                            </div>
                            <h1 style={{ fontSize: '2.5rem' }}>{t('financing.title')}</h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '1rem auto' }}>
                                {t('financing.subtitle')}
                            </p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
                            <div className="card" style={{ padding: '2rem', border: '1px solid var(--primary)' }}>
                                <h3 style={{ marginBottom: '1.5rem' }}>{t('financing.trust_analytics')}</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{t('financing.trust_score')}</span><span style={{ color: 'var(--primary)', fontWeight: 800 }}>{trustScore}/100</span></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{t('financing.success_rate')}</span><span style={{ fontWeight: 700 }}>98.2%</span></div>
                                </div>
                            </div>
                            <div className="card" style={{ padding: '2rem', border: '1px solid var(--primary)' }}>
                                <h3 style={{ marginBottom: '1.5rem' }}>{t('financing.eligibility')}</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{t('financing.collateral')}</span><span style={{ fontWeight: 700 }}>₹{(totalContractValue / 100000).toFixed(1)}L</span></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{t('financing.max_exposure')}</span><span style={{ color: 'var(--primary)', fontWeight: 800 }}>₹{(totalContractValue * 0.4 / 100000).toFixed(1)}L</span></div>
                                </div>
                            </div>
                        </div>
                        <button className="btn btn-primary" style={{ width: '100%', padding: '1.5rem' }} onClick={() => setShowLoanFlow(true)}>{t('financing.apply_capital')}</button>
                    </motion.div>
                )}

                {activeTab === 'quality' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div style={{ marginBottom: '3rem' }}>
                            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{t('quality.live_title')}</h1>
                            <p style={{ color: 'var(--text-muted)' }}>{t('quality.live_subtitle')}</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
                            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ background: 'var(--bg-hover)', borderBottom: '1px solid var(--border)' }}>
                                            <th style={{ padding: '1.25rem' }}>{t('quality.batch_farmer')}</th>
                                            <th style={{ padding: '1.25rem' }}>{t('quality.crop')}</th>
                                            <th style={{ padding: '1.25rem' }}>{t('quality.status')}</th>
                                            <th style={{ padding: '1.25rem' }}>{t('quality.params')}</th>
                                            <th style={{ padding: '1.25rem' }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {contracts.filter(c => c.status === 'active' || c.status === 'in_progress').map((c, i) => (
                                            <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                <td style={{ padding: '1.25rem' }}>
                                                    <div style={{ fontWeight: 600 }}>{c.farmer_name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>#{c.id.substring(0, 8)}</div>
                                                </td>
                                                <td style={{ padding: '1.25rem', fontWeight: 600 }}>{c.crop_name}</td>
                                                <td style={{ padding: '1.25rem' }}>
                                                    <span style={{
                                                        padding: '0.25rem 0.75rem', background: 'rgba(16, 185, 129, 0.1)',
                                                        color: 'var(--success)', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700
                                                    }}>{t('dashboard.optimal')}</span>
                                                </td>
                                                <td style={{ padding: '1.25rem', fontSize: '0.9rem' }}>
                                                    {t('quality.moisture')}: 12.4% • {t('quality.health')}: 94%
                                                </td>
                                                <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                                                    <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>{t('quality.view_report')}</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <aside className="card" style={{ padding: '1.5rem', height: 'fit-content' }}>
                                <Microscope style={{ marginBottom: '1rem', color: 'var(--primary)' }} />
                                <h3>{t('quality.yield_estimate')}</h3>
                                <div style={{ fontSize: '2rem', fontWeight: 800, margin: '1rem 0' }}>42.5 Tons</div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('quality.expected_yield')}</p>
                            </aside>
                        </div>
                    </motion.div>
                )}
            </main>

            <AnimatePresence>
                {showModal && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="card" style={{ maxWidth: '600px', width: '100%', padding: '3rem' }}>
                            <h2>{t('quality.post_requirement_title')}</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{t('quality.post_requirement_desc')}</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <select style={{ width: '100%', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                                    <option>{t('quality.select_crop')}</option>
                                    {cropCategories.map(cat => <optgroup key={cat.name} label={cat.name}>{cat.crops.map(crop => <option key={crop} value={crop}>{crop}</option>)}</optgroup>)}
                                </select>
                                <input type="number" placeholder={t('quality.quantity_placeholder')} style={{ width: '100%', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }} />
                                <input type="number" placeholder={t('quality.target_price')} style={{ width: '100%', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }} />
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>{t('common.cancel')}</button>
                                    <button className="btn btn-primary" style={{ flex: 2 }} onClick={() => setShowModal(false)}>{t('quality.publish')}</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
                {showLoanFlow && <LoanApplicationFlow onClose={() => setShowLoanFlow(false)} onComplete={() => setShowLoanFlow(false)} />}
                {showContract && selectedFarmer && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '2rem' }}>
                        <ContractFlow farmer={selectedFarmer} onComplete={() => { setShowContract(false); setSelectedFarmer(null); }} />
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BusinessDashboard;
