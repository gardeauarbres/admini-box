/**
 * Système de cache pour les fonctionnalités IA
 * Évite les appels API redondants et réduit les coûts
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

const CACHE_DURATION = 1000 * 60 * 60; // 1 heure
const CACHE_PREFIX = 'ai_editor_cache_';

/**
 * Génère une clé de cache basée sur le texte et le type d'opération
 */
function getCacheKey(text: string, operation: string, options?: string): string {
  const textHash = text.slice(0, 50).replace(/\s+/g, '_');
  return `${CACHE_PREFIX}${operation}_${textHash}_${options || ''}`;
}

/**
 * Récupère une entrée du cache
 */
function getCached<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;

  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const entry: CacheEntry<T> = JSON.parse(cached);
    const now = Date.now();

    // Vérifier si le cache est expiré
    if (now > entry.expiresAt) {
      localStorage.removeItem(key);
      return null;
    }

    return entry.data;
  } catch (error) {
    console.error('Cache read error:', error);
    return null;
  }
}

/**
 * Stocke une entrée dans le cache
 */
function setCached<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;

  const entry: CacheEntry<T> = {
    data,
    timestamp: Date.now(),
    expiresAt: Date.now() + CACHE_DURATION,
  };

  try {

    localStorage.setItem(key, JSON.stringify(entry));
  } catch (error) {
    console.error('Cache write error:', error);
    // Si le localStorage est plein, nettoyer les anciennes entrées
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      clearOldCacheEntries();
      try {
        localStorage.setItem(key, JSON.stringify(entry));
      } catch {
        // Ignorer si ça échoue encore
      }
    }
  }
}

/**
 * Nettoie les anciennes entrées du cache
 */
function clearOldCacheEntries(): void {
  if (typeof window === 'undefined') return;

  const keys = Object.keys(localStorage);
  const now = Date.now();

  keys.forEach(key => {
    if (key.startsWith(CACHE_PREFIX)) {
      try {
        const cached = localStorage.getItem(key);
        if (cached) {
          const entry: CacheEntry<any> = JSON.parse(cached);
          if (now > entry.expiresAt) {
            localStorage.removeItem(key);
          }
        }
      } catch {
        localStorage.removeItem(key);
      }
    }
  });
}

/**
 * Vérifie le cache avant d'appeler l'API
 */
export async function withCache<T>(
  operation: string,
  text: string,
  options: string | undefined,
  apiCall: () => Promise<T>
): Promise<T> {
  const cacheKey = getCacheKey(text, operation, options);

  // Vérifier le cache
  const cached = getCached<T>(cacheKey);
  if (cached !== null) {
    console.log(`Cache hit for ${operation}`);
    return cached;
  }

  // Appel API
  console.log(`Cache miss for ${operation}, calling API...`);
  const result = await apiCall();

  // Mettre en cache
  setCached(cacheKey, result);

  return result;
}

/**
 * Nettoie tout le cache IA
 */
export function clearAICache(): void {
  if (typeof window === 'undefined') return;

  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith(CACHE_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
}

/**
 * Obtient la taille du cache
 */
export function getCacheSize(): number {
  if (typeof window === 'undefined') return 0;

  const keys = Object.keys(localStorage);
  return keys.filter(key => key.startsWith(CACHE_PREFIX)).length;
}

