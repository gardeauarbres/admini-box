'use client';

import { useState } from 'react';
import SimpleEditor from '@/components/SimpleEditor';
import EditorDocumentList from '@/components/EditorDocumentList';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function EditorPage() {
    const [selectedDocumentId, setSelectedDocumentId] = useState<string | undefined>(undefined);
    const [showList, setShowList] = useState(true);

    const handleSelectDocument = (documentId: string) => {
        setSelectedDocumentId(documentId);
        setShowList(false);
    };

    const handleNewDocument = () => {
        setSelectedDocumentId(undefined);
        setShowList(false);
    };

    const handleBackToList = () => {
        setShowList(true);
        setSelectedDocumentId(undefined);
    };

    return (
        <ProtectedRoute>
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
                        onDocumentCreated={(documentId) => {
                            setSelectedDocumentId(documentId);
                            showList && setShowList(false);
                        }}
                    />
                )}
            </div>
        </ProtectedRoute>
    );
}
