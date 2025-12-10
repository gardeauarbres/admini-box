import React from 'react';

interface NeonCardProps {
    children: React.ReactNode;
    color?: 'cyan' | 'magenta' | 'lime' | 'violet';
    className?: string;
    style?: React.CSSProperties;
    glowIntensity?: 'low' | 'medium' | 'high';
}

const NeonCard: React.FC<NeonCardProps> = ({
    children,
    color = 'cyan',
    className = '',
    style = {},
    glowIntensity = 'medium'
}) => {
    // Map colors to CSS variables or hex values
    const neonColors = {
        cyan: '#00f3ff',
        magenta: '#ff00ff',
        lime: '#00ff41',
        violet: '#9d00ff'
    };

    const mainColor = neonColors[color];

    // Define shadow intensities
    const shadows = {
        low: `0 0 5px ${mainColor}40, 0 0 10px ${mainColor}20`,
        medium: `0 0 10px ${mainColor}60, 0 0 20px ${mainColor}30, inset 0 0 5px ${mainColor}10`,
        high: `0 0 15px ${mainColor}, 0 0 30px ${mainColor}60, inset 0 0 10px ${mainColor}20`
    };

    return (
        <div
            className={`neon-card ${className}`}
            style={{
                background: 'rgba(10, 10, 15, 0.7)', // Deep dark background
                backdropFilter: 'blur(10px)',
                border: `1px solid ${mainColor}`,
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: shadows[glowIntensity],
                color: '#fff',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                ...style
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 0 20px ${mainColor}, 0 0 40px ${mainColor}40`;
                e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = shadows[glowIntensity];
                e.currentTarget.style.transform = 'translateY(0)';
            }}
        >
            {/* Scanline effect overlay */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.3) 50%)',
                backgroundSize: '100% 4px',
                pointerEvents: 'none',
                opacity: 0.1,
                zIndex: 1
            }} />

            <div style={{ position: 'relative', zIndex: 2 }}>
                {children}
            </div>

            <style jsx>{`
                .neon-card::before {
                    content: '';
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: radial-gradient(circle, ${mainColor}10 0%, transparent 70%);
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    pointer-events: none;
                }
                .neon-card:hover::before {
                    opacity: 1;
                }
            `}</style>
        </div>
    );
};

export default NeonCard;
