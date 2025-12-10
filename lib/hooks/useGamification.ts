
import { useTransactions, useDocuments } from '@/lib/queries';
import { useAuth } from '@/context/AuthContext';
import { calculateIncome, calculateExpense } from '@/lib/utils';
import { useMemo } from 'react';

export interface Badge {
    id: string;
    icon: string;
    name: string;
    description: string;
    unlocked: boolean;
}

export function useGamification() {
    const { user } = useAuth();
    const { data: transactions = [] } = useTransactions(user?.$id || null);
    const { data: documents = [] } = useDocuments(user?.$id || null);

    const gamificationData = useMemo(() => {
        const income = calculateIncome(transactions);
        const expense = calculateExpense(transactions);

        // Badge Logic
        const badges: Badge[] = [
            {
                id: 'starter',
                icon: '🚀',
                name: 'Débutant',
                description: 'Première connexion',
                unlocked: !!user
            },
            {
                id: 'organizer',
                icon: '📂',
                name: 'Organisateur',
                description: '5 documents classés',
                unlocked: documents.length >= 5
            },
            {
                id: 'saver',
                icon: '💰',
                name: 'Économe',
                description: 'Revenus > Dépenses',
                unlocked: income > expense && income > 0
            },
            {
                id: 'active',
                icon: '⚡',
                name: 'Actif',
                description: '5 transactions',
                unlocked: transactions.length >= 5
            },
        ];

        // XP Calculation
        // Base XP for badges
        const badgeXP = badges.filter(b => b.unlocked).length * 100;
        // Activity XP
        const docXP = documents.length * 10;
        const transXP = transactions.length * 5;

        const totalXP = badgeXP + docXP + transXP;

        // Level Calculation (Simple linear progression for now: 1 level per 500 XP)
        const level = Math.floor(totalXP / 500) + 1;
        const nextLevelXP = level * 500;
        const currentLevelStartXP = (level - 1) * 500;

        // Progress within current level
        const progress = Math.min(100, Math.max(0, ((totalXP - currentLevelStartXP) / (nextLevelXP - currentLevelStartXP)) * 100));

        return {
            badges,
            xp: totalXP,
            level,
            progress,
            nextLevelXP
        };
    }, [user, transactions, documents]);

    return gamificationData;
}
