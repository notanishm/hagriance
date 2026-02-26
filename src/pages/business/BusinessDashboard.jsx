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
import { businessService } from '../../services/database';

const BusinessDashboard = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
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

    const fetchData = async () => {
        if (!user) return;

        try {
            setLoading(true);
            setError(null);

            // Fetch farmers
            const { data: farmersData } = await businessService.searchFarmers(searchTerm);
            setFarmers(farmersData || []);

            // Fetch business contracts
            const { data: contractsData } = await businessService.getBusinessContracts(user.id);
            setContracts(contractsData || []);

            // Fetch business profile
            const { data: profileData } = await businessService.getBusinessProfile(user.id);
            setProfile(profileData || (user.role === 'business' ? user : null));

        } catch (err) {
            console.error('Error fetching business data:', err);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user, searchTerm]);

    const activeContractsCount = contracts.filter(c => c.status === 'active' || c.status === 'in_progress').length;
    const totalContractValue = contracts.reduce((sum, c) => sum + (c.total_value || 0), 0);
    const trustScore = profile?.trust_score || 84;

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
                        <Briefcase size={18} /> Marketplace
                    </button>
                    <button
                        onClick={() => setActiveTab('contracts')}
                        style={{
                            padding: '1.5rem 0.5rem',
                            border: 'none',
                            background: 'none',
                            color: activeTab === 'contracts' ? 'var(--primary)' : 'var(--text-muted)',
                            fontWeight: 700,
                            borderBottom: activeTab === 'contracts' ? '3px solid var(--primary)' : '3px solid transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <FileText size={18} /> My Contracts
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
                        <Landmark size={18} /> Financing
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
                                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Farmer Marketplace</h1>
                                <p style={{ color: 'var(--text-muted)' }}>Browse verified farmers and establish direct trade contracts.</p>
                            </div>
                            <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ padding: '1rem 2rem', borderRadius: 'var(--radius-md)' }}>
                                <Plus size={20} /> Post New Requirement
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '3rem' }}>
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
                                                {cropCategories.map(cat => <option key={cat.name} value={cat.name}>{cat.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </aside>

                            <section>
                                <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
                                    <div style={{ position: 'relative', flex: 1 }}>
                                        <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
                                        <input
                                            type="text"
                                            placeholder="Search farmers by name, location, or crop..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '1rem 1rem 1rem 3rem',
                                                borderRadius: 'var(--radius-md)',
                                                border: '1px solid var(--border)',
                                                boxShadow: 'var(--shadow-sm)'
                                            }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {farmers.length === 0 ? (
                                        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                                            <User size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
                                            <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-muted)' }}>No Farmers Found</h3>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Try adjusting your search filters</p>
                                        </div>
                                    ) : (
                                        farmers.map(farmer => (
                                            <motion.div key={farmer.id} whileHover={{ x: 5 }} className="card" style={{ display: 'flex', alignItems: 'center', gap: '2rem', padding: '1.5rem' }}>
                                                <div style={{ fontSize: '3rem' }}>👨‍🌾</div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.25rem' }}>
                                                        <h3 style={{ fontSize: '1.25rem' }}>{farmer.full_name}</h3>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#B8860B', fontSize: '0.9rem', fontWeight: 700 }}>
                                                            <Star size={16} fill="#B8860B" /> {farmer.rating || '4.5'}
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={14} /> {farmer.location}</span>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>🌾 {farmer.land_size} Acres</span>
                                                    </div>
                                                    <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                                                        {(farmer.crops_history || []).map((crop, idx) => (
                                                            <span key={idx} style={{ padding: '0.25rem 0.75rem', background: 'rgba(45, 90, 39, 0.05)', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>{crop}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <button className="btn btn-primary" onClick={() => { setSelectedFarmer(farmer); setShowContract(true); }}>
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
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div style={{ marginBottom: '3rem' }}>
                            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>My Contracts</h1>
                            <p style={{ color: 'var(--text-muted)' }}>Manage your active trade relationships and track fulfillment.</p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {contracts.length === 0 ? (
                                <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                                    <FileText size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
                                    <h3>No Contracts Yet</h3>
                                    <p style={{ color: 'var(--text-muted)' }}>Head over to the marketplace to start trading with farmers.</p>
                                </div>
                            ) : (
                                contracts.map(contract => (
                                    <div key={contract.id} className="card" style={{ padding: '2rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <h3 style={{ fontSize: '1.25rem' }}>{contract.farmer_name || 'Farmer Contract'}</h3>
                                                    <span style={{
                                                        padding: '0.25rem 0.75rem',
                                                        background: 'rgba(45, 90, 39, 0.1)',
                                                        color: 'var(--primary)',
                                                        borderRadius: 'var(--radius-full)',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 700
                                                    }}>
                                                        {contract.crop_name}
                                                    </span>
                                                </div>
                                                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>ID: {contract.contract_number || contract.id} • Created: {new Date(contract.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <span style={{
                                                    padding: '0.4rem 1rem',
                                                    borderRadius: 'var(--radius-full)',
                                                    background: contract.status === 'active' || contract.status === 'in_progress' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                                    color: contract.status === 'active' || contract.status === 'in_progress' ? 'var(--success)' : '#F59E0B',
                                                    fontSize: '0.8rem', fontWeight: 700
                                                }}>
                                                    {contract.status === 'active' || contract.status === 'in_progress' ? 'IN PROGRESS' : contract.status.toUpperCase()}
                                                </span>
                                                <div style={{ marginTop: '0.5rem', fontSize: '1.1rem', fontWeight: 700 }}>₹{contract.total_value?.toLocaleString()}</div>
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                            <span>Fulfillment Progress</span>
                                            <span style={{ fontWeight: 600 }}>{contract.progress || (contract.status === 'completed' ? 100 : 45)}%</span>
                                        </div>
                                        <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${contract.progress || (contract.status === 'completed' ? 100 : 45)}%` }} style={{ height: '100%', background: 'var(--primary)' }} />
                                        </div>
                                    </div>
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
                            <h1 style={{ fontSize: '2.5rem' }}>Business Credit</h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '1rem auto' }}>
                                Scale your operations by leveraging your trade history for low-interest capital.
                            </p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
                            <div className="card" style={{ padding: '2rem', border: '1px solid var(--primary)' }}>
                                <h3 style={{ marginBottom: '1.5rem' }}>Trust Analytics</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Platform Trust Score</span><span style={{ color: 'var(--primary)', fontWeight: 800 }}>{trustScore}/100</span></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Contract Success</span><span style={{ fontWeight: 700 }}>98.2%</span></div>
                                </div>
                            </div>
                            <div className="card" style={{ padding: '2rem', border: '1px solid var(--primary)' }}>
                                <h3 style={{ marginBottom: '1.5rem' }}>Credit Eligibility</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Collateral Value</span><span style={{ fontWeight: 700 }}>₹{(totalContractValue / 100000).toFixed(1)}L</span></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Max Exposure</span><span style={{ color: 'var(--primary)', fontWeight: 800 }}>₹{(totalContractValue * 0.4 / 100000).toFixed(1)}L</span></div>
                                </div>
                            </div>
                        </div>
                        <button className="btn btn-primary" style={{ width: '100%', padding: '1.5rem' }} onClick={() => setShowLoanFlow(true)}>Apply for Working Capital</button>
                    </motion.div>
                )}

                {activeTab === 'quality' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div style={{ marginBottom: '3rem' }}>
                            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Live Crop Monitoring</h1>
                            <p style={{ color: 'var(--text-muted)' }}>Real-time quality parameter tracking for all active contracts.</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
                            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                                            <th style={{ padding: '1.25rem' }}>Batch / Farmer</th>
                                            <th style={{ padding: '1.25rem' }}>Crop</th>
                                            <th style={{ padding: '1.25rem' }}>Status</th>
                                            <th style={{ padding: '1.25rem' }}>Parameters</th>
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
                                                    }}>Optimal</span>
                                                </td>
                                                <td style={{ padding: '1.25rem', fontSize: '0.9rem' }}>
                                                    Moisture: 12.4% • Health: 94%
                                                </td>
                                                <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                                                    <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>Report</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <aside className="card" style={{ padding: '1.5rem', height: 'fit-content' }}>
                                <Microscope style={{ marginBottom: '1rem', color: 'var(--primary)' }} />
                                <h3>Total Yield Estimate</h3>
                                <div style={{ fontSize: '2rem', fontWeight: 800, margin: '1rem 0' }}>42.5 Tons</div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Expected yield across all monitored fields this month.</p>
                            </aside>
                        </div>
                    </motion.div>
                )}
            </main>

            <AnimatePresence>
                {showModal && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="card" style={{ maxWidth: '600px', width: '100%', padding: '3rem' }}>
                            <h2>Post Crop Requirement</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Describe your needs to verified farmers.</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <select style={{ width: '100%', padding: '1rem', border: '1px solid var(--border)' }}>
                                    <option>Select Crop</option>
                                    {cropCategories.map(cat => <optgroup key={cat.name} label={cat.name}>{cat.crops.map(crop => <option key={crop} value={crop}>{crop}</option>)}</optgroup>)}
                                </select>
                                <input type="number" placeholder="Quantity (Quintals)" style={{ width: '100%', padding: '1rem', border: '1px solid var(--border)' }} />
                                <input type="number" placeholder="Target Price ₹" style={{ width: '100%', padding: '1rem', border: '1px solid var(--border)' }} />
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                                    <button className="btn btn-primary" style={{ flex: 2 }} onClick={() => setShowModal(false)}>Publish Requirement</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
                {showLoanFlow && <LoanApplicationFlow onClose={() => setShowLoanFlow(false)} onComplete={() => setShowLoanFlow(false)} />}
                {showContract && selectedFarmer && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '2rem' }}>
                        <ContractFlow farmer={selectedFarmer} onComplete={() => { setShowContract(false); setSelectedFarmer(null); fetchData(); }} />
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BusinessDashboard;
