'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useEditorDocuments, useDeleteEditorDocument } from '@/lib/queries';
import { useToast } from '@/context/ToastContext';
import LoadingSpinner from './LoadingSpinner';
import { formatDate } from '@/lib/utils';

interface EditorDocumentListProps {
  onSelectDocument?: (documentId: string) => void;
  onNewDocument?: () => void;
}

export default function EditorDocumentList({ onSelectDocument, onNewDocument }: EditorDocumentListProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { data: documents = [], isLoading } = useEditorDocuments(user?.$id || null);
  const deleteMutation = useDeleteEditorDocument();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDocuments = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (documentId: string, title: string) => {
    if (!confirm(`Supprimer le document "${title}" ?`)) return;
    
    if (!user) return;
    
    try {
      await deleteMutation.mutateAsync({ documentId, userId: user.$id });
      showToast('Document supprimé avec succès', 'success');
    } catch (error) {
      console.error('Error deleting document:', error);
      const errorMessage = (error as Error).message;
      if (errorMessage.includes('non autorisé')) {
        showToast('Vous n\'avez pas le droit de supprimer ce document', 'error');
      } else {
        showToast('Erreur lors de la suppression', 'error');
      }
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Chargement des documents..." />;
  }

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>Mes Documents</h2>
        {onNewDocument && (
          <button
            onClick={onNewDocument}
            className="btn btn-primary"
            style={{ padding: '0.5rem 1rem' }}
          >
            + Nouveau document
          </button>
        )}
      </div>

      {documents.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="🔍 Rechercher un document..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: 'var(--radius)',
              background: 'var(--input-bg)',
              border: '1px solid var(--card-border)',
              color: 'var(--foreground)',
              fontSize: '0.9rem'
            }}
          />
        </div>
      )}

      {documents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--secondary)' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Aucun document</p>
          <p style={{ fontSize: '0.9rem' }}>Créez votre premier document pour commencer</p>
          {onNewDocument && (
            <button
              onClick={onNewDocument}
              className="btn btn-primary"
              style={{ marginTop: '1rem', padding: '0.75rem 1.5rem' }}
            >
              Créer un document
            </button>
          )}
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--secondary)' }}>
          <p>Aucun document ne correspond à votre recherche</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredDocuments.map((doc) => (
            <div
              key={doc.$id}
              className="glass-panel"
              style={{
                padding: '1.5rem',
                cursor: onSelectDocument ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
                border: '1px solid var(--card-border)',
              }}
              onClick={() => onSelectDocument?.(doc.$id)}
              onMouseEnter={(e) => {
                if (onSelectDocument) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (onSelectDocument) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--foreground)' }}>
                    {doc.title || 'Sans titre'}
                  </h3>
                  <p style={{ 
                    fontSize: '0.85rem', 
                    color: 'var(--secondary)', 
                    marginBottom: '0.75rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {doc.content.substring(0, 150)}...
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.75rem', color: 'var(--secondary)' }}>
                    <span>📝 {doc.metadata?.wordCount || 0} mots</span>
                    <span>📅 {formatDate(doc.$updatedAt || doc.$createdAt)}</span>
                    {doc.format && (
                      <span style={{ 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '4px', 
                        background: 'var(--button-secondary-bg)',
                        fontSize: '0.7rem'
                      }}>
                        {doc.format.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {onSelectDocument && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDocument(doc.$id);
                      }}
                      className="btn btn-secondary"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                      title="Ouvrir"
                    >
                      ✏️ Ouvrir
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(doc.$id, doc.title);
                    }}
                    className="btn btn-danger"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                    title="Supprimer"
                    disabled={deleteMutation.isPending}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

