'use client';

import React, { useRef, useState, CSSProperties } from 'react';

interface SpotlightCardProps {
    children: React.ReactNode;
    className?: string;
    style?: CSSProperties;
    spotlightColor?: string;
}

export default function SpotlightCard({
    children,
    className = '',
    style = {},
    spotlightColor = 'rgba(255, 255, 255, 0.15)'
}: SpotlightCardProps) {
    const divRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!divRef.current) return;

        const rect = divRef.current.getBoundingClientRect();
        setPosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    };

    return (
        <div
            ref={divRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setOpacity(1)}
            onMouseLeave={() => setOpacity(0)}
            className={`glass-panel ${className}`}
            style={{
                position: 'relative',
                overflow: 'hidden',
                ...style
            }}
        >
            {/* Spotlight Gradient Layer */}
            <div
                style={{
                    pointerEvents: 'none',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: opacity,
                    background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 40%)`,
                    transition: 'opacity 0.3s ease',
                    zIndex: 0,
                    mixBlendMode: 'overlay'
                }}
            />

            {/* Content Layer (z-index to be above spotlight) */}
            <div style={{ position: 'relative', zIndex: 1 }}>
                {children}
            </div>
        </div>
    );
}
