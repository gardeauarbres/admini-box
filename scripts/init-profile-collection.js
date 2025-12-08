const { Client, Databases, ID, Permission, Role } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function initProfileCollection() {
    try {
        console.log('Création de la collection user_profiles...');

        // Créer la collection
        try {
            await databases.createCollection(
                'adminibox_db',
                'user_profiles',
                'Profils utilisateurs',
                [
                    Permission.read(Role.any()),
                    Permission.create(Role.users()),
                    Permission.update(Role.users()),
                    Permission.delete(Role.users()),
                ]
            );
            console.log('✅ Collection user_profiles créée');
        } catch (error) {
            if (error.message.includes('already exists')) {
                console.log('ℹ️ Collection user_profiles existe déjà');
            } else {
                throw error;
            }
        }

        // Attributs (Appwrite ne supporte pas les objets imbriqués, donc on aplatit les adresses)
        const attributes = [
            // Personnel
            { key: 'userId', type: 'string', size: 255, required: true },
            { key: 'firstName', type: 'string', size: 100, required: true },
            { key: 'lastName', type: 'string', size: 100, required: true },
            { key: 'birthDate', type: 'string', size: 50, required: false },
            { key: 'phone', type: 'string', size: 50, required: false },
            { key: 'avatar', type: 'string', size: 255, required: false },
            { key: 'bio', type: 'string', size: 1000, required: false },
            { key: 'language', type: 'string', size: 10, required: false },
            { key: 'timezone', type: 'string', size: 50, required: false },
            // Adresse personnelle (aplatie)
            { key: 'addressStreet', type: 'string', size: 255, required: false },
            { key: 'addressCity', type: 'string', size: 100, required: false },
            { key: 'addressPostalCode', type: 'string', size: 20, required: false },
            { key: 'addressCountry', type: 'string', size: 100, required: false },
            // Professionnel
            { key: 'profession', type: 'string', size: 100, required: false },
            { key: 'company', type: 'string', size: 100, required: false },
            { key: 'professionalEmail', type: 'string', size: 255, required: false },
            { key: 'professionalPhone', type: 'string', size: 50, required: false },
            { key: 'website', type: 'string', size: 500, required: false },
            { key: 'sector', type: 'string', size: 100, required: false },
            { key: 'status', type: 'string', size: 50, required: false },
            { key: 'jobDescription', type: 'string', size: 1000, required: false },
            // Adresse professionnelle (aplatie)
            { key: 'professionalAddressStreet', type: 'string', size: 255, required: false },
            { key: 'professionalAddressCity', type: 'string', size: 100, required: false },
            { key: 'professionalAddressPostalCode', type: 'string', size: 20, required: false },
            { key: 'professionalAddressCountry', type: 'string', size: 100, required: false },
        ];

        for (const attr of attributes) {
            try {
                if (attr.type === 'string') {
                    await databases.createStringAttribute(
                        'adminibox_db',
                        'user_profiles',
                        attr.key,
                        attr.size,
                        attr.required
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

        // Créer l'index sur userId
        try {
            await databases.createIndex(
                'adminibox_db',
                'user_profiles',
                'idx_userId',
                ['userId'],
                ['ASC']
            );
            console.log('✅ Index userId créé');
        } catch (error) {
            if (error.message.includes('already exists')) {
                console.log('ℹ️ Index userId existe déjà');
            }
        }

        console.log('✅ Initialisation de la collection user_profiles terminée !');
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
}

// Créer le bucket avatars
async function initAvatarsBucket() {
    try {
        const { Storage } = require('node-appwrite');
        const storage = new Storage(client);

        try {
            await storage.createBucket(
                'avatars',
                'Avatars utilisateurs',
                [
                    Permission.read(Role.any()), // Public read
                    Permission.create(Role.users()),
                    Permission.update(Role.users()),
                    Permission.delete(Role.users()),
                ],
                false, // fileSecurity
                10 * 1024 * 1024, // 10MB max
                ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
                true, // compression
                false, // encryption
                false, // antivirus
            );
            console.log('✅ Bucket avatars créé');
        } catch (error) {
            if (error.message.includes('already exists')) {
                console.log('ℹ️ Bucket avatars existe déjà');
            } else {
                throw error;
            }
        }
    } catch (error) {
        console.error('❌ Erreur création bucket:', error.message);
    }
}

async function init() {
    await initProfileCollection();
    await initAvatarsBucket();
}

init();

