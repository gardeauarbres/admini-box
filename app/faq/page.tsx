'use client';

import React, { useState } from 'react';
import NeonCard from '@/components/NeonCard';
import { motion, AnimatePresence } from 'framer-motion';

const faqData = [
    {
        category: 'Général',
        questions: [
            { q: "Qu'est-ce qu'AdminiBox ?", a: "AdminiBox est votre assistant administratif personnel tout-en-un. Il centralise vos documents, gère vos courriers, et utilise l'IA pour simplifier vos démarches." },
            { q: "Est-ce gratuit ?", a: "Nous proposons une version gratuite complète. Une version Premium existe pour les utilisateurs avancés nécessitant plus de stockage et des fonctionnalités IA illimitées." },
        ]
    },
    {
        category: 'Fonctionnalités',
        questions: [
            { q: "Comment fonctionne le scanner intelligent ?", a: "Il suffit de prendre en photo ou d'uploader un reçu. Notre IA analyse l'image, extrait le marchand, la date et le montant, et catégorise automatiquement la dépense." },
            { q: "Mes données bancaires sont-elles sécurisées ?", a: "Absolument. Nous utilisons un cryptage de niveau bancaire et ne stockons jamais vos identifiants bancaires en clair." },
        ]
    },
    {
        category: 'Compte',
        questions: [
            { q: "Comment supprimer mon compte ?", a: "Vous pouvez demander la suppression de votre compte et de toutes vos données depuis la page 'Mon Profil' > 'Zone de danger'." },
            { q: "Puis-je exporter mes données ?", a: "Oui, vous pouvez à tout moment exporter vos transactions et documents au format CSV ou ZIP." },
        ]
    }
];

export default function FAQPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [openIndex, setOpenIndex] = useState<{ cat: number, q: number } | null>(null);

    const filteredFAQs = faqData.map(section => ({
        ...section,
        questions: section.questions.filter(item =>
            item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.a.toLowerCase().includes(searchTerm.toLowerCase())
        )
    })).filter(section => section.questions.length > 0);

    return (
        <div style={{ padding: '2rem 1rem', paddingBottom: '4rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1 className="section-title" style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '3rem', textShadow: '0 0 20px rgba(0, 243, 255, 0.5)' }}>
                Foire Aux Questions
            </h1>

            <div style={{ marginBottom: '3rem', position: 'relative' }}>
                <input
                    type="text"
                    placeholder="🔍 Posez votre question..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '1.5rem',
                        paddingLeft: '3.5rem',
                        fontSize: '1.2rem',
                        background: 'rgba(0,0,0,0.5)',
                        border: '1px solid cyan',
                        borderRadius: '12px',
                        color: 'white',
                        boxShadow: '0 0 15px rgba(0, 243, 255, 0.2)',
                        backdropFilter: 'blur(5px)'
                    }}
                />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {filteredFAQs.length > 0 ? (
                    filteredFAQs.map((section, sIndex) => (
                        <NeonCard key={sIndex} color={sIndex % 2 === 0 ? 'cyan' : 'magenta'} glowIntensity="low">
                            <h2 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem', opacity: 0.9 }}>{section.category}</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {section.questions.map((item, qIndex) => {
                                    const isOpen = openIndex?.cat === sIndex && openIndex?.q === qIndex;
                                    return (
                                        <div
                                            key={qIndex}
                                            style={{
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '8px',
                                                overflow: 'hidden',
                                                background: isOpen ? 'rgba(255,255,255,0.05)' : 'transparent',
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            <button
                                                onClick={() => setOpenIndex(isOpen ? null : { cat: sIndex, q: qIndex })}
                                                style={{
                                                    width: '100%',
                                                    padding: '1.25rem',
                                                    textAlign: 'left',
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: 'white',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    fontSize: '1.1rem',
                                                    fontWeight: 500
                                                }}
                                            >
                                                <span>{item.q}</span>
                                                <span style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}>▼</span>
                                            </button>
                                            <AnimatePresence>
                                                {isOpen && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        style={{ overflow: 'hidden' }}
                                                    >
                                                        <div style={{ padding: '0 1.25rem 1.25rem 1.25rem', opacity: 0.8, lineHeight: '1.6' }}>
                                                            {item.a}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                })}
                            </div>
                        </NeonCard>
                    ))
                ) : (
                    <div style={{ textAlign: 'center', padding: '4rem', opacity: 0.7 }}>
                        <h3>Aucun résultat trouvé pour "{searchTerm}" 🕵️‍♂️</h3>
                        <p>Essayez avec d'autres mots-clés.</p>
                    </div>
                )}
            </div>

            <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                <p style={{ marginBottom: '1rem' }}>Vous ne trouvez pas votre réponse ?</p>
                <a href="mailto:support@gardeauarbres.fr" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
                    Contactez le Support
                </a>
            </div>
        </div>
    );
}
