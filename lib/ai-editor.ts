/**
 * Fonctions utilitaires pour les fonctionnalités IA de l'éditeur (via Groq)
 */

import { withCache } from './ai-editor-cache';

export interface AIResponse {
  texte_principal: string;
  variantes?: string[];
  meta?: {
    organisme?: string | null;
    type_document?: string | null;
    urgence?: string | null;
    date_echeance?: string | null;
    montant?: number | null;
    actions_recommandees?: string[];
  };
  commentaires?: string[];
}

async function callAI(payload: any): Promise<AIResponse> {
  const response = await fetch('/api/ai/groq', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erreur API IA');
  }

  return response.json();
}

/**
 * Corriger l'orthographe et la grammaire
 */
export async function correctText(text: string): Promise<{ correctedText: string; changes: boolean }> {
  return withCache('correct', text, undefined, async () => {
    const result = await callAI({
      mode: 'corriger',
      contenu: text,
      lang: 'fr'
    });

    return {
      correctedText: result.texte_principal,
      changes: result.texte_principal !== text
    };
  });
}

/**
 * Améliorer le style
 */
export async function improveText(
  text: string,
  style: 'professional' | 'simple' | 'clear' | 'concise' = 'professional'
): Promise<{ improvedText: string }> {
  return withCache('improve', text, style, async () => {
    let context = "Amélioration standard";
    if (style === 'professional') context = "Rendre le ton plus professionnel et administratif.";
    if (style === 'simple') context = "Simplifier le langage pour être compris de tous.";
    if (style === 'clear') context = "Clarifier le propos, éviter les ambiguïtés.";
    if (style === 'concise') context = "Raccourcir et aller à l'essentiel.";

    const result = await callAI({
      mode: style === 'professional' ? 'formaliser' : 'ameliorer',
      contenu: text,
      contexte: context,
      lang: 'fr'
    });

    return { improvedText: result.texte_principal };
  });
}

/**
 * Générer un résumé
 */
export async function summarizeText(
  text: string,
  length: 'short' | 'medium' | 'detailed' = 'medium'
): Promise<{ summary: string }> {
  return withCache('summarize', text, length, async () => {
    const result = await callAI({
      mode: 'resumer',
      contenu: text,
      contexte: `Longueur souhaitée : ${length}`,
      lang: 'fr'
    });

    return { summary: result.texte_principal };
  });
}

/**
 * Traduire le texte (via le mode ameliorer/contexte car pas de mode traduire explicite dans le prompt user, 
 * mais l'IA peut le faire si demandé en contexte)
 */
export async function translateText(
  text: string,
  targetLanguage: string
): Promise<{ translatedText: string }> {
  return withCache('translate', text, targetLanguage, async () => {
    const result = await callAI({
      mode: 'ameliorer', // On utilise ameliorer pour réécrire
      contenu: text,
      contexte: `Traduis ce texte en ${targetLanguage}. Garde le ton administratif.`,
      lang: targetLanguage // Indication de la langue de sortie
    });

    return { translatedText: result.texte_principal };
  });
}

/**
 * Vérifier si l'IA est configurée
 */
export async function checkAIConfiguration(): Promise<boolean> {
  try {
    const response = await fetch('/api/ai/groq');
    const data = await response.json();
    return data.status === 'configured';
  } catch {
    return false;
  }
}


