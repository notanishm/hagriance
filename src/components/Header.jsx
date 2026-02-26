import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Globe, Sprout, LogOut, User as UserIcon, ChevronDown } from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import SpotlightCard from './SpotlightCard';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { language, setLanguage, t } = useTranslation();
    const { user, logout } = useAuth();
    const { theme, toggleTheme, isDark } = useTheme();
    const [showUserMenu, setShowUserMenu] = useState(false);

    const isLanding = location.pathname === '/';

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    // Get user display name
    const getUserDisplay = () => {
        if (!user) return null;
        return user.email?.split('@')[0] || 'User';
    };

    // Get user role badge
    const getUserRole = () => {
        const path = location.pathname;
        if (path.includes('farmer')) return 'Farmer';
        if (path.includes('business')) return 'Business';
        if (path.includes('bank')) return 'Bank';
        return 'User';
    };

    // Simple breadcrumb logic
    const pathnames = location.pathname.split('/').filter((x) => x);
    const breadcrumbMap = {
        roles: 'Join',
        farmer: 'Farmer',
        business: 'Business',
        register: 'Onboarding',
        dashboard: 'Dashboard'
    };

    return (
        <header className="glass" style={{
            padding: '0.75rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            height: '70px'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                {/* Back Button */}
                {!isLanding && (
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            background: 'rgba(0,0,0,0.05)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                        }}
                    >
                        <ArrowLeft size={20} />
                    </button>
                )}

                {/* Brand / Logo */}
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
                    <div style={{
                        background: 'var(--primary)',
                        color: 'white',
                        borderRadius: '12px',
                        padding: '0.5rem',
                        display: 'flex'
                    }}>
                        <Sprout size={24} />
                    </div>
                    <span className="gradient-text" style={{ fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.03em' }}>
                        Agriance
                    </span>
                </Link>

                {/* Breadcrumbs */}
                {!isLanding && (
                    <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        <span style={{ opacity: 0.5 }}>/</span>
                        {pathnames.map((name, index) => {
                            const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
                            const isLast = index === pathnames.length - 1;
                            const label = breadcrumbMap[name] || name.charAt(0).toUpperCase() + name.slice(1);

                            return (
                                <React.Fragment key={name}>
                                    {isLast ? (
                                        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{label}</span>
                                    ) : (
                                        <Link to={routeTo} style={{ textDecoration: 'none', color: 'inherit' }}>{label}</Link>
                                    )}
                                    {!isLast && <span style={{ opacity: 0.5 }}>/</span>}
                                </React.Fragment>
                            );
                        })}
                    </nav>
                )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {/* Theme Toggle with Spotlight Effect */}
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    marginRight: '0.5rem'
                }}>
                    <SpotlightCard
                        onClick={toggleTheme}
                        isDark={isDark}
                        spotlightColor={isDark ? 'rgba(74, 222, 128, 0.5)' : 'rgba(45, 90, 39, 0.4)'}
                        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                    />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-hover)', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
                    {['en', 'hi', 'mr'].map((lang) => (
                        <button
                            key={lang}
                            onClick={() => setLanguage(lang)}
                            style={{
                                padding: '0.4rem 0.8rem',
                                borderRadius: '8px',
                                border: 'none',
                                background: language === lang ? 'white' : 'transparent',
                                boxShadow: language === lang ? 'var(--shadow-sm)' : 'none',
                                color: language === lang ? 'var(--primary)' : 'var(--text-muted)',
                                fontWeight: language === lang ? 700 : 500,
                                fontSize: '0.85rem',
                                cursor: 'pointer'
                            }}
                        >
                            {lang === 'en' ? 'EN' : lang === 'hi' ? 'हि' : 'म'}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '1rem', borderLeft: '1px solid var(--border)', paddingLeft: '1.5rem' }}>
                    {user ? (
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.5rem 1rem',
                                    background: 'rgba(45, 90, 39, 0.05)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius-md)',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                }}
                            >
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: 'var(--primary)',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.9rem'
                                }}>
                                    {getUserDisplay()?.charAt(0).toUpperCase()}
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{getUserDisplay()}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                                        {getUserRole()}
                                    </div>
                                </div>
                                <ChevronDown size={16} color="var(--text-muted)" />
                            </button>

                            {showUserMenu && (
                                <>
                                    <div 
                                        style={{
                                            position: 'fixed',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            zIndex: 999
                                        }}
                                        onClick={() => setShowUserMenu(false)}
                                    />
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: '100%',
                                            right: 0,
                                            marginTop: '0.5rem',
                                            background: 'var(--bg-card)',
                                            border: '1px solid var(--border)',
                                            borderRadius: 'var(--radius-md)',
                                            boxShadow: 'var(--shadow-lg)',
                                            minWidth: '200px',
                                            zIndex: 1000
                                        }}
                                    >
                                        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)' }}>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Signed in as</div>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: '0.25rem' }}>
                                                {user.email}
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem 1rem',
                                                border: 'none',
                                                background: 'none',
                                                textAlign: 'left',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                color: '#ef4444',
                                                fontWeight: 600,
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            <LogOut size={16} /> Logout
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <>
                            <button
                                onClick={() => navigate('/login')}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-main)',
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    cursor: 'pointer'
                                }}
                            >
                                Login
                            </button>
                            <button
                                onClick={() => navigate('/register')}
                                className="btn btn-primary"
                                style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}
                            >
                                Register
                            </button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
