/**
 * Système de stockage hybride pour les brouillons
 * Utilise localStorage pour petits documents et IndexedDB pour gros documents
 */

const STORAGE_PREFIX = 'adminibox_';
const STORAGE_THRESHOLD = 100 * 1024; // 100KB

/**
 * Vérifie si IndexedDB est disponible
 */
function isIndexedDBAvailable(): boolean {
  return typeof window !== 'undefined' && 'indexedDB' in window;
}

/**
 * Sauvegarde dans IndexedDB
 */
async function saveToIndexedDB(key: string, data: any): Promise<void> {
  if (!isIndexedDBAvailable()) {
    throw new Error('IndexedDB not available');
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open('adminibox_drafts', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['drafts'], 'readwrite');
      const store = transaction.objectStore('drafts');

      const draftData = {
        id: key,
        data,
        timestamp: Date.now(),
      };

      const putRequest = store.put(draftData);
      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(putRequest.error);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('drafts')) {
        db.createObjectStore('drafts', { keyPath: 'id' });
      }
    };
  });
}

/**
 * Récupère depuis IndexedDB
 */
async function getFromIndexedDB<T>(key: string, defaultValue: T): Promise<T> {
  if (!isIndexedDBAvailable()) {
    return defaultValue;
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open('adminibox_drafts', 1);

    request.onerror = () => resolve(defaultValue);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['drafts'], 'readonly');
      const store = transaction.objectStore('drafts');
      const getRequest = store.get(key);

      getRequest.onsuccess = () => {
        const result = getRequest.result;
        resolve(result ? result.data : defaultValue);
      };
      getRequest.onerror = () => resolve(defaultValue);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('drafts')) {
        db.createObjectStore('drafts', { keyPath: 'id' });
      }
    };
  });
}

/**
 * Sauvegarde hybride : localStorage pour petits documents, IndexedDB pour gros
 */
export function saveDraftHybrid(key: string, data: any): void {
  try {
    const serialized = JSON.stringify(data);
    const size = new Blob([serialized]).size;

    if (size > STORAGE_THRESHOLD && isIndexedDBAvailable()) {
      // Utiliser IndexedDB pour gros documents
      saveToIndexedDB(key, data).then(() => {
        // Marquer dans localStorage
        localStorage.setItem(`${STORAGE_PREFIX}${key}_storage_type`, 'indexeddb');
      }).catch((error) => {
        console.error('Error saving to IndexedDB, falling back to localStorage:', error);
        // Fallback vers localStorage
        localStorage.setItem(`${STORAGE_PREFIX}${key}`, serialized);
        localStorage.setItem(`${STORAGE_PREFIX}${key}_storage_type`, 'localstorage');
      });
    } else {
      // Utiliser localStorage pour petits documents
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, serialized);
      localStorage.setItem(`${STORAGE_PREFIX}${key}_storage_type`, 'localstorage');
    }
  } catch (error) {
    console.error('Error saving draft:', error);
  }
}

/**
 * Récupère depuis le stockage hybride
 */
export async function getDraftHybrid<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const storageType = localStorage.getItem(`${STORAGE_PREFIX}${key}_storage_type`);

    if (storageType === 'indexeddb' && isIndexedDBAvailable()) {
      return await getFromIndexedDB(key, defaultValue);
    } else {
      // localStorage ou fallback
      const item = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
      if (item) {
        return JSON.parse(item) as T;
      }
    }
  } catch (error) {
    console.error('Error reading draft:', error);
  }

  return defaultValue;
}

/**
 * Supprime un brouillon du stockage hybride
 */
export function removeDraftHybrid(key: string): void {
  try {
    const storageType = localStorage.getItem(`${STORAGE_PREFIX}${key}_storage_type`);
    
    if (storageType === 'indexeddb' && isIndexedDBAvailable()) {
      // Supprimer d'IndexedDB
      const request = indexedDB.open('adminibox_drafts', 1);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['drafts'], 'readwrite');
        const store = transaction.objectStore('drafts');
        store.delete(key);
      };
    }
    
    // Supprimer de localStorage
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
    localStorage.removeItem(`${STORAGE_PREFIX}${key}_storage_type`);
  } catch (error) {
    console.error('Error removing draft:', error);
  }
}

