# 🏛️ AdminiBox - Centralized SaaS

**AdminiBox** est une application SaaS centralisée pour simplifier votre vie administrative. Gérez vos organismes administratifs, vos documents, vos finances et créez vos courriers en un seul endroit.

## ✨ Fonctionnalités

### 📊 Tableau de Bord Unifié (HOA)
- Vue d'ensemble de tous vos organismes administratifs
- Suivi des actions urgentes et des alertes
- Gestion rapide des organismes (CAF, CPAM, URSSAF, Impôts, etc.)

### 📄 Gestion Documentaire (GDA)
- Stockage sécurisé de tous vos documents administratifs
- Organisation par organisme
- Upload et téléchargement de fichiers

### 💰 Comptabilité & Suivi Financier (CSF)
- Suivi de vos revenus et dépenses
- Catégorisation des transactions
- Calcul automatique du solde

### ✍️ Éditeur de Documents (EDO)
- Création de courriers et documents officiels
- Sauvegarde automatique dans vos documents

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 18+ 
- npm, yarn, pnpm ou bun
- Un compte Appwrite (gratuit sur [appwrite.io](https://appwrite.io))

### Installation

1. **Cloner le projet**
   ```bash
   git clone <votre-repo>
   cd admini_box
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement**
   
   Créez un fichier `.env.local` à la racine du projet :
   ```env
   NEXT_PUBLIC_APPWRITE_ENDPOINT=https://votre-endpoint.appwrite.io/v1
   NEXT_PUBLIC_APPWRITE_PROJECT=votre-project-id
   ```
   
   > 📝 Voir `SETUP_ENV.md` pour plus de détails

4. **Initialiser Appwrite**
   ```bash
   node scripts/init-appwrite.js
   ```
   
   Cette commande crée automatiquement :
   - La base de données
   - Les collections (documents, transactions, organisms)
   - Le bucket de stockage pour les fichiers

5. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```

6. **Ouvrir dans le navigateur**
   
   Rendez-vous sur [http://localhost:3000](http://localhost:3000)

## 📁 Structure du Projet

```
admini_box/
├── app/                    # Pages Next.js (App Router)
│   ├── page.tsx           # Page d'accueil (Tableau de bord)
│   ├── documents/         # Gestion documentaire
│   ├── finance/           # Comptabilité
│   ├── editor/            # Éditeur de documents
│   ├── login/             # Connexion
│   └── register/          # Inscription
├── components/            # Composants React réutilisables
│   ├── Navigation.tsx
│   ├── OrganismCard.tsx
│   ├── FinanceTable.tsx
│   ├── FileManager.tsx
│   ├── SimpleEditor.tsx
│   ├── Toast.tsx
│   └── ProtectedRoute.tsx
├── context/               # Contextes React
│   ├── AuthContext.tsx    # Gestion de l'authentification
│   └── ToastContext.tsx   # Gestion des notifications
├── lib/                   # Utilitaires
│   └── appwrite.ts       # Configuration Appwrite
├── scripts/               # Scripts d'initialisation
│   ├── init-appwrite.js   # Initialisation Appwrite
│   └── add-url-attribute.js
└── types/                 # Types TypeScript
    └── appwrite.ts
```

## 🔐 Sécurité

- ✅ Authentification via Appwrite
- ✅ Protection des routes privées
- ✅ Permissions granulaires par utilisateur
- ✅ Variables d'environnement pour les identifiants
- ✅ Validation TypeScript stricte

## 🛠️ Technologies Utilisées

- **Framework:** Next.js 16 (App Router)
- **Langage:** TypeScript
- **UI:** React 19
- **Backend:** Appwrite (BaaS)
- **Styling:** CSS Modules + CSS Variables

## 📝 Scripts Disponibles

```bash
# Développement
npm run dev

# Build de production
npm run build

# Démarrer en production
npm start

# Linter
npm run lint
```

## 🔧 Configuration Appwrite

L'application nécessite une configuration Appwrite avec :

- **Base de données:** `adminibox_db`
- **Collections:**
  - `documents` - Métadonnées des fichiers
  - `transactions` - Transactions financières
  - `organisms` - Organismes administratifs
- **Storage Bucket:** `documents_bucket`

Le script `scripts/init-appwrite.js` configure automatiquement tout cela.

## 📚 Documentation

Toute la documentation est disponible dans le dossier [`docs/`](./docs/) :

- [Check-up Complet](./docs/CHECKUP_COMPLET.md) - Analyse complète et optimisations
- [Rapport de Check-up Initial](./docs/CHECKUP_REPORT.md) - Analyse initiale de l'application
- [Changelog](./docs/CHANGELOG.md) - Historique des changements
- [Améliorations Phase 2](./docs/IMPROVEMENTS_V2.md) - React Query & Middleware
- [Améliorations Finales](./docs/AMELIORATIONS_FINALES.md) - Validation, Pagination, Recherche
- [Guide de Configuration](./docs/SETUP_ENV.md) - Configuration des variables d'environnement
- [Corrections Prioritaires](./docs/FIXES_PRIORITY.md) - Guide des corrections appliquées
- [Propositions d'Améliorations](./docs/PROPOSITIONS_AMELIORATIONS.md) - Idées futures

## 🎯 Fonctionnalités Futures

- [ ] Pagination pour les listes longues
- [ ] Cache avec React Query
- [ ] Export PDF des documents
- [ ] Graphiques financiers
- [ ] Notifications par email
- [ ] Mode sombre/clair
- [ ] Recherche avancée

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📄 Licence

Ce projet est privé.

---

**Développé avec ❤️ pour simplifier votre vie administrative**
