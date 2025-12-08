'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { storage } from '@/lib/appwrite';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useDocuments, useCreateDocument, useDeleteDocument } from '@/lib/queries';
import Pagination from './Pagination';
import LoadingSpinner from './LoadingSpinner';
import { exportDocumentsToCSV } from '@/lib/export';

const FileManager: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [filter, setFilter] = useState('Tous');
    const [searchQuery, setSearchQuery] = useState('');
    const [uploading, setUploading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // React Query hooks
    const { data: files = [], isLoading } = useDocuments(user?.$id || null);
    const createMutation = useCreateDocument();
    const deleteMutation = useDeleteDocument();

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0] || !user) return;

        const file = e.target.files[0];
        setUploading(true);

        try {
            await createMutation.mutateAsync({
                userId: user.$id,
                file,
                metadata: {
                    name: file.name,
                    date: new Date().toISOString().split('T')[0],
                    organism: 'Autre', // Default, should be selectable
                    type: 'Document',
                    size: (file.size / 1024).toFixed(2) + ' KB',
                }
            });

            showToast('Document uploadé avec succès', 'success');
        } catch (error) {
            console.error('Upload failed:', error);
            showToast('Échec de l\'upload', 'error');
        } finally {
            setUploading(false);
            // Reset input
            e.target.value = '';
        }
    };

    const handleDownload = async (fileId: string) => {
        try {
            const result = storage.getFileDownload('documents_bucket', fileId);
            window.open(result, '_blank');
        } catch (error) {
            console.error('Download failed:', error);
            showToast('Erreur lors du téléchargement', 'error');
        }
    };

    const handleDelete = useCallback(async (docId: string, fileId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ?') || !user) return;

        try {
            await deleteMutation.mutateAsync({ docId, fileId, userId: user.$id });
            showToast('Document supprimé avec succès', 'success');
        } catch (error) {
            console.error('Delete failed:', error);
            showToast('Erreur lors de la suppression', 'error');
        }
    }, [user, deleteMutation, showToast]);

    const organisms = ['Tous', ...Array.from(new Set(files.map(f => f.organism)))];

    // Filtrage et recherche optimisé
    const filteredFiles = useMemo(() => {
        const lowerSearch = searchQuery.toLowerCase();
        return files.filter(f => {
            const matchesSearch = searchQuery === '' || 
                f.name.toLowerCase().includes(lowerSearch) ||
                f.organism.toLowerCase().includes(lowerSearch);
            const matchesFilter = filter === 'Tous' || f.organism === filter;
            return matchesSearch && matchesFilter;
        });
    }, [files, searchQuery, filter]);

    // Pagination optimisée
    const paginationData = useMemo(() => {
        const totalPages = Math.ceil(filteredFiles.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedFiles = filteredFiles.slice(startIndex, endIndex);
        return { totalPages, paginatedFiles };
    }, [filteredFiles, currentPage, itemsPerPage]);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filter]);

    const handleExport = useCallback(() => {
        exportDocumentsToCSV(files);
        showToast('Export CSV réussi', 'success');
    }, [files, showToast]);

    if (isLoading) return <LoadingSpinner message="Chargement des documents..." />;

    return (
        <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                    {organisms.map(org => (
                        <button
                            key={org}
                            onClick={() => setFilter(org)}
                            className={`btn ${filter === org ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                        >
                            {org}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="file"
                            onChange={handleUpload}
                            style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                            disabled={uploading || createMutation.isPending}
                        />
                        <button className="btn btn-primary" disabled={uploading || createMutation.isPending}>
                            <span style={{ marginRight: '0.5rem' }}>{uploading || createMutation.isPending ? '...' : '+'}</span>
                            {uploading || createMutation.isPending ? 'Envoi...' : 'Ajouter un document'}
                        </button>
                    </div>
                    {files.length > 0 && (
                        <button 
                            onClick={handleExport} 
                            className="btn btn-secondary"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            title="Exporter les documents en CSV"
                        >
                            📥 Exporter CSV
                        </button>
                    )}
                </div>
            </div>

            {/* Barre de recherche */}
            {files.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <input
                        type="text"
                        placeholder="🔍 Rechercher un document..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: 'var(--radius)',
                            background: 'var(--form-bg)',
                            border: '1px solid var(--card-border)',
                            color: 'var(--foreground)',
                            fontSize: '0.9rem'
                        }}
                    />
                </div>
            )}

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--card-border)', textAlign: 'left' }}>
                            <th style={{ padding: '1rem', color: 'var(--secondary)' }}>Nom du fichier</th>
                            <th style={{ padding: '1rem', color: 'var(--secondary)' }}>Organisme</th>
                            <th style={{ padding: '1rem', color: 'var(--secondary)' }}>Date</th>
                            <th style={{ padding: '1rem', color: 'var(--secondary)' }}>Taille</th>
                            <th style={{ padding: '1rem', color: 'var(--secondary)' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginationData.paginatedFiles.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--secondary)' }}>
                                    {files.length === 0 
                                        ? 'Aucun document enregistré'
                                        : 'Aucun document ne correspond à votre recherche'
                                    }
                                </td>
                            </tr>
                        ) : (
                            paginationData.paginatedFiles.map(file => (
                            <tr key={file.$id} style={{ borderBottom: '1px solid var(--card-border)' }}>
                                <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <span style={{ fontSize: '1.5rem' }}>📄</span>
                                    {file.name}
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '4px',
                                        background: 'var(--form-bg)',
                                        fontSize: '0.85rem'
                                    }}>
                                        {file.organism}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem', color: 'var(--secondary)' }}>{file.date}</td>
                                <td style={{ padding: '1rem', color: 'var(--secondary)' }}>{file.size}</td>
                                <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => handleDownload(file.fileId)}
                                        className="btn btn-secondary"
                                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                                    >
                                        Voir
                                    </button>
                                    <button
                                        onClick={() => handleDelete(file.$id, file.fileId)}
                                        className="btn btn-secondary"
                                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                                        disabled={deleteMutation.isPending}
                                    >
                                        Suppr.
                                    </button>
                                </td>
                            </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {paginationData.totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={paginationData.totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={filteredFiles.length}
                />
            )}

            {(searchQuery || filter !== 'Tous') && filteredFiles.length > 0 && (
                <div style={{ marginTop: '1rem', textAlign: 'center', color: 'var(--secondary)', fontSize: '0.9rem' }}>
                    {filteredFiles.length} document{filteredFiles.length > 1 ? 's' : ''} trouvé{filteredFiles.length > 1 ? 's' : ''} sur {files.length}
                </div>
            )}
        </div>
    );
};

export default FileManager;
