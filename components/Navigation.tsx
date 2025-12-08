'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { usePathname } from 'next/navigation';
import EnhancedGlobalSearch from './EnhancedGlobalSearch';

export default function Navigation() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showSearch, setShowSearch] = useState(false);

    // Fermer le menu mobile au changement de page
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    // Fermer le menu mobile si on clique en dehors
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.mobile-menu') && !target.closest('.menu-toggle')) {
                setIsMobileMenuOpen(false);
            }
        };
        if (isMobileMenuOpen) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [isMobileMenuOpen]);

    const navItems = [
        { href: '/', label: 'Tableau de bord', icon: '🏠', shortLabel: 'Accueil' },
        { href: '/documents', label: 'Documents', icon: '📄', shortLabel: 'Docs' },
        { href: '/editor', label: 'Éditeur', icon: '✏️', shortLabel: 'Éditeur' },
        { href: '/finance', label: 'Finance', icon: '💰', shortLabel: 'Finance' },
        { href: '/analytics', label: 'Analytics', icon: '📊', shortLabel: 'Stats' },
        { href: '/profile', label: 'Mon profil', icon: '👤', shortLabel: 'Profil' },
    ];

    const isActive = (href: string) => pathname === href;

    if (!user) {
        return (
            <nav 
                className="glass-panel" 
                role="navigation"
                aria-label="Navigation principale"
                style={{
                    position: 'sticky',
                    top: '1rem',
                    margin: '1rem auto',
                    maxWidth: '1200px',
                    zIndex: 50,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem 2rem',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}
            >
                <div style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>AdminiBox</div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <Link href="/login" className="btn btn-secondary" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                        Connexion
                    </Link>
                    <Link href="/register" className="btn btn-primary" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                        Inscription
                    </Link>
                </div>
            </nav>
        );
    }

    return (
        <>
            <nav 
                className="glass-panel" 
                role="navigation"
                aria-label="Navigation principale"
                style={{
                    position: 'sticky',
                    top: '1rem',
                    margin: '1rem auto',
                    maxWidth: '1200px',
                    zIndex: 50,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem 1.5rem',
                    flexWrap: 'wrap',
                    gap: '0.75rem'
                }}
            >
                {/* Logo */}
                <Link href="/" style={{ fontWeight: 'bold', fontSize: '1.25rem', textDecoration: 'none', color: 'var(--foreground)' }}>
                    AdminiBox
                </Link>

                {/* Desktop Navigation */}
                <div style={{ 
                    display: 'flex', 
                    gap: '0.5rem', 
                    alignItems: 'center', 
                    flexWrap: 'wrap',
                    flex: 1,
                    justifyContent: 'center'
                }}>
                    {/* Recherche - Bouton dépliable */}
                    <div style={{ position: 'relative' }}>
                        {showSearch ? (
                            <div style={{ 
                                position: 'absolute', 
                                top: '100%', 
                                left: 0, 
                                marginTop: '0.5rem',
                                width: '300px',
                                zIndex: 100
                            }}>
                                <EnhancedGlobalSearch />
                                <button
                                    onClick={() => setShowSearch(false)}
                                    style={{
                                        position: 'absolute',
                                        top: '0.5rem',
                                        right: '0.5rem',
                                        background: 'var(--danger)',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '24px',
                                        height: '24px',
                                        cursor: 'pointer',
                                        color: 'white',
                                        fontSize: '0.75rem'
                                    }}
                                    aria-label="Fermer la recherche"
                                >
                                    ×
                                </button>
                            </div>
                        ) : null}
                        <button
                            onClick={() => setShowSearch(!showSearch)}
                            className="btn btn-secondary"
                            style={{ 
                                fontSize: '1rem', 
                                padding: '0.5rem 0.75rem',
                                minWidth: 'auto'
                            }}
                            aria-label="Recherche"
                            title="Recherche (Ctrl+K)"
                        >
                            🔍
                        </button>
                    </div>

                    {/* Liens de navigation - Icônes uniquement sur desktop */}
                    <div style={{ 
                        display: 'none', 
                        gap: '0.25rem',
                        alignItems: 'center'
                    }}
                    className="desktop-nav"
                    >
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="nav-link"
                                aria-label={item.label}
                                title={item.label}
                                style={{
                                    padding: '0.5rem 0.75rem',
                                    fontSize: '1.1rem',
                                    background: isActive(item.href) ? 'var(--primary)' : 'transparent',
                                    opacity: isActive(item.href) ? 1 : 0.8,
                                    borderRadius: 'var(--radius)',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minWidth: '2.5rem',
                                    textDecoration: 'none'
                                }}
                            >
                                {item.icon}
                            </Link>
                        ))}
                    </div>

                    {/* Actions rapides */}
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button
                            onClick={toggleTheme}
                            className="btn btn-secondary"
                            style={{ 
                                fontSize: '1rem', 
                                padding: '0.5rem 0.75rem',
                                minWidth: 'auto'
                            }}
                            aria-label={`Basculer vers le thème ${theme === 'dark' ? 'clair' : 'sombre'}`}
                            title={`Thème ${theme === 'dark' ? 'sombre' : 'clair'}`}
                        >
                            {theme === 'dark' ? '☀️' : '🌙'}
                        </button>
                        
                        {/* Menu hamburger pour mobile */}
                        <button
                            className="menu-toggle btn btn-secondary"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            style={{ 
                                fontSize: '1.2rem', 
                                padding: '0.5rem 0.75rem',
                                minWidth: 'auto',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                            aria-label="Menu"
                            aria-expanded={isMobileMenuOpen}
                        >
                            ☰
                        </button>
                    </div>
                </div>
            </nav>

            {/* Menu mobile déroulant */}
            {isMobileMenuOpen && (
                <div 
                    className="mobile-menu glass-panel"
                    style={{
                        position: 'fixed',
                        top: 'calc(1rem + 60px)',
                        right: '1rem',
                        maxWidth: '300px',
                        width: 'calc(100% - 2rem)',
                        zIndex: 100,
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        maxHeight: 'calc(100vh - 100px)',
                        overflowY: 'auto',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                    }}
                >
                    {/* Recherche dans le menu mobile */}
                    <div style={{ marginBottom: '0.5rem' }}>
                        <EnhancedGlobalSearch />
                    </div>

                    {/* Liens de navigation */}
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.75rem 1rem',
                                borderRadius: 'var(--radius)',
                                background: isActive(item.href) ? 'var(--primary)' : 'transparent',
                                color: 'var(--foreground)',
                                textDecoration: 'none',
                                transition: 'all 0.2s ease',
                                fontSize: '0.95rem'
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive(item.href)) {
                                    e.currentTarget.style.background = 'var(--button-secondary-bg)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive(item.href)) {
                                    e.currentTarget.style.background = 'transparent';
                                }
                            }}
                        >
                            <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    ))}

                    {/* Séparateur */}
                    <div style={{ 
                        height: '1px', 
                        background: 'var(--card-border)', 
                        margin: '0.5rem 0' 
                    }} />

                    {/* Actions */}
                    <button
                        onClick={() => {
                            setIsMobileMenuOpen(false);
                            logout();
                        }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem 1rem',
                            borderRadius: 'var(--radius)',
                            background: 'transparent',
                            border: '1px solid var(--danger)',
                            color: 'var(--danger)',
                            cursor: 'pointer',
                            fontSize: '0.95rem',
                            width: '100%',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--danger)';
                            e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'var(--danger)';
                        }}
                    >
                        <span>🚪</span>
                        <span>Déconnexion</span>
                    </button>
                </div>
            )}

            <style jsx>{`
                @media (min-width: 768px) {
                    .desktop-nav {
                        display: flex !important;
                    }
                    .menu-toggle {
                        display: none !important;
                    }
                }
                @media (max-width: 767px) {
                    .desktop-nav {
                        display: none !important;
                    }
                    .menu-toggle {
                        display: flex !important;
                    }
                }
            `}</style>
        </>
    );
}
