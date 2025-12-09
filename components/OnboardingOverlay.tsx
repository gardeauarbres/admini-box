'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import confetti from 'canvas-confetti';

interface OnboardingStep {
    title: string;
    description: string;
    icon: string;
}

const STEPS: OnboardingStep[] = [
    {
        title: 'Bienvenue sur AdminiBox',
        description: 'Votre assistant personnel pour simplifier, centraliser et automatiser toute votre gestion administrative.',
        icon: '👋',
    },
    {
        title: 'Centralisez vos documents',
        description: 'Stockez, classez et retrouvez tous vos justificatifs et courriers importants en un seul endroit sécurisé.',
        icon: '📂',
    },
    {
        title: 'Assistant IA Intelligent',
        description: 'Rédigez des courriers parfaits, corrigez vos fautes et obtenez des conseils financiers grâce à notre IA de pointe.',
        icon: '✨',
    },
    {
        title: 'Restez serein',
        description: 'Suivez vos échéances, gérez votre budget et ne ratez plus aucune obligation administrative.',
        icon: '🛡️',
    },
];

export default function OnboardingOverlay() {
    const { user } = useAuth();
    const [isVisible, setIsVisible] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        // Vérifier si l'utilisateur est connecté et s'il a déjà vu l'onboarding
        if (user) {
            const hasSeenOnboarding = localStorage.getItem('admini_box_onboarding_seen');
            if (!hasSeenOnboarding) {
                setIsVisible(true);
            }
        }
    }, [user]);

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleFinish();
        }
    };

    const handleFinish = () => {
        setIsVisible(false);
        localStorage.setItem('admini_box_onboarding_seen', 'true');
        // Confettis pour célébrer la fin de l'onboarding
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    };

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.8)',
                        backdropFilter: 'blur(8px)',
                        zIndex: 9999,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '1rem',
                    }}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        className="glass-panel"
                        style={{
                            maxWidth: '500px',
                            width: '100%',
                            padding: '2rem',
                            textAlign: 'center',
                            background: 'var(--card-bg)', // Opaque pour lisibilité
                            border: '1px solid var(--primary)',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                        }}
                    >
                        <motion.div
                            key={currentStep}
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                                {STEPS[currentStep].icon}
                            </div>
                            <h2 style={{ fontSize: '2rem', marginBottom: '1rem', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                {STEPS[currentStep].title}
                            </h2>
                            <p style={{ fontSize: '1.1rem', color: 'var(--foreground)', lineHeight: '1.6', marginBottom: '2rem' }}>
                                {STEPS[currentStep].description}
                            </p>
                        </motion.div>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                            {STEPS.map((_, index) => (
                                <div
                                    key={index}
                                    style={{
                                        width: '10px',
                                        height: '10px',
                                        borderRadius: '50%',
                                        background: index === currentStep ? 'var(--primary)' : 'var(--card-border)',
                                        transition: 'background 0.3s ease'
                                    }}
                                />
                            ))}
                        </div>

                        <button
                            onClick={handleNext}
                            className="btn btn-primary"
                            style={{
                                width: '100%',
                                padding: '1rem',
                                fontSize: '1.1rem',
                                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                                border: 'none',
                                color: 'white'
                            }}
                        >
                            {currentStep === STEPS.length - 1 ? 'C\'est parti ! 🚀' : 'Suivant'}
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
