import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../contexts/LanguageContext';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Building2, FileText, Banknote, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import FileUpload from '../../components/FileUpload';
import { useAuth } from '../../contexts/AuthContext';
import { businessService } from '../../services/database';

const BusinessOnboarding = () => {
    const { t } = useTranslation();
    const { user, updateProfile } = useAuth();
    const navigate = useNavigate();
    
    const [step, setStep] = useState(1);
    const [regFile, setRegFile] = useState(null);
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
        companyName: '',
        gstNumber: '',
        businessType: '',
        registrationNumber: '',
        bankName: '',
        accountNumber: '',
        ifscCode: ''
    });
    
    // Pre-fill form with Google OAuth data on mount
    useEffect(() => {
        if (user) {
            const { fullName } = getGoogleUserInfo();
            if (fullName) {
                setFormData(prev => ({
                    ...prev,
                    companyName: fullName
                }));
            }
        }
    }, [user]);

    const handleNext = async () => {
        if (step < 3) {
            setStep(step + 1);
        } else {
            await handleSubmit();
        }
    };

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

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError(null);

        try {
            // Validate required fields
            if (!formData.companyName || !formData.gstNumber) {
                throw new Error('Please fill in company name and GST number');
            }

            if (!formData.bankName || !formData.accountNumber || !formData.ifscCode) {
                throw new Error('Please fill in all financial details');
            }

            // Get email from user object
            const { email: userEmail, fullName: googleName } = getUserInfo();
            
            if (!userEmail) {
                console.error('Could not find email in user object:', user);
                throw new Error('Email not found. Please try logging in again.');
            }

            console.log('Using email:', userEmail);

            // Save business profile to Supabase
            const { data, error } = await businessService.createBusinessProfile(
                user.id,
                {
                    email: userEmail,
                    business_name: formData.companyName,
                    business_gst: formData.gstNumber,
                    business_type: formData.businessType || 'Agricultural Trader',
                    registration_number: formData.registrationNumber,
                    bank_account: formData.accountNumber,
                    ifsc_code: formData.ifscCode,
                }
            );

            if (error) {
                throw new Error(error);
            }

            // Update the profile in AuthContext
            await updateProfile({
                role: 'business',
                onboarding_completed: true,
                business_name: formData.companyName,
                business_gst: formData.gstNumber,
            });

            // Success - navigate to dashboard
            navigate('/business/dashboard');
        } catch (err) {
            console.error('Error saving business profile:', err);
            setError(err.message || 'Failed to save profile. Please try again.');
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '2rem' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="card"
                    style={{ padding: '3rem' }}
                >
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                padding: '1rem',
                                background: '#fee',
                                border: '1px solid #fcc',
                                borderRadius: 'var(--radius-sm)',
                                marginBottom: '1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                color: '#c33'
                            }}
                        >
                            <AlertCircle size={20} />
                            <span>{error}</span>
                        </motion.div>
                    )}

                    {step === 1 && (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                <div style={{ padding: '1rem', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '12px', color: '#D4AF37' }}>
                                    <Building2 />
                                </div>
                                <h2>Register Your Business</h2>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <input 
                                    type="text" 
                                    placeholder="Company Name *" 
                                    className="card" 
                                    style={{ padding: '1rem', width: '100%' }}
                                    value={formData.companyName}
                                    onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                                />
                                <input 
                                    type="text" 
                                    placeholder="GST Number *" 
                                    className="card" 
                                    style={{ padding: '1rem', width: '100%' }}
                                    value={formData.gstNumber}
                                    onChange={(e) => setFormData({...formData, gstNumber: e.target.value})}
                                />
                                <input 
                                    type="text" 
                                    placeholder="Business Type (Optional)" 
                                    className="card" 
                                    style={{ padding: '1rem', width: '100%' }}
                                    value={formData.businessType}
                                    onChange={(e) => setFormData({...formData, businessType: e.target.value})}
                                />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                <div style={{ padding: '1rem', background: 'rgba(45, 90, 39, 0.1)', borderRadius: '12px', color: 'var(--primary)' }}>
                                    <FileText />
                                </div>
                                <h2>Legal Documentation</h2>
                            </div>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Upload your business registration documents for verification.</p>
                            <FileUpload
                                label="Registration Certificate (GST/PAN)"
                                value={regFile}
                                onFileSelect={setRegFile}
                                accept=".pdf,.doc,.docx,.jpg,.png"
                            />
                        </div>
                    )}

                    {step === 3 && (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                <div style={{ padding: '1rem', background: 'rgba(45, 90, 39, 0.1)', borderRadius: '12px', color: 'var(--primary)' }}>
                                    <Banknote />
                                </div>
                                <h2>Financial Details</h2>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <input 
                                    type="text" 
                                    placeholder="Bank Name *" 
                                    className="card" 
                                    style={{ padding: '1rem', width: '100%' }}
                                    value={formData.bankName}
                                    onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                                />
                                <input 
                                    type="text" 
                                    placeholder="Account Number *" 
                                    className="card" 
                                    style={{ padding: '1rem', width: '100%' }}
                                    value={formData.accountNumber}
                                    onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                                />
                                <input 
                                    type="text" 
                                    placeholder="IFSC Code *" 
                                    className="card" 
                                    style={{ padding: '1rem', width: '100%' }}
                                    value={formData.ifscCode}
                                    onChange={(e) => setFormData({...formData, ifscCode: e.target.value})}
                                />
                            </div>
                        </div>
                    )}

                    <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'space-between' }}>
                        <button onClick={() => setStep(s => s - 1)} disabled={step === 1 || isSubmitting} className="btn btn-secondary">
                            <ArrowLeft size={18} /> Back
                        </button>
                        <button onClick={handleNext} className="btn btn-primary" disabled={isSubmitting}>
                            {step === 3 
                                ? (isSubmitting ? 'Saving...' : 'Complete Setup')
                                : 'Next Step'
                            } <ArrowRight size={18} />
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default BusinessOnboarding;
