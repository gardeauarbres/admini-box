/**
 * Script d'initialisation de la collection documents_editor pour l'éditeur de documents
 * 
 * Usage: node scripts/init-editor-collection.js
 * 
 * Prérequis:
 * - Variables d'environnement dans .env.local:
 *   - NEXT_PUBLIC_APPWRITE_ENDPOINT
 *   - NEXT_PUBLIC_APPWRITE_PROJECT
 *   - APPWRITE_API_KEY
 */

const { Client, Databases } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const DATABASE_ID = 'adminibox_db';
const COLLECTION_ID = 'documents_editor';

async function initEditorCollection() {
    try {
        console.log('🚀 Initialisation de la collection documents_editor...\n');

        // Vérifier si la collection existe déjà
        try {
            await databases.getCollection(DATABASE_ID, COLLECTION_ID);
            console.log('⚠️  La collection existe déjà. Voulez-vous la recréer ? (non implémenté, arrêt)');
            return;
        } catch (error) {
            if (error.code !== 404) throw error;
        }

        // Créer la collection
        console.log('📝 Création de la collection...');
        await databases.createCollection(
            DATABASE_ID,
            COLLECTION_ID,
            'Documents Éditeur',
            [
                { permission: 'read(Role.users())' },
                { permission: 'create(Role.users())' },
                { permission: 'update(Role.users())' },
                { permission: 'delete(Role.users())' },
            ]
        );
        console.log('✅ Collection créée\n');

        // Créer les attributs
        console.log('📋 Création des attributs...\n');

        // userId (string, required)
        await databases.createStringAttribute(
            DATABASE_ID,
            COLLECTION_ID,
            'userId',
            255,
            true
        );
        console.log('✅ Attribut userId créé');

        // title (string, required)
        await databases.createStringAttribute(
            DATABASE_ID,
            COLLECTION_ID,
            'title',
            500,
            true
        );
        console.log('✅ Attribut title créé');

        // content (string, required)
        await databases.createStringAttribute(
            DATABASE_ID,
            COLLECTION_ID,
            'content',
            1000000, // 1MB max
            true
        );
        console.log('✅ Attribut content créé');

        // format (string, enum)
        await databases.createStringAttribute(
            DATABASE_ID,
            COLLECTION_ID,
            'format',
            20,
            false,
            'text'
        );
        console.log('✅ Attribut format créé');

        // metadata (string, JSON)
        await databases.createStringAttribute(
            DATABASE_ID,
            COLLECTION_ID,
            'metadata',
            5000,
            false
        );
        console.log('✅ Attribut metadata créé');

        // settings (string, JSON)
        await databases.createStringAttribute(
            DATABASE_ID,
            COLLECTION_ID,
            'settings',
            1000,
            false
        );
        console.log('✅ Attribut settings créé');

        // Attendre que les attributs soient prêts
        console.log('\n⏳ Attente de la finalisation des attributs...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Créer les index
        console.log('\n🔍 Création des index...');

        // Index sur userId pour les requêtes utilisateur
        try {
            await databases.createIndex(
                DATABASE_ID,
                COLLECTION_ID,
                'idx_userId',
                'key',
                ['userId'],
                ['ASC']
            );
            console.log('✅ Index userId créé');
        } catch (error) {
            console.log('⚠️  Index userId peut-être déjà existant');
        }

        // Index sur title pour la recherche
        try {
            await databases.createIndex(
                DATABASE_ID,
                COLLECTION_ID,
                'idx_title',
                'fulltext',
                ['title'],
                ['ASC']
            );
            console.log('✅ Index title créé');
        } catch (error) {
            console.log('⚠️  Index title peut-être déjà existant');
        }

        // Index sur $updatedAt pour le tri
        try {
            await databases.createIndex(
                DATABASE_ID,
                COLLECTION_ID,
                'idx_updatedAt',
                'key',
                ['$updatedAt'],
                ['DESC']
            );
            console.log('✅ Index $updatedAt créé');
        } catch (error) {
            console.log('⚠️  Index $updatedAt peut-être déjà existant');
        }

        console.log('\n✨ Collection documents_editor initialisée avec succès !');
        console.log('\n📝 Structure créée:');
        console.log('   - userId (string, required)');
        console.log('   - title (string, required, max 500)');
        console.log('   - content (string, required, max 1MB)');
        console.log('   - format (string, optional, default: "text")');
        console.log('   - metadata (string, JSON, optional)');
        console.log('   - settings (string, JSON, optional)');
        console.log('\n🔍 Index créés:');
        console.log('   - idx_userId (key)');
        console.log('   - idx_title (fulltext)');
        console.log('   - idx_updatedAt (key, DESC)');

    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error.message);
        if (error.code) {
            console.error('   Code:', error.code);
        }
        process.exit(1);
    }
}

// Exécuter le script
initEditorCollection();

