'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { professionalProfileSchema, type ProfessionalProfileFormData } from '@/lib/validations';
import { useCreateProfile, useUpdateProfile } from '@/lib/queries';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useEffect } from 'react';

interface ProfessionalProfileFormProps {
  profile: any;
}

export default function ProfessionalProfileForm({ profile }: ProfessionalProfileFormProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const createMutation = useCreateProfile();
  const updateMutation = useUpdateProfile();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProfessionalProfileFormData>({
    resolver: zodResolver(professionalProfileSchema),
    defaultValues: profile ? {
      profession: profile.profession || '',
      company: profile.company || '',
      professionalEmail: profile.professionalEmail || '',
      professionalPhone: profile.professionalPhone || '',
      website: profile.website || '',
      sector: profile.sector || '',
      status: profile.status || '',
      jobDescription: profile.jobDescription || '',
      professionalAddress: profile.professionalAddress || {
        street: '',
        city: '',
        postalCode: '',
        country: '',
      },
    } : {
      profession: '',
      company: '',
      professionalEmail: '',
      professionalPhone: '',
      website: '',
      sector: '',
      status: '',
      jobDescription: '',
      professionalAddress: {
        street: '',
        city: '',
        postalCode: '',
        country: '',
      },
    } as any,
  });

  useEffect(() => {
    if (profile) {
      reset({
        profession: profile.profession || '',
        company: profile.company || '',
        professionalEmail: profile.professionalEmail || '',
        professionalPhone: profile.professionalPhone || '',
        website: profile.website || '',
        sector: profile.sector || '',
        status: profile.status || '',
        jobDescription: profile.jobDescription || '',
        professionalAddress: profile.professionalAddress || {
          street: '',
          city: '',
          postalCode: '',
          country: '',
        },
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data: ProfessionalProfileFormData) => {
    if (!user) return;

    try {
      if (profile) {
        await updateMutation.mutateAsync({
          profileId: profile.$id,
          userId: user.$id,
          data: data as any,
        });
        showToast('Profil professionnel mis à jour avec succès', 'success');
      } else {
        // Si pas de profil, créer avec les données de base
        const nameParts = user.name?.split(' ') || [];
        await createMutation.mutateAsync({
          userId: user.$id,
          data: {
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            language: 'fr',
            timezone: 'Europe/Paris',
            ...(data as any),
          },
        });
        showToast('Profil professionnel créé avec succès', 'success');
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
      <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Informations Professionnelles</h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Profession */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--secondary)' }}>
            Profession / Métier
          </label>
          <input
            type="text"
            {...register('profession')}
            placeholder="Ex: Développeur, Consultant..."
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: 'var(--radius)',
              background: 'var(--input-bg)',
              border: errors.profession ? '1px solid var(--danger)' : '1px solid var(--input-border)',
              color: 'var(--foreground)',
            }}
          />
          {errors.profession && (
            <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
              {errors.profession.message}
            </p>
          )}
        </div>

        {/* Entreprise */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--secondary)' }}>
            Entreprise / Organisation
          </label>
          <input
            type="text"
            {...register('company')}
            placeholder="Ex: Google, Microsoft..."
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: 'var(--radius)',
              background: 'var(--input-bg)',
              border: errors.company ? '1px solid var(--danger)' : '1px solid var(--input-border)',
              color: 'var(--foreground)',
            }}
          />
          {errors.company && (
            <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
              {errors.company.message}
            </p>
          )}
        </div>

        {/* Statut */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--secondary)' }}>
            Statut professionnel
          </label>
          <select
            {...register('status')}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: 'var(--radius)',
              background: 'var(--input-bg)',
              border: errors.status ? '1px solid var(--danger)' : '1px solid var(--input-border)',
              color: 'var(--foreground)',
            }}
          >
            <option value="">Sélectionner...</option>
            <option value="employee">Salarié</option>
            <option value="freelancer">Indépendant / Freelance</option>
            <option value="retired">Retraité</option>
            <option value="student">Étudiant</option>
            <option value="other">Autre</option>
          </select>
          {errors.status && (
            <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
              {errors.status.message}
            </p>
          )}
        </div>

        {/* Secteur */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--secondary)' }}>
            Secteur d'activité
          </label>
          <input
            type="text"
            {...register('sector')}
            placeholder="Ex: Informatique, Finance..."
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: 'var(--radius)',
              background: 'var(--input-bg)',
              border: errors.sector ? '1px solid var(--danger)' : '1px solid var(--input-border)',
              color: 'var(--foreground)',
            }}
          />
          {errors.sector && (
            <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
              {errors.sector.message}
            </p>
          )}
        </div>

        {/* Email professionnel */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--secondary)' }}>
            Email professionnel
          </label>
          <input
            type="email"
            {...register('professionalEmail')}
            placeholder="contact@entreprise.com"
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: 'var(--radius)',
              background: 'var(--input-bg)',
              border: errors.professionalEmail ? '1px solid var(--danger)' : '1px solid var(--input-border)',
              color: 'var(--foreground)',
            }}
          />
          {errors.professionalEmail && (
            <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
              {errors.professionalEmail.message}
            </p>
          )}
        </div>

        {/* Téléphone professionnel */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--secondary)' }}>
            Téléphone professionnel
          </label>
          <input
            type="tel"
            {...register('professionalPhone')}
            placeholder="+33 1 23 45 67 89"
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: 'var(--radius)',
              background: 'var(--input-bg)',
              border: errors.professionalPhone ? '1px solid var(--danger)' : '1px solid var(--input-border)',
              color: 'var(--foreground)',
            }}
          />
          {errors.professionalPhone && (
            <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
              {errors.professionalPhone.message}
            </p>
          )}
        </div>

        {/* Site web */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--secondary)' }}>
            Site web professionnel
          </label>
          <input
            type="url"
            {...register('website')}
            placeholder="https://www.exemple.com"
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: 'var(--radius)',
              background: 'var(--input-bg)',
              border: errors.website ? '1px solid var(--danger)' : '1px solid var(--input-border)',
              color: 'var(--foreground)',
            }}
          />
          {errors.website && (
            <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
              {errors.website.message}
            </p>
          )}
        </div>
      </div>

      {/* Adresse professionnelle */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--foreground)' }}>Adresse Professionnelle</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--secondary)' }}>
              Rue
            </label>
            <input
              type="text"
              {...register('professionalAddress.street')}
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
              {...register('professionalAddress.postalCode')}
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
              {...register('professionalAddress.city')}
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
              {...register('professionalAddress.country')}
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

      {/* Description du poste */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--secondary)' }}>
          Description du poste / Responsabilités
        </label>
        <textarea
          {...register('jobDescription')}
          rows={4}
          placeholder="Décrivez votre poste et vos responsabilités..."
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: 'var(--radius)',
            background: 'var(--input-bg)',
            border: errors.jobDescription ? '1px solid var(--danger)' : '1px solid var(--input-border)',
            color: 'var(--foreground)',
            resize: 'vertical',
            fontFamily: 'inherit',
          }}
        />
        {errors.jobDescription && (
          <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
            {errors.jobDescription.message}
          </p>
        )}
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

