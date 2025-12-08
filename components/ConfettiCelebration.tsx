'use client';

import { useEffect, useRef } from 'react';

interface ConfettiCelebrationProps {
    urgentCount: number;
}

export default function ConfettiCelebration({ urgentCount }: ConfettiCelebrationProps) {
    const prevCountRef = useRef(urgentCount);
    const hasCelebratedRef = useRef(false);

    useEffect(() => {
        // Si on passe de >0 à 0, c'est une victoire !
        if (prevCountRef.current > 0 && urgentCount === 0) {
            fireConfetti();
            hasCelebratedRef.current = true;
        }

        // Mise à jour de la ref pour la prochaine comparaison
        prevCountRef.current = urgentCount;
    }, [urgentCount]);

    const fireConfetti = async () => {
        const confetti = (await import('canvas-confetti')).default;

        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

        const randomInRange = (min: number, max: number) => {
            return Math.random() * (max - min) + min;
        };

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);

            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            });
        }, 250);
    };

    return null; // Ce composant n'a pas d'interface visuelle directe
}
