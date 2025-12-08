/**
 * Hook optimisé pour calculer les statistiques textuelles
 * Utilise useMemo pour éviter les recalculs inutiles
 */

import { useMemo } from 'react';

export interface TextStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  paragraphs: number;
}

export function useTextStats(content: string): TextStats {
  return useMemo(() => {
    if (!content.trim()) {
      return {
        words: 0,
        characters: 0,
        charactersNoSpaces: 0,
        paragraphs: 0,
      };
    }

    const words = content.trim().split(/\s+/).length;
    const characters = content.length;
    const charactersNoSpaces = content.replace(/\s/g, '').length;
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim()).length || 1;

    return {
      words,
      characters,
      charactersNoSpaces,
      paragraphs,
    };
  }, [content]);
}

