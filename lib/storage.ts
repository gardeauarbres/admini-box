/**
 * Utilitaires pour le stockage local (localStorage)
 */

const STORAGE_PREFIX = 'adminibox_';

/**
 * Sauvegarde une valeur dans localStorage
 */
export function saveToStorage<T>(key: string, value: T): void {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, serialized);
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

/**
 * Récupère une valeur depuis localStorage
 */
export function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    if (typeof window === 'undefined') return defaultValue;
    const item = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
}

/**
 * Supprime une clé de localStorage
 */
export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
}

/**
 * Vide tout le storage de l'application
 */
export function clearStorage(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
}

/**
 * Sauvegarde automatique des données de formulaire
 */
export function saveFormDraft<T>(formId: string, data: T): void {
  saveToStorage(`form_draft_${formId}`, {
    data,
    timestamp: Date.now()
  });
}

/**
 * Récupère un brouillon de formulaire
 */
export function getFormDraft<T>(formId: string): T | null {
  const draft = getFromStorage<{ data: T; timestamp: number } | null>(
    `form_draft_${formId}`,
    null
  );
  
  if (!draft) return null;
  
  // Supprimer les brouillons de plus de 7 jours
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  if (draft.timestamp < sevenDaysAgo) {
    removeFromStorage(`form_draft_${formId}`);
    return null;
  }
  
  return draft.data;
}

/**
 * Supprime un brouillon de formulaire
 */
export function clearFormDraft(formId: string): void {
  removeFromStorage(`form_draft_${formId}`);
}

