const { Client, Databases } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function addOrganismAttributes() {
    try {
        console.log('Ajout des attributs pour les organismes...');

        const attributes = [
            { key: 'tags', type: 'string', size: 500, required: false },
            { key: 'isFavorite', type: 'boolean', required: false },
            { key: 'reminderDate', type: 'string', size: 50, required: false },
            { key: 'reminderMessage', type: 'string', size: 200, required: false },
        ];

        for (const attr of attributes) {
            try {
                if (attr.type === 'string') {
                    await databases.createStringAttribute(
                        'adminibox_db',
                        'organisms',
                        attr.key,
                        attr.size,
                        attr.required
                    );
                } else if (attr.type === 'boolean') {
                    await databases.createBooleanAttribute(
                        'adminibox_db',
                        'organisms',
                        attr.key,
                        attr.required,
                        false // default value
                    );
                }
                console.log(`✅ Attribut ${attr.key} créé`);
            } catch (error) {
                if (error.message.includes('already exists')) {
                    console.log(`ℹ️ Attribut ${attr.key} existe déjà`);
                } else {
                    console.error(`❌ Erreur pour ${attr.key}:`, error.message);
                }
            }
        }

        console.log('✅ Ajout des attributs terminé !');
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
}

addOrganismAttributes();

