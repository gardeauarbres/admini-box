'use client';

import { useState } from 'react';
import { databases } from '@/lib/appwrite';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ID, Permission, Role } from 'appwrite';
import { useRouter } from 'next/navigation';

export default function AddOrganismsPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const router = useRouter();

    const addMissingOrganisms = async () => {
        if (!user) {
            setMessage('Vous devez être connecté');
            return;
        }

        setLoading(true);
        setMessage('Ajout des organismes...');

        const newOrganisms = [
            { name: 'AMELI', status: 'ok', message: 'Tout est à jour', url: 'https://www.ameli.fr' },
            { name: 'URSSAF', status: 'warning', message: 'Déclaration mensuelle à venir', url: 'https://www.urssaf.fr' },
        ];

        try {
            for (const org of newOrganisms) {
                await databases.createDocument(
                    'adminibox_db',
                    'organisms',
                    ID.unique(),
                    {
                        name: org.name,
                        status: org.status,
                        message: org.message,
                        url: org.url,
                        userId: user.$id
                    },
                    [
                        Permission.read(Role.user(user.$id)),
                        Permission.write(Role.user(user.$id)),
                        Permission.update(Role.user(user.$id)),
                        Permission.delete(Role.user(user.$id)),
                    ]
                );
            }

            setMessage('✅ AMELI et URSSAF ajoutés avec succès !');
            setTimeout(() => {
                router.push('/');
            }, 2000);
        } catch (error) {
            console.error('Error adding organisms:', error);
            setMessage('❌ Erreur lors de l\'ajout. Ils existent peut-être déjà.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute>
            <div style={{ maxWidth: '600px', margin: '4rem auto' }} className="glass-panel">
                <div style={{ padding: '2rem' }}>
                    <h1 className="section-title" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        Ajouter AMELI et URSSAF
                    </h1>

                    <p style={{ color: 'var(--secondary)', marginBottom: '2rem', textAlign: 'center' }}>
                        Cette page permet d'ajouter les nouveaux organismes (AMELI et URSSAF) à votre compte existant.
                    </p>

                    {message && (
                        <div style={{
                            background: message.includes('✅') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                            color: message.includes('✅') ? 'var(--success)' : 'var(--danger)',
                            padding: '1rem',
                            borderRadius: 'var(--radius)',
                            marginBottom: '1rem',
                            textAlign: 'center'
                        }}>
                            {message}
                        </div>
                    )}

                    <button
                        onClick={addMissingOrganisms}
                        disabled={loading}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '1rem' }}
                    >
                        {loading ? 'Ajout en cours...' : 'Ajouter AMELI et URSSAF'}
                    </button>

                    <button
                        onClick={() => router.push('/')}
                        className="btn btn-secondary"
                        style={{ width: '100%', padding: '1rem', marginTop: '1rem' }}
                    >
                        Retour au tableau de bord
                    </button>
                </div>
            </div>
        </ProtectedRoute>
    );
}
