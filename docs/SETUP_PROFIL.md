# 🔧 Configuration du Système de Profil

## ⚠️ Problème : Impossible de sauvegarder le profil

Si vous ne pouvez pas sauvegarder les modifications du profil, c'est probablement parce que la collection `user_profiles` n'existe pas encore dans Appwrite.

---

## ✅ Solution 1 : Créer la collection via le script (Recommandé)

### Prérequis
Vous devez avoir une **clé API Appwrite** dans votre `.env.local` :

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT=votre_project_id
APPWRITE_API_KEY=votre_api_key
```

### Obtenir la clé API
1. Allez sur votre console Appwrite : https://cloud.appwrite.io
2. Sélectionnez votre projet
3. Allez dans **Settings** → **API Keys**
4. Créez une nouvelle clé avec les permissions :
   - `collections.read`
   - `collections.write`
   - `databases.read`
   - `databases.write`
   - `storage.read`
   - `storage.write`

### Exécuter le script
```bash
node scripts/init-profile-collection.js
```

---

## ✅ Solution 2 : Créer la collection manuellement

### 1. Créer la collection
1. Allez sur https://cloud.appwrite.io
2. Sélectionnez votre projet
3. Allez dans **Databases** → **adminibox_db**
4. Cliquez sur **Create Collection**
5. Nom : `user_profiles`
6. Permissions :
   - Read: `Any`
   - Create: `Users`
   - Update: `Users`
   - Delete: `Users`

### 2. Créer les attributs

#### Attributs de base (Personnel)
- `userId` - String (255) - **Required**
- `firstName` - String (100) - **Required**
- `lastName` - String (100) - **Required**
- `birthDate` - String (50) - Optional
- `phone` - String (50) - Optional
- `avatar` - String (255) - Optional
- `bio` - String (1000) - Optional
- `language` - String (10) - Optional
- `timezone` - String (50) - Optional

#### Attributs d'adresse personnelle (aplatis)
- `addressStreet` - String (255) - Optional
- `addressCity` - String (100) - Optional
- `addressPostalCode` - String (20) - Optional
- `addressCountry` - String (100) - Optional

#### Attributs professionnels
- `profession` - String (100) - Optional
- `company` - String (100) - Optional
- `professionalEmail` - String (255) - Optional
- `professionalPhone` - String (50) - Optional
- `website` - String (500) - Optional
- `sector` - String (100) - Optional
- `status` - String (50) - Optional
- `jobDescription` - String (1000) - Optional

#### Attributs d'adresse professionnelle (aplatis)
- `professionalAddressStreet` - String (255) - Optional
- `professionalAddressCity` - String (100) - Optional
- `professionalAddressPostalCode` - String (20) - Optional
- `professionalAddressCountry` - String (100) - Optional

### 3. Créer l'index
1. Dans la collection `user_profiles`
2. Allez dans **Indexes**
3. Créez un index :
   - **Key**: `idx_userId`
   - **Type**: `key`
   - **Attributes**: `userId`
   - **Order**: `ASC`

### 4. Créer le bucket pour les avatars
1. Allez dans **Storage**
2. Cliquez sur **Create Bucket**
3. **ID**: `avatars`
4. **Name**: `Avatars utilisateurs`
5. **Permissions**:
   - Read: `Any` (pour que les avatars soient publics)
   - Create: `Users`
   - Update: `Users`
   - Delete: `Users`
6. **File Security**: `false`
7. **Maximum file size**: `10 MB`
8. **Allowed file extensions**: `jpg, jpeg, png, webp, gif`
9. **Compression**: `Enabled`
10. **Encryption**: `Disabled`
11. **Antivirus**: `Disabled`

---

## 🔍 Vérification

Après avoir créé la collection, testez :
1. Allez sur `/profile`
2. Remplissez le formulaire personnel
3. Cliquez sur "Enregistrer les modifications"
4. Vous devriez voir un message de succès ✅

---

## 🐛 Dépannage

### Erreur : "Collection not found"
→ La collection n'existe pas. Créez-la via la Solution 1 ou 2.

### Erreur : "Permission denied"
→ Vérifiez les permissions de la collection. Elles doivent être :
- Read: `Any`
- Create/Update/Delete: `Users`

### Erreur : "Attribute not found"
→ Tous les attributs n'ont pas été créés. Vérifiez la liste complète ci-dessus.

### Erreur : "Invalid attribute type"
→ Appwrite ne supporte pas les objets imbriqués. Les adresses sont stockées comme des champs séparés (addressStreet, addressCity, etc.).

---

## 📝 Note importante

**Appwrite ne supporte pas les objets imbriqués** (comme `address: { street, city }`). 
C'est pourquoi les adresses sont stockées comme des champs séparés :
- `addressStreet`, `addressCity`, `addressPostalCode`, `addressCountry`
- `professionalAddressStreet`, `professionalAddressCity`, etc.

Le code gère automatiquement la conversion entre les objets TypeScript et les champs Appwrite.

---

**Une fois la collection créée, le système de profil fonctionnera parfaitement !** 🎉

