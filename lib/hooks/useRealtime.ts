import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { client } from '../appwrite';
import { queryKeys } from '../queries';

// Mapping between collection names (or IDs) and query keys
// Note: You needs to ensure these IDs match your actual Appwrite Collection IDs
const COLLECTION_KEYS: Record<string, (userId: string) => string[]> = {
    'organisms': queryKeys.organisms,
    'transactions': queryKeys.transactions,
    'documents': queryKeys.documents,
    'user_profiles': queryKeys.profile,
};

export function useRealtime(userId: string | null) {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!userId) return;

        console.log('🔌 Subscribing to realtime events...');

        // Subscribe to all documents in the database
        // In a real app, you might want to be more specific to reduce traffic
        // channels: databases.[databaseId].collections.[collectionId].documents
        const unsubscribe = client.subscribe(
            [
                'databases.adminibox_db.collections.organisms.documents',
                'databases.adminibox_db.collections.transactions.documents',
                'databases.adminibox_db.collections.documents.documents',
                'databases.adminibox_db.collections.user_profiles.documents'
            ],
            (response) => {
                console.log('⚡ Realtime event received:', response.events);

                // Extract collection name from the event channel
                // Format: databases.[dbId].collections.[collectionId].documents.[docId]
                // We mainly care about knowing WHICH collection changed

                // Helper to check if event is for a specific collection
                const isCollection = (name: string) =>
                    response.events.some(event => event.includes(`collections.${name}.documents`));

                if (isCollection('organisms')) {
                    console.log('🔄 Invalidating organisms');
                    queryClient.invalidateQueries({ queryKey: queryKeys.organisms(userId) });
                }

                if (isCollection('transactions')) {
                    console.log('🔄 Invalidating transactions');
                    queryClient.invalidateQueries({ queryKey: queryKeys.transactions(userId) });
                }

                if (isCollection('documents')) {
                    console.log('🔄 Invalidating documents');
                    queryClient.invalidateQueries({ queryKey: queryKeys.documents(userId) });
                }

                if (isCollection('user_profiles')) {
                    console.log('🔄 Invalidating profile');
                    queryClient.invalidateQueries({ queryKey: queryKeys.profile(userId) });
                }
            }
        );

        return () => {
            console.log('🔌 Unsubscribing from realtime events');
            unsubscribe();
        };
    }, [userId, queryClient]);
}
