import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Filter, Landmark, User, FileText,
    BarChart3, CheckCircle, XCircle, ChevronRight,
    AlertCircle, TrendingUp, Calendar, Clock
} from 'lucide-react';
import { sampleLoans, LOAN_STATUS } from '../../data/loans';
import RiskAssessment from '../../components/RiskAssessment';
import { useAuth } from '../../contexts/AuthContext';
import { bankService } from '../../services/database';

const BankDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('applications'); // applications, portfolio, analytics
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Real data from Supabase
    const [loanApplications, setLoanApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            
            try {
                setLoading(true);
                setError(null);

                // Fetch all loan applications for review
                const { data: loansData, error: loansError } = await bankService.getLoanApplications({});
                if (loansError) throw loansError;
                setLoanApplications(loansData || []);

            } catch (err) {
                console.error('Error fetching bank data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const handleApprove = async (loanId) => {
        try {
            const { error } = await bankService.updateLoanStatus(loanId, 'approved', 'Approved by banker');
            if (error) throw error;
            
            // Update local state
            setLoanApplications(prev => 
                prev.map(loan => loan.id === loanId ? { ...loan, status: 'approved' } : loan)
            );
            setSelectedApplication(prev => prev?.id === loanId ? { ...prev, status: 'approved' } : prev);
            alert('Loan application approved successfully!');
        } catch (err) {
            alert(`Error approving loan: ${err.message}`);
        }
    };

    const handleReject = async (loanId) => {
        try {
            const { error } = await bankService.updateLoanStatus(loanId, 'rejected', 'Rejected by banker');
            if (error) throw error;
            
            // Update local state
            setLoanApplications(prev => 
                prev.map(loan => loan.id === loanId ? { ...loan, status: 'rejected' } : loan)
            );
            setSelectedApplication(prev => prev?.id === loanId ? { ...prev, status: 'rejected' } : prev);
            alert('Loan application rejected');
        } catch (err) {
            alert(`Error rejecting loan: ${err.message}`);
        }
    };

    // Calculate stats from real data
    const pendingCount = loanApplications.filter(l => l.status === 'pending').length;
    const approvedLoans = loanApplications.filter(l => l.status === 'approved');
    const totalActiveLoanValue = approvedLoans.reduce((sum, l) => sum + (l.loan_amount || 0), 0);
    const avgRiskScore = loanApplications.length > 0 
        ? Math.round(loanApplications.reduce((sum, l) => sum + (l.risk_score || 80), 0) / loanApplications.length)
        : 82;

    const stats = [
        { label: 'Pending Applications', value: pendingCount.toString(), icon: <Clock color="#F59E0B" />, trend: '+3 today' },
        { label: 'Active Loans', value: `₹${(totalActiveLoanValue / 100000).toFixed(1)}L`, icon: <Landmark color="var(--primary)" />, trend: `${approvedLoans.length} Active` },
        { label: 'Avg Risk Score', value: `${avgRiskScore}/100`, icon: <TrendingUp color="var(--success)" />, trend: 'Healthy' },
        { label: 'Repayments Rate', value: '98.4%', icon: <CheckCircle color="var(--primary)" />, trend: 'Above avg' }
    ];

    const filteredApplications = loanApplications.filter(loan =>
        loan.applicant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.application_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                    <p style={{ color: 'var(--text-muted)' }}>Loading loan applications...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '3rem 4rem' }}>
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
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            <main style={{ padding: '3rem 4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Banker's Terminal</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Evaluating agriculture risk using verified platform contracts and profiles.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', background: 'white', padding: '0.5rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
                        {['applications', 'portfolio', 'analytics'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: 'var(--radius-sm)',
                                    border: 'none',
                                    background: activeTab === tab ? 'var(--primary)' : 'transparent',
                                    color: activeTab === tab ? 'white' : 'var(--text-muted)',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    textTransform: 'capitalize'
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats Overview */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                    {stats.map((stat, i) => (
                        <div key={i} className="card" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div style={{ padding: '0.5rem', background: 'rgba(0,0,0,0.03)', borderRadius: '8px' }}>{stat.icon}</div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 700 }}>{stat.trend}</span>
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{stat.label}</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stat.value}</div>
                        </div>
                    ))}
                </div>

                {activeTab === 'applications' && (
                    <div style={{ display: 'grid', gridTemplateColumns: selectedApplication ? '1fr 450px' : '1fr', gap: '2rem' }}>
                        {/* List Section */}
                        <section>
                            <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
                                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '1.5rem' }}>
                                    <div style={{ position: 'relative', flex: 1 }}>
                                        <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                                        <input
                                            type="text"
                                            placeholder="Search application ID or applicant name..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
                                        />
                                    </div>
                                    <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Filter size={18} /> Filters
                                    </button>
                                </div>

                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ background: '#f8fafc', textAlignment: 'left' }}>
                                        <tr>
                                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)' }}>APPLICANT</th>
                                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)' }}>AMOUNT</th>
                                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)' }}>RISK SCORE</th>
                                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)' }}>STATUS</th>
                                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)' }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredApplications.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" style={{ padding: '3rem', textAlign: 'center' }}>
                                                    <FileText size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
                                                    <p style={{ color: 'var(--text-muted)' }}>No loan applications found</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredApplications.map(loan => {
                                                const statusColor = loan.status === 'approved' ? 'var(--success)' : 
                                                                   loan.status === 'rejected' ? '#EF4444' : '#F59E0B';
                                                const statusBg = loan.status === 'approved' ? 'rgba(16, 185, 129, 0.1)' : 
                                                                loan.status === 'rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)';
                                                
                                                return (
                                                    <tr
                                                        key={loan.id}
                                                        onClick={() => setSelectedApplication(loan)}
                                                        style={{
                                                            borderTop: '1px solid #f1f5f9',
                                                            cursor: 'pointer',
                                                            background: selectedApplication?.id === loan.id ? 'rgba(45, 90, 39, 0.03)' : 'transparent'
                                                        }}
                                                    >
                                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                                            <div style={{ fontWeight: 600 }}>{loan.applicant_name || 'Unknown'}</div>
                                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                                ID: {loan.application_number} • {loan.applicant_type || 'Farmer'}
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                                            <div style={{ fontWeight: 700 }}>₹{loan.loan_amount?.toLocaleString() || '0'}</div>
                                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                                {loan.purpose?.substring(0, 20) || 'N/A'}...
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                                            <div style={{
                                                                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                                                                color: (loan.risk_score || 80) >= 80 ? 'var(--success)' : 
                                                                       (loan.risk_score || 80) >= 60 ? '#F59E0B' : '#EF4444',
                                                                fontWeight: 800, fontSize: '1.1rem'
                                                            }}>
                                                                {loan.risk_score || 80}
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                                            <span style={{
                                                                padding: '0.25rem 0.75rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 600,
                                                                background: statusBg,
                                                                color: statusColor
                                                            }}>
                                                                {loan.status?.toUpperCase() || 'PENDING'}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                                            <ChevronRight size={18} color="var(--text-muted)" />
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* Analysis Sidebar */}
                        <AnimatePresence>
                            {selectedApplication && (
                                <motion.aside
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: 20, opacity: 0 }}
                                >
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                        <RiskAssessment score={selectedApplication.risk_score || 80} breakdown={selectedApplication.riskBreakdown || {}} />

                                        <div className="card" style={{ padding: '1.5rem' }}>
                                            <h4 style={{ marginBottom: '1rem' }}>Application Details</h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ color: 'var(--text-muted)' }}>Applied Date</span>
                                                    <span>{new Date(selectedApplication.created_at).toLocaleDateString() || 'N/A'}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ color: 'var(--text-muted)' }}>Purpose</span>
                                                    <span style={{ fontWeight: 600 }}>{selectedApplication.purpose || 'N/A'}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ color: 'var(--text-muted)' }}>Tenure</span>
                                                    <span>{selectedApplication.tenure_months || 0} months</span>
                                                </div>
                                                {selectedApplication.status === 'pending' && (
                                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                                        <button
                                                            className="btn btn-secondary"
                                                            style={{ flex: 1, color: '#EF4444' }}
                                                            onClick={() => handleReject(selectedApplication.id)}
                                                        >
                                                            <XCircle size={18} /> Reject
                                                        </button>
                                                        <button
                                                            className="btn btn-primary"
                                                            style={{ flex: 2 }}
                                                            onClick={() => handleApprove(selectedApplication.id)}
                                                        >
                                                            <CheckCircle size={18} /> Approve Loan
                                                        </button>
                                                    </div>
                                                )}
                                                {selectedApplication.status !== 'pending' && (
                                                    <div style={{ 
                                                        marginTop: '1rem', 
                                                        padding: '1rem', 
                                                        background: selectedApplication.status === 'approved' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                        borderRadius: 'var(--radius-sm)',
                                                        textAlign: 'center',
                                                        fontWeight: 700,
                                                        color: selectedApplication.status === 'approved' ? 'var(--success)' : '#EF4444'
                                                    }}>
                                                        {selectedApplication.status === 'approved' ? '✓ APPROVED' : '✗ REJECTED'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="card" style={{ padding: '1.5rem', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', marginBottom: '0.5rem', fontWeight: 700 }}>
                                                <AlertCircle size={18} /> Platform Insight
                                            </div>
                                            <p style={{ fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>
                                                {selectedApplication.applicant_name} has platform verification and contract history available for risk assessment.
                                            </p>
                                        </div>
                                    </div>
                                </motion.aside>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {activeTab !== 'applications' && (
                    <div className="card" style={{ padding: '5rem', textAlign: 'center' }}>
                        <BarChart3 size={64} color="var(--primary)" style={{ marginBottom: '1.5rem' }} />
                        <h2>Advanced Analytics Dashboard</h2>
                        <p style={{ color: 'var(--text-muted)' }}>This module is currently processing institutional data records.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default BankDashboard;
