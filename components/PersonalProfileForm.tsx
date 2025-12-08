'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { personalProfileSchema, type PersonalProfileFormData } from '@/lib/validations';
import { useUserProfile, useCreateProfile, useUpdateProfile } from '@/lib/queries';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useEffect } from 'react';

interface PersonalProfileFormProps {
  profile: any;
}

export default function PersonalProfileForm({ profile }: PersonalProfileFormProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const createMutation = useCreateProfile();
  const updateMutation = useUpdateProfile();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PersonalProfileFormData>({
    resolver: zodResolver(personalProfileSchema),
    defaultValues: profile ? {
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      birthDate: profile.birthDate || '',
      phone: profile.phone || '',
      bio: profile.bio || '',
      language: profile.language || 'fr',
      timezone: profile.timezone || 'Europe/Paris',
      address: profile.address || {
        street: '',
        city: '',
        postalCode: '',
        country: '',
      },
    } : {
      firstName: '',
      lastName: '',
      birthDate: '',
      phone: '',
      bio: '',
      language: 'fr',
      timezone: 'Europe/Paris',
      address: {
        street: '',
        city: '',
        postalCode: '',
        country: '',
      },
    },
  } as any);

  useEffect(() => {
    if (profile) {
      reset({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        birthDate: profile.birthDate || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        language: profile.language || 'fr',
        timezone: profile.timezone || 'Europe/Paris',
        address: profile.address || {
          street: '',
          city: '',
          postalCode: '',
          country: '',
        },
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data: PersonalProfileFormData) => {
    if (!user) return;

    try {
      if (profile) {
        await updateMutation.mutateAsync({
          profileId: profile.$id,
          userId: user.$id,
          data,
        });
        showToast('Profil personnel mis à jour avec succès', 'success');
      } else {
        await createMutation.mutateAsync({
          userId: user.$id,
          data,
        });
        showToast('Profil personnel créé avec succès', 'success');
      }
    } catch (error: any) {
      console.error('Error saving profile:', error);
      const errorMessage = error?.message || 'Erreur lors de la sauvegarde';

      // Messages d'erreur plus spécifiques
      if (errorMessage.includes('collection') || errorMessage.includes('not found')) {
        showToast('La collection de profils n\'existe pas. Veuillez exécuter le script d\'initialisation.', 'error');
      } else if (errorMessage.includes('permission') || errorMessage.includes('forbidden')) {
        showToast('Vous n\'avez pas les permissions nécessaires.', 'error');
      } else if (errorMessage.includes('required') || errorMessage.includes('invalid')) {
        showToast('Veuillez vérifier que tous les champs requis sont remplis.', 'error');
      } else {
        showToast(`Erreur: ${errorMessage}`, 'error');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="glass-panel" style={{ padding: '2rem' }}>
      <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Informations Personnelles</h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Prénom */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--secondary)' }}>
            Prénom *
          </label>
          <input
            type="text"
            {...register('firstName')}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: 'var(--radius)',
              background: 'var(--input-bg)',
              border: errors.firstName ? '1px solid var(--danger)' : '1px solid var(--input-border)',
              color: 'var(--foreground)',
            }}
          />
          {errors.firstName && (
            <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
              {errors.firstName.message}
            </p>
          )}
        </div>

        {/* Nom */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--secondary)' }}>
            Nom *
          </label>
          <input
            type="text"
            {...register('lastName')}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: 'var(--radius)',
              background: 'var(--input-bg)',
              border: errors.lastName ? '1px solid var(--danger)' : '1px solid var(--input-border)',
              color: 'var(--foreground)',
            }}
          />
          {errors.lastName && (
            <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
              {errors.lastName.message}
            </p>
          )}
        </div>

        {/* Date de naissance */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--secondary)' }}>
            Date de naissance
          </label>
          <input
            type="date"
            {...register('birthDate')}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: 'var(--radius)',
              background: 'var(--input-bg)',
              border: errors.birthDate ? '1px solid var(--danger)' : '1px solid var(--input-border)',
              color: 'var(--foreground)',
            }}
          />
          {errors.birthDate && (
            <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
              {errors.birthDate.message}
            </p>
          )}
        </div>

        {/* Téléphone */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--secondary)' }}>
            Téléphone
          </label>
          <input
            type="tel"
            {...register('phone')}
            placeholder="+33 6 12 34 56 78"
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: 'var(--radius)',
              background: 'var(--input-bg)',
              border: errors.phone ? '1px solid var(--danger)' : '1px solid var(--input-border)',
              color: 'var(--foreground)',
            }}
          />
          {errors.phone && (
            <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
              {errors.phone.message}
            </p>
          )}
        </div>
      </div>

      {/* Adresse */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--foreground)' }}>Adresse</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--secondary)' }}>
              Rue
            </label>
            <input
              type="text"
              {...register('address.street')}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 'var(--radius)',
                background: 'var(--input-bg)',
                border: '1px solid var(--input-border)',
                color: 'var(--foreground)',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--secondary)' }}>
              Code postal
            </label>
            <input
              type="text"
              {...register('address.postalCode')}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 'var(--radius)',
                background: 'var(--input-bg)',
                border: '1px solid var(--input-border)',
                color: 'var(--foreground)',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--secondary)' }}>
              Ville
            </label>
            <input
              type="text"
              {...register('address.city')}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 'var(--radius)',
                background: 'var(--input-bg)',
                border: '1px solid var(--input-border)',
                color: 'var(--foreground)',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--secondary)' }}>
              Pays
            </label>
            <input
              type="text"
              {...register('address.country')}
              placeholder="France"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 'var(--radius)',
                background: 'var(--input-bg)',
                border: '1px solid var(--input-border)',
                color: 'var(--foreground)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Bio */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--secondary)' }}>
          Bio / Description personnelle
        </label>
        <textarea
          {...register('bio')}
          rows={4}
          placeholder="Parlez-nous un peu de vous..."
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: 'var(--radius)',
            background: 'var(--input-bg)',
            border: errors.bio ? '1px solid var(--danger)' : '1px solid var(--input-border)',
            color: 'var(--foreground)',
            resize: 'vertical',
            fontFamily: 'inherit',
          }}
        />
        {errors.bio && (
          <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
            {errors.bio.message}
          </p>
        )}
      </div>

      {/* Langue et Fuseau horaire */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--secondary)' }}>
            Langue
          </label>
          <select
            {...register('language')}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: 'var(--radius)',
              background: 'var(--input-bg)',
              border: '1px solid var(--input-border)',
              color: 'var(--foreground)',
            }}
          >
            <option value="fr">Français</option>
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="de">Deutsch</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--secondary)' }}>
            Fuseau horaire
          </label>
          <select
            {...register('timezone')}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: 'var(--radius)',
              background: 'var(--input-bg)',
              border: '1px solid var(--input-border)',
              color: 'var(--foreground)',
            }}
          >
            <option value="Europe/Paris">Europe/Paris (GMT+1)</option>
            <option value="Europe/London">Europe/London (GMT+0)</option>
            <option value="America/New_York">America/New_York (GMT-5)</option>
            <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn btn-primary"
        style={{ width: '100%' }}
      >
        {isSubmitting ? 'Sauvegarde...' : 'Enregistrer les modifications'}
      </button>
    </form>
  );
}

