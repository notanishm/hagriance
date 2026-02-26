import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Settings, User, Building2, Landmark, ShieldAlert, X } from 'lucide-react';

const DevModeBar = () => {
    const { isDevMode, switchDevRole, userProfile } = useAuth();
    const [isVisible, setIsVisible] = React.useState(true);

    if (!isDevMode || !isVisible) return null;

    return (
        <div style={{
            background: '#111',
            color: 'white',
            padding: '10px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '13px',
            zIndex: 9999,
            width: '100%',
            borderBottom: '2px solid #fbbf24',
            position: 'relative'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                    background: '#fbbf24',
                    color: '#000',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: 950,
                    fontSize: '11px',
                    letterSpacing: '0.5px'
                }}>
                    STAGING / DEV
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldAlert size={16} color="#fbbf24" />
                    <span style={{ fontWeight: 600 }}>Auth Bypass Active</span>
                </div>

                <div style={{ width: '1px', height: '20px', background: '#333', margin: '0 8px' }}></div>

                <span style={{ color: '#888', fontWeight: 500 }}>Switch Context:</span>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => switchDevRole('farmer')}
                        style={{
                            background: userProfile?.role === 'farmer' ? '#2D5A27' : '#222',
                            color: userProfile?.role === 'farmer' ? 'white' : '#aaa',
                            border: '1px solid ' + (userProfile?.role === 'farmer' ? '#4A8B3F' : '#333'),
                            padding: '6px 14px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '12px',
                            fontWeight: 600,
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#fbbf24'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = userProfile?.role === 'farmer' ? '#4A8B3F' : '#333'}
                    >
                        <User size={14} /> Farmer
                    </button>

                    <button
                        onClick={() => switchDevRole('business')}
                        style={{
                            background: userProfile?.role === 'business' ? '#B8860B' : '#222',
                            color: userProfile?.role === 'business' ? 'white' : '#aaa',
                            border: '1px solid ' + (userProfile?.role === 'business' ? '#D4AF37' : '#333'),
                            padding: '6px 14px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '12px',
                            fontWeight: 600,
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#fbbf24'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = userProfile?.role === 'business' ? '#D4AF37' : '#333'}
                    >
                        <Building2 size={14} /> Business
                    </button>

                    <button
                        onClick={() => switchDevRole('bank')}
                        style={{
                            background: userProfile?.role === 'bank' ? '#1D4ED8' : '#222',
                            color: userProfile?.role === 'bank' ? 'white' : '#aaa',
                            border: '1px solid ' + (userProfile?.role === 'bank' ? '#3B82F6' : '#333'),
                            padding: '6px 14px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '12px',
                            fontWeight: 600,
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#fbbf24'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = userProfile?.role === 'bank' ? '#3B82F6' : '#333'}
                    >
                        <Landmark size={14} /> Bank
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ fontSize: '12px', color: '#666', background: '#222', padding: '4px 10px', borderRadius: '4px' }}>
                    User: <span style={{ color: '#fbbf24', fontWeight: 700 }}>{userProfile?.full_name}</span>
                </div>
                <button
                    onClick={() => setIsVisible(false)}
                    style={{
                        background: '#333',
                        border: 'none',
                        color: '#888',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#888'}
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};

export default DevModeBar;
