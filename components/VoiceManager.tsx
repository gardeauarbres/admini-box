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
            msg: "Nouveau formulaire de dépense",
            action: (cmd: string, router: Router) => {
                // Regex pour extraire le montant (ex: "50 euros", "50€", "50")
                const amountMatch = cmd.match(/(\d+(?:[.,]\d+)?)\s*(?:euros?|€)?/i);

                // Regex pour extraire le libellé après "pour" ou "chez"
                const labelMatch = cmd.match(/(?:pour|chez|à)\s+(?:le\s+|la\s+|l'|les\s+)?([a-z0-9àâäéèêëîïôöùûüç\s]+)/i);

                let url = '/finance?action=add';
                let feedback = "Nouveau formulaire de dépense";

                if (amountMatch) {
                    const amount = amountMatch[1].replace(',', '.');
                    url += `&amount=${amount}`;
                    feedback = `Dépense de ${amount}€ détectée`;
                }

                if (labelMatch && labelMatch[1]) {
                    // Nettoyage rapide du libellé
                    const label = labelMatch[1].trim();
                    // On ne prend pas le libellé s'il est trop générique ou fait partie du montant
                    if (label.length > 2 && !label.match(/^\d/)) {
                        url += `&label=${encodeURIComponent(label)}`;
                        feedback += ` pour ${label}`;
                    }
                }

                router.push(url);
                return feedback;
            }
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

        // Stratégie : Découper la phrase en mots et chercher chaque mot
        // Cela permet d'ignorer les mots de liaison ("aller", "à", "la", "montre", "moi")
        // et de se concentrer sur les mots-clés ("banque", "profil", "admin")

        // Liste de mots vides (stop words) à ignorer complètement pour réduire le bruit
        const STOP_WORDS = ['je', 'tu', 'il', 'nous', 'vous', 'ils', 'mon', 'ma', 'mes', 'le', 'la', 'les', 'un', 'une', 'des', 's\'il', 'te', 'plait', 'plaît', 'svp', 'veuillez', 'aller', 'montre', 'ouvre', 'vers', 'dans', 'sur', 'pour', 'chez', 'veut', 'veux', 'voudrais', 'aimerais', 'peux'];

        const tokens = lowerCmd.split(/\s+/)
            .filter(t => t.length > 2) // Ignore les mots très courts
            .filter(t => !STOP_WORDS.includes(t)); // Filtre les mots vides

        let bestMatch = null;
        let bestScore = 1; // Score Fuse : 0 = parfait, 1 = nul

        for (const token of tokens) {
            const results = fuse.search(token);
            if (results.length > 0) {
                const topResult = results[0];
                if (topResult.score !== undefined && topResult.score < bestScore) {
                    bestScore = topResult.score;
                    bestMatch = topResult.item;
                }
            }
        }

        // Si aucun mot individuel ne matche, on tente la phrase entière (au cas où "mentions légales")
        if (!bestMatch) {
            const fullResults = fuse.search(lowerCmd);
            if (fullResults.length > 0) {
                bestMatch = fullResults[0].item;
                bestScore = fullResults[0].score || 1;
            }
        }

        if (bestMatch && bestScore < 0.5) {
            console.log(`Matched: ${bestMatch.msg} (Score: ${bestScore})`);

            if (bestMatch.action) {
                const feedback = bestMatch.action(lowerCmd, router);
                showToast(feedback, 'success');
            } else if (bestMatch.path) {
                router.push(bestMatch.path);
                showToast(bestMatch.msg || 'Navigation...', 'success');
            }
        } else {
            console.warn("No match found for:", lowerCmd);
            showToast(`Je n'ai pas compris : "${command}"`, 'info');
        }
    };

    return <VoiceInput onCommand={handleCommand} />;
}
