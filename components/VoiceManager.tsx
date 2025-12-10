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
        } else if ((lowerCmd.includes('ajoute') || lowerCmd.includes('créer')) && (lowerCmd.includes('dépense') || lowerCmd.includes('transaction'))) {
            router.push('/finance?action=add');
            showToast('Ouverture du formulaire de dépense...', 'success');
        } else if (lowerCmd.includes('scan') || lowerCmd.includes('reçu') || lowerCmd.includes('facture')) {
            router.push('/finance?action=scan');
            showToast('Activation du scanner...', 'success');
        } else if (lowerCmd.includes('document') || lowerCmd.includes('fichier')) {
            router.push('/?tab=documents'); // Assuming dashboard handles tabs or just scrolling
            showToast('Accès aux documents', 'success');
        } else {
            showToast('Commande non reconnue', 'error');
        }
    };

    return <VoiceInput onCommand={handleCommand} />;
}
