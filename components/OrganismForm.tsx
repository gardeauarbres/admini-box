'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { organismSchema, type OrganismFormData } from '@/lib/validations';

interface OrganismFormProps {
  onSubmit: (data: OrganismFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  defaultValues?: Partial<OrganismFormData>;
}

export default function OrganismForm({
  onSubmit,
  onCancel,
  isSubmitting = false,
  defaultValues
}: OrganismFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<OrganismFormData>({
    resolver: zodResolver(organismSchema),
    defaultValues: defaultValues || {
      name: '',
      url: '',
      status: 'ok',
      message: ''
    }
  });

  const onFormSubmit = async (data: OrganismFormData) => {
    await onSubmit(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
      <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>
        {defaultValues ? 'Modifier l\'organisme' : 'Nouvel Organisme'}
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {/* Nom */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--secondary)' }}>
            Nom de l'organisme *
          </label>
          <input
            type="text"
            {...register('name')}
            placeholder="Ex: MSA, Préfecture..."
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: 'var(--radius)',
              background: 'var(--input-bg)',
              border: errors.name ? '1px solid var(--danger)' : '1px solid var(--card-border)',
              color: 'var(--foreground)'
            }}
          />
          {errors.name && (
            <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
              {errors.name.message}
            </p>
          )}
        </div>

        {/* URL */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--secondary)' }}>
            URL du portail
          </label>
          <input
            type="url"
            {...register('url')}
            placeholder="https://..."
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: 'var(--radius)',
              background: 'var(--input-bg)',
              border: errors.url ? '1px solid var(--danger)' : '1px solid var(--card-border)',
              color: 'var(--foreground)'
            }}
          />
          {errors.url && (
            <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
              {errors.url.message}
            </p>
          )}
        </div>

        {/* Statut */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--secondary)' }}>
            Statut
          </label>
          <select
            {...register('status')}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: 'var(--radius)',
              background: 'var(--input-bg)',
              border: errors.status ? '1px solid var(--danger)' : '1px solid var(--card-border)',
              color: 'var(--foreground)'
            }}
          >
            <option value="ok">OK</option>
            <option value="warning">Attention</option>
            <option value="urgent">Urgent</option>
          </select>
          {errors.status && (
            <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
              {errors.status.message}
            </p>
          )}
        </div>

        {/* Message */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--secondary)' }}>
            Message
          </label>
          <input
            type="text"
            {...register('message')}
            placeholder="Ex: Déclaration à faire avant le..."
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: 'var(--radius)',
              background: 'var(--input-bg)',
              border: errors.message ? '1px solid var(--danger)' : '1px solid var(--card-border)',
              color: 'var(--foreground)'
            }}
          />
          {errors.message && (
            <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
              {errors.message.message}
            </p>
          )}
        </div>
      </div>

      {/* SECTION RAPPELS / CALENDRIER */}
      <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--card-border)' }}>
        <h4 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--accent)' }}>📅 Rappel & Calendrier</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>

          {/* Date de rappel */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--secondary)' }}>
              Date limite / Rappel
            </label>
            <input
              type="date"
              {...register('reminderDate')}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 'var(--radius)',
                background: 'var(--input-bg)',
                border: '1px solid var(--card-border)',
                color: 'var(--foreground)'
              }}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginTop: '0.25rem' }}>
              Le rappel s'effacera automatiquement une fois la date passée.
            </p>
          </div>

          {/* Message de rappel */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--secondary)' }}>
              Note pour le rappel (optionnel)
            </label>
            <input
              type="text"
              {...register('reminderMessage')}
              placeholder="Ex: Payer avant midi..."
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 'var(--radius)',
                background: 'var(--input-bg)',
                border: '1px solid var(--card-border)',
                color: 'var(--foreground)'
              }}
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary"
          style={{ flex: 1 }}
        >
          {isSubmitting ? 'Enregistrement...' : defaultValues ? 'Modifier' : 'Ajouter l\'organisme'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
          disabled={isSubmitting}
        >
          Annuler
        </button>
      </div>
    </form>
  );
}

