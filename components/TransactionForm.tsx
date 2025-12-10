'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { transactionSchema, type TransactionFormData } from '@/lib/validations';
import { saveFormDraft, getFormDraft, clearFormDraft } from '@/lib/storage';

interface TransactionFormProps {
  onSubmit: (data: TransactionFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  initialData?: Partial<TransactionFormData>;
}

export default function TransactionForm({
  onSubmit,
  onCancel,
  isSubmitting = false,
  initialData
}: TransactionFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: initialData || getFormDraft<TransactionFormData>('transaction') || {
      label: '',
      amount: 0,
      category: 'Autre',
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
    }
  });

  // Effect to update form if initialData changes
  useEffect(() => {
    if (initialData) {
      reset(initialData as TransactionFormData);
    }
  }, [initialData, reset]);

  const formData = watch();

  // Sauvegarde automatique du brouillon
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.label || formData.amount > 0) {
        saveFormDraft('transaction', formData);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData]);

  const onFormSubmit = async (data: TransactionFormData) => {
    // Convertir le montant selon le type
    const finalAmount = data.type === 'expense' ? -Math.abs(data.amount) : Math.abs(data.amount);
    clearFormDraft('transaction');
    await onSubmit({ ...data, amount: finalAmount });
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} style={{ marginBottom: '2rem', padding: '1rem', background: 'var(--form-bg)', borderRadius: 'var(--radius)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        {/* Libellé */}
        <div>
          <input
            placeholder="Libellé *"
            {...register('label')}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '4px',
              border: errors.label ? '1px solid var(--danger)' : '1px solid var(--card-border)',
              background: 'var(--input-bg)',
              color: 'var(--foreground)'
            }}
          />
          {errors.label && (
            <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              {errors.label.message}
            </p>
          )}
        </div>

        {/* Montant */}
        <div>
          <input
            type="number"
            step="0.01"
            placeholder="Montant *"
            {...register('amount', { valueAsNumber: true })}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '4px',
              border: errors.amount ? '1px solid var(--danger)' : '1px solid var(--card-border)',
              background: 'var(--input-bg)',
              color: 'var(--foreground)'
            }}
          />
          {errors.amount && (
            <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              {errors.amount.message}
            </p>
          )}
        </div>

        {/* Type */}
        <div>
          <select
            {...register('type')}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '4px',
              border: errors.type ? '1px solid var(--danger)' : '1px solid var(--card-border)',
              background: 'var(--input-bg)',
              color: 'var(--foreground)'
            }}
          >
            <option value="expense">Dépense</option>
            <option value="income">Revenu</option>
          </select>
          {errors.type && (
            <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              {errors.type.message}
            </p>
          )}
        </div>

        {/* Catégorie */}
        <div>
          <select
            {...register('category')}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '4px',
              border: errors.category ? '1px solid var(--danger)' : '1px solid var(--card-border)',
              background: 'var(--input-bg)',
              color: 'var(--foreground)'
            }}
          >
            <option value="Autre">Autre</option>
            <option value="Alimentation">Alimentation</option>
            <option value="Logement">Logement</option>
            <option value="Santé">Santé</option>
            <option value="Salaire">Salaire</option>
          </select>
          {errors.category && (
            <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              {errors.category.message}
            </p>
          )}
        </div>

        {/* Date */}
        <div>
          <input
            type="date"
            {...register('date')}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '4px',
              border: errors.date ? '1px solid var(--danger)' : '1px solid var(--card-border)',
              background: 'var(--input-bg)',
              color: 'var(--foreground)'
            }}
          />
          {errors.date && (
            <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              {errors.date.message}
            </p>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Ajout...' : 'Ajouter'}
        </button>
        <button
          type="button"
          onClick={() => {
            clearFormDraft('transaction');
            onCancel();
          }}
          className="btn btn-secondary"
          disabled={isSubmitting}
        >
          Annuler
        </button>
      </div>
    </form>
  );
}

