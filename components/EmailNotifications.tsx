'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useUserProfile } from '@/lib/queries';
import { saveToStorage, getFromStorage } from '@/lib/storage';

interface EmailNotificationSettings {
  enabled: boolean;
  reminders: boolean;
  overdue: boolean;
  weeklySummary: boolean;
  monthlyReport: boolean;
  email: string;
}

export default function EmailNotifications() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { data: profile } = useUserProfile(user?.$id || null);
  const [settings, setSettings] = useState<EmailNotificationSettings>({
    enabled: false,
    reminders: true,
    overdue: true,
    weeklySummary: false,
    monthlyReport: false,
    email: user?.email || profile?.professionalEmail || '',
  });

  useEffect(() => {
    if (user) {
      const saved = getFromStorage<EmailNotificationSettings>(
        `emailNotifications_${user.$id}`,
        {
          enabled: false,
          reminders: true,
          overdue: true,
          weeklySummary: false,
          monthlyReport: false,
          email: user.email || '',
        }
      );
      setSettings(saved);
    }
  }, [user, profile]);

  const handleSave = () => {
    if (!user) return;

    if (settings.enabled && !settings.email.trim()) {
      showToast('Veuillez entrer une adresse email', 'error');
      return;
    }

    saveToStorage(`emailNotifications_${user.$id}`, settings);
    showToast('Paramètres de notifications sauvegardés', 'success');
  };

  const handleTestEmail = () => {
    if (!settings.email.trim()) {
      showToast('Veuillez entrer une adresse email', 'error');
      return;
    }

    // Simuler l'envoi d'un email de test
    const subject = encodeURIComponent('Test de notification AdminiBox');
    const body = encodeURIComponent(
      `Bonjour,\n\nCeci est un email de test depuis AdminiBox.\n\n` +
      `Si vous recevez cet email, vos notifications sont correctement configurées.\n\n` +
      `Cordialement,\nL'équipe AdminiBox`
    );

    window.location.href = `mailto:${settings.email}?subject=${subject}&body=${body}`;
    showToast('Email de test préparé', 'success');
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 600 }}>
        📧 Notifications par Email
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Activation générale */}
        <div>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem', 
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 500
          }}>
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
              style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }}
            />
            <span>Activer les notifications par email</span>
          </label>
          <p style={{ fontSize: '0.85rem', color: 'var(--secondary)', marginTop: '0.5rem', marginLeft: '2rem' }}>
            Recevez des notifications importantes par email
          </p>
        </div>

        {settings.enabled && (
          <>
            {/* Adresse email */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--secondary)' }}>
                Adresse email
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                placeholder="votre@email.com"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius)',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  color: 'var(--foreground)',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            {/* Types de notifications */}
            <div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '1rem', fontWeight: 600 }}>
                Types de notifications
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem', 
                  cursor: 'pointer',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius)',
                  background: 'var(--form-bg)',
                  border: '1px solid var(--card-border)'
                }}>
                  <input
                    type="checkbox"
                    checked={settings.reminders}
                    onChange={(e) => setSettings({ ...settings, reminders: e.target.checked })}
                    style={{ width: '1.1rem', height: '1.1rem', cursor: 'pointer' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>🔔 Rappels d'organismes</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>
                      Recevez un email pour les rappels programmés
                    </div>
                  </div>
                </label>

                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem', 
                  cursor: 'pointer',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius)',
                  background: 'var(--form-bg)',
                  border: '1px solid var(--card-border)'
                }}>
                  <input
                    type="checkbox"
                    checked={settings.overdue}
                    onChange={(e) => setSettings({ ...settings, overdue: e.target.checked })}
                    style={{ width: '1.1rem', height: '1.1rem', cursor: 'pointer' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>⚠️ Organismes en retard</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>
                      Alertes pour les organismes avec rappels dépassés
                    </div>
                  </div>
                </label>

                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem', 
                  cursor: 'pointer',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius)',
                  background: 'var(--form-bg)',
                  border: '1px solid var(--card-border)'
                }}>
                  <input
                    type="checkbox"
                    checked={settings.weeklySummary}
                    onChange={(e) => setSettings({ ...settings, weeklySummary: e.target.checked })}
                    style={{ width: '1.1rem', height: '1.1rem', cursor: 'pointer' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>📊 Résumé hebdomadaire</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>
                      Recevez un résumé de votre activité chaque semaine
                    </div>
                  </div>
                </label>

                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem', 
                  cursor: 'pointer',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius)',
                  background: 'var(--form-bg)',
                  border: '1px solid var(--card-border)'
                }}>
                  <input
                    type="checkbox"
                    checked={settings.monthlyReport}
                    onChange={(e) => setSettings({ ...settings, monthlyReport: e.target.checked })}
                    style={{ width: '1.1rem', height: '1.1rem', cursor: 'pointer' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>📈 Rapport mensuel</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>
                      Recevez un rapport détaillé de vos données chaque mois
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Boutons d'action */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button
                onClick={handleSave}
                className="btn btn-primary"
                style={{ flex: 1, padding: '0.75rem' }}
              >
                💾 Enregistrer les paramètres
              </button>
              <button
                onClick={handleTestEmail}
                className="btn btn-secondary"
                style={{ padding: '0.75rem 1.5rem' }}
              >
                ✉️ Tester l'email
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

