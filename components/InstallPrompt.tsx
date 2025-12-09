'use client';

import React, { useEffect, useState } from 'react';

const InstallPrompt: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setIsVisible(false);
        }
    };

    if (!isVisible) return null;

    return (
        <button
            onClick={handleInstallClick}
            className="btn glass-panel"
            style={{
                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                color: 'white',
                border: 'none',
                width: '100%',
                justifyContent: 'center',
                gap: '0.75rem',
                marginTop: '1rem',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
            }}
        >
            <span style={{ fontSize: '1.2rem' }}>📱</span>
            Installer l'App
        </button>
    );
};

export default InstallPrompt;
