import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Landmark, CreditCard, PieChart, FileCheck, ChevronRight, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { partnerBanks } from '../data/loans';
import FileUpload from './FileUpload';
import { BankLMSService } from '../services/bankLMS';
import { useAuth } from '../contexts/AuthContext';
import { farmerService, businessService } from '../services/database';

const LoanApplicationFlow = ({ onClose, onComplete }) => {
    const { user } = useAuth();
    const [step, setStep] = useState(1); // 1: Bank selection, 2: Details, 3: Documents, 4: Review
    const [selectedBank, setSelectedBank] = useState(null);
    const [amount, setAmount] = useState('');
    const [tenure, setTenure] = useState('12');
    const [purpose, setPurpose] = useState('');
    const [bankStatement, setBankStatement] = useState(null);
    const [landRecord, setLandRecord] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [decision, setDecision] = useState(null);
    const [error, setError] = useState(null);

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);
    const goToStep = (s) => {
        if (s < step) setStep(s);
    };

    const handleSubmit = async () => {
        try {
            setIsProcessing(true);
            setError(null);

            // Generate unique application number
            const applicationNumber = `APL-${Date.now()}`;

            // Mock data for risk scoring (in real app, fetch from user's contracts)
            const applicationData = {
                landArea: 5,
                cropValue: 1,
                contractValue: 200000,
                duration: 6,
                kycVerified: true
            };

            const riskScore = BankLMSService.calculateRiskScore(applicationData);
            
            // Save loan application to database
            const loanData = {
                farmer_id: user.id, // Could be business_id if called from business dashboard
                application_number: applicationNumber,
                loan_amount: parseFloat(amount),
                tenure_months: parseInt(tenure),
                purpose: purpose || 'Agricultural financing',
                bank_name: selectedBank?.name,
                status: 'pending',
                risk_score: riskScore,
                applicant_type: 'farmer' // or 'business' depending on context
            };

            // Try to save as farmer first, if fails try as business
            let saveResult;
            try {
                saveResult = await farmerService.createLoanApplication(loanData);
            } catch (err) {
                // If user is not a farmer, try saving as business
                saveResult = await businessService.createLoanApplication(loanData);
            }

            if (saveResult.error) throw saveResult.error;

            // Create mock bank payload for LMS simulation
            const payload = BankLMSService.createLoanPayload(
                { id: user.id, name: user.email, kycStatus: 'verified' },
                { id: 'C-505', totalValue: 200000, cropName: 'Wheat' },
                amount,
                tenure
            );

            const result = await BankLMSService.submitLoanApplication(payload, riskScore);
            setDecision(result);
        } catch (err) {
            console.error('Error submitting loan application:', err);
            setError(err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '2rem'
        }}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="card"
                style={{ maxWidth: '700px', width: '100%', padding: '0', overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
            >
                {/* Header */}
                <div style={{ padding: '2rem 3rem', background: 'var(--primary)', color: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Landmark size={28} /> Apply for Agriculture Loan
                        </h2>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                    </div>
                </div>

                {/* Stepper */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
                    {[1, 2, 3, 4].map(s => (
                        <div
                            key={s}
                            onClick={() => goToStep(s)}
                            style={{
                                flex: 1,
                                padding: '1rem',
                                textAlign: 'center',
                                borderBottom: step === s ? '3px solid var(--primary)' : 'none',
                                color: step === s ? 'var(--primary)' : s < step ? 'var(--success)' : 'var(--text-muted)',
                                fontWeight: step === s || s < step ? 700 : 400,
                                fontSize: '0.8rem',
                                cursor: s < step ? 'pointer' : 'default',
                                transition: 'all 0.2s'
                            }}
                        >
                            {s < step ? '✓' : `STEP ${s}`}
                        </div>
                    ))}
                </div>

                <div style={{ padding: '3rem', overflowY: 'auto', flex: 1 }}>
                    {step === 1 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            <h3 style={{ marginBottom: '1.5rem' }}>Select Preferred Bank</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {partnerBanks.map(bank => (
                                    <div
                                        key={bank.id}
                                        onClick={() => setSelectedBank(bank)}
                                        style={{
                                            padding: '1.5rem',
                                            border: `2px solid ${selectedBank?.id === bank.id ? 'var(--primary)' : 'var(--border)'}`,
                                            borderRadius: 'var(--radius-md)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1.5rem',
                                            transition: 'all 0.2s',
                                            background: selectedBank?.id === bank.id ? 'rgba(45, 90, 39, 0.03)' : 'white'
                                        }}
                                    >
                                        <div style={{ fontSize: '2.5rem' }}>{bank.icon}</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{bank.name}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Interest from {bank.minInterest} • Max {bank.maxTenure}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#B8860B' }}>★ {bank.rating}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button
                                className="btn btn-primary"
                                style={{ width: '100%', marginTop: '2rem' }}
                                disabled={!selectedBank}
                                onClick={handleNext}
                            >
                                Continue <ChevronRight size={18} />
                            </button>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            <h3 style={{ marginBottom: '1.5rem' }}>Loan Details</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Requested Amount (₹)</label>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="e.g. 150000"
                                        style={{ width: '100%', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Repayment Tenure (Months)</label>
                                    <select
                                        value={tenure}
                                        onChange={(e) => setTenure(e.target.value)}
                                        style={{ width: '100%', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
                                    >
                                        <option value="6">6 Months</option>
                                        <option value="12">12 Months (Recommended)</option>
                                        <option value="24">24 Months</option>
                                        <option value="36">36 Months</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Purpose of Loan</label>
                                    <textarea
                                        rows="3"
                                        value={purpose}
                                        onChange={(e) => setPurpose(e.target.value)}
                                        placeholder="Briefly describe what you will use the funds for..."
                                        style={{ width: '100%', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontFamily: 'inherit' }}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={handleBack}><ArrowLeft size={18} /> Back</button>
                                <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleNext} disabled={!amount}>Next Step <ChevronRight size={18} /></button>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            <h3 style={{ marginBottom: '1rem' }}>Support Documents</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>Platform data (KYC & Contracts) is automatically shared with the bank.</p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <FileUpload
                                    label="Bank Statement (3 Months)"
                                    value={bankStatement}
                                    onFileSelect={setBankStatement}
                                    accept=".pdf,.jpg,.png"
                                />
                                <FileUpload
                                    label="Land Record (Optional)"
                                    value={landRecord}
                                    onFileSelect={setLandRecord}
                                    accept=".pdf,.jpg,.png"
                                />
                                <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: 'var(--radius-sm)' }}>
                                    <FileCheck color="var(--success)" size={24} />
                                    <span style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: 600 }}>Platform KYC & Contracts Linked</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={handleBack}><ArrowLeft size={18} /> Back</button>
                                <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleNext}>Review Application <ChevronRight size={18} /></button>
                            </div>
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            {decision ? (
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{
                                        width: '80px', height: '80px',
                                        background: decision.decision === 'APPROVED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                        color: decision.decision === 'APPROVED' ? 'var(--success)' : '#EF4444',
                                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        margin: '0 auto 1.5rem'
                                    }}>
                                        {decision.decision === 'APPROVED' ? <CheckCircle2 size={40} /> : <AlertCircle size={40} />}
                                    </div>
                                    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                                        Application {decision.decision}
                                    </h3>
                                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                                        Ref: {decision.bankReference}
                                    </p>

                                    {decision.decision === 'APPROVED' ? (
                                        <div className="card" style={{ padding: '1.5rem', background: '#fcfdfa', textAlign: 'left', marginBottom: '2rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                                <span>Interest Rate</span>
                                                <span style={{ fontWeight: 700 }}>{decision.financialTerms.interestRate} p.a.</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                                <span>Processing Fee</span>
                                                <span>{decision.financialTerms.processingFee}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span>Disbursal</span>
                                                <span>{decision.financialTerms.disbursalTime}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <p style={{ color: '#EF4444', marginBottom: '2rem' }}>
                                            {decision.financialTerms.reason}
                                        </p>
                                    )}

                                    <button
                                        className="btn btn-primary"
                                        style={{ width: '100%' }}
                                        onClick={onClose}
                                    >
                                        Back to Dashboard
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <h3 style={{ marginBottom: '1.5rem' }}>Application Review</h3>
                                    <div className="card" style={{ padding: '1.5rem', background: '#f8fafc', border: '1px solid var(--border)', marginBottom: '2rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>Beneficiary Bank</span>
                                            <span style={{ fontWeight: 600 }}>{selectedBank?.name}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>Loan Amount</span>
                                            <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.1rem' }}>₹{parseInt(amount).toLocaleString()}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>Tenure</span>
                                            <span style={{ fontWeight: 600 }}>{tenure} Months</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>Estimated Interest</span>
                                            <span style={{ fontWeight: 600 }}>~{selectedBank?.minInterest} p.a.</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>Documents Uploaded</span>
                                            <span style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.8rem' }}>Verified ✓</span>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
                                        By submitting, you authorize {selectedBank?.name} to access your platform profile, land records, and contract history for credit evaluation.
                                    </p>
                                    
                                    {error && (
                                        <div style={{ 
                                            marginBottom: '1rem', 
                                            padding: '1rem', 
                                            background: 'rgba(239, 68, 68, 0.1)', 
                                            borderRadius: 'var(--radius-sm)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            color: '#ef4444'
                                        }}>
                                            <AlertCircle size={18} />
                                            <span style={{ fontSize: '0.9rem' }}>{error}</span>
                                        </div>
                                    )}
                                    
                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={handleBack} disabled={isProcessing}><ArrowLeft size={18} /> Back</button>
                                        <button
                                            className="btn btn-primary"
                                            style={{ flex: 2, padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                            onClick={handleSubmit}
                                            disabled={isProcessing}
                                        >
                                            {isProcessing ? <><Loader2 className="animate-spin" size={20} /> Processing...</> : 'Submit Application'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default LoanApplicationFlow;
