'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import VoiceInput from './VoiceInput';
import { useToast } from '@/context/ToastContext';

export default function VoiceManager() {
    const router = useRouter();
    const { showToast } = useToast();

    const handleCommand = (command: string) => {
        const lowerCmd = command.toLowerCase();

        if (lowerCmd.includes('accueil') || lowerCmd.includes('bord') || lowerCmd.includes('home')) {
            router.push('/');
            showToast('Navigation vers l\'accueil', 'success');
        } else if (lowerCmd.includes('finance') || lowerCmd.includes('compta')) {
            router.push('/finance');
            showToast('Navigation vers Finances', 'success');
        } else if (lowerCmd.includes('compte') || lowerCmd.includes('profil')) {
            router.push('/profile');
            showToast('Navigation vers Profil', 'success');
        } else if (lowerCmd.includes('ajoute') && (lowerCmd.includes('dépense') || lowerCmd.includes('transaction'))) {
            router.push('/finance');
            // In a real app, we would pass a query param or context to open the modal immediately
            showToast('Ouverture de la section finances...', 'info');
        } else {
            showToast('Commande non reconnue (Essayez: "Accueil", "Finance", "Profil")', 'error');
        }
    };

    return <VoiceInput onCommand={handleCommand} />;
}
