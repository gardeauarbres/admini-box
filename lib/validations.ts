import { z } from 'zod';

// Schéma de validation pour un organisme
export const organismSchema = z.object({
  name: z.string()
    .min(2, "Le nom doit faire au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  url: z.string()
    .url("URL invalide. Format attendu: https://exemple.com")
    .optional()
    .or(z.literal("")),
  status: z.enum(['ok', 'warning', 'urgent']),
  message: z.string()
    .max(500, "Le message ne peut pas dépasser 500 caractères")
    .optional()
    .or(z.literal("")),
  tags: z.array(z.string())
    .max(10, "Maximum 10 tags")
    .optional(),
  isFavorite: z.boolean().optional(),
  reminderDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide (YYYY-MM-DD)")
    .optional()
    .or(z.literal("")),
  reminderMessage: z.string()
    .max(200, "Le message de rappel ne peut pas dépasser 200 caractères")
    .optional()
    .or(z.literal("")),
});

export type OrganismFormData = z.infer<typeof organismSchema>;

// Schéma de validation pour une transaction
export const transactionSchema = z.object({
  label: z.string()
    .min(2, "Le libellé doit faire au moins 2 caractères")
    .max(255, "Le libellé ne peut pas dépasser 255 caractères"),
  amount: z.number()
    .positive("Le montant doit être positif")
    .max(999999.99, "Le montant est trop élevé"),
  category: z.string()
    .min(1, "La catégorie est requise"),
  type: z.enum(['income', 'expense']),
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide (YYYY-MM-DD)"),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;

// Schéma de validation pour la connexion
export const loginSchema = z.object({
  email: z.string()
    .email("Email invalide")
    .min(1, "L'email est requis"),
  password: z.string()
    .min(8, "Le mot de passe doit faire au moins 8 caractères")
    .max(100, "Le mot de passe est trop long"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Schéma de validation pour l'inscription
export const registerSchema = z.object({
  name: z.string()
    .min(2, "Le nom doit faire au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères")
    .regex(/^[a-zA-ZÀ-ÿ\s-']+$/, "Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes"),
  email: z.string()
    .email("Email invalide")
    .min(1, "L'email est requis"),
  password: z.string()
    .min(8, "Le mot de passe doit faire au moins 8 caractères")
    .max(100, "Le mot de passe est trop long")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
    .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

// Schéma de validation pour l'éditeur de documents
export const documentSchema = z.object({
  title: z.string()
    .min(1, "Le titre est requis")
    .max(255, "Le titre ne peut pas dépasser 255 caractères"),
  content: z.string()
    .min(1, "Le contenu est requis")
    .max(100000, "Le contenu est trop long"),
});

export type DocumentFormData = z.infer<typeof documentSchema>;

// Schéma de validation pour l'adresse
export const addressSchema = z.object({
  street: z.string().max(255, "L'adresse est trop longue").optional().or(z.literal('')),
  city: z.string().max(100, "La ville est trop longue").optional().or(z.literal('')),
  postalCode: z.string().max(20, "Le code postal est trop long").optional().or(z.literal('')),
  country: z.string().max(100, "Le pays est trop long").optional().or(z.literal('')),
});

export type AddressFormData = z.infer<typeof addressSchema>;

// Schéma de validation pour le profil personnel
export const personalProfileSchema = z.object({
  firstName: z.string()
    .min(1, "Le prénom est requis")
    .max(100, "Le prénom est trop long")
    .regex(/^[a-zA-ZÀ-ÿ\s-']+$/, "Le prénom ne peut contenir que des lettres"),
  lastName: z.string()
    .min(1, "Le nom est requis")
    .max(100, "Le nom est trop long")
    .regex(/^[a-zA-ZÀ-ÿ\s-']+$/, "Le nom ne peut contenir que des lettres"),
  birthDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide (YYYY-MM-DD)")
    .optional()
    .or(z.literal('')),
  phone: z.string()
    .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, "Numéro de téléphone invalide")
    .optional()
    .or(z.literal('')),
  bio: z.string()
    .max(1000, "La bio ne peut pas dépasser 1000 caractères")
    .optional()
    .or(z.literal('')),
  language: z.string().default('fr'),
  timezone: z.string().default('Europe/Paris'),
  address: addressSchema.optional(),
});

export type PersonalProfileFormData = z.infer<typeof personalProfileSchema>;

// Schéma de validation pour le profil professionnel
export const professionalProfileSchema = z.object({
  profession: z.string()
    .max(100, "La profession est trop longue")
    .optional()
    .or(z.literal('')),
  company: z.string()
    .max(100, "Le nom de l'entreprise est trop long")
    .optional()
    .or(z.literal('')),
  professionalEmail: z.string()
    .email("Email professionnel invalide")
    .optional()
    .or(z.literal('')),
  professionalPhone: z.string()
    .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, "Numéro de téléphone invalide")
    .optional()
    .or(z.literal('')),
  website: z.string()
    .url("URL invalide")
    .optional()
    .or(z.literal('')),
  sector: z.string()
    .max(100, "Le secteur est trop long")
    .optional()
    .or(z.literal('')),
  status: z.enum(['employee', 'freelancer', 'retired', 'student', 'other', ''] as const)
    .optional()
    .or(z.literal('')),
  jobDescription: z.string()
    .max(1000, "La description est trop longue")
    .optional()
    .or(z.literal('')),
  professionalAddress: addressSchema.optional(),
});

export type ProfessionalProfileFormData = z.infer<typeof professionalProfileSchema>;

// Schéma de validation pour le changement de mot de passe
export const changePasswordSchema = z.object({
  currentPassword: z.string()
    .min(1, "Le mot de passe actuel est requis"),
  newPassword: z.string()
    .min(8, "Le nouveau mot de passe doit faire au moins 8 caractères")
    .max(100, "Le mot de passe est trop long")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
    .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
  confirmPassword: z.string()
    .min(1, "La confirmation est requise"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

