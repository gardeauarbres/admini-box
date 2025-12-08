/**
 * Script pour créer le bucket avatars dans Appwrite
 * Usage: node scripts/create-avatars-bucket.js
 */

require('dotenv').config({ path: '.env.local' });
const { Client, Storage, Permission, Role } = require('node-appwrite');

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT || process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const storage = new Storage(client);

const BUCKET_ID = 'avatars';

async function createAvatarsBucket() {
  try {
    // Vérifier si le bucket existe déjà
    try {
      await storage.getBucket(BUCKET_ID);
      console.log('✅ Bucket avatars existe déjà');
      return;
    } catch (error) {
      // Le bucket n'existe pas, on le crée
    }

    // Créer le bucket avatars
    await storage.createBucket(
      BUCKET_ID,
      'Avatars Bucket',
      [
        Permission.read(Role.any()), // Les avatars sont publics pour l'affichage
        Permission.create(Role.users()), // Seuls les utilisateurs authentifiés peuvent uploader
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ],
      false, // fileSecurity
      10 * 1024 * 1024, // maximumFileSize (10MB)
      ['image/jpeg', 'image/png', 'image/gif', 'image/webp'], // MIME types autorisés
      true, // compression
      false, // encryption
      false // antivirus
    );

    console.log('✅ Bucket avatars créé avec succès');
  } catch (error) {
    if (error.code === 409) {
      console.log('ℹ️ Bucket avatars existe déjà');
    } else {
      console.error('❌ Erreur lors de la création du bucket:', error.message);
      if (error.code === 401) {
        console.error('💡 Vérifiez que votre APPWRITE_API_KEY est correcte dans .env.local');
      }
      process.exit(1);
    }
  }
}

createAvatarsBucket();

