'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useGamification } from '@/lib/hooks/useGamification';

export default function GamificationCard() {
    const { badges, xp, level, progress, nextLevelXP } = useGamification();

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 className="section-title" style={{ fontSize: '1.1rem', margin: 0 }}>🏆 Mes Succès</h3>
                <span style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 600 }}>Niveau {level}</span>
            </div>

            {/* Progress Bar */}
            <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--secondary)', marginBottom: '0.25rem' }}>
                    <span>XP</span>
                    <span>{xp} / {nextLevelXP}</span>
                </div>
                <div style={{ height: '6px', background: 'var(--card-border)', borderRadius: '3px', overflow: 'hidden' }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        style={{ height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--secondary))' }}
                    />
                </div>
            </div>

            {/* Badges Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                {badges.map((badge) => (
                    <div key={badge.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', opacity: badge.unlocked ? 1 : 0.4 }} title={badge.description}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: badge.unlocked ? 'rgba(var(--primary-rgb), 0.2)' : 'rgba(0,0,0,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.2rem',
                            border: badge.unlocked ? '1px solid var(--primary)' : '1px solid transparent'
                        }}>
                            {badge.icon}
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--secondary)', textAlign: 'center' }}>{badge.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
