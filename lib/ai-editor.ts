/**
 * Fonctions utilitaires pour les fonctionnalités IA de l'éditeur
 */

import { withCache } from './ai-editor-cache';

export interface AICorrectResponse {
  success: boolean;
  originalText: string;
  correctedText: string;
  changes: boolean;
}

export interface AIImproveResponse {
  success: boolean;
  originalText: string;
  improvedText: string;
  style: string;
}

export interface AISummarizeResponse {
  success: boolean;
  originalLength: number;
  summary: string;
  length: string;
  reduction: number;
}

export interface AITranslateResponse {
  success: boolean;
  originalText: string;
  translatedText: string;
  targetLanguage: string;
}

/**
 * Corriger l'orthographe et la grammaire
 */
export async function correctText(text: string): Promise<AICorrectResponse> {
  return withCache('correct', text, undefined, async () => {
    const response = await fetch('/api/ai/correct', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.error || 'Erreur lors de la correction';
      const error = new Error(errorMessage);
      (error as any).status = response.status;
      (error as any).details = errorData;
      throw error;
    }

    return response.json();
  });
}

/**
 * Améliorer le style
 */
export async function improveText(
  text: string,
  style: 'professional' | 'simple' | 'clear' | 'concise' = 'professional'
): Promise<AIImproveResponse> {
  return withCache('improve', text, style, async () => {
    const response = await fetch('/api/ai/improve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, style }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.error || 'Erreur lors de l\'amélioration';
      const error = new Error(errorMessage);
      (error as any).status = response.status;
      (error as any).details = errorData;
      throw error;
    }

    return response.json();
  });
}

/**
 * Générer un résumé
 */
export async function summarizeText(
  text: string,
  length: 'short' | 'medium' | 'detailed' = 'medium'
): Promise<AISummarizeResponse> {
  return withCache('summarize', text, length, async () => {
    const response = await fetch('/api/ai/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, length }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.error || 'Erreur lors du résumé';
      const error = new Error(errorMessage);
      (error as any).status = response.status;
      (error as any).details = errorData;
      throw error;
    }

    return response.json();
  });
}

/**
 * Traduire le texte
 */
export async function translateText(
  text: string,
  targetLanguage: string = 'anglais'
): Promise<AITranslateResponse> {
  return withCache('translate', text, targetLanguage, async () => {
    const response = await fetch('/api/ai/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetLanguage }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.error || 'Erreur lors de la traduction';
      const error = new Error(errorMessage);
      (error as any).status = response.status;
      (error as any).details = errorData;
      throw error;
    }

    return response.json();
  });
}

/**
 * Vérifier si OpenAI est configuré
 */
export async function checkAIConfiguration(): Promise<boolean> {
  try {
    const response = await fetch('/api/ai/correct');
    const data = await response.json();
    return data.status === 'configured';
  } catch {
    return false;
  }
}

