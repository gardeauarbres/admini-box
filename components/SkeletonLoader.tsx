'use client';

export default function SkeletonLoader() {
    return (
        <div className="grid-dashboard">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                    key={i}
                    className="glass-panel"
                    style={{
                        height: '220px',
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                        background: 'var(--card-bg)', // Ensure correct base for pulse
                    }}
                >
                    {/* Header Skeleton */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ width: '60%', height: '24px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px' }} />
                        <div style={{ width: '80px', height: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }} />
                    </div>

                    {/* Message Skeleton */}
                    <div style={{ width: '90%', height: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginTop: '0.5rem' }} />

                    {/* Tags Skeleton */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                        <div style={{ width: '60px', height: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} />
                        <div style={{ width: '80px', height: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} />
                    </div>

                    {/* Button Skeleton */}
                    <div style={{ width: '100%', height: '36px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', marginTop: '0.5rem' }} />
                </div>
            ))}
        </div>
    );
}
