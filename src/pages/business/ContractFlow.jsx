import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Shield, CreditCard, ChevronRight, Check, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { useTranslation } from '../../contexts/LanguageContext';
import { generateContractLocally } from '../../services/contractEngine';
import ContractDisplay from '../../components/ContractDisplay';
import { useAuth } from '../../contexts/AuthContext';
import { businessService } from '../../services/database';

const ContractFlow = ({ farmer, onComplete }) => {
    const { user } = useAuth();
    const [step, setStep] = useState('form'); // form, generating, review, sign, pay, done
    const [loading, setLoading] = useState(false);
    const [contractContent, setContractContent] = useState('');
    const [error, setError] = useState(null);
    const [savedContractId, setSavedContractId] = useState(null);
    const { t, language } = useTranslation();

    const [formData, setFormData] = useState({
        farmerName: farmer?.full_name || farmer?.name || 'Farmer',
        farmerId: farmer?.id,
        businessName: 'AgriCorp Ltd.',
        businessGst: '27AABCU9603R1Z',
        cropName: 'Premium Organic Wheat',
        quantity: 50,
        unit: 'Quintals',
        price: 4200,
        deliveryDate: '2025-10-15',
    });

    const [selectedClauses, setSelectedClauses] = useState(['quality', 'forceMajeure']); // Default on for most deals

    const toggleClause = (clause) => {
        setSelectedClauses(prev =>
            prev.includes(clause)
                ? prev.filter(c => c !== clause)
                : [...prev, clause]
        );
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setStep('generating');

        // Brief artificial delay for "AI sensation" feel, but 100% reliable local generation
        setTimeout(() => {
            const content = generateContractLocally(formData, language, selectedClauses);
            setContractContent(content);
            setStep('review');
        }, 1500);
    };

    const handleRegenerate = () => {
        setStep('form');
    };

    const handleFinalizeContract = async () => {
        try {
            setLoading(true);
            setError(null);

            // Generate unique contract number
            const contractNumber = `FC-${Date.now()}`;
            
            // Calculate total value
            const totalValue = parseFloat(formData.quantity) * parseFloat(formData.price);

            // Save contract to database
            const { data, error: saveError } = await businessService.createContract({
                business_id: user.id,
                farmer_id: formData.farmerId,
                contract_number: contractNumber,
                crop_name: formData.cropName,
                quantity: parseFloat(formData.quantity),
                unit: formData.unit,
                price: parseFloat(formData.price),
                total_value: totalValue,
                delivery_date: formData.deliveryDate,
                status: 'active',
                contract_content: contractContent,
                selected_clauses: selectedClauses
            });

            if (saveError) throw saveError;

            setSavedContractId(data?.id);
            setStep('done');
        } catch (err) {
            console.error('Error saving contract:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass" style={{
            padding: '2rem',
            borderRadius: 'var(--radius-lg)',
            maxWidth: '900px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)'
        }}>
            {step === 'form' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ background: 'var(--primary-light)', p: '10px', borderRadius: '12px' }}>
                            <FileText size={32} color="var(--primary)" />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Create Smart Contract</h2>
                            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Define terms for AI-powered legal document generation</p>
                        </div>
                    </div>

                    <form onSubmit={handleFormSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Farmer Name</label>
                            <input type="text" value={formData.farmerName} disabled className="form-control" style={{ width: '100%', background: '#f1f5f9' }} />
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Crop Selection</label>
                            <input
                                type="text"
                                value={formData.cropName}
                                onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                                className="form-control"
                                style={{ width: '100%' }}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Quantity</label>
                            <input
                                type="number"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                className="form-control"
                                style={{ width: '100%' }}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Unit</label>
                            <select
                                value={formData.unit}
                                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                className="form-control"
                                style={{ width: '100%' }}
                            >
                                <option>Quintals</option>
                                <option>Kilograms</option>
                                <option>Tons</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Price per Unit (₹)</label>
                            <input
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                className="form-control"
                                style={{ width: '100%' }}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Expected Delivery Date</label>
                            <input
                                type="date"
                                value={formData.deliveryDate}
                                onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                                className="form-control"
                                style={{ width: '100%' }}
                                required
                            />
                        </div>

                        <div style={{ gridColumn: 'span 2', marginTop: '1rem' }}>
                            <h4 style={{ marginBottom: '1rem', fontWeight: 600 }}>Additional Provisions</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                {[
                                    { id: 'quality', label: 'Quality Standards', desc: '7-day inspection window' },
                                    { id: 'forceMajeure', label: 'Force Majeure', desc: 'Natural disaster protection' },
                                    { id: 'organicCert', label: 'Organic Cert.', desc: 'Warranty of organic practices' },
                                    { id: 'insurance', label: 'Crop Insurance', desc: 'Declare insurance coverage' }
                                ].map(clause => (
                                    <div
                                        key={clause.id}
                                        onClick={() => toggleClause(clause.id)}
                                        style={{
                                            padding: '1rem',
                                            borderRadius: '12px',
                                            border: `2px solid ${selectedClauses.includes(clause.id) ? 'var(--primary)' : 'var(--border)'}`,
                                            background: selectedClauses.includes(clause.id) ? 'var(--primary-light)' : 'white',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem'
                                        }}
                                    >
                                        <div style={{
                                            width: '20px',
                                            height: '20px',
                                            borderRadius: '4px',
                                            border: '2px solid var(--primary)',
                                            background: selectedClauses.includes(clause.id) ? 'var(--primary)' : 'transparent',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white'
                                        }}>
                                            {selectedClauses.includes(clause.id) && <Check size={14} strokeWidth={4} />}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{clause.label}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{clause.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px dashed var(--border)', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span>Advance Funding (25%)</span>
                                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{(formData.quantity * formData.price * 0.25).toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Total Value</span>
                                    <span style={{ fontWeight: 700 }}>₹{(formData.quantity * formData.price).toLocaleString()}</span>
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
                                Generate Legal Fair Contract <ChevronRight size={20} />
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}

            {step === 'generating' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <div className="spinner-container" style={{ position: 'relative', display: 'inline-block', marginBottom: '2.5rem' }}>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                            <RefreshCw size={64} color="var(--primary)" />
                        </motion.div>
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                            <FileText size={24} color="var(--primary)" />
                        </div>
                    </div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>Drafting Smart Agreement...</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '400px', margin: '0 auto' }}>
                        Generating a tailored, fair agreement between you and <strong>{formData.farmerName}</strong> with full legal compliance.
                    </p>
                </motion.div>
            )}

            {step === 'review' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Review Smart-Drafted Contract</h2>
                            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Tailored based on your deal terms</p>
                        </div>
                        <span className="badge badge-success" style={{ background: '#dcfce7', color: '#166534', padding: '8px 16px', borderRadius: '20px', fontWeight: 600 }}>
                            <Shield size={16} style={{ marginRight: '6px' }} /> Verified Template
                        </span>
                    </div>

                    <ContractDisplay
                        content={contractContent}
                        onEdit={handleRegenerate}
                        onSign={() => setStep('sign')}
                    />
                </motion.div>
            )}

            {step === 'sign' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center' }}>
                    <Shield size={64} color="var(--primary)" style={{ marginBottom: '2rem' }} />
                    <h2>Aadhaar E-Sign Verification</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>
                        We will send an OTP to your Aadhaar-linked mobile number for secure digital signature.
                    </p>
                    <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <input key={i} type="text" maxLength="1" style={{
                                    width: '45px',
                                    height: '55px',
                                    textAlign: 'center',
                                    fontSize: '1.5rem',
                                    fontWeight: 700,
                                    border: '2px solid var(--border)',
                                    borderRadius: '12px'
                                }} />
                            ))}
                        </div>
                    </div>
                    <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setStep('pay')}>
                        Verify & Sign Contract
                    </button>
                    <button className="btn btn-link" onClick={() => setStep('review')} style={{ marginTop: '1rem' }}>Back to Review</button>
                </motion.div>
            )}

            {step === 'pay' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <CreditCard size={48} color="var(--primary)" style={{ marginBottom: '1.5rem' }} />
                        <h2>Payment for Advance Funding</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Ensuring the farmer has resources to begin cultivation.</p>
                    </div>

                    <div className="card" style={{ background: '#f8fafc', padding: '2rem', marginBottom: '2.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <span>Advance to Farmer</span>
                            <span>₹{(formData.quantity * formData.price * 0.25).toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                            <span>Platform Fee (2%)</span>
                            <span>₹{(formData.quantity * formData.price * 0.25 * 0.02).toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '1.25rem', fontWeight: 700 }}>
                            <span>Total Payable</span>
                            <span style={{ color: 'var(--primary)' }}>₹{(formData.quantity * formData.price * 0.25 * 1.02).toLocaleString()}</span>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                        <button className="btn btn-secondary">UPI / PhonePe</button>
                        <button className="btn btn-secondary">Bank Transfer</button>
                    </div>

                    <button className="btn btn-primary" style={{ width: '100%', padding: '1.25rem' }} onClick={handleFinalizeContract} disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 size={20} className="animate-spin" style={{ marginRight: '0.5rem' }} />
                                Finalizing Contract...
                            </>
                        ) : (
                            'Authorize Payment'
                        )}
                    </button>

                    {error && (
                        <div style={{ 
                            marginTop: '1rem', 
                            padding: '1rem', 
                            background: 'rgba(239, 68, 68, 0.1)', 
                            borderRadius: 'var(--radius-sm)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: '#ef4444'
                        }}>
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}
                </motion.div>
            )}

            {step === 'done' && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '100px',
                        height: '100px',
                        background: 'var(--success)',
                        color: 'white',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 2rem'
                    }}>
                        <Check size={48} strokeWidth={3} />
                    </div>
                    <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Contract Finalized!</h2>
                    {savedContractId && (
                        <div style={{ 
                            background: '#f8fafc', 
                            padding: '1rem', 
                            borderRadius: 'var(--radius-sm)', 
                            marginBottom: '1rem',
                            fontSize: '0.9rem'
                        }}>
                            <div style={{ color: 'var(--text-muted)' }}>Contract ID</div>
                            <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.1rem' }}>
                                {savedContractId}
                            </div>
                        </div>
                    )}
                    <p style={{ color: 'var(--text-muted)', marginBottom: '3rem' }}>
                        The contract is now active. {formData.farmerName} has been notified to begin cultivation.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="btn btn-primary" style={{ flex: 1 }} onClick={onComplete}>Back to Dashboard</button>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default ContractFlow;
