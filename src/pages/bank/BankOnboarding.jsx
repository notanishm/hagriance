import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Landmark, ShieldCheck, FileText, Globe, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTranslation } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { bankService } from '../../services/database';

const steps = [
    { id: 'bank_info', title: 'Institution Info', icon: <Landmark /> },
    { id: 'license', title: 'License Verification', icon: <ShieldCheck /> },
    { id: 'products', title: 'Loan Products', icon: <FileText /> },
    { id: 'ops', title: 'Operational Setup', icon: <Globe /> }
];

const BankOnboarding = () => {
    const { t } = useTranslation();
    const { user, updateProfile } = useAuth();
    const navigate = useNavigate();
    
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    
    // Get Google OAuth user info
    const getGoogleUserInfo = () => {
        const fullName = user?.user_metadata?.full_name || 
                        user?.user_metadata?.name ||
                        user?.identities?.[0]?.identity_data?.full_name ||
                        user?.identities?.[0]?.identity_data?.name ||
                        '';
        return { fullName };
    };
    
    // Form data state
    const [formData, setFormData] = useState({
        bankName: '',
        institutionType: 'Public Sector Bank',
        headquartersCity: '',
        rbiLicense: '',
        gstin: '',
        branchName: '',
        bankCode: ''
    });
    
    // Pre-fill form with Google OAuth data on mount
    useEffect(() => {
        if (user) {
            const { fullName } = getGoogleUserInfo();
            if (fullName) {
                setFormData(prev => ({
                    ...prev,
                    bankName: fullName
                }));
            }
        }
    }, [user]);

    const handleNext = async () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            await handleSubmit();
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError(null);

    // Extract user info from Google OAuth or regular auth
    const getUserInfo = () => {
        console.log('User object:', user);
        console.log('User metadata:', user?.user_metadata);
        
        const email = user?.email || 
                     user?.user_metadata?.email || 
                     user?.user_metadata?.user_name ||
                     user?.identities?.[0]?.identity_data?.email;
        
        const fullName = user?.user_metadata?.full_name || 
                        user?.user_metadata?.name ||
                        user?.user_metadata?.user_name ||
                        user?.identities?.[0]?.identity_data?.full_name ||
                        user?.identities?.[0]?.identity_data?.name;
        
        return { email, fullName };
    };

        try {
            // Validate required fields
            if (!formData.bankName || !formData.rbiLicense) {
                throw new Error('Please fill in bank name and RBI license number');
            }

            // Get email from user object
            const { email: userEmail, fullName: googleName } = getUserInfo();
            
            if (!userEmail) {
                console.error('Could not find email in user object:', user);
                throw new Error('Email not found. Please try logging in again.');
            }

            console.log('Using email:', userEmail);

            // Save bank profile to Supabase
            const { data, error } = await bankService.createBankProfile(
                user.id,
                {
                    email: userEmail,
                    bank_name: formData.bankName,
                    branch_name: formData.headquartersCity || 'Main Branch',
                    bank_code: formData.rbiLicense,
                    license_number: formData.rbiLicense,
                }
            );

            if (error) {
                throw new Error(error);
            }

            // Update the profile in AuthContext
            await updateProfile({
                role: 'bank',
                onboarding_completed: true,
                bank_name: formData.bankName,
            });

            // Success - navigate to dashboard
            navigate('/bank/dashboard');
        } catch (err) {
            console.error('Error saving bank profile:', err);
            setError(err.message || 'Failed to save profile. Please try again.');
            setIsSubmitting(false);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        } else {
            navigate('/roles');
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '2rem' }}>
            <div style={{ maxWidth: '800px', margin: '4rem auto' }}>

                {/* Progress Stepper */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '4rem',
                    position: 'relative'
                }}>
                    <div style={{
                        position: 'absolute', top: '22px', left: '40px', right: '40px',
                        height: '2px', background: '#e2e8f0', zIndex: 0
                    }} />
                    <div style={{
                        position: 'absolute', top: '22px', left: '40px',
                        width: `${(currentStep / (steps.length - 1)) * 90}%`,
                        height: '2px', background: 'var(--primary)', zIndex: 0,
                        transition: 'all 0.4s'
                    }} />

                    {steps.map((step, index) => (
                        <div key={step.id} style={{ zIndex: 1, textAlign: 'center' }}>
                            <div style={{
                                width: '45px', height: '45px', borderRadius: '50%',
                                background: index <= currentStep ? 'var(--primary)' : 'white',
                                color: index <= currentStep ? 'white' : '#94a3b8',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: index <= currentStep ? 'none' : '2px solid #e2e8f0',
                                margin: '0 auto 0.75rem', transition: 'all 0.3s'
                            }}>
                                {index < currentStep ? <CheckCircle2 size={24} /> : step.icon}
                            </div>
                            <span style={{
                                fontSize: '0.8rem', fontWeight: 600,
                                color: index <= currentStep ? 'var(--text-main)' : '#94a3b8'
                            }}>
                                {step.title}
                            </span>
                        </div>
                    ))}
                </div>

                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card"
                    style={{ padding: '4rem' }}
                >
                    {currentStep === 0 && (
                        <div>
                            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Institution Registration</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>Provide the official details of your banking or financial institution.</p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Legal Bank Name</label>
                                    <input type="text" placeholder="e.g. State Bank of India" style={{ width: '100%', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }} />
                                </div>
                                <div className="input-group">
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Institution Type</label>
                                    <select style={{ width: '100%', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                                        <option>Public Sector Bank</option>
                                        <option>Private Bank</option>
                                        <option>Co-operative Bank</option>
                                        <option>NBFC</option>
                                        <option>MFI</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Headquarters City</label>
                                    <input type="text" placeholder="Mumbai" style={{ width: '100%', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }} />
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 1 && (
                        <div>
                            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Regulatory Compliance</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>We verify your RBI license and GST registration to ensure platform security.</p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                <div className="input-group">
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>RBI License Number</label>
                                    <input type="text" style={{ width: '100%', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }} />
                                </div>
                                <div className="input-group">
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>GSTIN</label>
                                    <input type="text" style={{ width: '100%', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }} />
                                </div>
                                <div style={{ padding: '2rem', border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>Drag & Drop official RBI Authorization PDF</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div>
                            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Loan Product Catalog</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>Define the agricultural loan products you want to offer on FarmConnect.</p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {['Kisan Credit Card (KCC) Loan', 'Crop Production Loan', 'Farm Mechanization Loan', 'Irrigation Infrastructure Loan'].map((prod, i) => (
                                    <div key={i} style={{
                                        padding: '1.25rem', border: '1px solid var(--border)',
                                        borderRadius: 'var(--radius-sm)', display: 'flex',
                                        justifyContent: 'space-between', alignItems: 'center'
                                    }}>
                                        <span style={{ fontWeight: 600 }}>{prod}</span>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <input type="text" placeholder="Interest Rate %" style={{ width: '120px', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '4px' }} />
                                            <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>Edit Terms</button>
                                        </div>
                                    </div>
                                ))}
                                <button className="btn btn-secondary" style={{ borderStyle: 'dashed' }}>+ Add Custom Product</button>
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '100px', height: '100px', background: 'rgba(16, 185, 129, 0.1)',
                                color: 'var(--success)', borderRadius: '50%', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem'
                            }}>
                                <CheckCircle2 size={50} />
                            </div>
                            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Ready to Launch</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '3rem' }}>
                                Your institution is now registered. You can start evaluating loan applications from farmers and businesses immediately.
                            </p>
                            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: 'var(--radius-sm)', textAlign: 'left', marginBottom: '1rem' }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>Verification Status</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#F59E0B' }}>
                                    <ShieldCheck size={18} /> <span>Application pending final admin approval (usually 2-4 hours)</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div style={{
                        marginTop: '4rem', display: 'flex', justifyContent: 'space-between',
                        paddingTop: '2rem', borderTop: '1px solid var(--border)'
                    }}>
                        <button onClick={handleBack} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <ArrowLeft size={18} /> {t('common.back')}
                        </button>
                        <button onClick={handleNext} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {currentStep === steps.length - 1 ? 'Go to Dashboard' : t('common.next')} <ArrowRight size={18} />
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default BankOnboarding;
