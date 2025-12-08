'use client';

import FileManager from '@/components/FileManager';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function DocumentsPage() {
    return (
        <ProtectedRoute>
            <div>
                <header style={{ marginBottom: '3rem' }}>
                    <h1 className="section-title">Gestion Documentaire (GDA)</h1>
                    <p style={{ color: 'var(--secondary)' }}>
                        Tous vos documents administratifs, centralisés et sécurisés.
                    </p>
                </header>

                <FileManager />
            </div>
        </ProtectedRoute>
    );
}
