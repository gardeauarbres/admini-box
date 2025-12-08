const { Client, Databases } = require('node-appwrite');

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function addUrlAttribute() {
    try {
        console.log('Adding URL attribute to organisms collection...');

        await databases.createStringAttribute(
            'adminibox_db',
            'organisms',
            'url',
            500,
            false // not required
        );

        console.log('✅ URL attribute added successfully!');
        console.log('Please wait a few seconds for Appwrite to process the change.');
    } catch (error) {
        if (error.message && error.message.includes('already exists')) {
            console.log('✅ URL attribute already exists!');
        } else {
            console.error('❌ Error adding URL attribute:', error.message);
        }
    }
}

addUrlAttribute();
