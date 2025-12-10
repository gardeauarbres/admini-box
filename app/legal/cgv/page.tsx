import React from 'react';
import NeonCard from '@/components/NeonCard';

export default function CGVPage() {
    return (
        <NeonCard color="lime" glowIntensity="medium">
            <h2 style={{ marginTop: 0, fontSize: '2rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                Conditions Générales de Vente (CGV)
            </h2>

            <div style={{ lineHeight: '1.7', color: 'rgba(255,255,255,0.9)' }}>
                <h3>1. Abonnements</h3>
                <p>
                    AdminiBox propose des abonnements mensuels et annuels ("Premium").
                    Le paiement est dû d'avance au début de chaque période.
                </p>

                <h3>2. Tarifs</h3>
                <p>
                    Les prix sont indiqués en Euros TTC. AdminiBox se réserve le droit de modifier ses tarifs avec un préavis de 30 jours.
                </p>

                <h3>3. Rétractation</h3>
                <p>
                    Conformément à la loi, vous disposez de 14 jours pour vous rétracter après la souscription d'un abonnement,
                    sauf si vous avez commencé à utiliser le service (ex: génération de documents Premium).
                </p>

                <h3>4. Résiliation</h3>
                <p>
                    Vous pouvez résilier votre abonnement à tout moment depuis votre espace client.
                    La résiliation prend effet à la fin de la période payée en cours.
                </p>

                <div style={{ background: 'rgba(0, 255, 65, 0.1)', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #00ff41', marginTop: '2rem' }}>
                    <strong>Support Client :</strong> support@gardeauarbres.fr
                </div>
            </div>
        </NeonCard>
    );
}
