'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const links = [
        { href: '/legal/mentions', label: 'Mentions Légales' },
        { href: '/legal/cgu', label: 'CGU (Utilisation)' },
        { href: '/legal/cgv', label: 'CGV (Vente)' },
        { href: '/legal/privacy', label: 'Confidentialité' },
    ];

    return (
        <div className="legal-container" style={{
            paddingTop: '2rem',
            paddingBottom: '4rem',
            position: 'relative'
        }}>
            <h1 className="section-title" style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '3rem', textShadow: '0 0 20px rgba(99, 102, 241, 0.5)' }}>
                Centre de Conformité
            </h1>

            <div className="legal-grid" style={{
                display: 'grid',
                gridTemplateColumns: '250px 1fr',
                gap: '2rem',
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                {/* Sidebar Navigation */}
                <aside style={{ position: 'sticky', top: '100px', height: 'fit-content' }}>
                    <nav style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        background: 'rgba(255,255,255,0.03)',
                        backdropFilter: 'blur(10px)',
                        padding: '1.5rem',
                        borderRadius: '16px',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: 'var(--secondary)' }}>Documents</h3>
                        {links.map(link => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`legal-nav-item ${pathname === link.href ? 'active' : ''}`}
                                style={{
                                    textDecoration: 'none',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '8px',
                                    transition: 'all 0.2s ease',
                                    color: pathname === link.href ? 'white' : 'var(--secondary)',
                                    background: pathname === link.href ? 'var(--primary)' : 'transparent',
                                    border: pathname === link.href ? 'none' : '1px solid transparent',
                                    fontWeight: pathname === link.href ? 600 : 400
                                }}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </aside>

                {/* Main Content */}
                <main>
                    {children}
                </main>
            </div>

            <style jsx>{`
                @media (max-width: 768px) {
                    .legal-grid {
                        grid-template-columns: 1fr !important;
                    }
                    aside {
                        position: static !important;
                    }
                }
            `}</style>
        </div>
    );
}
