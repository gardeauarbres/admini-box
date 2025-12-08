# 🔒 Sécurité de l'Éditeur de Documents

## Garanties de Confidentialité

L'éditeur de documents est conçu pour garantir que **chaque utilisateur ne peut accéder qu'à ses propres documents**.

## Mécanismes de Sécurité Implémentés

### 1. **Permissions Appwrite au niveau document**
Chaque document créé utilise des permissions strictes :
```javascript
[
  Permission.read(Role.user(userId)),
  Permission.write(Role.user(userId)),
  Permission.update(Role.user(userId)),
  Permission.delete(Role.user(userId)),
]
```
Ces permissions garantissent que seul le propriétaire peut lire, modifier ou supprimer son document.

### 2. **Filtrage par userId dans les requêtes**
- `useEditorDocuments(userId)` : Filtre automatiquement les documents par `userId`
- Seuls les documents de l'utilisateur connecté sont retournés

### 3. **Vérifications de sécurité dans les hooks**

#### `useEditorDocument(documentId, userId)`
- Vérifie que `doc.userId === userId` avant de retourner le document
- Lance une erreur si l'utilisateur tente d'accéder à un document qui ne lui appartient pas

#### `useUpdateEditorDocument()`
- Vérifie la propriété du document avant toute mise à jour
- Requiert `userId` en paramètre pour validation
- Bloque les tentatives de modification de documents d'autres utilisateurs

#### `useDeleteEditorDocument()`
- Vérifie la propriété du document avant suppression
- Requiert `userId` en paramètre pour validation
- Bloque les tentatives de suppression de documents d'autres utilisateurs

### 4. **Isolation des données**
- Chaque document contient un champ `userId` obligatoire
- Les requêtes utilisent `Query.equal('userId', userId)` pour filtrer
- Les index Appwrite sont configurés pour optimiser ces requêtes

## Protection contre les Accès Non Autorisés

### Scénarios bloqués :
1. ❌ Un utilisateur ne peut pas voir les documents d'un autre utilisateur
2. ❌ Un utilisateur ne peut pas modifier un document d'un autre utilisateur
3. ❌ Un utilisateur ne peut pas supprimer un document d'un autre utilisateur
4. ❌ Un utilisateur ne peut pas accéder à un document via son ID s'il ne lui appartient pas

### Messages d'erreur :
- `"Accès non autorisé à ce document"` - Tentative d'accès à un document d'un autre utilisateur
- `"Accès non autorisé : ce document ne vous appartient pas"` - Tentative de modification/suppression

## Configuration Appwrite

### Collection `documents_editor`
- **userId** : Attribut requis (string, 255 caractères max)
- **Index** : `idx_userId` pour optimiser les requêtes par utilisateur
- **Permissions collection** : `Role.users()` (permissions définies au niveau document)

### Bonnes Pratiques
✅ Les permissions sont définies **au niveau de chaque document** lors de la création
✅ Le `userId` est toujours vérifié avant toute opération
✅ Les erreurs de sécurité sont clairement communiquées à l'utilisateur

## Test de Sécurité

Pour tester la sécurité :
1. Créez un document avec un utilisateur A
2. Connectez-vous avec un utilisateur B
3. Tentez d'accéder au document de l'utilisateur A via son ID
4. ✅ Vous devriez recevoir une erreur "Accès non autorisé"

---

*Dernière mise à jour : Sécurité renforcée avec vérifications explicites de propriété*

