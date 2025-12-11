'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import VoiceInput from './VoiceInput';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import Fuse from 'fuse.js';

export default function VoiceManager() {
    const router = useRouter();
    const { showToast } = useToast();
    const { user, loading } = useAuth();

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
            keys: ['accueil', 'maison', 'home', 'bord', 'dashboard', 'retour'],
            path: '/',
            msg: "Retour à l'accueil"
        },
        {
            keys: ['profil', 'compte', 'paramètre', 'réglage', 'mes infos', 'configuration'],
            path: '/profile',
            msg: "Ouverture du profil"
        },
        {
            keys: ['aide', 'faq', 'question', 'support', 'sos', 'problème'],
            path: '/faq',
            msg: "Centre d'aide ouvert"
        },

        // --- Module Finances ---
        {
            keys: ['finance', 'compta', 'argent', 'banque', 'budget', 'solde'],
            path: '/finance',
            msg: "Module Finances ouvert"
        },
        {
            keys: ['dépense', 'achat', 'transaction', 'ajouter', 'payer', 'facture', 'frais'],
            path: '/finance?action=add',
            msg: "Nouveau formulaire de dépense"
        },
        {
            keys: ['analyse', 'statistique', 'graphique', 'chart', 'camembert', 'courbe', 'évolution'],
            path: '/analytics',
            msg: "Consultation des statistiques"
        },

        // --- Module Documents ---
        {
            keys: ['document', 'fichier', 'papier', 'archive', 'dossier', 'explorateur'],
            path: '/documents',
            msg: "Explorateur de documents"
        },
        {
            keys: ['scanner', 'scan', 'photo', 'ticket', 'reçu', 'digitaliser', 'numériser'],
            path: '/finance?action=scan',
            msg: "Scanner prêt"
        },
        {
            keys: ['mail', 'courrier', 'message', 'inbox', 'réception', 'email'],
            path: '/mails',
            msg: "Boîte de réception"
        },
        {
            keys: ['éditeur', 'écrire', 'rédiger', 'lettre', 'word', 'nouveau document', 'créer'],
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
            keys: ['admin', 'organisme', 'structure', 'gestion', 'ajouter organisme'],
            path: '/add-organisms',
            msg: "Administration Organismes"
        },

        // --- Autres ---
        {
            keys: ['magasin', 'market', 'store', 'boutique', 'achat', 'plugin', 'extension'],
            path: '/marketplace',
            msg: "Marketplace Neon"
        },

        // --- Pages Légales ---
        {
            keys: ['légal', 'cgu', 'confidentialité', 'mention', 'condition', 'règlement'],
            path: '/legal/privacy',
            msg: "Pages Légales"
        },
        {
            keys: ['cgv', 'vente'],
            path: '/legal/cgv',
            msg: "Conditions Générales de Vente"
        },
        {
            keys: ['mentions légales', 'éditeur du site'],
            path: '/legal/mentions',
            msg: "Mentions Légales"
        }
    ];

    // Initialisation de Fuse avec mémoïsation pour la performance
    const fuse = useMemo(() => new Fuse(COMMAND_MAP, {
        keys: ['keys'],
        threshold: 0.4, // Seuil de tolérance (0.0 = exact, 1.0 = tout matche)
        ignoreLocation: true, // Peu importe où se trouve le mot dans la phrase
        minMatchCharLength: 3
    }), []);

    const handleCommand = (command: string) => {
        const lowerCmd = command.toLowerCase();
        console.log("Voice Command Received:", lowerCmd);

        // Recherche floue
        const results = fuse.search(lowerCmd);

        if (results.length > 0) {
            // Prendre le meilleur résultat
            const match = results[0].item;

            console.log(`Matched: ${match.msg} (Score: ${results[0].score})`);

            if (match.action) {
                // Passer la commande brute pour l'extraction de paramètres
                const feedback = match.action(lowerCmd, router);
                showToast(feedback, 'success');
            } else if (match.path) {
                router.push(match.path);
                showToast(match.msg || 'Navigation...', 'success');
            }
        } else {
            console.warn("No match found for:", lowerCmd);
            showToast(`Je n'ai pas compris : "${command}"`, 'info');
        }
    };

    return <VoiceInput onCommand={handleCommand} />;
}
