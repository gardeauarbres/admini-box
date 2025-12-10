import React from 'react';
import NeonCard from '@/components/NeonCard';

export default function MentionsPage() {
    return (
        <NeonCard color="violet" glowIntensity="medium">
            <h2 style={{ marginTop: 0, fontSize: '2rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                Mentions Légales
            </h2>

            <div style={{ lineHeight: '1.7', color: 'rgba(255,255,255,0.9)' }}>
                <h3>Éditeur du site</h3>
                <p>
                    Le site <strong>Gard Eau Arbres</strong> est édité par :<br /><br />
                    <strong>GARD EAU ARBRES</strong><br />
                    Association déclarée (loi 1901)<br />
                    <strong>SIREN</strong> : 894 676 790<br />
                    <strong>SIRET (siège)</strong> : 894 676 790 00013<br />
                    <strong>Catégorie juridique</strong> : 9220 – Association déclarée<br />
                    <strong>Code APE</strong> : 9499Z – Autres organisations fonctionnant par adhésion volontaire<br />
                    <strong>Appartenance ESS</strong> : Oui<br />
                    <strong>Siège social</strong> : Thémines, Lot (46), France<br />
                    <strong>Directeur de la publication</strong> : Ramon Alain (Président)
                </p>

                <h3>Hébergement</h3>
                <p>
                    Le site est hébergé par :<br />
                    <strong>Vercel Inc.</strong><br />
                    340 S Lemon Ave #4133<br />
                    Walnut, CA 91789<br />
                    USA<br />
                    Site : <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>https://vercel.com</a>
                </p>

                <h3>Propriété Intellectuelle</h3>
                <p>
                    L’ensemble du site, de son code source, de ses outils, de ses contenus (textes, images, vidéos, logos, audios, radio, IA, documents) est protégé par les législations françaises et internationales relatives au droit d’auteur et à la propriété intellectuelle.
                </p>
                <p>
                    Toute reproduction, diffusion, modification ou exploitation, même partielle, sans autorisation écrite préalable de Gard Eau Arbres est strictement interdite.
                </p>

                <div style={{ background: 'rgba(157, 0, 255, 0.1)', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #9d00ff', marginTop: '2rem' }}>
                    <strong>Contact :</strong> contact@gardeauarbres.fr
                </div>
            </div>
        </NeonCard >
    );
}
