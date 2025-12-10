'use client';

import { useState } from 'react';
import { useToast } from '@/context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

export interface OrganismTemplate {
    id: string;
    name: string;
    icon: string;
    url: string;
    message: string;
    tags: string[];
    description: string;
    category: 'public' | 'health' | 'finance' | 'utilities' | 'other';
}

const templates: OrganismTemplate[] = [
    // Services Publics
    { id: 'caf', name: 'CAF', icon: '🏛️', url: 'https://www.caf.fr', message: 'Allocations familiales', tags: ['social', 'famille'], description: 'Gestion des aides au logement et familiales', category: 'public' },
    { id: 'prefecture', name: 'ANTS', icon: '🆔', url: 'https://ants.gouv.fr', message: 'Titres sécurisés', tags: ['papiers', 'identité'], description: 'Passeports, Cartes d\'identité, Permis', category: 'public' },
    { id: 'pole-emploi', name: 'France Travail', icon: '💼', url: 'https://www.francetravail.fr', message: 'Recherche d\'emploi', tags: ['emploi', 'chômage'], description: 'Gestion de votre dossier demandeur d\'emploi', category: 'public' },

    // Santé
    { id: 'cpam', name: 'Ameli (CPAM)', icon: '🏥', url: 'https://www.ameli.fr', message: 'Assurance Maladie', tags: ['santé', 'remboursements'], description: 'Suivi des remboursements et droits', category: 'health' },
    { id: 'msa', name: 'MSA', icon: '🌾', url: 'https://www.msa.fr', message: 'Santé Agricole', tags: ['santé', 'agriculture'], description: 'Protection sociale du monde agricole', category: 'health' },
    { id: 'mutuelle', name: 'Mutuelle', icon: '🩺', url: '', message: 'Complémentaire Santé', tags: ['santé', 'privé'], description: 'Votre complémentaire santé (à configurer)', category: 'health' },

    // Finance & Impôts
    { id: 'impots', name: 'Impôts', icon: '💶', url: 'https://www.impots.gouv.fr', message: 'Déclaration de revenus', tags: ['fiscalité', 'taxes'], description: 'Espace particulier pour vos impôts', category: 'finance' },
    { id: 'urssaf', name: 'URSSAF', icon: '📊', url: 'https://www.urssaf.fr', message: 'Cotisations', tags: ['pro', 'cotisations'], description: 'Gestion des cotisations sociales', category: 'finance' },
    { id: 'bank', name: 'Banque', icon: '🏦', url: '', message: 'Compte Bancaire', tags: ['finance', 'compte'], description: 'Accès à vos comptes bancaires', category: 'finance' },

    // Énergie & Utilitaires
    { id: 'edf', name: 'EDF', icon: '⚡', url: 'https://particulier.edf.fr', message: 'Fournisseur d\'électricité', tags: ['énergie', 'factures'], description: 'Gestion de votre contrat d\'électricité', category: 'utilities' },
    { id: 'engie', name: 'Engie', icon: '🔥', url: 'https://particuliers.engie.fr', message: 'Gaz et Électricité', tags: ['énergie', 'gaz'], description: 'Services de gaz naturel et électricité', category: 'utilities' },
    { id: 'veolia', name: 'Eau (Veolia)', icon: '💧', url: 'https://www.service.eau.veolia.fr', message: 'Distribution d\'eau', tags: ['eau', 'factures'], description: 'Gestion de votre abonnement eau', category: 'utilities' },
    { id: 'orange', name: 'Orange', icon: '📡', url: 'https://www.orange.fr', message: 'Internet & Mobile', tags: ['telecom', 'box'], description: 'Gestion de vos forfaits et box', category: 'utilities' },
];

const CATEGORIES = [
    { id: 'all', label: 'Tout', icon: '🔍' },
    { id: 'public', label: 'Service Public', icon: '🇫🇷' },
    { id: 'health', label: 'Santé', icon: '❤️' },
    { id: 'finance', label: 'Finance', icon: '💰' },
    { id: 'utilities', label: 'Énergie & Box', icon: '🏠' },
];

interface MarketplaceProps {
    onInstall: (template: OrganismTemplate) => void;
    onClose: () => void;
}

export default function Marketplace({ onInstall, onClose }: MarketplaceProps) {
    const { showToast } = useToast();
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filtered = templates.filter(t => {
        const matchCategory = activeCategory === 'all' || t.category === activeCategory;
        const matchSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCategory && matchSearch;
    });

    return (
        <div className="glass-panel marketplace-container" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '80vh', maxWidth: '1000px', margin: '0 auto', border: '1px solid var(--primary)' }}>
            <style jsx global>{`
            @media (max-width: 768px) {
              .marketplace-body {
                flex-direction: column !important;
              }
              .marketplace-sidebar {
                width: 100% !important;
                border-right: none !important;
                border-bottom: 1px solid var(--card-border) !important;
                padding: 1rem !important;
              }
              .marketplace-sidebar-content {
                flex-direction: row !important;
                overflow-x: auto;
                padding-bottom: 0.5rem;
                gap: 0.5rem !important;
                -webkit-overflow-scrolling: touch;
              }
              .marketplace-sidebar-btn {
                white-space: nowrap;
                padding: 0.5rem 1rem !important;
                font-size: 0.9rem !important;
                flex-shrink: 0;
                background: var(--card-bg);
                border: 1px solid var(--card-border) !important;
              }
              .marketplace-container {
                 height: 100dvh !important; /* Use dvh for better mobile browser support */
                 border-radius: 0 !important;
                 max-width: none !important;
                 border: none !important;
                 margin: 0 !important;
              }
            }
      `}</style>

            {/* Header */}
            <div style={{ padding: '1.5rem', background: 'linear-gradient(to right, rgba(var(--primary-rgb), 0.1), transparent)', borderBottom: '1px solid var(--card-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            🏪 Service Store
                            <span style={{ fontSize: '0.8rem', background: 'var(--accent)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '99px' }}>BETA</span>
                        </h2>
                        <p style={{ color: 'var(--secondary)', margin: '0.5rem 0 0 0' }}>Découvrez et installez vos services essentiels en un clic.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="btn btn-secondary"
                        style={{ width: '40px', height: '40px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        ✕
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                        <input
                            type="text"
                            placeholder="Rechercher un service (ex: CAF, EDF...)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '99px', border: '1px solid var(--input-border)', background: 'var(--input-bg)', color: 'var(--foreground)' }}
                        />
                    </div>
                </div>
            </div>

            <div className="marketplace-body" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* Sidebar Categories */}
                <div className="marketplace-sidebar" style={{ width: '200px', padding: '1.5rem 1rem', borderRight: '1px solid var(--card-border)', overflowY: 'auto' }}>
                    <h3 style={{ fontSize: '0.9rem', color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>Catégories</h3>
                    <div className="marketplace-sidebar-content" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className="marketplace-sidebar-btn"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: activeCategory === cat.id ? 'var(--primary)' : 'transparent',
                                    color: activeCategory === cat.id ? 'white' : 'var(--foreground)',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.2s ease',
                                    fontWeight: activeCategory === cat.id ? 600 : 400
                                }}
                            >
                                <span>{cat.icon}</span>
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid Content */}
                <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', background: 'rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        <AnimatePresence mode="popLayout">
                            {filtered.map(item => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    style={{
                                        background: 'var(--card-bg)',
                                        borderRadius: '16px',
                                        padding: '1.5rem',
                                        border: '1px solid var(--card-border)',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '1rem',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                        <div style={{
                                            width: '60px',
                                            height: '60px',
                                            borderRadius: '16px',
                                            background: 'var(--form-bg)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '2rem',
                                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                                        }}>
                                            {item.icon}
                                        </div>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>{item.name}</h3>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--accent)', background: 'rgba(var(--accent-rgb), 0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                                                {CATEGORIES.find(c => c.id === item.category)?.label}
                                            </span>
                                        </div>
                                    </div>

                                    <p style={{ fontSize: '0.9rem', color: 'var(--secondary)', lineHeight: '1.5', flex: 1, margin: 0 }}>
                                        {item.description}
                                    </p>

                                    <button
                                        onClick={() => {
                                            onInstall(item);
                                            showToast(`${item.name} a été installé avec succès`, 'success');
                                        }}
                                        className="btn btn-primary"
                                        style={{ width: '100%', justifyContent: 'center', padding: '0.6rem', fontWeight: 600, background: 'linear-gradient(135deg, var(--primary), var(--accent))', border: 'none' }}
                                    >
                                        INSTALLER
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                    {filtered.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--secondary)' }}>
                            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🔦</span>
                            Aucun service trouvé pour "{searchQuery}"
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
