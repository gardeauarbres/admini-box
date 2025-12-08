# 🚀 Proposition d'Optimisation de l'Éditeur de Documents

## Vue d'ensemble

Ce document présente plusieurs approches possibles pour optimiser l'éditeur de documents intégré dans AdminiBox, en proposant différentes variantes techniques pour chaque aspect de l'architecture. L'objectif est de fournir une base flexible permettant d'adapter l'implémentation selon les besoins spécifiques du projet.

---

## 📊 1. Architecture de Sauvegarde dans Appwrite

### Variante A : Collection dédiée + Storage séparé (Recommandée)

**Principe** : Séparer le contenu brut (collection) des exports formatés (Storage).

#### Structure de la collection `documents_editor`

```typescript
interface EditorDocument {
  $id: string;
  userId: string;
  title: string;
  content: string; // Contenu brut ou Markdown
  format: 'text' | 'markdown' | 'html'; // Format du contenu
  metadata: {
    wordCount: number;
    characterCount: number;
    paragraphCount: number;
    lastModified: string;
    version: number;
  };
  settings: {
    autoSave: boolean;
    autoSaveInterval: number; // en secondes
  };
  $createdAt: string;
  $updatedAt: string;
}
```

#### Avantages
- ✅ Contenu directement accessible via API
- ✅ Recherche full-text possible
- ✅ Métadonnées structurées
- ✅ Historique de versions facile à implémenter
- ✅ Storage utilisé uniquement pour les exports (PDF, DOCX, etc.)

#### Inconvénients
- ⚠️ Limite de taille des documents (Appwrite limite à ~1MB par document)
- ⚠️ Coût de stockage dans la base de données

#### Implémentation

```typescript
// lib/queries/editor.ts
export function useEditorDocument(documentId: string | null) {
  return useQuery({
    queryKey: ['editor-document', documentId],
    queryFn: async () => {
      if (!documentId) return null;
      const doc = await databases.getDocument(
        'adminibox_db',
        'documents_editor',
        documentId
      );
      return doc as EditorDocument;
    },
    enabled: !!documentId,
  });
}

export function useCreateEditorDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      userId: string;
      title: string;
      content: string;
      format?: 'text' | 'markdown' | 'html';
    }) => {
      return await databases.createDocument(
        'adminibox_db',
        'documents_editor',
        ID.unique(),
        {
          ...data,
          format: data.format || 'text',
          metadata: {
            wordCount: 0,
            characterCount: 0,
            paragraphCount: 0,
            lastModified: new Date().toISOString(),
            version: 1,
          },
          settings: {
            autoSave: true,
            autoSaveInterval: 30,
          },
        },
        [Permission.read(Role.user(data.userId)), Permission.write(Role.user(data.userId))]
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['editor-documents'] });
    },
  });
}

export function useUpdateEditorDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      documentId,
      updates,
      metadata,
    }: {
      documentId: string;
      updates: Partial<Pick<EditorDocument, 'title' | 'content' | 'format'>>;
      metadata?: Partial<EditorDocument['metadata']>;
    }) => {
      const currentDoc = await databases.getDocument(
        'adminibox_db',
        'documents_editor',
        documentId
      );
      
      return await databases.updateDocument(
        'adminibox_db',
        'documents_editor',
        documentId,
        {
          ...updates,
          metadata: {
            ...currentDoc.metadata,
            ...metadata,
            lastModified: new Date().toISOString(),
            version: (currentDoc.metadata.version || 1) + 1,
          },
        }
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['editor-document', variables.documentId] });
      queryClient.invalidateQueries({ queryKey: ['editor-documents'] });
    },
  });
}
```

---

### Variante B : Storage uniquement avec métadonnées en collection

**Principe** : Stocker le contenu dans Storage, métadonnées dans une collection.

#### Structure

```typescript
interface DocumentMetadata {
  $id: string;
  userId: string;
  title: string;
  fileId: string; // Référence au fichier dans Storage
  format: 'text' | 'markdown' | 'html';
  metadata: {
    wordCount: number;
    characterCount: number;
    size: number; // Taille du fichier
    lastModified: string;
  };
  $createdAt: string;
  $updatedAt: string;
}
```

#### Avantages
- ✅ Pas de limite de taille (Storage peut gérer de gros fichiers)
- ✅ Métadonnées légères en base
- ✅ Compatible avec l'architecture actuelle

#### Inconvénients
- ⚠️ Nécessite un download pour accéder au contenu
- ⚠️ Pas de recherche full-text native
- ⚠️ Plus complexe pour les mises à jour partielles

---

### Variante C : Hybride (Collection + Storage pour gros documents)

**Principe** : Collection pour documents < 500KB, Storage pour documents plus volumineux.

```typescript
interface EditorDocument {
  $id: string;
  userId: string;
  title: string;
  content?: string; // Si < 500KB
  fileId?: string; // Si >= 500KB
  storageType: 'collection' | 'storage';
  // ... reste identique
}
```

#### Avantages
- ✅ Flexibilité maximale
- ✅ Optimisé pour tous les cas d'usage

#### Inconvénients
- ⚠️ Logique plus complexe
- ⚠️ Nécessite une migration pour les documents existants

---

## ⏱️ 2. Stratégies d'Auto-sauvegarde

### Stratégie A : Debounce intelligent avec inactivité

**Principe** : Sauvegarder après X secondes d'inactivité, avec un maximum de Y secondes.

```typescript
function useIntelligentAutoSave(
  content: string,
  title: string,
  saveFn: (content: string, title: string) => Promise<void>,
  options: {
    inactivityDelay: number; // 5 secondes
    maxInterval: number; // 30 secondes
  } = { inactivityDelay: 5000, maxInterval: 30000 }
) {
  const lastActivityRef = useRef<number>(Date.now());
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const maxIntervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!content && !title) return;

    // Réinitialiser le timer d'inactivité
    const handleActivity = () => {
      lastActivityRef.current = Date.now();
      
      // Annuler le timer précédent
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Programmer une sauvegarde après l'inactivité
      saveTimeoutRef.current = setTimeout(() => {
        const timeSinceActivity = Date.now() - lastActivityRef.current;
        if (timeSinceActivity >= options.inactivityDelay) {
          saveFn(content, title);
        }
      }, options.inactivityDelay);
    };

    handleActivity();

    // Sauvegarde maximale toutes les X secondes
    if (maxIntervalRef.current) {
      clearInterval(maxIntervalRef.current);
    }
    
    maxIntervalRef.current = setInterval(() => {
      const timeSinceActivity = Date.now() - lastActivityRef.current;
      if (timeSinceActivity < options.maxInterval) {
        saveFn(content, title);
      }
    }, options.maxInterval);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (maxIntervalRef.current) clearInterval(maxIntervalRef.current);
    };
  }, [content, title, saveFn, options]);
}
```

#### Avantages
- ✅ Économise les requêtes (sauvegarde seulement après inactivité)
- ✅ Garantit une sauvegarde même en cas d'écriture continue
- ✅ Adaptatif au comportement utilisateur

---

### Stratégie B : Comparaison de contenu (Diff-based)

**Principe** : Sauvegarder uniquement si le contenu a réellement changé.

```typescript
function useDiffBasedAutoSave(
  content: string,
  title: string,
  saveFn: (content: string, title: string) => Promise<void>,
  interval: number = 30000
) {
  const lastSavedContentRef = useRef<string>('');
  const lastSavedTitleRef = useRef<string>('');

  useEffect(() => {
    if (!content && !title) return;

    const intervalId = setInterval(() => {
      const hasChanged = 
        content !== lastSavedContentRef.current ||
        title !== lastSavedTitleRef.current;

      if (hasChanged) {
        saveFn(content, title).then(() => {
          lastSavedContentRef.current = content;
          lastSavedTitleRef.current = title;
        });
      }
    }, interval);

    return () => clearInterval(intervalId);
  }, [content, title, saveFn, interval]);
}
```

#### Avantages
- ✅ Évite les sauvegardes inutiles
- ✅ Réduit la charge serveur
- ✅ Simple à implémenter

---

### Stratégie C : Adaptive interval (basé sur la taille)

**Principe** : Intervalle adaptatif selon la taille du document.

```typescript
function useAdaptiveAutoSave(
  content: string,
  title: string,
  saveFn: (content: string, title: string) => Promise<void>
) {
  const getInterval = useCallback((size: number) => {
    if (size < 1000) return 10000; // 10s pour petits documents
    if (size < 10000) return 30000; // 30s pour documents moyens
    return 60000; // 60s pour gros documents
  }, []);

  useEffect(() => {
    if (!content && !title) return;

    const size = content.length + title.length;
    const interval = getInterval(size);

    const intervalId = setInterval(() => {
      saveFn(content, title);
    }, interval);

    return () => clearInterval(intervalId);
  }, [content, title, saveFn, getInterval]);
}
```

#### Avantages
- ✅ Optimisé selon la taille
- ✅ Économise la bande passante pour gros documents

---

### Stratégie D : WebSocket pour sauvegarde temps réel (Avancé)

**Principe** : Utiliser WebSocket pour synchronisation temps réel (collaboration).

```typescript
// Nécessite un backend WebSocket ou Appwrite Realtime
function useRealtimeAutoSave(
  documentId: string,
  content: string,
  title: string
) {
  const { subscribe } = useAppwriteRealtime();
  
  useEffect(() => {
    if (!documentId) return;

    // Écouter les changements
    const unsubscribe = subscribe(
      `databases.adminibox_db.collections.documents_editor.documents.${documentId}`,
      (response) => {
        // Gérer les mises à jour distantes
      }
    );

    // Envoyer les changements avec debounce
    const debouncedSave = debounce((content: string, title: string) => {
      // Envoyer via WebSocket
    }, 2000);

    debouncedSave(content, title);

    return () => {
      unsubscribe();
      debouncedSave.cancel();
    };
  }, [documentId, content, title, subscribe]);
}
```

#### Avantages
- ✅ Synchronisation temps réel
- ✅ Support collaboration
- ✅ Expérience utilisateur fluide

#### Inconvénients
- ⚠️ Complexité accrue
- ⚠️ Nécessite infrastructure supplémentaire

---

## 🔄 3. Découpage État Local / État Distant avec React Query

### Architecture recommandée : Optimistic Updates + Cache

```typescript
// hooks/useEditor.ts
export function useEditor(documentId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // État local (non synchronisé)
  const [localContent, setLocalContent] = useState('');
  const [localTitle, setLocalTitle] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  // État distant (synchronisé via React Query)
  const { data: remoteDocument, isLoading } = useEditorDocument(documentId || null);
  const updateMutation = useUpdateEditorDocument();
  const createMutation = useCreateEditorDocument();

  // Synchronisation initiale
  useEffect(() => {
    if (remoteDocument && !isDirty) {
      setLocalContent(remoteDocument.content);
      setLocalTitle(remoteDocument.title);
    }
  }, [remoteDocument, isDirty]);

  // Détection de changements
  useEffect(() => {
    const hasChanged = 
      localContent !== remoteDocument?.content ||
      localTitle !== remoteDocument?.title;
    setIsDirty(hasChanged);
  }, [localContent, localTitle, remoteDocument]);

  // Sauvegarde avec optimistic update
  const save = useCallback(async () => {
    if (!documentId) {
      // Créer un nouveau document
      const newDoc = await createMutation.mutateAsync({
        userId: user!.$id,
        title: localTitle,
        content: localContent,
      });
      return newDoc.$id;
    } else {
      // Mettre à jour avec optimistic update
      const previousDoc = queryClient.getQueryData(['editor-document', documentId]);
      
      // Optimistic update
      queryClient.setQueryData(['editor-document', documentId], (old: any) => ({
        ...old,
        content: localContent,
        title: localTitle,
        metadata: {
          ...old.metadata,
          lastModified: new Date().toISOString(),
        },
      }));

      try {
        await updateMutation.mutateAsync({
          documentId,
          updates: { content: localContent, title: localTitle },
          metadata: calculateStats(localContent),
        });
        setIsDirty(false);
      } catch (error) {
        // Rollback en cas d'erreur
        queryClient.setQueryData(['editor-document', documentId], previousDoc);
        throw error;
      }
    }
  }, [documentId, localContent, localTitle, user, createMutation, updateMutation, queryClient]);

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
  };
}
```

### Variante : État unifié avec synchronisation automatique

```typescript
// hooks/useEditorUnified.ts
export function useEditorUnified(documentId?: string) {
  const { data: document } = useEditorDocument(documentId || null);
  const updateMutation = useUpdateEditorDocument();
  
  // État unifié : toujours synchronisé avec le cache React Query
  const content = document?.content || '';
  const title = document?.title || '';

  const updateContent = useCallback((newContent: string) => {
    if (!documentId) return;
    
    // Mise à jour optimiste immédiate
    queryClient.setQueryData(['editor-document', documentId], (old: any) => ({
      ...old,
      content: newContent,
    }));

    // Sauvegarde avec debounce
    debouncedSave(documentId, newContent);
  }, [documentId, queryClient]);

  return {
    content,
    title,
    updateContent,
    updateTitle: (newTitle: string) => { /* similaire */ },
  };
}
```

---

## 📈 4. Optimisation des Statistiques Textuelles

### Approche A : useMemo avec dépendances granulaires

```typescript
function useTextStats(content: string) {
  return useMemo(() => {
    if (!content.trim()) {
      return { words: 0, characters: 0, charactersNoSpaces: 0, paragraphs: 0 };
    }

    const words = content.trim().split(/\s+/).length;
    const characters = content.length;
    const charactersNoSpaces = content.replace(/\s/g, '').length;
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim()).length || 1;

    return { words, characters, charactersNoSpaces, paragraphs };
  }, [content]);
}
```

### Approche B : Web Worker pour gros documents

```typescript
// workers/textStats.worker.ts
self.onmessage = function(e) {
  const { content } = e.data;
  
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const characters = content.length;
  const charactersNoSpaces = content.replace(/\s/g, '').length;
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim()).length || 1;
  
  self.postMessage({ words, characters, charactersNoSpaces, paragraphs });
};

// hooks/useTextStatsWorker.ts
function useTextStatsWorker(content: string) {
  const [stats, setStats] = useState({ words: 0, characters: 0, charactersNoSpaces: 0, paragraphs: 0 });
  const workerRef = useRef<Worker>();

  useEffect(() => {
    workerRef.current = new Worker(new URL('../workers/textStats.worker.ts', import.meta.url));
    
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  useEffect(() => {
    if (!workerRef.current) return;

    const timeoutId = setTimeout(() => {
      workerRef.current?.postMessage({ content });
    }, 300); // Debounce de 300ms

    workerRef.current.onmessage = (e) => {
      setStats(e.data);
    };

    return () => clearTimeout(timeoutId);
  }, [content]);

  return stats;
}
```

### Approche C : Calcul incrémental (pour très gros documents)

```typescript
function useIncrementalTextStats(content: string) {
  const previousStatsRef = useRef({ words: 0, characters: 0, paragraphs: 0 });
  const previousContentRef = useRef('');

  return useMemo(() => {
    const previous = previousContentRef.current;
    
    // Si le contenu n'a pas beaucoup changé, calculer seulement la différence
    if (previous && Math.abs(content.length - previous.length) < 100) {
      // Calcul incrémental simplifié
      const diff = content.slice(previous.length);
      const newWords = diff.trim().split(/\s+/).filter(w => w).length;
      
      previousStatsRef.current = {
        words: previousStatsRef.current.words + newWords,
        characters: content.length,
        paragraphs: content.split(/\n\s*\n/).filter(p => p.trim()).length || 1,
      };
    } else {
      // Calcul complet
      const words = content.trim() ? content.trim().split(/\s+/).length : 0;
      const characters = content.length;
      const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim()).length || 1;
      
      previousStatsRef.current = { words, characters, paragraphs };
    }

    previousContentRef.current = content;
    return previousStatsRef.current;
  }, [content]);
}
```

---

## 💾 5. Amélioration du Système de Brouillon localStorage

### Approche A : Compression pour gros documents

```typescript
// lib/storage/compressedStorage.ts
import pako from 'pako'; // ou utiliser CompressionStream API native

export function saveCompressedDraft<T>(key: string, data: T): void {
  try {
    const serialized = JSON.stringify(data);
    
    // Compression pour documents > 10KB
    if (serialized.length > 10000) {
      const compressed = pako.deflate(serialized, { to: 'string' });
      localStorage.setItem(`${STORAGE_PREFIX}${key}_compressed`, compressed);
      localStorage.setItem(`${STORAGE_PREFIX}${key}_meta`, JSON.stringify({ compressed: true }));
    } else {
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, serialized);
      localStorage.removeItem(`${STORAGE_PREFIX}${key}_compressed`);
    }
  } catch (error) {
    console.error('Error saving compressed draft:', error);
  }
}

export function getCompressedDraft<T>(key: string, defaultValue: T): T {
  try {
    const meta = localStorage.getItem(`${STORAGE_PREFIX}${key}_meta`);
    
    if (meta && JSON.parse(meta).compressed) {
      const compressed = localStorage.getItem(`${STORAGE_PREFIX}${key}_compressed`);
      if (compressed) {
        const decompressed = pako.inflate(compressed, { to: 'string' });
        return JSON.parse(decompressed) as T;
      }
    } else {
      const item = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
      if (item) return JSON.parse(item) as T;
    }
  } catch (error) {
    console.error('Error reading compressed draft:', error);
  }
  
  return defaultValue;
}
```

### Approche B : IndexedDB pour gros documents

```typescript
// lib/storage/indexedDBStorage.ts
const DB_NAME = 'adminibox_drafts';
const DB_VERSION = 1;
const STORE_NAME = 'drafts';

async function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

export async function saveDraftToIndexedDB(key: string, data: any): Promise<void> {
  const db = await getDB();
  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  
  await store.put({
    id: key,
    data,
    timestamp: Date.now(),
  });
}

export async function getDraftFromIndexedDB<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const db = await getDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    const request = store.get(key);
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.data : defaultValue);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error reading from IndexedDB:', error);
    return defaultValue;
  }
}
```

### Approche C : Diff-based storage (sauvegarder seulement les changements)

```typescript
// lib/storage/diffStorage.ts
interface DraftDiff {
  baseVersion: number;
  diffs: Array<{
    position: number;
    deleted: number;
    inserted: string;
  }>;
  timestamp: number;
}

export function saveDraftDiff(key: string, newContent: string, oldContent: string): void {
  const diffs = calculateDiffs(oldContent, newContent);
  
  if (diffs.length === 0) return; // Pas de changements
  
  const existing = getFromStorage<DraftDiff>(`${key}_diff`, null);
  
  if (existing && diffs.length < newContent.length * 0.1) {
    // Sauvegarder seulement les diffs si < 10% du contenu
    saveToStorage(`${key}_diff`, {
      baseVersion: existing.baseVersion,
      diffs: [...existing.diffs, ...diffs],
      timestamp: Date.now(),
    });
  } else {
    // Sauvegarder le contenu complet
    saveToStorage(key, newContent);
  }
}

function calculateDiffs(oldText: string, newText: string): DraftDiff['diffs'] {
  // Implémentation simplifiée d'un diff algorithm
  // Pour production, utiliser une librairie comme 'diff' ou 'fast-diff'
  const diffs: DraftDiff['diffs'] = [];
  // ... logique de calcul des différences
  return diffs;
}
```

### Approche D : Stratégie hybride (localStorage + IndexedDB)

```typescript
// lib/storage/hybridStorage.ts
const STORAGE_THRESHOLD = 100 * 1024; // 100KB

export function saveDraftHybrid(key: string, data: any): void {
  const serialized = JSON.stringify(data);
  
  if (serialized.length > STORAGE_THRESHOLD) {
    // Utiliser IndexedDB pour gros documents
    saveDraftToIndexedDB(key, data);
    // Marquer dans localStorage
    saveToStorage(`${key}_storage_type`, 'indexeddb');
  } else {
    // Utiliser localStorage pour petits documents
    saveToStorage(key, data);
    saveToStorage(`${key}_storage_type`, 'localstorage');
  }
}

export async function getDraftHybrid<T>(key: string, defaultValue: T): Promise<T> {
  const storageType = getFromStorage<string>(`${key}_storage_type`, 'localstorage');
  
  if (storageType === 'indexeddb') {
    return await getDraftFromIndexedDB(key, defaultValue);
  } else {
    return getFromStorage(key, defaultValue);
  }
}
```

---

## 🔮 6. Préparation pour Fonctionnalités Futures

### A. Gestion de Versions

#### Structure de données

```typescript
interface DocumentVersion {
  $id: string;
  documentId: string;
  version: number;
  content: string;
  title: string;
  metadata: {
    wordCount: number;
    characterCount: number;
  };
  createdAt: string;
  createdBy: string;
  changeDescription?: string;
}

// Collection séparée pour les versions
const versionsCollection = 'document_versions';
```

#### Hooks React Query

```typescript
export function useDocumentVersions(documentId: string) {
  return useQuery({
    queryKey: ['document-versions', documentId],
    queryFn: async () => {
      const response = await databases.listDocuments(
        'adminibox_db',
        'document_versions',
        [Query.equal('documentId', documentId), Query.orderDesc('version')]
      );
      return response.documents as DocumentVersion[];
    },
    enabled: !!documentId,
  });
}

export function useCreateDocumentVersion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      documentId: string;
      content: string;
      title: string;
      changeDescription?: string;
    }) => {
      // Récupérer la version actuelle
      const currentDoc = await databases.getDocument(
        'adminibox_db',
        'documents_editor',
        data.documentId
      );
      
      const newVersion = (currentDoc.metadata.version || 0) + 1;
      
      // Créer la version
      await databases.createDocument(
        'adminibox_db',
        'document_versions',
        ID.unique(),
        {
          documentId: data.documentId,
          version: newVersion,
          content: data.content,
          title: data.title,
          metadata: calculateStats(data.content),
          changeDescription: data.changeDescription,
        }
      );
      
      return newVersion;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['document-versions', variables.documentId] });
    },
  });
}
```

### B. Support Markdown

#### Parser Markdown

```typescript
// lib/markdown/parser.ts
import { marked } from 'marked'; // ou 'remark' + 'rehype'

export function parseMarkdown(content: string): string {
  return marked.parse(content);
}

export function extractMarkdownMetadata(content: string): {
  hasHeaders: boolean;
  hasLinks: boolean;
  hasImages: boolean;
  codeBlocks: number;
} {
  // Analyse du contenu Markdown
  return {
    hasHeaders: /^#+\s/.test(content),
    hasLinks: /\[.*?\]\(.*?\)/.test(content),
    hasImages: /!\[.*?\]\(.*?\)/.test(content),
    codeBlocks: (content.match(/```/g) || []).length / 2,
  };
}
```

#### Éditeur Markdown avec prévisualisation

```typescript
// components/MarkdownEditor.tsx
export function MarkdownEditor({ content, onChange }: Props) {
  const [preview, setPreview] = useState('');
  
  useEffect(() => {
    const html = parseMarkdown(content);
    setPreview(html);
  }, [content]);
  
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      <textarea value={content} onChange={(e) => onChange(e.target.value)} />
      <div dangerouslySetInnerHTML={{ __html: preview }} />
    </div>
  );
}
```

### C. Formats d'Export

#### Architecture modulaire

```typescript
// lib/exports/exporters.ts
interface Exporter {
  name: string;
  extension: string;
  export: (document: EditorDocument) => Promise<Blob>;
}

class PDFExporter implements Exporter {
  name = 'PDF';
  extension = 'pdf';
  
  async export(document: EditorDocument): Promise<Blob> {
    // Utiliser jsPDF ou Puppeteer
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    doc.text(document.content, 10, 10);
    return doc.output('blob');
  }
}

class DOCXExporter implements Exporter {
  name = 'Word';
  extension = 'docx';
  
  async export(document: EditorDocument): Promise<Blob> {
    // Utiliser docx
    const { Document, Packer, Paragraph, TextRun } = await import('docx');
    const doc = new Document({
      sections: [{
        children: [new Paragraph({
          children: [new TextRun(document.content)],
        })],
      }],
    });
    return await Packer.toBlob(doc);
  }
}

class HTMLExporter implements Exporter {
  name = 'HTML';
  extension = 'html';
  
  async export(document: EditorDocument): Promise<Blob> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head><title>${document.title}</title></head>
        <body>${parseMarkdown(document.content)}</body>
      </html>
    `;
    return new Blob([html], { type: 'text/html' });
  }
}

export const exporters: Exporter[] = [
  new PDFExporter(),
  new DOCXExporter(),
  new HTMLExporter(),
];
```

#### Hook d'export

```typescript
export function useExportDocument() {
  const { showToast } = useToast();
  
  return useMutation({
    mutationFn: async ({
      document,
      format,
    }: {
      document: EditorDocument;
      format: 'pdf' | 'docx' | 'html';
    }) => {
      const exporter = exporters.find(e => e.extension === format);
      if (!exporter) throw new Error(`Format ${format} non supporté`);
      
      const blob = await exporter.export(document);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${document.title}.${exporter.extension}`;
      a.click();
      URL.revokeObjectURL(url);
      
      showToast(`Document exporté en ${exporter.name}`, 'success');
    },
  });
}
```

---

## 🎯 Recommandations Finales

### Architecture recommandée (équilibrée)

1. **Sauvegarde** : Variante A (Collection dédiée + Storage pour exports)
2. **Auto-sauvegarde** : Stratégie A (Debounce intelligent avec inactivité)
3. **État** : Architecture avec découpage local/distant (première approche)
4. **Statistiques** : Approche A (useMemo) pour la plupart des cas, B (Web Worker) pour documents > 100KB
5. **Brouillons** : Approche D (Hybride localStorage + IndexedDB)
6. **Futur** : Implémenter les structures de données pour versions dès le début

### Ordre d'implémentation suggéré

1. ✅ Migrer vers collection dédiée `documents_editor`
2. ✅ Implémenter debounce intelligent pour auto-sauvegarde
3. ✅ Optimiser les statistiques avec useMemo
4. ✅ Améliorer le système de brouillon (hybride)
5. 🔮 Ajouter support Markdown
6. 🔮 Implémenter gestion de versions
7. 🔮 Ajouter exports (PDF, DOCX, HTML)

---

*Document créé pour AdminiBox - Architecture flexible et évolutive*

