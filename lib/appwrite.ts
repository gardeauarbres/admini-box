import { Client, Account, Databases, Storage } from 'appwrite';

export const client = new Client();

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;

if (!endpoint || !projectId) {
    throw new Error('Missing Appwrite environment variables. Please check your .env.local file.');
}

client
    .setEndpoint(endpoint)
    .setProject(projectId);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
