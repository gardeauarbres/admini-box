'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import VoiceInput from './VoiceInput';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';

export default function VoiceManager() {
    const router = useRouter();
    const { showToast } = useToast();
    const { user, loading } = useAuth();

    // Fix typo in useAuth usage if needed, assuming user is correct.

    // Type definition for smarter command map
    type Router = ReturnType<typeof useRouter>;
    type CommandDef = {
        keys: string[];
        path?: string;
        msg?: string;
        action?: (cmd: string, router: Router) => string;
    };

    const COMMAND_MAP: CommandDef[] = [
        // --- Navigation Globale ---
        {
            keys: ['accueil', 'maison', 'home', 'bord', 'dashboard'],
            path: '/',
            msg: "Retour à l'accueil"
        },
        {
            keys: ['profil', 'compte', 'paramètre', 'réglage'],
            path: '/profile',
            msg: "Ouverture du profil"
        },
        {
            keys: ['aide', 'faq', 'question', 'support'],
            path: '/faq',
            msg: "Centre d'aide ouvert"
        },

        // --- Module Finances ---
        {
            keys: ['finance', 'compta', 'argent', 'banque'],
            path: '/finance',
            msg: "Module Finances ouvert"
        },
        {
            keys: ['dépense', 'achat', 'transaction', 'ajouter'],
            path: '/finance?action=add',
            msg: "Nouveau formulaire de dépense"
        },
        {
            keys: ['analyse', 'statistique', 'graphique', 'chart'],
            path: '/analytics',
            msg: "Consultation des statistiques"
        },

        // --- Module Documents ---
        {
            keys: ['document', 'fichier', 'papier', 'archive'],
            path: '/documents',
            msg: "Explorateur de documents"
        },
        {
            keys: ['scanner', 'scan', 'photo', 'ticket'],
            path: '/finance?action=scan',
            msg: "Scanner prêt"
        },
        {
            keys: ['mail', 'courrier', 'message', 'inbox'],
            path: '/mails',
            msg: "Boîte de réception"
        },
        {
            keys: ['éditeur', 'écrire', 'rédiger', 'lettre'],
            path: '/editor',
            msg: "Éditeur de documents",
            action: (cmd: string, router: Router) => {
                // Extraction "pour [Organisme]"
                const match = cmd.match(/pour\s+(?:le\s+|la\s+|l'|les\s+)?([a-z0-9àâäéèêëîïôöùûüç]+)/i);
                if (match && match[1]) {
                    const organism = match[1];
                    router.push(`/editor?action=create&organism=${organism}`);
                    return `Nouveau courrier pour ${organism}`;
                }
                router.push('/editor');
                return "Éditeur de documents";
            }
        },
        {
            keys: ['admin', 'organisme', 'structure'],
            path: '/add-organisms',
            msg: "Administration Organismes"
        },

        // --- Autres ---
        {
            keys: ['magasin', 'market', 'store', 'boutique'],
            path: '/marketplace',
            msg: "Marketplace Neon"
        },
        {
            keys: ['légal', 'cgu', 'confidentialité', 'mention'],
            path: '/legal/privacy',
            msg: "Pages Légales"
        }
    ];

    const handleCommand = (command: string) => {
        const lowerCmd = command.toLowerCase();
        console.log("Voice Command Received:", lowerCmd);

        const match = COMMAND_MAP.find(cmd =>
            cmd.keys.some(k => lowerCmd.includes(k))
        );

        if (match) {
            if (match.action) {
                const feedback = match.action(lowerCmd, router);
                showToast(feedback, 'success');
            } else if (match.path) {
                router.push(match.path);
                showToast(match.msg || 'Navigation...', 'success');
            }
        } else {
            // Tentative de fallback ou message d'erreur doux
            showToast(`Commande non comprise: "${command}"`, 'error');
        }
    };

    return <VoiceInput onCommand={handleCommand} />;
}
