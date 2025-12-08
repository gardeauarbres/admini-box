'use client';

import { useState, useRef } from 'react';
import { useUploadAvatar, useUpdateProfile, useUserProfile } from '@/lib/queries';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { storage } from '@/lib/appwrite';
import LoadingSpinner from './LoadingSpinner';

interface AvatarUploadProps {
  currentAvatar?: string;
  onUploadComplete?: (avatarId: string) => void;
  size?: number;
}

export default function AvatarUpload({ currentAvatar, onUploadComplete, size = 120 }: AvatarUploadProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const uploadMutation = useUploadAvatar();
  const updateProfileMutation = useUpdateProfile();
  const { data: profile } = useUserProfile(user?.$id || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const getAvatarUrl = (avatarId?: string) => {
    if (!avatarId) return null;

    // Construire l'URL manuellement
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';

    // Utiliser documents_bucket car c'est celui qui existe (avatars n'a pas pu être créé)
    return `${endpoint}/storage/buckets/documents_bucket/files/${avatarId}/view?project=${projectId}`;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      showToast('Veuillez sélectionner une image', 'error');
      return;
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('L\'image est trop grande (max 5MB)', 'error');
      return;
    }

    // Afficher la prévisualisation
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    if (user) {
      uploadMutation.mutate(
        { userId: user.$id, file },
        {
          onSuccess: async (avatarId) => {
            // Mettre à jour le profil avec l'ID de l'avatar
            if (profile) {
              try {
                await updateProfileMutation.mutateAsync({
                  profileId: profile.$id,
                  userId: user.$id,
                  data: { avatar: avatarId },
                });
              } catch (error) {
                console.error('Failed to update profile with avatar:', error);
                showToast('Avatar uploadé mais erreur lors de la mise à jour du profil', 'info');
              }
            }

            showToast('Avatar mis à jour avec succès', 'success');
            if (onUploadComplete) {
              onUploadComplete(avatarId);
            }
            setPreview(null);
          },
          onError: (error) => {
            console.error('Upload failed:', error);
            showToast('Erreur lors de l\'upload de l\'avatar', 'error');
            setPreview(null);
          },
        }
      );
    }
  };

  const avatarUrl = preview || getAvatarUrl(currentAvatar);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: 'var(--card-bg)',
          border: '3px solid var(--card-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onClick={() => fileInputRef.current?.click()}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.borderColor = 'var(--primary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.borderColor = 'var(--card-border)';
        }}
      >
        {uploadMutation.isPending ? (
          <LoadingSpinner size="small" />
        ) : avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <div style={{
            fontSize: size * 0.4,
            color: 'var(--secondary)',
          }}>
            👤
          </div>
        )}

        {/* Overlay au survol */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            transition: 'opacity 0.2s ease',
            pointerEvents: 'none',
          }}
          className="avatar-overlay"
        >
          <span style={{ color: 'white', fontSize: '0.9rem', fontWeight: 600 }}>
            📷 Modifier
          </span>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      <style jsx>{`
        .avatar-overlay {
          opacity: 0;
        }
        div:hover .avatar-overlay {
          opacity: 1;
        }
      `}</style>

      <button
        onClick={() => fileInputRef.current?.click()}
        className="btn btn-secondary"
        style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
        disabled={uploadMutation.isPending}
      >
        {uploadMutation.isPending ? 'Upload...' : avatarUrl ? 'Changer la photo' : 'Ajouter une photo'}
      </button>
    </div>
  );
}

