import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Filter, Landmark, User, FileText,
    BarChart3, CheckCircle, XCircle, ChevronRight,
    AlertCircle, TrendingUp, Calendar, Clock, PieChart, Info
} from 'lucide-react';
import RiskAssessment from '../../components/RiskAssessment';
import { useAuth } from '../../contexts/AuthContext';
import { bankService } from '../../services/database';

const BankDashboard = () => {
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
            setError('Failed to load dashboard data');
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
        { label: 'Pending Applications', value: pendingCount.toString(), icon: <Clock color="#F59E0B" /> },
        { label: 'Total AUM', value: `₹${(totalActiveLoanValue / 100000).toFixed(1)}L`, icon: <Landmark color="var(--primary)" /> },
        { label: 'Avg Portfolio Risk', value: `${avgRiskScore}/100`, icon: <TrendingUp color="var(--success)" /> },
        { label: 'Default Rate', value: '1.2%', icon: <XCircle color="#EF4444" /> }
    ];

    const filteredApplications = loanApplications.filter(loan =>
        loan.applicant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.application_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⏳ Loading Banker Terminal...</div>;

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            <main style={{ padding: '3rem 4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Banker's Terminal</h1>
                        <p style={{ color: 'var(--text-muted)' }}>AI-driven agriculture lending risk assessment</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', background: 'white', padding: '0.5rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
                        {['applications', 'portfolio', 'analytics'].map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} style={{
                                padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-sm)', border: 'none',
                                background: activeTab === tab ? 'var(--primary)' : 'transparent',
                                color: activeTab === tab ? 'white' : 'var(--text-muted)', fontWeight: 600,
                                cursor: 'pointer', textTransform: 'capitalize'
                            }}>{tab}</button>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                    {stats.map((stat, i) => (
                        <div key={i} className="card" style={{ padding: '1.5rem' }}>
                            <div style={{ padding: '0.5rem', background: 'rgba(0,0,0,0.03)', borderRadius: '8px', width: 'fit-content', marginBottom: '1rem' }}>{stat.icon}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{stat.label}</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stat.value}</div>
                        </div>
                    ))}
                </div>

                {activeTab === 'applications' && (
                    <div style={{ display: 'grid', gridTemplateColumns: selectedApplication ? '1fr 450px' : '1fr', gap: '2rem' }}>
                        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                                <input type="text" placeholder="Search applicant..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }} />
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ background: '#f8fafc' }}>
                                    <tr>
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>APPLICANT</th>
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>AMOUNT</th>
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>RISK SCORE</th>
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>STATUS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredApplications.map(loan => (
                                        <tr key={loan.id} onClick={() => setSelectedApplication(loan)} style={{ borderTop: '1px solid #f1f5f9', cursor: 'pointer', background: selectedApplication?.id === loan.id ? 'rgba(45, 90, 39, 0.03)' : 'transparent' }}>
                                            <td style={{ padding: '1.25rem' }}>
                                                <div style={{ fontWeight: 600 }}>{loan.applicant_name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{loan.applicant_type.toUpperCase()} • #{loan.application_number}</div>
                                            </td>
                                            <td style={{ padding: '1.25rem', fontWeight: 700 }}>₹{loan.loan_amount.toLocaleString()}</td>
                                            <td style={{ padding: '1.25rem' }}>
                                                <span style={{ fontWeight: 800, color: loan.risk_score >= 80 ? 'var(--success)' : (loan.risk_score >= 60 ? '#F59E0B' : '#EF4444') }}>{loan.risk_score}</span>
                                            </td>
                                            <td style={{ padding: '1.25rem' }}>
                                                <span style={{ padding: '0.25rem 0.75rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 600, background: loan.status === 'approved' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: loan.status === 'approved' ? 'var(--success)' : '#F59E0B' }}>{loan.status.toUpperCase()}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <AnimatePresence>
                            {selectedApplication && (
                                <motion.aside initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <RiskAssessment score={selectedApplication.risk_score} />
                                    <div className="card" style={{ padding: '1.5rem' }}>
                                        <h3>Application Details</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem', fontSize: '0.9rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Purpose</span><span style={{ fontWeight: 600 }}>{selectedApplication.purpose}</span></div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Tenure</span><span>{selectedApplication.tenure_months} months</span></div>
                                            {selectedApplication.status === 'pending' ? (
                                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                                    <button className="btn btn-secondary" style={{ flex: 1, color: '#EF4444' }} onClick={() => handleLoanAction(selectedApplication.id, 'rejected')}>Reject</button>
                                                    <button className="btn btn-primary" style={{ flex: 2 }} onClick={() => handleLoanAction(selectedApplication.id, 'approved')}>Approve</button>
                                                </div>
                                            ) : (
                                                <div style={{ textAlign: 'center', padding: '1rem', background: '#f1f5f9', borderRadius: 'var(--radius-sm)', fontWeight: 700 }}>{selectedApplication.status.toUpperCase()}</div>
                                            )}
                                        </div>
                                    </div>
                                </motion.aside>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {activeTab === 'portfolio' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}><h3>Active Loan Portfolio</h3></div>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ background: '#f8fafc' }}>
                                        <tr>
                                            <th style={{ padding: '1rem', textAlign: 'left' }}>BORROWER</th>
                                            <th style={{ padding: '1rem', textAlign: 'left' }}>LOAN TYPE</th>
                                            <th style={{ padding: '1rem', textAlign: 'left' }}>REPAYMENT</th>
                                            <th style={{ padding: '1rem', textAlign: 'left' }}>EXPOSURE</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {approvedLoans.map(loan => (
                                            <tr key={loan.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '1.25rem' }}><strong>{loan.applicant_name}</strong></td>
                                                <td style={{ padding: '1.25rem' }}>{loan.applicant_type.toUpperCase()}</td>
                                                <td style={{ padding: '1.25rem' }}>
                                                    <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', width: '100%', overflow: 'hidden' }}>
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
                                <h3>Exposure by Category</h3>
                                <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Farmers</span><span style={{ fontWeight: 700 }}>64%</span></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Agri-Businesses</span><span style={{ fontWeight: 700 }}>36%</span></div>
                                    <div style={{ height: '10px', display: 'flex', borderRadius: '5px', overflow: 'hidden', marginTop: '1rem' }}>
                                        <div style={{ width: '64%', background: 'var(--primary)' }}></div>
                                        <div style={{ width: '36%', background: '#B8860B' }}></div>
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
                                <h3>Credit Growth vs Risk</h3>
                                <div style={{ height: '200px', width: '100%', background: '#f8fafc', borderRadius: 'var(--radius-md)', marginTop: '1.5rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', padding: '1rem' }}>
                                    {[40, 65, 45, 90, 55, 70].map((h, i) => <div key={i} style={{ height: `${h}%`, width: '25px', background: 'var(--primary)', borderRadius: '4px 4px 0 0' }}></div>)}
                                </div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '1rem', textAlign: 'center' }}>Monthly Credit Disbursement (Last 6 Months)</p>
                            </div>
                            <div className="card" style={{ padding: '2rem' }}>
                                <Info style={{ marginBottom: '1rem', color: 'var(--primary)' }} />
                                <h3>Portfolio Health Meta-Data</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Systemic Default Risk</span><span style={{ color: 'var(--success)', fontWeight: 800 }}>Low (0.8%)</span></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Regional Volatility</span><span style={{ fontWeight: 700 }}>Stable</span></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Yield Verification Rate</span><span style={{ fontWeight: 700 }}>100% (Blockchain)</span></div>
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
