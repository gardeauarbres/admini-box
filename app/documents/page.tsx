'use client';

import { useState } from 'react';
import FileManager from '@/components/FileManager';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function DocumentsPage() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    return (
        <ProtectedRoute>
            <div>
                <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 className="section-title">Gestion Documentaire (GDA)</h1>
                        <p style={{ color: 'var(--secondary)' }}>
                            Tous vos documents administratifs, centralisés et sécurisés.
                        </p>
                    </div>

                    <div style={{
                        background: 'var(--card-bg)',
                        padding: '0.25rem',
                        borderRadius: 'var(--radius)',
                        border: '1px solid var(--card-border)',
                        display: 'flex',
                        gap: '0.25rem'
                    }}>
                        <button
                            onClick={() => setViewMode('grid')}
                            style={{
                                padding: '0.5rem',
                                borderRadius: 'calc(var(--radius) - 4px)',
                                border: 'none',
                                background: viewMode === 'grid' ? 'var(--primary)' : 'transparent',
                                color: viewMode === 'grid' ? 'white' : 'var(--secondary)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '40px',
                                height: '40px'
                            }}
                            title="Vue Grille"
                        >
                            <span style={{ fontSize: '1.2rem' }}>🔲</span>
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            style={{
                                padding: '0.5rem',
                                borderRadius: 'calc(var(--radius) - 4px)',
                                border: 'none',
                                background: viewMode === 'list' ? 'var(--primary)' : 'transparent',
                                color: viewMode === 'list' ? 'white' : 'var(--secondary)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '40px',
                                height: '40px'
                            }}
                            title="Vue Liste"
                        >
                            <span style={{ fontSize: '1.2rem' }}>≣</span>
                        </button>
                    </div>
                </header>

                <FileManager viewMode={viewMode} />
            </div>
        </ProtectedRoute>
    );
}
