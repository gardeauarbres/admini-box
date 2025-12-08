'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { account } from '@/lib/appwrite';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { changePasswordSchema, type ChangePasswordFormData } from '@/lib/validations';
import ActiveSessions from './ActiveSessions';

export default function SecuritySettings() {
  const { user, checkUser } = useAuth();
  const { showToast } = useToast();
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    if (!user) return;

    try {
      // Vérifier le mot de passe actuel en créant une session temporaire
      try {
        await account.createEmailPasswordSession(user.email!, data.currentPassword);
      } catch (error: any) {
        if (error.message?.includes('Invalid credentials')) {
          showToast('Mot de passe actuel incorrect', 'error');
          return;
        }
        throw error;
      }

      // Changer le mot de passe
      await account.updatePassword(data.newPassword, data.currentPassword);
      
      showToast('Mot de passe modifié avec succès', 'success');
      reset();
      setIsChangingPassword(false);
    } catch (error: any) {
      console.error('Error changing password:', error);
      const errorMessage = error?.message || 'Erreur lors du changement de mot de passe';
      
      if (errorMessage.includes('Invalid credentials')) {
        showToast('Mot de passe actuel incorrect', 'error');
      } else if (errorMessage.includes('same')) {
        showToast('Le nouveau mot de passe doit être différent de l\'ancien', 'error');
      } else {
        showToast(`Erreur: ${errorMessage}`, 'error');
      }
    }
  };

  return (
    <div style={{ display: 'grid', gap: '2rem' }}>
      {/* Changement de mot de passe */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>🔐 Mot de passe</h3>
            <p style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>
              Changez votre mot de passe pour sécuriser votre compte
            </p>
          </div>
          {!isChangingPassword && (
            <button
              onClick={() => setIsChangingPassword(true)}
              className="btn btn-secondary"
            >
              Modifier
            </button>
          )}
        </div>

        {isChangingPassword && (
          <form onSubmit={handleSubmit(onSubmit)} style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--secondary)' }}>
                  Mot de passe actuel *
                </label>
                <input
                  type="password"
                  {...register('currentPassword')}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius)',
                    background: 'var(--input-bg)',
                    border: errors.currentPassword ? '1px solid var(--danger)' : '1px solid var(--input-border)',
                    color: 'var(--foreground)',
                  }}
                />
                {errors.currentPassword && (
                  <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                    {errors.currentPassword.message}
                  </p>
                )}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--secondary)' }}>
                  Nouveau mot de passe *
                </label>
                <input
                  type="password"
                  {...register('newPassword')}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius)',
                    background: 'var(--input-bg)',
                    border: errors.newPassword ? '1px solid var(--danger)' : '1px solid var(--input-border)',
                    color: 'var(--foreground)',
                  }}
                />
                {errors.newPassword && (
                  <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                    {errors.newPassword.message}
                  </p>
                )}
                <p style={{ color: 'var(--secondary)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                  Au moins 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre
                </p>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--secondary)' }}>
                  Confirmer le nouveau mot de passe *
                </label>
                <input
                  type="password"
                  {...register('confirmPassword')}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius)',
                    background: 'var(--input-bg)',
                    border: errors.confirmPassword ? '1px solid var(--danger)' : '1px solid var(--input-border)',
                    color: 'var(--foreground)',
                  }}
                />
                {errors.confirmPassword && (
                  <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary"
                >
                  {isSubmitting ? 'Modification...' : 'Changer le mot de passe'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPassword(false);
                    reset();
                  }}
                  className="btn btn-secondary"
                  disabled={isSubmitting}
                >
                  Annuler
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Sessions actives */}
      <ActiveSessions />
    </div>
  );
}

