import React from 'react';
import NeonCard from '@/components/NeonCard';

export default function MentionsPage() {
    return (
        <NeonCard color="violet" glowIntensity="medium">
            <h2 style={{ marginTop: 0, fontSize: '2rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                Mentions Légales
            </h2>

            <div style={{ lineHeight: '1.7', color: 'rgba(255,255,255,0.9)' }}>
                <h3>Éditeur</h3>
                <p>
                    Le site <strong>AdminiBox</strong> est édité par :<br />
                    <strong>Gard Eau Arbres</strong> (Association / Entreprise)<br />
                    Siège social : [Adresse Postale]<br />
                    SIRET : [Numéro SIRET]<br />
                    Directeur de la publication : [Nom du Directeur]
                </p>

                <h3>Hébergement</h3>
                <p>
                    Le site est hébergé par :<br />
                    <strong>Vercel Inc.</strong><br />
                    340 S Lemon Ave #4133<br />
                    Walnut, CA 91789<br />
                    USA
                </p>

                <h3>Propriété Intellectuelle</h3>
                <p>
                    L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle.
                    Tous les droits de reproduction sont réservés.
                </p>

                <div style={{ background: 'rgba(157, 0, 255, 0.1)', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #9d00ff', marginTop: '2rem' }}>
                    <strong>Contact :</strong> contact@gardeauarbres.fr
                </div>
            </div>
        </NeonCard>
    );
}
