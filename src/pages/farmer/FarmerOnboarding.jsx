import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, MapPin, ClipboardList, ShieldCheck, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const steps = [
    { id: 'kyc', title: 'KYC Verification', icon: <ShieldCheck /> },
    { id: 'personal', title: 'Personal Details', icon: <CheckCircle2 /> },
    { id: 'land', title: 'Land Details', icon: <MapPin /> },
    { id: 'history', title: 'Crop History', icon: <ClipboardList /> }
];

const FarmerOnboarding = () => {
    const { t } = useTranslation();
    const { user, setLocalProfile } = useAuth();
    const navigate = useNavigate();

    const [currentStep, setCurrentStep] = useState(0);
    const [isLocating, setIsLocating] = useState(false);
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
        documentType: 'Aadhaar Card',
        documentNumber: '',
        fullName: '',
        phoneNumber: '',
        landSize: '',
        location: '',
        selectedCrops: []
    });

    // Pre-fill form with Google OAuth data on mount
    useEffect(() => {
        if (user) {
            const { fullName } = getGoogleUserInfo();
            if (fullName) {
                setFormData(prev => ({
                    ...prev,
                    fullName: fullName
                }));
            }
        }
    }, [user]);

    const handleNext = async () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            // Final step - save locally & navigate
            await handleSubmit();
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError(null);

        try {
            // Validate required fields
            if (!formData.fullName || !formData.phoneNumber) {
                throw new Error('Please fill in all required fields');
            }

            if (!formData.documentNumber) {
                throw new Error('Please provide your document number');
            }

            if (!formData.landSize || formData.landSize <= 0) {
                throw new Error('Please provide valid land size');
            }

            if (formData.selectedCrops.length === 0) {
                throw new Error('Please select at least one crop');
            }

            // Build profile and save to localStorage (bypassing Supabase for demo)
            const userEmail = user?.email || user?.user_metadata?.email || 'demo@agriance.com';
            const profile = {
                id: user?.id || 'demo-farmer',
                email: userEmail,
                role: 'farmer',
                full_name: formData.fullName,
                phone_number: formData.phoneNumber,
                land_size: parseFloat(formData.landSize),
                location: formData.location,
                crops_history: formData.selectedCrops,
                document_type: formData.documentType,
                document_number: formData.documentNumber,
                onboarding_completed: true,
                updated_at: new Date().toISOString(),
            };

            // Save to localStorage via AuthContext
            setLocalProfile(profile);

            // Also cache the raw form data for potential later use
            try { localStorage.setItem('agriance_farmer_data', JSON.stringify(formData)); } catch (e) { /* ignore */ }

            console.log('Farmer profile saved to localStorage:', profile);

            // Navigate to dashboard
            setTimeout(() => {
                navigate('/farmer/dashboard');
            }, 400);
        } catch (err) {
            console.error('Farmer onboarding error:', err);
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

    const detectLocation = () => {
        setIsLocating(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const locationStr = `${latitude.toFixed(4)}, ${longitude.toFixed(4)} (GPS Verified)`;
                    setFormData(prev => ({ ...prev, location: locationStr }));
                    setIsLocating(false);
                },
                (error) => {
                    console.error("Error detecting location:", error);
                    setError('Unable to detect location. Please enter manually.');
                    setIsLocating(false);
                }
            );
        } else {
            setError('Geolocation is not supported by your browser');
            setIsLocating(false);
        }
    };

    const toggleCrop = (crop) => {
        setFormData(prev => ({
            ...prev,
            selectedCrops: prev.selectedCrops.includes(crop)
                ? prev.selectedCrops.filter(c => c !== crop)
                : [...prev.selectedCrops, crop]
        }));
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '2rem' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>

                {/* Progress Stepper */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '3rem',
                    position: 'relative',
                    padding: '0 1rem'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: '20px',
                        left: '40px',
                        right: '40px',
                        height: '2px',
                        background: '#e2e8f0',
                        zIndex: 0
                    }} />
                    <div style={{
                        position: 'absolute',
                        top: '20px',
                        left: '40px',
                        width: `${(currentStep / (steps.length - 1)) * 90}%`,
                        height: '2px',
                        background: 'var(--primary)',
                        zIndex: 0,
                        transition: 'width 0.4s ease'
                    }} />

                    {steps.map((step, index) => (
                        <div key={step.id} style={{ zIndex: 1, textAlign: 'center' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: index <= currentStep ? 'var(--primary)' : 'white',
                                color: index <= currentStep ? 'white' : '#64748b',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: index <= currentStep ? 'none' : '2px solid #e2e8f0',
                                margin: '0 auto 0.5rem',
                                transition: 'all 0.3s'
                            }}>
                                {index < currentStep ? <CheckCircle2 size={20} /> : step.icon}
                            </div>
                            <span style={{
                                fontSize: '0.75rem',
                                fontWeight: index <= currentStep ? '600' : '400',
                                color: index <= currentStep ? 'var(--text-main)' : '#94a3b8'
                            }}>
                                {step.title}
                            </span>
                        </div>
                    ))}
                </div>

                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
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

                    {currentStep === 0 && (
                        <div>
                            <h2 style={{ marginBottom: '1.5rem' }}>Verify Your Identity</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                                Please provide your Aadhaar or PAN details to get verified.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div className="input-group">
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Document Type</label>
                                    <select
                                        className="btn btn-secondary"
                                        style={{ width: '100%', textAlign: 'left', padding: '1rem' }}
                                        value={formData.documentType}
                                        onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                                    >
                                        <option>Aadhaar Card</option>
                                        <option>PAN Card</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Document Number *</label>
                                    <input
                                        type="text"
                                        placeholder={formData.documentType === 'Aadhaar Card' ? 'XXXX-XXXX-XXXX' : 'XXXXXXXXXX'}
                                        value={formData.documentNumber}
                                        onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '1rem',
                                            borderRadius: 'var(--radius-sm)',
                                            border: '1px solid var(--border)'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 1 && (
                        <div>
                            <h2 style={{ marginBottom: '1.5rem' }}>Personal Information</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div className="input-group">
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Full Name *</label>
                                    <input
                                        type="text"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        placeholder="Enter your full name"
                                        style={{ width: '100%', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
                                    />
                                </div>
                                <div className="input-group">
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Phone Number *</label>
                                    <input
                                        type="tel"
                                        value={formData.phoneNumber}
                                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                        placeholder="Enter phone number"
                                        style={{ width: '100%', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div>
                            <h2 style={{ marginBottom: '1.5rem' }}>Land Details</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div className="input-group">
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Land Size (in Acres) *</label>
                                    <input
                                        type="number"
                                        placeholder="Enter acres"
                                        value={formData.landSize}
                                        onChange={(e) => setFormData({ ...formData, landSize: e.target.value })}
                                        min="0"
                                        step="0.01"
                                        style={{ width: '100%', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
                                    />
                                </div>
                                <div className="input-group">
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Location (Tehsil / District)</label>
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <input
                                            type="text"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            placeholder="Enter location or auto-detect"
                                            style={{ flex: 1, padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
                                        />
                                        <button
                                            onClick={detectLocation}
                                            disabled={isLocating}
                                            className="btn btn-secondary"
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
                                        >
                                            <MapPin size={18} /> {isLocating ? 'Locating...' : 'Auto-detect'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div>
                            <h2 style={{ marginBottom: '1.5rem' }}>Crop History</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>What crops do you usually grow? Select all that apply.</p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                {['Wheat', 'Rice', 'Soybean', 'Cotton', 'Sugarcane', 'Maize', 'Onion', 'Potato', 'Others'].map(crop => (
                                    <motion.div
                                        key={crop}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => toggleCrop(crop)}
                                        style={{
                                            padding: '1.25rem 1rem',
                                            border: `2px solid ${formData.selectedCrops.includes(crop) ? 'var(--primary)' : 'var(--border)'}`,
                                            background: formData.selectedCrops.includes(crop) ? 'rgba(45, 90, 39, 0.05)' : 'white',
                                            color: formData.selectedCrops.includes(crop) ? 'var(--primary)' : 'var(--text-main)',
                                            borderRadius: 'var(--radius-md)',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            fontWeight: formData.selectedCrops.includes(crop) ? 700 : 500,
                                            transition: 'all 0.2s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        {crop}
                                        {formData.selectedCrops.includes(crop) && <CheckCircle2 size={16} />}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div style={{
                        marginTop: '3rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        paddingTop: '2rem',
                        borderTop: '1px solid var(--border)'
                    }}>
                        <button onClick={handleBack} className="btn btn-secondary" disabled={isSubmitting}>
                            <ArrowLeft size={18} /> {t('common.back')}
                        </button>
                        <button onClick={handleNext} className="btn btn-primary" disabled={isSubmitting}>
                            {currentStep === steps.length - 1
                                ? (isSubmitting ? 'Saving...' : t('common.submit'))
                                : t('common.next')
                            } <ArrowRight size={18} />
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default FarmerOnboarding;
