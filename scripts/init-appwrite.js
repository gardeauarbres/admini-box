const sdk = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new sdk.Client();

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;
const API_KEY = process.env.APPWRITE_API_KEY;

if (!ENDPOINT || !PROJECT_ID || !API_KEY) {
    console.error('Missing environment variables');
    process.exit(1);
}

client
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const databases = new sdk.Databases(client);
const storage = new sdk.Storage(client);

const DB_NAME = 'AdminiBoxDB';
const DB_ID = 'adminibox_db';

async function init() {
    try {
        // 1. Create Database
        try {
            await databases.get(DB_ID);
            console.log('Database already exists');
        } catch (e) {
            await databases.create(DB_ID, DB_NAME);
            console.log('Database created');
        }

        // 2. Create Collections
        const collections = [
            { id: 'documents', name: 'Documents' },
            { id: 'transactions', name: 'Transactions' },
            { id: 'organisms', name: 'Organisms' }
        ];

        for (const col of collections) {
            try {
                await databases.getCollection(DB_ID, col.id);
                console.log(`Collection ${col.name} already exists`);
            } catch (e) {
                await databases.createCollection(DB_ID, col.id, col.name, [
                    sdk.Permission.read(sdk.Role.users()),
                    sdk.Permission.write(sdk.Role.users())
                ]);
                console.log(`Collection ${col.name} created`);
            }
        }

        // 3. Create Attributes
        // Documents Attributes
        const docAttrs = [
            { key: 'name', type: 'string', size: 255, required: true },
            { key: 'type', type: 'string', size: 50, required: true },
            { key: 'organism', type: 'string', size: 100, required: true },
            { key: 'date', type: 'string', size: 20, required: true },
            { key: 'fileId', type: 'string', size: 255, required: true },
            { key: 'userId', type: 'string', size: 255, required: true },
        ];

        for (const attr of docAttrs) {
            try {
                await databases.createStringAttribute(DB_ID, 'documents', attr.key, attr.size, attr.required);
                console.log(`Attribute ${attr.key} created for documents`);
            } catch (e) {
                // Attribute might already exist
            }
        }

        // Transactions Attributes
        const transAttrs = [
            { key: 'label', type: 'string', size: 255, required: true },
            { key: 'amount', type: 'double', required: true },
            { key: 'category', type: 'string', size: 100, required: true },
            { key: 'date', type: 'string', size: 20, required: true },
            { key: 'type', type: 'string', size: 20, required: true }, // income/expense
            { key: 'userId', type: 'string', size: 255, required: true },
        ];

        for (const attr of transAttrs) {
            try {
                if (attr.type === 'double') {
                    await databases.createFloatAttribute(DB_ID, 'transactions', attr.key, attr.required);
                } else {
                    await databases.createStringAttribute(DB_ID, 'transactions', attr.key, attr.size, attr.required);
                }
                console.log(`Attribute ${attr.key} created for transactions`);
            } catch (e) {
                // Attribute might already exist
            }
        }

        // Organisms Attributes
        const orgAttrs = [
            { key: 'name', type: 'string', size: 100, required: true },
            { key: 'status', type: 'string', size: 50, required: true },
            { key: 'message', type: 'string', size: 500, required: false },
            { key: 'url', type: 'string', size: 500, required: false },
            { key: 'userId', type: 'string', size: 255, required: true },
        ];

        for (const attr of orgAttrs) {
            try {
                await databases.createStringAttribute(DB_ID, 'organisms', attr.key, attr.size, attr.required);
                console.log(`Attribute ${attr.key} created for organisms`);
            } catch (e) {
                // Attribute might already exist
            }
        }

        // 4. Create Storage Bucket
        const BUCKET_ID = 'documents_bucket';
        try {
            await storage.getBucket(BUCKET_ID);
            console.log('Bucket already exists');
        } catch (e) {
            await storage.createBucket(BUCKET_ID, 'Documents Bucket', [
                sdk.Permission.read(sdk.Role.users()),
                sdk.Permission.write(sdk.Role.users())
            ], true, true, undefined, ['jpg', 'png', 'pdf']);
            console.log('Bucket created');
        }

        console.log('Initialization complete!');

    } catch (error) {
        console.error('Initialization failed:', error);
    }
}

init();
