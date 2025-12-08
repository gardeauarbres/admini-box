# 🔧 Corrections Prioritaires - Guide de Fix

## 1. ✅ CRITIQUE - Variables d'environnement Appwrite

### Étape 1: Créer `.env.local`

```bash
# .env.local
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT=692989fe0009e92c88b9
```

### Étape 2: Modifier `lib/appwrite.ts`

```typescript
import { Client, Account, Databases, Storage } from 'appwrite';

export const client = new Client();

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;

if (!endpoint || !projectId) {
    throw new Error('Missing Appwrite environment variables');
}

client
    .setEndpoint(endpoint)
    .setProject(projectId);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
```

### Étape 3: Ajouter `.env.local` au `.gitignore`

```gitignore
# .env files
.env.local
.env*.local
```

---

## 2. ✅ CRITIQUE - Protection des Routes

### Créer `middleware.ts` à la racine

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Routes publiques
    const publicRoutes = ['/login', '/register'];
    const { pathname } = request.nextUrl;

    // Si c'est une route publique, laisser passer
    if (publicRoutes.includes(pathname)) {
        return NextResponse.next();
    }

    // Vérifier le cookie de session Appwrite
    const sessionCookie = request.cookies.get('a_session_692989fe0009e92c88b9');
    
    // Si pas de session et route protégée, rediriger vers login
    if (!sessionCookie && !publicRoutes.includes(pathname)) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
```

### Alternative: HOC pour les pages

Créer `components/ProtectedRoute.tsx`:

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Chargement...</div>;
    }

    if (!user) {
        return null;
    }

    return <>{children}</>;
}
```

Puis l'utiliser dans les pages protégées:

```typescript
import ProtectedRoute from '@/components/ProtectedRoute';

export default function DocumentsPage() {
    return (
        <ProtectedRoute>
            {/* Contenu de la page */}
        </ProtectedRoute>
    );
}
```

---

## 3. ✅ IMPORTANT - Corriger les `@ts-ignore`

### Dans `app/page.tsx`

**Avant:**
```typescript
// @ts-ignore
const docs = response.documents as Organism[];
```

**Après:**
```typescript
const docs = response.documents as unknown as Organism[];
// Ou mieux, définir le type de réponse Appwrite
```

### Type correct pour les réponses Appwrite

Créer `types/appwrite.ts`:

```typescript
import { Models } from 'appwrite';

export interface AppwriteDocument<T> extends Models.Document {
    [key: string]: any;
}

export interface AppwriteListResponse<T> {
    documents: AppwriteDocument<T>[];
    total: number;
}
```

Puis utiliser:

```typescript
import { AppwriteListResponse } from '@/types/appwrite';

const response = await databases.listDocuments(...) as AppwriteListResponse<Organism>;
const docs = response.documents;
```

---

## 4. ✅ IMPORTANT - Remplacer `alert()` par Notifications

### Créer `components/Toast.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';

interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'info';
    onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColor = {
        success: 'var(--success)',
        error: 'var(--danger)',
        info: 'var(--primary)'
    }[type];

    return (
        <div style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            padding: '1rem 1.5rem',
            background: bgColor,
            color: 'white',
            borderRadius: 'var(--radius)',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            zIndex: 1000,
            animation: 'slideIn 0.3s ease-out'
        }}>
            {message}
        </div>
    );
}
```

### Créer `context/ToastContext.tsx`

```typescript
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Toast } from '@/components/Toast';

interface ToastContextType {
    showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' | 'info') => {
        setToast({ message, type });
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </ToastContext.Provider>
    );
}

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};
```

### Utilisation

```typescript
const { showToast } = useToast();

// Au lieu de: alert('Erreur');
showToast('Erreur lors de la mise à jour', 'error');

// Pour le succès:
showToast('Organisme ajouté avec succès', 'success');
```

---

## 5. ✅ IMPORTANT - Corriger les types `any`

### Dans `app/login/page.tsx`

**Avant:**
```typescript
} catch (err: any) {
    setError(err.message || 'Erreur de connexion');
}
```

**Après:**
```typescript
} catch (err) {
    const error = err as Error;
    setError(error.message || 'Erreur de connexion');
}
```

### Dans `app/page.tsx` et `components/OrganismCard.tsx`

**Avant:**
```typescript
onChange={(e) => setNewStatus(e.target.value as any)}
```

**Après:**
```typescript
onChange={(e) => setNewStatus(e.target.value as 'ok' | 'warning' | 'urgent')}
```

---

## 6. ✅ Déplacer `dotenv` en devDependencies

```bash
npm uninstall dotenv
npm install --save-dev dotenv
```

---

## 7. ✅ Ajouter l'attribut `url` dans le script d'initialisation

Dans `scripts/init-appwrite.js`, ajouter:

```javascript
// Organisms Attributes
const orgAttrs = [
    { key: 'name', type: 'string', size: 100, required: true },
    { key: 'status', type: 'string', size: 50, required: true },
    { key: 'message', type: 'string', size: 500, required: false },
    { key: 'url', type: 'string', size: 500, required: false }, // AJOUTER CETTE LIGNE
    { key: 'userId', type: 'string', size: 255, required: true },
];
```

---

## 📝 Checklist de Validation

- [ ] Variables d'environnement configurées
- [ ] `.env.local` ajouté au `.gitignore`
- [ ] Protection des routes implémentée
- [ ] Tous les `@ts-ignore` corrigés
- [ ] Système de notifications en place
- [ ] Tous les `any` remplacés par des types appropriés
- [ ] `dotenv` déplacé en devDependencies
- [ ] Script d'initialisation mis à jour
- [ ] Tests effectués sur toutes les fonctionnalités

---

**Note:** Testez chaque correction individuellement avant de passer à la suivante.

