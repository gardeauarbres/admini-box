# 📝 Fonctionnalités de l'Éditeur de Documents (EDO)

## Vue d'ensemble

L'Éditeur de Documents (EDO) est un éditeur de texte intégré à AdminiBox qui permet de créer, éditer et sauvegarder des documents textes. Il offre plusieurs fonctionnalités avancées pour améliorer l'expérience de rédaction.

---

## ✨ Fonctionnalités principales

### 1. **Édition de texte**
- **Zone de texte principale** : Textarea redimensionnable verticalement
- **Titre du document** : Champ de saisie pour le titre (obligatoire)
- **Contenu** : Zone de texte pour le corps du document
- **Placeholder** : Indication "Commencez à écrire... (Ctrl+S pour sauvegarder)"

### 2. **Sauvegarde manuelle**
- **Bouton de sauvegarde** : Bouton "💾 Sauvegarder dans mes documents"
- **Raccourci clavier** : `Ctrl+S` (ou `Cmd+S` sur Mac) pour sauvegarder rapidement
- **Validation** : Le bouton est désactivé si le titre ou le contenu est vide
- **Feedback visuel** : Le bouton affiche "Sauvegarde..." pendant l'opération
- **Format de sauvegarde** : Le document est sauvegardé comme fichier `.txt` dans Appwrite Storage
- **Métadonnées** : Le document est enregistré dans la base de données avec :
  - Nom du fichier
  - Date de création
  - Organisme : "Personnel"
  - Type : "Note"
  - Taille du fichier
  - Référence au fichier dans Storage

### 3. **Sauvegarde automatique (Auto-save)**
- **Activation/Désactivation** : Case à cocher pour activer/désactiver l'auto-sauvegarde
- **Intervalle** : Sauvegarde automatique toutes les **30 secondes**
- **Conditions** :
  - L'auto-sauvegarde doit être activée
  - L'utilisateur doit être connecté
  - Le titre et le contenu doivent être remplis
  - Aucune sauvegarde manuelle en cours
- **Indicateur** : Affichage de l'heure de la dernière sauvegarde automatique

### 4. **Sauvegarde de brouillon (Draft)**
- **Sauvegarde automatique** : Les modifications sont sauvegardées automatiquement dans le localStorage
- **Délai (Debounce)** : Sauvegarde après **2 secondes** d'inactivité
- **Récupération** : Les brouillons sont automatiquement chargés au démarrage de l'éditeur
- **Nettoyage** : Le brouillon est supprimé après une sauvegarde réussie
- **Persistance** : Les brouillons sont conservés même après fermeture du navigateur (7 jours maximum)

### 5. **Statistiques du texte**
Affichage en temps réel de :
- **📝 Nombre de mots** : Compte le nombre de mots (séparés par des espaces)
- **🔤 Nombre de caractères** : Compte tous les caractères (espaces inclus)
- **📄 Nombre de paragraphes** : Compte les paragraphes (séparés par des lignes vides)

### 6. **Indicateur de dernière sauvegarde**
- **Affichage** : Affiche l'heure de la dernière sauvegarde réussie
- **Format** : Heure au format français (ex: "14:30:25")
- **Visibilité** : Visible uniquement après une sauvegarde

### 7. **Interface utilisateur**
- **Design** : Interface avec effet "glass-panel" (verre dépoli)
- **Thème adaptatif** : S'adapte au thème clair/sombre
- **Responsive** : S'adapte à différentes tailles d'écran
- **Barre d'outils** : Barre d'outils en haut avec statistiques et options
- **Zone de texte** : Textarea avec :
  - Hauteur minimale de 400px
  - Redimensionnement vertical
  - Police héritée du thème
  - Interligne de 1.6
  - Taille de police de 1rem

### 8. **Gestion des erreurs**
- **Validation** : Vérification que le titre et le contenu sont remplis avant sauvegarde
- **Messages d'erreur** : Affichage de messages d'erreur via le système de toast
- **Messages de succès** : Confirmation de sauvegarde réussie
- **Gestion des exceptions** : Capture et affichage des erreurs lors de la sauvegarde

### 9. **Sécurité et permissions**
- **Authentification requise** : L'utilisateur doit être connecté pour sauvegarder
- **Permissions Appwrite** : Les fichiers sont créés avec les permissions appropriées :
  - Lecture pour l'utilisateur
  - Écriture pour l'utilisateur
  - Mise à jour pour l'utilisateur
  - Suppression pour l'utilisateur

### 10. **Intégration avec le système**
- **Documents** : Les documents sauvegardés apparaissent dans la section "Documents"
- **Organisme** : Automatiquement classé sous "Personnel"
- **Type** : Automatiquement classé comme "Note"
- **Recherche** : Les documents sont recherchables via la recherche globale

---

## 🎯 Raccourcis clavier

| Raccourci | Action |
|-----------|--------|
| `Ctrl+S` (Windows/Linux) | Sauvegarder le document |
| `Cmd+S` (Mac) | Sauvegarder le document |

---

## 📊 Statistiques affichées

La barre d'outils affiche en temps réel :
- **Mots** : Nombre total de mots dans le document
- **Caractères** : Nombre total de caractères (avec espaces)
- **Paragraphes** : Nombre de paragraphes (pluriel automatique)

---

## 💾 Système de sauvegarde

### Sauvegarde manuelle
1. Cliquez sur "💾 Sauvegarder dans mes documents" ou appuyez sur `Ctrl+S`
2. Le document est converti en fichier `.txt`
3. Le fichier est uploadé dans Appwrite Storage
4. Les métadonnées sont enregistrées dans la base de données
5. Le formulaire est réinitialisé
6. Le brouillon est supprimé

### Sauvegarde automatique
- Se déclenche automatiquement toutes les 30 secondes
- Nécessite que l'auto-sauvegarde soit activée
- Nécessite un titre et du contenu

### Sauvegarde de brouillon
- Se déclenche automatiquement après 2 secondes d'inactivité
- Sauvegarde dans le localStorage du navigateur
- Récupération automatique au chargement de l'éditeur
- Conservation pendant 7 jours maximum

---

## 🔧 Configuration

### Options disponibles
- **Auto-sauvegarde** : Case à cocher pour activer/désactiver la sauvegarde automatique toutes les 30 secondes

---

## 📝 Format de fichier

- **Type** : Fichier texte (.txt)
- **Encodage** : UTF-8
- **Nom** : `{titre}.txt`
- **Stockage** : Appwrite Storage (bucket: `documents_bucket`)

---

## 🎨 Personnalisation

L'éditeur s'adapte automatiquement au thème de l'application :
- **Mode clair** : Fond clair, texte sombre
- **Mode sombre** : Fond sombre, texte clair
- **Couleurs** : Utilise les variables CSS du thème (`--foreground`, `--input-bg`, etc.)

---

## ⚠️ Limitations

- **Format** : Uniquement texte brut (.txt)
- **Taille** : Limite de taille des fichiers selon les restrictions d'Appwrite
- **Fonctionnalités avancées** : Pas de formatage (gras, italique, etc.) - éditeur de texte simple
- **Images** : Pas de support pour les images
- **Tableaux** : Pas de support pour les tableaux

---

## 🚀 Améliorations futures possibles

- Support du formatage (gras, italique, souligné)
- Support de Markdown
- Export en PDF
- Export en Word (.docx)
- Support des images
- Support des tableaux
- Historique des versions
- Mode plein écran
- Thèmes personnalisés
- Plus de formats d'export

---

## 📖 Guide d'utilisation

1. **Créer un document** :
   - Entrez un titre dans le champ "Titre du document"
   - Commencez à écrire dans la zone de texte

2. **Sauvegarder** :
   - Cliquez sur "💾 Sauvegarder dans mes documents" ou appuyez sur `Ctrl+S`
   - Le document sera sauvegardé et apparaîtra dans la section "Documents"

3. **Activer l'auto-sauvegarde** :
   - Cochez la case "Auto-sauvegarde (30s)"
   - Le document sera sauvegardé automatiquement toutes les 30 secondes

4. **Consulter les statistiques** :
   - Regardez la barre d'outils en haut pour voir les statistiques en temps réel

5. **Récupérer un brouillon** :
   - Si vous avez commencé à écrire et fermé l'éditeur, votre brouillon sera automatiquement restauré au prochain chargement

---

*Dernière mise à jour : Fonctionnalités actuelles de l'éditeur*

