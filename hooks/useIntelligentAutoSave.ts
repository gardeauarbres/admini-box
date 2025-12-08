/**
 * Hook pour l'auto-sauvegarde intelligente avec debounce et inactivité
 * Basé sur la stratégie A de la proposition d'optimisation
 */

import { useEffect, useRef } from 'react';

interface UseIntelligentAutoSaveOptions {
  content: string;
  title: string;
  saveFn: (content: string, title: string) => Promise<void>;
  inactivityDelay?: number; // Délai après inactivité (ms)
  maxInterval?: number; // Intervalle maximum (ms)
  enabled?: boolean;
}

export function useIntelligentAutoSave({
  content,
  title,
  saveFn,
  inactivityDelay = 5000, // 5 secondes
  maxInterval = 30000, // 30 secondes
  enabled = true,
}: UseIntelligentAutoSaveOptions) {
  const lastActivityRef = useRef<number>(Date.now());
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const maxIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isSavingRef = useRef(false);

  useEffect(() => {
    if (!enabled || !content || !title) {
      // Nettoyer les timers si désactivé ou contenu vide
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (maxIntervalRef.current) clearInterval(maxIntervalRef.current);
      return;
    }

    // Mettre à jour le timestamp d'activité
    const handleActivity = () => {
      lastActivityRef.current = Date.now();

      // Annuler le timer précédent
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Programmer une sauvegarde après l'inactivité
      saveTimeoutRef.current = setTimeout(async () => {
        const timeSinceActivity = Date.now() - lastActivityRef.current;
        if (timeSinceActivity >= inactivityDelay && !isSavingRef.current) {
          isSavingRef.current = true;
          try {
            await saveFn(content, title);
          } catch (error) {
            console.error('Auto-save failed:', error);
          } finally {
            isSavingRef.current = false;
          }
        }
      }, inactivityDelay);
    };

    handleActivity();

    // Sauvegarde maximale toutes les X secondes (même si l'utilisateur écrit continuellement)
    if (maxIntervalRef.current) {
      clearInterval(maxIntervalRef.current);
    }

    maxIntervalRef.current = setInterval(async () => {
      const timeSinceActivity = Date.now() - lastActivityRef.current;
      if (timeSinceActivity < maxInterval && !isSavingRef.current) {
        isSavingRef.current = true;
        try {
          await saveFn(content, title);
        } catch (error) {
          console.error('Auto-save failed:', error);
        } finally {
          isSavingRef.current = false;
        }
      }
    }, maxInterval);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (maxIntervalRef.current) clearInterval(maxIntervalRef.current);
    };
  }, [content, title, saveFn, inactivityDelay, maxInterval, enabled]);
}

