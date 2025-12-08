# 🔧 Configuration des Variables d'Environnement

## ⚠️ IMPORTANT

Les identifiants Appwrite ont été déplacés vers les variables d'environnement pour des raisons de sécurité.

## 📝 Étapes de Configuration

### 1. Créer le fichier `.env.local`

À la racine du projet, créez un fichier nommé `.env.local` avec le contenu suivant :

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT=692989fe0009e92c88b9

# Clé API OpenAI (optionnel)
# Pour les fonctionnalités IA de l'éditeur (correction, amélioration, résumé, traduction)
# ⚠️ NE PAS PARTAGER CETTE CLÉ PUBLIQUEMENT
OPENAI_API_KEY=votre_cle_api_ici
```

### 2. Vérifier que le fichier est bien ignoré

Le fichier `.env.local` devrait déjà être dans le `.gitignore` (ligne 34: `.env*`).

### 3. Redémarrer le serveur de développement

Après avoir créé le fichier `.env.local`, redémarrez votre serveur Next.js :

```bash
# Arrêtez le serveur (Ctrl+C)
# Puis relancez-le
npm run dev
```

## ✅ Vérification

Si tout est correctement configuré, l'application devrait fonctionner normalement sans erreur dans la console.

Si vous voyez l'erreur : `Missing Appwrite environment variables`, cela signifie que le fichier `.env.local` n'a pas été créé ou que le serveur n'a pas été redémarré.

## 🔒 Sécurité

- ✅ Ne jamais commiter le fichier `.env.local` dans Git
- ✅ Ne jamais partager vos identifiants Appwrite
- ✅ Utiliser des identifiants différents pour dev/prod si possible

## 📋 Contenu du fichier `.env.local`

Copiez-collez exactement ceci dans votre fichier `.env.local` :

```
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT=692989fe0009e92c88b9

# Clé API OpenAI (optionnel)
# Pour les fonctionnalités IA de l'éditeur (correction, amélioration, résumé, traduction)
# ⚠️ NE PAS PARTAGER CETTE CLÉ PUBLIQUEMENT
OPENAI_API_KEY=votre_cle_api_ici
```

**Note:** Les identifiants ci-dessus sont ceux qui étaient précédemment hardcodés dans `lib/appwrite.ts`. Ils sont maintenant sécurisés dans le fichier `.env.local`.

**Note 2:** `OPENAI_API_KEY` est optionnel et permet d'utiliser les fonctionnalités IA de l'éditeur. Voir `docs/OPTIMISATIONS_EDITEUR_OPENAI.md` pour plus de détails.

