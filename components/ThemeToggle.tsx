'use client';

import { useTheme } from '@/context/ThemeContext';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Éviter l'hydratation mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <button
                className="btn btn-secondary"
                style={{ width: '40px', height: '40px', padding: 0 }}
                aria-label="Toggle theme"
            >
                <span style={{ opacity: 0 }}>🌞</span>
            </button>
        );
    }

    return (
        <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="btn btn-secondary"
            style={{ width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Passer en mode ${theme === 'dark' ? 'clair' : 'sombre'}`}
        >
            {theme === 'dark' ? '🌞' : '🌙'}
        </button>
    );
}
