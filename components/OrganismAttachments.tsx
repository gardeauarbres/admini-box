'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { storage } from '@/lib/appwrite';
import { ID, Permission, Role } from 'appwrite';
import { formatDate, formatFileSize } from '@/lib/utils';
import LoadingSpinner from './LoadingSpinner';

interface Attachment {
  id: string;
  name: string;
  fileId: string;
  size: number;
  type: string;
  uploadedAt: string;
  userId: string;
}

interface OrganismAttachmentsProps {
  organismId: string;
  attachments?: string; // Attachments stockés comme string JSON dans Appwrite
  onUpdateAttachments: (attachments: Attachment[]) => void;
}

export default function OrganismAttachments({ organismId, attachments, onUpdateAttachments }: OrganismAttachmentsProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [localAttachments, setLocalAttachments] = useState<Attachment[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [uploading, setUploading] = useState(false);

  const attachmentsRef = useRef<string | undefined>(attachments);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    // Ne charger qu'une seule fois au montage ou si attachments change vraiment
    const currentAttachmentsStr = attachments || '';
    const previousAttachmentsStr = attachmentsRef.current || '';
    
    if (currentAttachmentsStr !== previousAttachmentsStr || !hasInitializedRef.current) {
      attachmentsRef.current = attachments;
      hasInitializedRef.current = true;
      
      // Charger les pièces jointes depuis le string JSON
      if (attachments) {
        try {
          const parsed = JSON.parse(attachments);
          const parsedArray = Array.isArray(parsed) ? parsed : [];
          // Utiliser une fonction de mise à jour pour éviter les dépendances
          setLocalAttachments(prev => {
            const prevStr = JSON.stringify(prev);
            const newStr = JSON.stringify(parsedArray);
            return prevStr === newStr ? prev : parsedArray;
          });
        } catch {
          setLocalAttachments(prev => prev.length > 0 ? [] : prev);
        }
      } else {
        setLocalAttachments(prev => prev.length > 0 ? [] : prev);
      }
    }
  }, [attachments]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Vérifier la taille (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      showToast('Le fichier est trop volumineux (max 10MB)', 'error');
      return;
    }

    setUploading(true);

    try {
      // Upload vers Appwrite Storage
      const response = await storage.createFile(
        'documents_bucket',
        ID.unique(),
        file,
        [
          Permission.read(Role.user(user.$id)),
          Permission.write(Role.user(user.$id)),
          Permission.update(Role.user(user.$id)),
          Permission.delete(Role.user(user.$id)),
        ]
      );

      const attachment: Attachment = {
        id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        fileId: response.$id,
        size: file.size,
        type: file.type || 'application/octet-stream',
        uploadedAt: new Date().toISOString(),
        userId: user.$id,
      };

      const updatedAttachments = [attachment, ...localAttachments];
      setLocalAttachments(updatedAttachments);
      
      // Utiliser setTimeout pour éviter les mises à jour synchrones qui causent des boucles
      setTimeout(() => {
        onUpdateAttachments(updatedAttachments);
      }, 0);
      
      showToast('Pièce jointe ajoutée avec succès', 'success');
    } catch (error) {
      console.error('Upload failed:', error);
      showToast('Erreur lors de l\'upload de la pièce jointe', 'error');
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleDownload = async (attachment: Attachment) => {
    try {
      const url = storage.getFileDownload('documents_bucket', attachment.fileId);
      window.open(url.toString(), '_blank');
    } catch (error) {
      console.error('Download failed:', error);
      showToast('Erreur lors du téléchargement', 'error');
    }
  };

  const handleDelete = async (attachmentId: string) => {
    if (!confirm('Supprimer cette pièce jointe ?')) return;

    const attachment = localAttachments.find(a => a.id === attachmentId);
    if (!attachment) return;

    try {
      // Supprimer le fichier de Storage
      await storage.deleteFile('documents_bucket', attachment.fileId);
      
      // Mettre à jour la liste locale
      const updatedAttachments = localAttachments.filter(a => a.id !== attachmentId);
      setLocalAttachments(updatedAttachments);
      
      // Utiliser setTimeout pour éviter les mises à jour synchrones qui causent des boucles
      setTimeout(() => {
        onUpdateAttachments(updatedAttachments);
      }, 0);
      
      showToast('Pièce jointe supprimée', 'success');
    } catch (error) {
      console.error('Delete failed:', error);
      showToast('Erreur lors de la suppression', 'error');
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
    if (type.includes('zip') || type.includes('rar')) return '📦';
    return '📎';
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          📎 Pièces jointes ({localAttachments.length})
        </h4>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="btn btn-secondary"
          style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
        >
          {isExpanded ? 'Réduire' : 'Voir'}
        </button>
      </div>

      {isExpanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Upload */}
          <div>
            <label
              htmlFor={`file-upload-${organismId}`}
              className="btn btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                cursor: uploading ? 'not-allowed' : 'pointer',
                opacity: uploading ? 0.6 : 1,
              }}
            >
              {uploading ? (
                <>
                  <LoadingSpinner size="small" />
                  Upload...
                </>
              ) : (
                <>
                  📤 Ajouter un fichier
                </>
              )}
            </label>
            <input
              id={`file-upload-${organismId}`}
              type="file"
              onChange={handleFileUpload}
              disabled={uploading}
              style={{ display: 'none' }}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginTop: '0.25rem' }}>
              Taille max : 10MB
            </p>
          </div>

          {/* Liste des pièces jointes */}
          {localAttachments.length === 0 ? (
            <div style={{ 
              padding: '1rem', 
              textAlign: 'center', 
              color: 'var(--secondary)', 
              fontSize: '0.85rem',
              fontStyle: 'italic'
            }}>
              Aucune pièce jointe pour le moment
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
              {localAttachments.map((attachment) => (
                <div
                  key={attachment.id}
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius)',
                    background: 'var(--form-bg)',
                    border: '1px solid var(--card-border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>{getFileIcon(attachment.type)}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      fontSize: '0.85rem', 
                      fontWeight: 500,
                      color: 'var(--foreground)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {attachment.name}
                    </div>
                    <div style={{ 
                      fontSize: '0.75rem', 
                      color: 'var(--secondary)',
                      display: 'flex',
                      gap: '0.5rem',
                      marginTop: '0.25rem'
                    }}>
                      <span>{formatFileSize(attachment.size)}</span>
                      <span>•</span>
                      <span>{formatDate(attachment.uploadedAt)}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleDownload(attachment)}
                      className="btn btn-secondary"
                      style={{ 
                        fontSize: '0.7rem', 
                        padding: '0.25rem 0.5rem',
                        background: 'var(--primary)20',
                        color: 'var(--primary)',
                        border: 'none'
                      }}
                      title="Télécharger"
                    >
                      ⬇️
                    </button>
                    <button
                      onClick={() => handleDelete(attachment.id)}
                      className="btn btn-secondary"
                      style={{ 
                        fontSize: '0.7rem', 
                        padding: '0.25rem 0.5rem',
                        background: 'var(--danger)20',
                        color: 'var(--danger)',
                        border: 'none'
                      }}
                      title="Supprimer"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

