/**
 * Script pour ajouter l'attribut notes à la collection organisms
 * Usage: node scripts/add-notes-attribute.js
 */

const { Client, Databases } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function addNotesAttribute() {
    try {
        console.log('Ajout de l\'attribut notes à la collection organisms...');
        
        await databases.createStringAttribute(
            'adminibox_db',
            'organisms',
            'notes',
            5000, // Taille max pour stocker du JSON
            false // Non requis
        );
        
        console.log('✅ Attribut notes ajouté avec succès');
    } catch (error) {
        if (error.message.includes('already exists')) {
            console.log('ℹ️ Attribut notes existe déjà');
        } else {
            console.error('❌ Erreur:', error.message);
            process.exit(1);
        }
    }
}

addNotesAttribute();

