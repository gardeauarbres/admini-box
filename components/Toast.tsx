'use client';

import { useEffect } from 'react';

interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'info';
    onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColor = {
        success: 'var(--success)',
        error: 'var(--danger)',
        info: 'var(--primary)'
    }[type];

    return (
        <div style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            padding: '1rem 1.5rem',
            background: bgColor,
            color: 'white',
            borderRadius: 'var(--radius)',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            zIndex: 1000,
            animation: 'slideIn 0.3s ease-out',
            maxWidth: '400px',
            wordWrap: 'break-word'
        }}>
            {message}
        </div>
    );
}

