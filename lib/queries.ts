import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { databases, storage } from './appwrite';
import { Query, ID, Permission, Role } from 'appwrite';
import { AppwriteListResponse } from '@/types/appwrite';

// Types
export interface Organism {
  $id: string;
  name: string;
  status: 'ok' | 'warning' | 'urgent';
  message: string;
  url?: string;
  userId: string;
  tags?: string[]; // Tags personnalisés
  isFavorite?: boolean; // Favori
  reminderDate?: string; // Date de rappel (YYYY-MM-DD)
  reminderMessage?: string; // Message de rappel
  notes?: string; // Notes au format JSON string
  attachments?: string; // Pièces jointes au format JSON string
  events?: string; // Événements calendrier au format JSON string
  $createdAt?: string;
  $updatedAt?: string;
}

export interface Transaction {
  $id: string;
  date: string;
  label: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  userId: string;
  $createdAt?: string;
}

export interface FileItem {
  $id: string;
  name: string;
  date: string;
  organism: string;
  type: string;
  size: string;
  fileId: string;
  userId: string;
  $createdAt?: string;
}

export interface EditorDocument {
  $id: string;
  userId: string;
  title: string;
  content: string;
  format?: 'text' | 'markdown' | 'html';
  metadata?: string; // JSON string
  settings?: string; // JSON string
  $createdAt: string;
  $updatedAt: string;
}

export interface EditorDocumentMetadata {
  wordCount: number;
  characterCount: number;
  paragraphCount: number;
  lastModified: string;
  version: number;
}

export interface EditorDocumentSettings {
  autoSave: boolean;
  autoSaveInterval: number;
}

export interface Address {
  street?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

export interface UserProfile {
  $id: string;
  userId: string;
  // Personnel
  firstName: string;
  lastName: string;
  birthDate?: string;
  phone?: string;
  avatar?: string; // File ID
  bio?: string;
  language: string;
  timezone: string;
  address?: Address;
  // Professionnel
  profession?: string;
  company?: string;
  professionalEmail?: string;
  professionalPhone?: string;
  website?: string;
  sector?: string;
  status?: 'employee' | 'freelancer' | 'retired' | 'student' | 'other';
  jobDescription?: string;
  professionalAddress?: Address;
  // Métadonnées
  createdAt: string;
  updatedAt: string;
}

// Query Keys
export const queryKeys = {
  organisms: (userId: string) => ['organisms', userId],
  transactions: (userId: string) => ['transactions', userId],
  documents: (userId: string) => ['documents', userId],
  profile: (userId: string) => ['profile', userId],
  editorDocument: (documentId: string) => ['editor-document', documentId],
  editorDocuments: (userId: string) => ['editor-documents', userId],
};

// Hooks pour les Organismes
export function useOrganisms(userId: string | null) {
  return useQuery({
    queryKey: userId ? queryKeys.organisms(userId) : ['organisms', 'null'],
    queryFn: async () => {
      if (!userId) return [];
      const response = await databases.listDocuments(
        'adminibox_db',
        'organisms',
        [Query.equal('userId', userId)]
      ) as unknown as AppwriteListResponse<any>;

      // Reconstruire les objets Organism depuis les données Appwrite
      return response.documents.map((doc: any) => ({
        ...doc,
        tags: doc.tags ? (typeof doc.tags === 'string' ? doc.tags.split(',').filter((t: string) => t.trim()) : doc.tags) : [],
        isFavorite: doc.isFavorite === true || doc.isFavorite === 'true',
        emailPatterns: doc.emailPatterns || undefined,
        $createdAt: doc.$createdAt || doc.createdAt || new Date().toISOString(),
      })) as Organism[];
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (anciennement cacheTime)
  });
}

export function useCreateOrganism() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: Omit<Organism, '$id' | 'userId'> }) => {
      // Appwrite ne supporte pas les tableaux, donc on aplatit les tags en string
      const cleanData: any = { ...data };
      if (data.tags) {
        cleanData.tags = Array.isArray(data.tags) ? data.tags.join(',') : data.tags;
      }
      return await databases.createDocument(
        'adminibox_db',
        'organisms',
        ID.unique(),
        {
          ...cleanData,
          userId,
        },
        [
          Permission.read(Role.user(userId)),
          Permission.write(Role.user(userId)),
          Permission.update(Role.user(userId)),
          Permission.delete(Role.user(userId)),
        ]
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organisms(variables.userId) });
    },
  });
}

export function useUpdateOrganism() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, userId, updates }: { id: string; userId: string; updates: Partial<Organism> }) => {
      // Appwrite ne supporte pas les tableaux, donc on aplatit les tags en string
      const cleanUpdates: any = {};

      // Ne copier que les champs définis et non-undefined
      Object.keys(updates).forEach(key => {
        const value = (updates as any)[key];
        if (value !== undefined && value !== null) {
          if (key === 'tags') {
            cleanUpdates.tags = Array.isArray(value) ? value.join(',') : value;
          } else if (key === 'notes' && typeof value === 'object') {
            cleanUpdates.notes = JSON.stringify(value);
          } else if (key === 'attachments' && typeof value === 'object') {
            cleanUpdates.attachments = JSON.stringify(value);
          } else if (key === 'events' && typeof value === 'object') {
            cleanUpdates.events = JSON.stringify(value);
          } else {
            cleanUpdates[key] = value;
          }
        }
      });

      // Vérifier qu'on a au moins une donnée à mettre à jour
      if (Object.keys(cleanUpdates).length === 0) {
        throw new Error('No data to update');
      }

      return await databases.updateDocument(
        'adminibox_db',
        'organisms',
        id,
        cleanUpdates
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organisms(variables.userId) });
    },
  });
}

export function useDeleteOrganism() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      return await databases.deleteDocument(
        'adminibox_db',
        'organisms',
        id
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organisms(variables.userId) });
    },
  });
}

// Hooks pour les Transactions
export function useTransactions(userId: string | null) {
  return useQuery({
    queryKey: userId ? queryKeys.transactions(userId) : ['transactions', 'null'],
    queryFn: async () => {
      if (!userId) return [];
      const response = await databases.listDocuments(
        'adminibox_db',
        'transactions',
        [
          Query.equal('userId', userId),
          Query.orderDesc('date')
        ]
      ) as unknown as AppwriteListResponse<Transaction>;
      return response.documents as Transaction[];
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: Omit<Transaction, '$id' | 'userId'> }) => {
      return await databases.createDocument(
        'adminibox_db',
        'transactions',
        ID.unique(),
        {
          ...data,
          userId,
        },
        [
          Permission.read(Role.user(userId)),
          Permission.write(Role.user(userId)),
          Permission.update(Role.user(userId)),
          Permission.delete(Role.user(userId)),
        ]
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions(variables.userId) });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      return await databases.deleteDocument('adminibox_db', 'transactions', id);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions(variables.userId) });
    },
  });
}

// Hooks pour les Documents
export function useDocuments(userId: string | null) {
  return useQuery({
    queryKey: userId ? queryKeys.documents(userId) : ['documents', 'null'],
    queryFn: async () => {
      if (!userId) return [];
      const response = await databases.listDocuments(
        'adminibox_db',
        'documents',
        [Query.equal('userId', userId)]
      ) as unknown as AppwriteListResponse<FileItem>;
      return response.documents as FileItem[];
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, file, metadata }: {
      userId: string;
      file: File;
      metadata: Omit<FileItem, '$id' | 'fileId' | 'userId'>
    }) => {
      // 1. Upload to Storage
      const storageResponse = await storage.createFile(
        'documents_bucket',
        ID.unique(),
        file,
        [
          Permission.read(Role.user(userId)),
          Permission.write(Role.user(userId)),
          Permission.update(Role.user(userId)),
          Permission.delete(Role.user(userId)),
        ]
      );

      // 2. Create Metadata in DB
      // Exclure 'size' car il n'est pas (encore) défini dans le schéma de la base de données Appwrite
      // et provoque une erreur 400.
      const { size, ...cleanMetadata } = metadata as any;

      return await databases.createDocument(
        'adminibox_db',
        'documents',
        ID.unique(),
        {
          ...cleanMetadata,
          fileId: storageResponse.$id,
          userId,
        },
        [
          Permission.read(Role.user(userId)),
          Permission.write(Role.user(userId)),
          Permission.update(Role.user(userId)),
          Permission.delete(Role.user(userId)),
        ]
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents(variables.userId) });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ docId, fileId, userId }: { docId: string; fileId: string; userId: string }) => {
      await storage.deleteFile('documents_bucket', fileId);
      return await databases.deleteDocument('adminibox_db', 'documents', docId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents(variables.userId) });
    },
  });
}

// Hooks pour le Profil Utilisateur
export function useUserProfile(userId: string | null) {
  return useQuery({
    queryKey: userId ? queryKeys.profile(userId) : ['profile', 'null'],
    queryFn: async () => {
      if (!userId) return null;
      try {
        const response = await databases.listDocuments(
          'adminibox_db',
          'user_profiles',
          [Query.equal('userId', userId)]
        ) as unknown as AppwriteListResponse<any>;

        if (response.documents.length > 0) {
          const doc = response.documents[0];
          // Reconstruire les objets d'adresse depuis les champs aplatis
          const profile: UserProfile = {
            $id: doc.$id,
            userId: doc.userId,
            firstName: doc.firstName || '',
            lastName: doc.lastName || '',
            birthDate: doc.birthDate || undefined,
            phone: doc.phone || undefined,
            avatar: doc.avatar || undefined,
            bio: doc.bio || undefined,
            language: doc.language || 'fr',
            timezone: doc.timezone || 'Europe/Paris',
            address: (doc.addressStreet || doc.addressCity) ? {
              street: doc.addressStreet || undefined,
              city: doc.addressCity || undefined,
              postalCode: doc.addressPostalCode || undefined,
              country: doc.addressCountry || undefined,
            } : undefined,
            profession: doc.profession || undefined,
            company: doc.company || undefined,
            professionalEmail: doc.professionalEmail || undefined,
            professionalPhone: doc.professionalPhone || undefined,
            website: doc.website || undefined,
            sector: doc.sector || undefined,
            status: doc.status || undefined,
            jobDescription: doc.jobDescription || undefined,
            professionalAddress: (doc.professionalAddressStreet || doc.professionalAddressCity) ? {
              street: doc.professionalAddressStreet || undefined,
              city: doc.professionalAddressCity || undefined,
              postalCode: doc.professionalAddressPostalCode || undefined,
              country: doc.professionalAddressCountry || undefined,
            } : undefined,
            createdAt: doc.$createdAt || new Date().toISOString(),
            updatedAt: doc.$updatedAt || new Date().toISOString(),
          };
          return profile;
        }
        return null;
      } catch (error: any) {
        // Si la collection n'existe pas encore, retourner null
        console.warn('Profile collection may not exist:', error?.message);
        return null;
      }
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useCreateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: Partial<UserProfile> }) => {
      // Nettoyer les données (supprimer les champs vides pour les objets optionnels)
      const cleanData: any = {
        userId,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        language: data.language || 'fr',
        timezone: data.timezone || 'Europe/Paris',
      };

      // Ajouter les champs optionnels seulement s'ils ont une valeur
      if (data.birthDate) cleanData.birthDate = data.birthDate;
      if (data.phone) cleanData.phone = data.phone;
      if (data.avatar) cleanData.avatar = data.avatar;
      if (data.bio) cleanData.bio = data.bio;

      // Adresse personnelle
      if (data.address) {
        if (data.address.street) cleanData.addressStreet = data.address.street;
        if (data.address.city) cleanData.addressCity = data.address.city;
        if (data.address.postalCode) cleanData.addressPostalCode = data.address.postalCode;
        if (data.address.country) cleanData.addressCountry = data.address.country;
      }

      // Professionnel
      if (data.profession) cleanData.profession = data.profession;
      if (data.company) cleanData.company = data.company;
      if (data.professionalEmail) cleanData.professionalEmail = data.professionalEmail;
      if (data.professionalPhone) cleanData.professionalPhone = data.professionalPhone;
      if (data.website) cleanData.website = data.website;
      if (data.sector) cleanData.sector = data.sector;
      if (data.status) cleanData.status = data.status;
      if (data.jobDescription) cleanData.jobDescription = data.jobDescription;

      // Adresse professionnelle
      if (data.professionalAddress) {
        if (data.professionalAddress.street) cleanData.professionalAddressStreet = data.professionalAddress.street;
        if (data.professionalAddress.city) cleanData.professionalAddressCity = data.professionalAddress.city;
        if (data.professionalAddress.postalCode) cleanData.professionalAddressPostalCode = data.professionalAddress.postalCode;
        if (data.professionalAddress.country) cleanData.professionalAddressCountry = data.professionalAddress.country;
      }

      return await databases.createDocument(
        'adminibox_db',
        'user_profiles',
        ID.unique(),
        cleanData,
        [
          Permission.read(Role.user(userId)),
          Permission.write(Role.user(userId)),
          Permission.update(Role.user(userId)),
          Permission.delete(Role.user(userId)),
        ]
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile(variables.userId) });
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ profileId, userId, data }: { profileId: string; userId: string; data: Partial<UserProfile> }) => {
      // Nettoyer les données (aplatir les objets imbriqués)
      const cleanData: any = {};

      // Champs simples
      if (data.firstName !== undefined) cleanData.firstName = data.firstName;
      if (data.lastName !== undefined) cleanData.lastName = data.lastName;
      if (data.birthDate !== undefined) cleanData.birthDate = data.birthDate;
      if (data.phone !== undefined) cleanData.phone = data.phone;
      if (data.avatar !== undefined) cleanData.avatar = data.avatar;
      if (data.bio !== undefined) cleanData.bio = data.bio;
      if (data.language !== undefined) cleanData.language = data.language;
      if (data.timezone !== undefined) cleanData.timezone = data.timezone;

      // Adresse personnelle (aplatie)
      if (data.address) {
        if (data.address.street !== undefined) cleanData.addressStreet = data.address.street;
        if (data.address.city !== undefined) cleanData.addressCity = data.address.city;
        if (data.address.postalCode !== undefined) cleanData.addressPostalCode = data.address.postalCode;
        if (data.address.country !== undefined) cleanData.addressCountry = data.address.country;
      }

      // Professionnel
      if (data.profession !== undefined) cleanData.profession = data.profession;
      if (data.company !== undefined) cleanData.company = data.company;
      if (data.professionalEmail !== undefined) cleanData.professionalEmail = data.professionalEmail;
      if (data.professionalPhone !== undefined) cleanData.professionalPhone = data.professionalPhone;
      if (data.website !== undefined) cleanData.website = data.website;
      if (data.sector !== undefined) cleanData.sector = data.sector;
      if (data.status !== undefined) cleanData.status = data.status;
      if (data.jobDescription !== undefined) cleanData.jobDescription = data.jobDescription;

      // Adresse professionnelle (aplatie)
      if (data.professionalAddress) {
        if (data.professionalAddress.street !== undefined) cleanData.professionalAddressStreet = data.professionalAddress.street;
        if (data.professionalAddress.city !== undefined) cleanData.professionalAddressCity = data.professionalAddress.city;
        if (data.professionalAddress.postalCode !== undefined) cleanData.professionalAddressPostalCode = data.professionalAddress.postalCode;
        if (data.professionalAddress.country !== undefined) cleanData.professionalAddressCountry = data.professionalAddress.country;
      }

      // Vérifier qu'on a au moins une donnée à mettre à jour
      if (Object.keys(cleanData).length === 0) {
        throw new Error('No data to update');
      }

      return await databases.updateDocument(
        'adminibox_db',
        'user_profiles',
        profileId,
        cleanData
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile(variables.userId) });
    },
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, file }: { userId: string; file: File }) => {
      // Utiliser documents_bucket comme bucket principal car avatars peut ne pas exister
      // (limite de buckets atteinte sur certains plans Appwrite)
      let bucketId = 'documents_bucket';

      // Essayer d'abord avec avatars si disponible
      try {
        await storage.listFiles('avatars', [Query.limit(1)]);
        bucketId = 'avatars';
      } catch (error: any) {
        // Si le bucket avatars n'existe pas, utiliser documents_bucket
        console.warn('Bucket avatars not found, using documents_bucket as fallback');
        bucketId = 'documents_bucket';
      }

      try {
        // Supprimer l'ancien avatar si existe
        const profile = await databases.listDocuments(
          'adminibox_db',
          'user_profiles',
          [Query.equal('userId', userId)]
        ) as unknown as AppwriteListResponse<UserProfile>;

        if (profile.documents.length > 0 && profile.documents[0].avatar) {
          try {
            // Essayer de supprimer depuis les deux buckets possibles
            try {
              await storage.deleteFile(bucketId, profile.documents[0].avatar);
            } catch {
              // Si ça échoue, essayer avec l'autre bucket
              const otherBucket = bucketId === 'avatars' ? 'documents_bucket' : 'avatars';
              try {
                await storage.deleteFile(otherBucket, profile.documents[0].avatar);
              } catch {
                // Ignorer si les deux échouent
                console.warn('Could not delete old avatar from any bucket');
              }
            }
          } catch (error) {
            console.warn('Could not delete old avatar:', error);
          }
        }

        // Upload du nouvel avatar
        const response = await storage.createFile(
          bucketId,
          ID.unique(),
          file,
          [
            Permission.read(Role.any()), // Avatar public
            Permission.write(Role.user(userId)),
            Permission.update(Role.user(userId)),
            Permission.delete(Role.user(userId)),
          ]
        );

        return response.$id;
      } catch (error: any) {
        // Si l'erreur est liée au bucket et qu'on n'était pas déjà sur documents_bucket
        if ((error?.message?.includes('bucket') || error?.message?.includes('Bucket')) && bucketId !== 'documents_bucket') {
          console.warn('Retrying with documents_bucket');
          const response = await storage.createFile(
            'documents_bucket',
            ID.unique(),
            file,
            [
              Permission.read(Role.any()),
              Permission.write(Role.user(userId)),
              Permission.update(Role.user(userId)),
              Permission.delete(Role.user(userId)),
            ]
          );
          return response.$id;
        }
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile(variables.userId) });
    },
  });
}

// Hooks pour l'Éditeur de Documents
export function useEditorDocument(documentId: string | null, userId: string | null) {
  return useQuery({
    queryKey: documentId ? queryKeys.editorDocument(documentId) : ['editor-document', 'null'],
    queryFn: async () => {
      if (!documentId || !userId) return null;
      const doc = await databases.getDocument(
        'adminibox_db',
        'documents_editor',
        documentId
      ) as any;

      // Vérification de sécurité : s'assurer que le document appartient à l'utilisateur
      if (doc.userId !== userId) {
        throw new Error('Accès non autorisé à ce document');
      }

      // Parser les JSON strings
      return {
        ...doc,
        metadata: doc.metadata ? JSON.parse(doc.metadata) : {
          wordCount: 0,
          characterCount: 0,
          paragraphCount: 0,
          lastModified: doc.$updatedAt || doc.$createdAt,
          version: 1,
        },
        settings: doc.settings ? JSON.parse(doc.settings) : {
          autoSave: true,
          autoSaveInterval: 30,
        },
      } as EditorDocument & { metadata: EditorDocumentMetadata; settings: EditorDocumentSettings };
    },
    enabled: !!documentId && !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useEditorDocuments(userId: string | null) {
  return useQuery({
    queryKey: userId ? queryKeys.editorDocuments(userId) : ['editor-documents', 'null'],
    queryFn: async () => {
      if (!userId) return [];
      const response = await databases.listDocuments(
        'adminibox_db',
        'documents_editor',
        [
          Query.equal('userId', userId),
          Query.orderDesc('$updatedAt'),
        ]
      ) as unknown as AppwriteListResponse<EditorDocument>;

      return response.documents.map((doc: any) => ({
        ...doc,
        metadata: doc.metadata ? JSON.parse(doc.metadata) : {
          wordCount: 0,
          characterCount: 0,
          paragraphCount: 0,
          lastModified: doc.$updatedAt || doc.$createdAt,
          version: 1,
        },
        settings: doc.settings ? JSON.parse(doc.settings) : {
          autoSave: true,
          autoSaveInterval: 30,
        },
      }));
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCreateEditorDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      title,
      content,
      format = 'text',
      metadata,
      settings,
    }: {
      userId: string;
      title: string;
      content: string;
      format?: 'text' | 'markdown' | 'html';
      metadata?: EditorDocumentMetadata;
      settings?: EditorDocumentSettings;
    }) => {
      const defaultMetadata: EditorDocumentMetadata = {
        wordCount: 0,
        characterCount: 0,
        paragraphCount: 0,
        lastModified: new Date().toISOString(),
        version: 1,
      };

      const defaultSettings: EditorDocumentSettings = {
        autoSave: true,
        autoSaveInterval: 30,
      };

      return await databases.createDocument(
        'adminibox_db',
        'documents_editor',
        ID.unique(),
        {
          userId,
          title,
          content,
          format,
          metadata: JSON.stringify(metadata || defaultMetadata),
          settings: JSON.stringify(settings || defaultSettings),
        },
        [
          Permission.read(Role.user(userId)),
          Permission.write(Role.user(userId)),
          Permission.update(Role.user(userId)),
          Permission.delete(Role.user(userId)),
        ]
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.editorDocuments(variables.userId) });
    },
  });
}

export function useUpdateEditorDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      documentId,
      userId,
      updates,
      metadata,
      settings,
    }: {
      documentId: string;
      userId: string;
      updates?: Partial<Pick<EditorDocument, 'title' | 'content' | 'format'>>;
      metadata?: Partial<EditorDocumentMetadata>;
      settings?: Partial<EditorDocumentSettings>;
    }) => {
      // Vérification de sécurité : récupérer le document et vérifier la propriété
      const currentDoc = await databases.getDocument(
        'adminibox_db',
        'documents_editor',
        documentId
      ) as any;

      // Vérifier que le document appartient à l'utilisateur
      if (currentDoc.userId !== userId) {
        throw new Error('Accès non autorisé : ce document ne vous appartient pas');
      }

      const currentMetadata: EditorDocumentMetadata = currentDoc.metadata
        ? JSON.parse(currentDoc.metadata)
        : {
          wordCount: 0,
          characterCount: 0,
          paragraphCount: 0,
          lastModified: currentDoc.$updatedAt || currentDoc.$createdAt,
          version: 1,
        };

      const currentSettings: EditorDocumentSettings = currentDoc.settings
        ? JSON.parse(currentDoc.settings)
        : {
          autoSave: true,
          autoSaveInterval: 30,
        };

      const cleanUpdates: any = {};
      if (updates?.title !== undefined) cleanUpdates.title = updates.title;
      if (updates?.content !== undefined) cleanUpdates.content = updates.content;
      if (updates?.format !== undefined) cleanUpdates.format = updates.format;

      if (metadata) {
        cleanUpdates.metadata = JSON.stringify({
          ...currentMetadata,
          ...metadata,
          lastModified: new Date().toISOString(),
          version: (currentMetadata.version || 1) + 1,
        });
      }

      if (settings) {
        cleanUpdates.settings = JSON.stringify({
          ...currentSettings,
          ...settings,
        });
      }

      if (Object.keys(cleanUpdates).length === 0) {
        throw new Error('No data to update');
      }

      return await databases.updateDocument(
        'adminibox_db',
        'documents_editor',
        documentId,
        cleanUpdates
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.editorDocument(variables.documentId) });
    },
  });
}

export function useDeleteEditorDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ documentId, userId }: { documentId: string; userId: string }) => {
      // Vérification de sécurité : vérifier que le document appartient à l'utilisateur avant suppression
      const doc = await databases.getDocument(
        'adminibox_db',
        'documents_editor',
        documentId
      ) as any;

      if (doc.userId !== userId) {
        throw new Error('Accès non autorisé : ce document ne vous appartient pas');
      }

      await databases.deleteDocument(
        'adminibox_db',
        'documents_editor',
        documentId
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.editorDocument(variables.documentId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.editorDocuments(variables.userId) });
    },
  });
}

