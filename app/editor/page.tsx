'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SimpleEditor from '@/components/SimpleEditor';
import EditorDocumentList from '@/components/EditorDocumentList';
import ProtectedRoute from '@/components/ProtectedRoute';

function EditorContent() {
    const [selectedDocumentId, setSelectedDocumentId] = useState<string | undefined>(undefined);
    const [showList, setShowList] = useState(true);

    // Gestion des paramètres URL pour pré-remplissage via Voice Assistant
    const searchParams = useSearchParams();
    const [initialData, setInitialData] = useState<{ title?: string, content?: string }>({});

    useEffect(() => {
        const organism = searchParams.get('organism');
        const action = searchParams.get('action');

        if (action === 'create' || organism) {
            setShowList(false);
            if (organism) {
                const formattedOrg = organism.charAt(0).toUpperCase() + organism.slice(1);
                setInitialData({
                    title: `Courrier pour ${formattedOrg}`,
                    content: `Objet : Demande de renseignements\n\nMadame, Monsieur,\n\nJe me permets de vous contacter concernant mon dossier auprès de ${formattedOrg}.\n\n Cordialement,\n`
                });
            }
        }
    }, [searchParams]);

    const handleSelectDocument = (documentId: string) => {
        setSelectedDocumentId(documentId);
        setShowList(false);
    };

    const handleNewDocument = () => {
        setSelectedDocumentId(undefined);
        setShowList(false);
        setInitialData({});
    };

    const handleBackToList = () => {
        setShowList(true);
        setSelectedDocumentId(undefined);
    };

    return (
        <div>
            <header style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 className="section-title">Éditeur de Documents (EDO)</h1>
                        <p style={{ color: 'var(--secondary)' }}>
                            Créez et gérez vos courriers et documents officiels.
                        </p>
                    </div>
                    {!showList && (
                        <button
                            onClick={handleBackToList}
                            className="btn btn-secondary"
                            style={{ padding: '0.5rem 1rem' }}
                        >
                            ← Retour à la liste
                        </button>
                    )}
                </div>
            </header>

            {showList ? (
                <EditorDocumentList
                    onSelectDocument={handleSelectDocument}
                    onNewDocument={handleNewDocument}
                />
            ) : (
                <SimpleEditor
                    documentId={selectedDocumentId}
                    initialTitle={initialData.title}
                    initialContent={initialData.content}
                    onDocumentCreated={(documentId) => {
                        setSelectedDocumentId(documentId);
                        showList && setShowList(false);
                    }}
                />
            )}
        </div>
    );
}

export default function EditorPage() {
    return (
        <ProtectedRoute>
            <Suspense fallback={<div className="glass-panel p-8 text-center">Chargement de l'éditeur...</div>}>
                <EditorContent />
            </Suspense>
        </ProtectedRoute>
    );
}
