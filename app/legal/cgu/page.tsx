import React from 'react';
import NeonCard from '@/components/NeonCard';

export default function CGUPage() {
    return (
        <NeonCard color="cyan" glowIntensity="medium">
            <h2 style={{ marginTop: 0, fontSize: '2rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                Conditions Générales d'Utilisation (CGU)
            </h2>

            <div style={{ lineHeight: '1.7', color: 'rgba(255,255,255,0.9)' }}>
                <h3>1. Acceptation</h3>
                <p>
                    L'utilisation d'<strong>AdminiBox</strong> implique l'acceptation pleine et entière des présentes CGU.
                </p>

                <h3>2. Services</h3>
                <p>
                    AdminiBox fournit des outils de gestion administrative, d'archivage numérique et d'assistance par IA.
                    Le service est fourni "tel quel" sans garantie de disponibilité permanente.
                </p>

                <h3>3. Responsabilité</h3>
                <p>
                    L'utilisateur est seul responsable de la véracité des documents qu'il produit ou archive via AdminiBox.
                    AdminiBox ne saurait se substituer à un conseiller juridique ou comptable.
                </p>

                <h3>4. Propriété Intellectuelle</h3>
                <p>
                    Tous les éléments de l'application (code, design, logo) sont la propriété exclusive de <strong>Gard Eau Arbres</strong>.
                </p>

                <div style={{ background: 'rgba(0, 243, 255, 0.1)', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid cyan', marginTop: '2rem' }}>
                    <strong>Version :</strong> 1.0 (Décembre 2025)
                </div>
            </div>
        </NeonCard>
    );
}
