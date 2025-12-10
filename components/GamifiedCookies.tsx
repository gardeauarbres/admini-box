'use client';

import React, { useState, useEffect } from 'react';
import NeonCard from './NeonCard';
import { motion, AnimatePresence } from 'framer-motion';

export default function GamifiedCookies() {
    const [isVisible, setIsVisible] = useState(false);
    const [accepted, setAccepted] = useState(false);
    const [level, setLevel] = useState(1);
    const [xp, setXp] = useState(0);

    useEffect(() => {
        // Check if already handled
        const cookieStatus = localStorage.getItem('admini_box_cookies');
        if (!cookieStatus) {
            // Delay showing slightly for effect
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        // Animation sequence
        setXp(100);
        setTimeout(() => setLevel(2), 600);

        // Save choice
        localStorage.setItem('admini_box_cookies', 'accepted');

        // Hide after celebration
        setTimeout(() => {
            setAccepted(true);
            setTimeout(() => setIsVisible(false), 2000);
        }, 1500);
    };

    const handleDecline = () => {
        localStorage.setItem('admini_box_cookies', 'declined');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    zIndex: 9999,
                    maxWidth: '400px',
                    width: 'calc(100% - 4rem)'
                }}
            >
                <NeonCard color="cyan" glowIntensity="high">
                    {!accepted ? (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{ fontSize: '2rem' }}>🍪</div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.2rem', textShadow: '0 0 10px cyan' }}>Mission Cookies</h3>
                                    <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8 }}>Quête Secondaire Débloquée !</p>
                                </div>
                            </div>

                            <p style={{ marginBottom: '1.5rem', lineHeight: '1.5', fontSize: '0.9rem' }}>
                                Acceptez les cookies pour gagner **100 XP** et améliorer votre expérience de navigation.
                                Nos cookies sont garantis sans calories mais riches en fonctionnalités.
                            </p>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    onClick={handleAccept}
                                    className="btn"
                                    style={{
                                        flex: 2,
                                        background: 'cyan',
                                        color: 'black',
                                        border: 'none',
                                        fontWeight: 'bold',
                                        padding: '0.75rem',
                                        clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)',
                                        cursor: 'pointer',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px'
                                    }}
                                >
                                    Accepter (+100 XP)
                                </button>
                                <button
                                    onClick={handleDecline}
                                    style={{
                                        flex: 1,
                                        background: 'transparent',
                                        border: '1px solid rgba(255,255,255,0.3)',
                                        color: 'white',
                                        padding: '0.75rem',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Refuser
                                </button>
                            </div>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1.2, opacity: 1 }}
                                transition={{ type: 'spring' }}
                            >
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                                <h3 style={{ color: '#00ff41', textShadow: '0 0 10px #00ff41', margin: '0.5rem 0' }}>LEVEL UP!</h3>
                                <p style={{ fontWeight: 'bold' }}>Niveau {level}</p>
                                <div style={{
                                    width: '100%',
                                    height: '6px',
                                    background: '#333',
                                    borderRadius: '3px',
                                    marginTop: '0.5rem',
                                    overflow: 'hidden'
                                }}>
                                    <motion.div
                                        initial={{ width: '0%' }}
                                        animate={{ width: '100%' }}
                                        style={{ height: '100%', background: '#00ff41' }}
                                    />
                                </div>
                                <p style={{ fontSize: '0.8rem', marginTop: '1rem', opacity: 0.8 }}>Préférences sauvegardées</p>
                            </motion.div>
                        </div>
                    )}
                </NeonCard>
            </motion.div>
        </AnimatePresence>
    );
}
