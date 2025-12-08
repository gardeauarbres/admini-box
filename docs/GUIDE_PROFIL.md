# 👤 Guide du Système de Profil Utilisateur

## 📋 Vue d'ensemble

Le système de profil permet aux utilisateurs de gérer leurs informations personnelles et professionnelles de manière centralisée.

---

## 🚀 Installation

### 1. Créer la collection Appwrite

Exécutez le script d'initialisation :

```bash
node scripts/init-profile-collection.js
```

Ce script crée :
- ✅ La collection `user_profiles` dans Appwrite
- ✅ Tous les attributs nécessaires
- ✅ Le bucket `avatars` pour les photos de profil
- ✅ Les index pour les performances

### 2. Variables d'environnement

Assurez-vous d'avoir dans `.env.local` :
```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT=your_project_id
APPWRITE_API_KEY=your_api_key
```

---

## 📁 Structure des Fichiers

```
app/profile/
  └── page.tsx              # Page principale avec onglets

components/
  ├── AvatarUpload.tsx      # Upload de photo de profil
  ├── ProfileOverview.tsx   # Vue d'ensemble du profil
  ├── PersonalProfileForm.tsx    # Formulaire personnel
  └── ProfessionalProfileForm.tsx # Formulaire professionnel

lib/
  ├── validations.ts        # Schémas Zod pour le profil
  └── queries.ts            # Hooks React Query

scripts/
  └── init-profile-collection.js  # Script d'initialisation
```

---

## 🎯 Fonctionnalités

### Profil Personnel
- ✅ Nom et prénom
- ✅ Date de naissance
- ✅ Téléphone
- ✅ Adresse complète
- ✅ Bio / Description
- ✅ Langue et fuseau horaire
- ✅ Photo de profil (avatar)

### Profil Professionnel
- ✅ Profession / Métier
- ✅ Entreprise
- ✅ Email et téléphone professionnels
- ✅ Site web
- ✅ Secteur d'activité
- ✅ Statut professionnel
- ✅ Description du poste
- ✅ Adresse professionnelle

### Vue d'ensemble
- ✅ Barre de progression de complétude
- ✅ Résumé des informations
- ✅ Statistiques du profil

---

## 🔧 Utilisation

### Accéder au profil
1. Cliquez sur "👤 Profil" dans la navigation
2. Ou accédez directement à `/profile`

### Remplir le profil
1. **Onglet Personnel** : Remplissez vos informations personnelles
2. **Onglet Professionnel** : Ajoutez vos informations professionnelles
3. **Upload d'avatar** : Cliquez sur l'avatar pour changer la photo

### Validation
- ✅ Tous les champs sont validés avec Zod
- ✅ Messages d'erreur en temps réel
- ✅ Validation des emails, URLs, téléphones

---

## 📊 Structure de Données

### Collection `user_profiles`

```typescript
{
  $id: string;
  userId: string;
  
  // Personnel
  firstName: string;
  lastName: string;
  birthDate?: string;
  phone?: string;
  avatar?: string; // File ID
  bio?: string;
  language: string;
  timezone: string;
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  
  // Professionnel
  profession?: string;
  company?: string;
  professionalEmail?: string;
  professionalPhone?: string;
  website?: string;
  sector?: string;
  status?: 'employee' | 'freelancer' | 'retired' | 'student' | 'other';
  jobDescription?: string;
  professionalAddress?: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  
  // Métadonnées
  createdAt: string;
  updatedAt: string;
}
```

---

## 🎨 Personnalisation

### Modifier les champs
Éditez `lib/validations.ts` pour ajouter/modifier les champs.

### Modifier le design
Les composants utilisent les variables CSS du thème pour s'adapter automatiquement au mode sombre/clair.

---

## 🔐 Sécurité

- ✅ Chaque utilisateur ne peut voir/modifier que son propre profil
- ✅ Permissions Appwrite configurées
- ✅ Validation côté client et serveur
- ✅ Avatar public (lecture) mais upload privé

---

## 📈 Prochaines Améliorations Possibles

1. **Paramètres de sécurité**
   - Changement de mot de passe
   - Authentification à deux facteurs
   - Sessions actives

2. **Statistiques**
   - Activité sur la plateforme
   - Historique des actions
   - Badges / Réalisations

3. **Personnalisation avancée**
   - Thème personnalisé
   - Préférences d'affichage
   - Notifications détaillées

---

**Le système de profil est maintenant opérationnel !** 🎉

