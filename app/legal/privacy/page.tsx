import React from 'react';
import NeonCard from '@/components/NeonCard';

export default function PrivacyPage() {
    return (
        <NeonCard color="magenta" glowIntensity="medium">
            <h2 style={{ marginTop: 0, fontSize: '2rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                Politique de Confidentialité
            </h2>

            <div style={{ lineHeight: '1.7', color: 'rgba(255,255,255,0.9)' }}>
                <h3>1. Introduction</h3>
                <p>
                    Chez <strong>AdminiBox</strong>, la confidentialité de vos données est notre priorité absolue.
                    Nous traitons vos documents administratifs avec le plus haut niveau de sécurité.
                </p>

                <h3>2. Collecte des Données</h3>
                <p>
                    Nous collectons uniquement les informations nécessaires au bon fonctionnement du service :
                </p>
                <ul>
                    <li>Informations de compte (email, nom).</li>
                    <li>Documents uploadés (stockés de manière cryptée).</li>
                    <li>Statistiques d'utilisation anonymisées.</li>
                </ul>

                <h3>3. Utilisation de l'IA</h3>
                <p>
                    L'analyse de vos reçus et documents par notre IA (Groq) se fait via des sessions sécurisées et éphémères.
                    Vos données personnelles ne sont <strong>JAMAIS</strong> utilisées pour entraîner les modèles d'IA.
                </p>

                <h3>4. Vos Droits</h3>
                <p>
                    Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données.
                    Vous pouvez exercer ces droits directement depuis votre espace "Mon Profil".
                </p>

                <div style={{ background: 'rgba(255,0,255,0.1)', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid magenta', marginTop: '2rem' }}>
                    <strong>Contact DPO :</strong> privacy@gardeauarbres.fr
                </div>
            </div>
        </NeonCard>
    );
}
