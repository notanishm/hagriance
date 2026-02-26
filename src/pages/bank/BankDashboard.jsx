import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../contexts/LanguageContext';
import {
    Search, Filter, Landmark, User, FileText,
    BarChart3, CheckCircle, XCircle, ChevronRight,
    AlertCircle, TrendingUp, Calendar, Clock, PieChart, Info
} from 'lucide-react';
import RiskAssessment from '../../components/RiskAssessment';
import { useAuth } from '../../contexts/AuthContext';
import { bankService } from '../../services/database';

const BankDashboard = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('applications'); // applications, portfolio, analytics
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [loanApplications, setLoanApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        if (!user) return;

        try {
            setLoading(true);
            setError(null);
            const { data: loansData } = await bankService.getLoanApplications({});
            setLoanApplications(loansData || []);
        } catch (err) {
            console.error('Error fetching bank data:', err);
            setError(t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const handleLoanAction = async (loanId, status) => {
        try {
            const reason = status === 'approved' ? 'Meets institutional risk threshold' : 'High credit risk or low collateral visibility';
            const { error } = await bankService.updateLoanStatus(loanId, status, reason);
            if (error) throw error;
            setLoanApplications(prev => prev.map(l => l.id === loanId ? { ...l, status } : l));
            setSelectedApplication(prev => prev?.id === loanId ? { ...prev, status } : prev);
        } catch (err) {
            alert(`Error updating loan: ${err.message}`);
        }
    };

    const pendingCount = loanApplications.filter(l => l.status === 'pending').length;
    const approvedLoans = loanApplications.filter(l => l.status === 'approved' || l.status === 'active');
    const totalActiveLoanValue = approvedLoans.reduce((sum, l) => sum + (l.loan_amount || 0), 0);
    const avgRiskScore = loanApplications.length > 0
        ? Math.round(loanApplications.reduce((sum, l) => sum + (l.risk_score || 80), 0) / loanApplications.length)
        : 82;

    const stats = [
        { label: t('bank.pending_apps'), value: pendingCount.toString(), icon: <Clock color="var(--warning)" /> },
        { label: t('bank.total_aum'), value: `₹${(totalActiveLoanValue / 100000).toFixed(1)}L`, icon: <Landmark color="var(--primary)" /> },
        { label: t('bank.avg_risk'), value: `${avgRiskScore}/100`, icon: <TrendingUp color="var(--success)" /> },
        { label: t('bank.default_rate'), value: '1.2%', icon: <XCircle color="var(--error)" /> }
    ];

    const filteredApplications = loanApplications.filter(loan =>
        loan.applicant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.application_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
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
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.8, marginBottom: '0.5rem', color: 'var(--secondary)' }}>Institutional Credit Control</div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0 }}>{t('bank.dashboard')}, {user?.email?.split('@')[0]?.toUpperCase() || 'Bank Officer'}</h1>
                        <p style={{ margin: '0.5rem 0 0 0', opacity: 0.8 }}>Overseeing ₹{(totalActiveLoanValue / 100000).toFixed(1)}L in agricultural assets across {approvedLoans.length} active portfolios.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', background: 'rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '12px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        {['applications', 'portfolio', 'analytics'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: activeTab === tab ? 'white' : 'transparent',
                                    color: activeTab === tab ? 'var(--primary)' : 'white',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    textTransform: 'capitalize',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {t(`bank.${tab}`)}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <main style={{ maxWidth: '1400px', margin: '-3rem auto 0 auto', padding: '0 4rem 4rem 4rem', position: 'relative', zIndex: 5 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                    {stats.map((stat, i) => (
                        <div key={i} className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ padding: '0.6rem', background: 'var(--bg-hover)', borderRadius: '10px' }}>{stat.icon}</div>
                                {stat.label === t('bank.pending_apps') && pendingCount > 0 && (
                                    <span style={{ background: 'var(--error)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 800 }}>URGENT</span>
                                )}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '0.5rem' }}>{stat.label}</div>
                            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)' }}>{stat.value}</div>
                        </div>
                    ))}
                </div>

                {activeTab === 'applications' && (
                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} style={{ display: 'grid', gridTemplateColumns: selectedApplication ? '1fr 480px' : '1fr', gap: '2rem' }}>
                        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Incoming Requests</h3>
                                <div style={{ position: 'relative', width: '300px' }}>
                                    <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input
                                        type="text"
                                        placeholder="Search applicants..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="form-input-refined"
                                        style={{ paddingLeft: '2.5rem', height: '40px', background: 'white' }}
                                    />
                                </div>
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ background: '#f1f5f9', borderBottom: '1px solid var(--border)' }}>
                                    <tr>
                                        <th style={{ padding: '1rem 2rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)' }}>Applicant</th>
                                        <th style={{ padding: '1rem 2rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)' }}>Amount</th>
                                        <th style={{ padding: '1rem 2rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)' }}>Risk Score</th>
                                        <th style={{ padding: '1rem 2rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)' }}>Decision</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredApplications.map(loan => (
                                        <tr key={loan.id} onClick={() => setSelectedApplication(loan)} style={{ borderTop: '1px solid var(--border-light)', cursor: 'pointer', background: selectedApplication?.id === loan.id ? 'rgba(45, 90, 39, 0.05)' : 'transparent', transition: 'all 0.2s ease' }}>
                                            <td style={{ padding: '1.5rem 2rem' }}>
                                                <div style={{ fontWeight: 800, fontSize: '1rem' }}>{loan.applicant_name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{loan.applicant_type.toUpperCase()} • #{loan.application_number}</div>
                                            </td>
                                            <td style={{ padding: '1.5rem 2rem', fontWeight: 900, fontSize: '1.1rem', color: 'var(--primary)' }}>₹{loan.loan_amount.toLocaleString()}</td>
                                            <td style={{ padding: '1.5rem 2rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid', borderColor: loan.risk_score >= 80 ? 'var(--success)' : (loan.risk_score >= 60 ? 'var(--warning)' : 'var(--error)'), fontSize: '0.85rem', fontWeight: 900 }}>
                                                        {loan.risk_score}
                                                    </div>
                                                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                                                        {loan.risk_score >= 80 ? 'PRIME' : (loan.risk_score >= 60 ? 'MID' : 'HIGH RISK')}
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.5rem 2rem' }}>
                                                <span className={`status-badge status-${loan.status === 'approved' ? 'success' : 'pending'}`}>
                                                    {loan.status.toUpperCase()}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <AnimatePresence>
                            {selectedApplication && (
                                <motion.aside initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div className="card" style={{ padding: '2rem', background: 'var(--primary)', color: 'white' }}>
                                        <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ShieldCheck size={20} /> Underwriting Analysis</h3>
                                        <RiskAssessment score={selectedApplication.risk_score} hideDetails />
                                        <div style={{ marginTop: '1.5rem', background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '12px', fontSize: '0.85rem', lineHeight: '1.6', border: '1px solid rgba(255,255,255,0.1)' }}>
                                            Blockchain verified contract <strong>#{selectedApplication.application_number}</strong> covers 120% of loan value through crop assets.
                                        </div>
                                    </div>

                                    <div className="card" style={{ padding: '2rem' }}>
                                        <h3 style={{ marginBottom: '1.5rem' }}>{t('bank.app_details')}</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.95rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
                                                <span style={{ color: 'var(--text-muted)' }}>{t('bank.purpose_label')}</span>
                                                <span style={{ fontWeight: 700 }}>{selectedApplication.purpose}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
                                                <span style={{ color: 'var(--text-muted)' }}>{t('bank.tenure_label')}</span>
                                                <span style={{ fontWeight: 700 }}>{selectedApplication.tenure_months} months</span>
                                            </div>

                                            {selectedApplication.status === 'pending' ? (
                                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                                    <button className="btn btn-secondary" style={{ flex: 1, borderColor: 'var(--error)', color: 'var(--error)' }} onClick={() => handleLoanAction(selectedApplication.id, 'rejected')}>{t('bank.reject')}</button>
                                                    <button className="btn btn-primary" style={{ flex: 2, background: 'var(--success)', border: 'none' }} onClick={() => handleLoanAction(selectedApplication.id, 'approved')}>{t('bank.approve')}</button>
                                                </div>
                                            ) : (
                                                <div style={{ textAlign: 'center', padding: '1.25rem', background: '#f0fdf4', color: 'var(--success)', borderRadius: '12px', fontWeight: 900, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                                    <CheckCircle size={20} style={{ display: 'inline', marginRight: '0.5rem' }} /> {selectedApplication.status.toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.aside>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}

                {activeTab === 'portfolio' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}><h3>{t('bank.active_portfolio')}</h3></div>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ background: 'var(--bg-hover)' }}>
                                        <tr>
                                            <th style={{ padding: '1rem', textAlign: 'left' }}>{t('bank.borrower')}</th>
                                            <th style={{ padding: '1rem', textAlign: 'left' }}>{t('bank.loan_type')}</th>
                                            <th style={{ padding: '1rem', textAlign: 'left' }}>{t('bank.repayment')}</th>
                                            <th style={{ padding: '1rem', textAlign: 'left' }}>{t('bank.exposure')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {approvedLoans.map(loan => (
                                            <tr key={loan.id} style={{ borderTop: '1px solid var(--border-light)' }}>
                                                <td style={{ padding: '1.25rem' }}><strong>{loan.applicant_name}</strong></td>
                                                <td style={{ padding: '1.25rem' }}>{loan.applicant_type.toUpperCase()}</td>
                                                <td style={{ padding: '1.25rem' }}>
                                                    <div style={{ height: '6px', background: 'var(--border-light)', borderRadius: '3px', width: '100%', overflow: 'hidden' }}>
                                                        <div style={{ height: '100%', width: '45%', background: 'var(--success)' }}></div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1.25rem', fontWeight: 700 }}>₹{loan.loan_amount.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <aside className="card" style={{ padding: '2rem' }}>
                                <PieChart style={{ marginBottom: '1.5rem', color: 'var(--primary)' }} />
                                <h3>{t('bank.exposure_category')}</h3>
                                <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{t('bank.farmers_label')}</span><span style={{ fontWeight: 700 }}>64%</span></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{t('bank.businesses_label')}</span><span style={{ fontWeight: 700 }}>36%</span></div>
                                    <div style={{ height: '10px', display: 'flex', borderRadius: '5px', overflow: 'hidden', marginTop: '1rem' }}>
                                        <div style={{ width: '64%', background: 'var(--primary)' }}></div>
                                        <div style={{ width: '36%', background: 'var(--secondary)' }}></div>
                                    </div>
                                </div>
                            </aside>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'analytics' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <div className="card" style={{ padding: '2rem' }}>
                                <BarChart3 style={{ marginBottom: '1rem', color: 'var(--primary)' }} />
                                <h3>{t('bank.growth_risk')}</h3>
                                <div style={{ height: '200px', width: '100%', background: 'var(--bg-hover)', borderRadius: 'var(--radius-md)', marginTop: '1.5rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', padding: '1rem' }}>
                                    {[40, 65, 45, 90, 55, 70].map((h, i) => <div key={i} style={{ height: `${h}%`, width: '25px', background: 'var(--primary)', borderRadius: '4px 4px 0 0' }}></div>)}
                                </div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '1rem', textAlign: 'center' }}>{t('bank.monthly_disb')}</p>
                            </div>
                            <div className="card" style={{ padding: '2rem' }}>
                                <Info style={{ marginBottom: '1rem', color: 'var(--primary)' }} />
                                <h3>{t('bank.health_meta')}</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{t('bank.systemic_risk')}</span><span style={{ color: 'var(--success)', fontWeight: 800 }}>Low (0.8%)</span></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{t('bank.reg_volatility')}</span><span style={{ fontWeight: 700 }}>Stable</span></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{t('bank.yield_verification')}</span><span style={{ fontWeight: 700 }}>100% (Blockchain)</span></div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </main>
        </div>
    );
};

export default BankDashboard;
