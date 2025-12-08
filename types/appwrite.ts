import { Models } from 'appwrite';

export type AppwriteDocument<T> = Models.Document & T;

export interface AppwriteListResponse<T> {
    documents: AppwriteDocument<T>[];
    total: number;
}

