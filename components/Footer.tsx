'use client';

import Link from 'next/link';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer-glass" style={{
            marginTop: 'auto',
            borderTop: '1px solid var(--glass-border)',
            background: 'rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(10px)',
            padding: '2rem 1rem',
        }}>
            <div className="container" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.5rem'
            }}>

                {/* Navigation Links */}
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '1.5rem',
                    justifyContent: 'center',
                    fontSize: '0.9rem'
                }}>
                    <Link href="/legal/mentions" className="footer-link">Mentions Légales</Link>
                    <Link href="/legal/cgu" className="footer-link">CGU</Link>
                    <Link href="/legal/cgv" className="footer-link">CGV</Link>
                    <Link href="/legal/privacy" className="footer-link">Confidentialité</Link>
                    <Link href="/faq" className="footer-link">FAQ</Link>
                </div>

                {/* Copyright */}
                <div style={{
                    color: 'var(--secondary)',
                    fontSize: '0.85rem',
                    textAlign: 'center'
                }}>
                    © {currentYear} AdminiBox. Simplify your administrative life.
                </div>
            </div>

            <style jsx>{`
        .footer-link {
          color: var(--secondary);
          text-decoration: none;
          transition: color 0.2s ease;
        }
        .footer-link:hover {
          color: var(--primary);
          text-shadow: 0 0 8px rgba(99, 102, 241, 0.4);
        }
      `}</style>
        </footer>
    );
}
