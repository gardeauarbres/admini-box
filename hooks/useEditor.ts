/**
 * Hook principal pour gérer l'état de l'éditeur
 * Gère la synchronisation entre l'état local et l'état distant
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  useEditorDocument,
  useCreateEditorDocument,
  useUpdateEditorDocument,
  type EditorDocumentMetadata,
} from '@/lib/queries';
import { useQueryClient } from '@tanstack/react-query';

interface UseEditorOptions {
  documentId?: string;
  autoSave?: boolean;
  autoSaveInterval?: number;
  format?: 'text' | 'markdown' | 'html';
}

export function useEditor(options: UseEditorOptions = {}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { documentId, autoSave = true, autoSaveInterval = 30000, format: initialFormat } = options;

  // État local (non synchronisé immédiatement)
  const [localContent, setLocalContent] = useState('');
  const [localTitle, setLocalTitle] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const lastSavedRef = useRef<{ content: string; title: string }>({ content: '', title: '' });

  // État distant (synchronisé via React Query)
  const { data: remoteDocument, isLoading } = useEditorDocument(documentId || null, user?.$id || null);
  const updateMutation = useUpdateEditorDocument();
  const createMutation = useCreateEditorDocument();

  // Synchronisation initiale depuis le document distant
  useEffect(() => {
    if (remoteDocument && !isDirty) {
      setLocalContent(remoteDocument.content || '');
      setLocalTitle(remoteDocument.title || '');
      lastSavedRef.current = {
        content: remoteDocument.content || '',
        title: remoteDocument.title || '',
      };
    }
  }, [remoteDocument, isDirty]);

  // Détection de changements
  useEffect(() => {
    const hasChanged =
      localContent !== (remoteDocument?.content || '') ||
      localTitle !== (remoteDocument?.title || '');
    setIsDirty(hasChanged);
  }, [localContent, localTitle, remoteDocument]);

  // Calcul des statistiques
  const calculateStats = useCallback((content: string): EditorDocumentMetadata => {
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const characters = content.length;
    const charactersNoSpaces = content.replace(/\s/g, '').length;
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim()).length || 1;

    return {
      wordCount: words,
      characterCount: characters,
      paragraphCount: paragraphs,
      lastModified: new Date().toISOString(),
      version: remoteDocument?.metadata?.version || 1,
    };
  }, [remoteDocument]);

  // Sauvegarde avec optimistic update
  const save = useCallback(async () => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    if (!localTitle.trim() || !localContent.trim()) {
      throw new Error('Title and content are required');
    }

    if (!documentId) {
      // Créer un nouveau document
      const stats = calculateStats(localContent);
      const newDoc = await createMutation.mutateAsync({
        userId: user.$id,
        title: localTitle,
        content: localContent,
        format: initialFormat || 'text',
        metadata: stats,
      });
      
      lastSavedRef.current = { content: localContent, title: localTitle };
      setIsDirty(false);
      
      return newDoc.$id;
    } else {
      // Mettre à jour avec optimistic update
      const previousDoc = queryClient.getQueryData(['editor-document', documentId]);

      // Optimistic update
      queryClient.setQueryData(['editor-document', documentId], (old: any) => {
        if (!old) return old;
        const stats = calculateStats(localContent);
        return {
          ...old,
          content: localContent,
          title: localTitle,
          metadata: {
            ...old.metadata,
            ...stats,
          },
        };
      });

      try {
        const stats = calculateStats(localContent);
        await updateMutation.mutateAsync({
          documentId,
          userId: user.$id, // Ajouter userId pour vérification de sécurité
          updates: { 
            content: localContent, 
            title: localTitle,
            format: initialFormat || remoteDocument?.format || 'text',
          },
          metadata: stats,
        });
        
        lastSavedRef.current = { content: localContent, title: localTitle };
        setIsDirty(false);
      } catch (error) {
        // Rollback en cas d'erreur
        queryClient.setQueryData(['editor-document', documentId], previousDoc);
        throw error;
      }
    }
  }, [
    documentId,
    localContent,
    localTitle,
    user,
    createMutation,
    updateMutation,
    queryClient,
    calculateStats,
  ]);

  return {
    // État local
    localContent,
    setLocalContent,
    localTitle,
    setLocalTitle,
    isDirty,

    // État distant
    remoteDocument,
    isLoading,

    // Actions
    save,
    isSaving: updateMutation.isPending || createMutation.isPending,

    // Métadonnées
    metadata: remoteDocument?.metadata,
    settings: remoteDocument?.settings,
  };
}

