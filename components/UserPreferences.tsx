'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import { usePersistentNotifications } from '@/context/PersistentNotificationsContext';
import { saveToStorage, getFromStorage } from '@/lib/storage';

interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    organisms: boolean;
    transactions: boolean;
    documents: boolean;
  };
  display: {
    density: 'compact' | 'comfortable' | 'spacious';
    itemsPerPage: number;
    showAvatars: boolean;
    showStats: boolean;
  };
  behavior: {
    autoSave: boolean;
    autoSaveInterval: number; // en secondes
    confirmDelete: boolean;
    showTooltips: boolean;
  };
}

const defaultPreferences: UserPreferences = {
  notifications: {
    email: true,
    push: true,
    sms: false,
    organisms: true,
    transactions: true,
    documents: true,
  },
  display: {
    density: 'comfortable',
    itemsPerPage: 10,
    showAvatars: true,
    showStats: true,
  },
  behavior: {
    autoSave: true,
    autoSaveInterval: 2,
    confirmDelete: true,
    showTooltips: true,
  },
};

export default function UserPreferences() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const { addNotification } = usePersistentNotifications();
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      const saved = getFromStorage<UserPreferences>(`preferences_${user.$id}`, defaultPreferences);
      setPreferences(saved);
    }
  }, [user]);

  const updatePreference = <K extends keyof UserPreferences>(
    category: K,
    key: keyof UserPreferences[K],
    value: any
  ) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  const savePreferences = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      saveToStorage(`preferences_${user.$id}`, preferences);
      showToast('Préférences sauvegardées avec succès', 'success');
      
      // Appliquer les préférences immédiatement
      if (preferences.behavior.autoSave) {
        addNotification(
          `Auto-sauvegarde activée : vos données seront sauvegardées automatiquement toutes les ${preferences.behavior.autoSaveInterval} secondes.`,
          'info'
        );
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      showToast('Erreur lors de la sauvegarde des préférences', 'error');
    } finally {
      setSaving(false);
    }
  };

  const resetPreferences = () => {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser toutes vos préférences ?')) {
      setPreferences(defaultPreferences);
      if (user) {
        saveToStorage(`preferences_${user.$id}`, defaultPreferences);
      }
      showToast('Préférences réinitialisées', 'success');
    }
  };

  return (
    <div style={{ display: 'grid', gap: '2rem' }}>
      {/* Thème */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>🎨 Apparence</h3>
        
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>Thème</div>
              <div style={{ color: 'var(--secondary)', fontSize: '0.85rem' }}>
                Mode {theme === 'dark' ? 'sombre' : 'clair'}
              </div>
            </div>
            <button onClick={toggleTheme} className="btn btn-secondary">
              {theme === 'dark' ? '☀️ Mode clair' : '🌙 Mode sombre'}
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>Densité d'affichage</div>
              <div style={{ color: 'var(--secondary)', fontSize: '0.85rem' }}>
                Espacement entre les éléments
              </div>
            </div>
            <select
              value={preferences.display.density}
              onChange={(e) => updatePreference('display', 'density', e.target.value)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius)',
                background: 'var(--input-bg)',
                border: '1px solid var(--input-border)',
                color: 'var(--foreground)',
              }}
            >
              <option value="compact">Compact</option>
              <option value="comfortable">Confortable</option>
              <option value="spacious">Spacieux</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>Éléments par page</div>
              <div style={{ color: 'var(--secondary)', fontSize: '0.85rem' }}>
                Nombre d'éléments affichés par page
              </div>
            </div>
            <select
              value={preferences.display.itemsPerPage}
              onChange={(e) => updatePreference('display', 'itemsPerPage', parseInt(e.target.value))}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius)',
                background: 'var(--input-bg)',
                border: '1px solid var(--input-border)',
                color: 'var(--foreground)',
              }}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>Afficher les avatars</div>
              <div style={{ color: 'var(--secondary)', fontSize: '0.85rem' }}>
                Afficher les photos de profil
              </div>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '26px' }}>
              <input
                type="checkbox"
                checked={preferences.display.showAvatars}
                onChange={(e) => updatePreference('display', 'showAvatars', e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute',
                cursor: 'pointer',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: preferences.display.showAvatars ? 'var(--primary)' : 'var(--card-bg)',
                borderRadius: '26px',
                transition: '0.3s',
              }}>
                <span style={{
                  position: 'absolute',
                  content: '""',
                  height: '20px',
                  width: '20px',
                  left: '3px',
                  bottom: '3px',
                  background: 'white',
                  borderRadius: '50%',
                  transition: '0.3s',
                  transform: preferences.display.showAvatars ? 'translateX(24px)' : 'translateX(0)',
                }} />
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>🔔 Notifications</h3>
        
        <div style={{ display: 'grid', gap: '1rem' }}>
          {Object.entries(preferences.notifications).map(([key, value]) => (
            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>
                  {key === 'email' && '📧 Email'}
                  {key === 'push' && '🔔 Notifications push'}
                  {key === 'sms' && '📱 SMS'}
                  {key === 'organisms' && '🏢 Organismes'}
                  {key === 'transactions' && '💰 Transactions'}
                  {key === 'documents' && '📄 Documents'}
                </div>
                <div style={{ color: 'var(--secondary)', fontSize: '0.85rem' }}>
                  {key === 'email' && 'Recevoir des notifications par email'}
                  {key === 'push' && 'Notifications dans le navigateur'}
                  {key === 'sms' && 'Notifications par SMS (si configuré)'}
                  {key === 'organisms' && 'Notifications pour les organismes'}
                  {key === 'transactions' && 'Notifications pour les transactions'}
                  {key === 'documents' && 'Notifications pour les documents'}
                </div>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '26px' }}>
                <input
                  type="checkbox"
                  checked={value as boolean}
                  onChange={(e) => updatePreference('notifications', key as keyof UserPreferences['notifications'], e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: value ? 'var(--primary)' : 'var(--card-bg)',
                  borderRadius: '26px',
                  transition: '0.3s',
                }}>
                  <span style={{
                    position: 'absolute',
                    content: '""',
                    height: '20px',
                    width: '20px',
                    left: '3px',
                    bottom: '3px',
                    background: 'white',
                    borderRadius: '50%',
                    transition: '0.3s',
                    transform: value ? 'translateX(24px)' : 'translateX(0)',
                  }} />
                </span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Comportement */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>⚙️ Comportement</h3>
        
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>Auto-sauvegarde</div>
              <div style={{ color: 'var(--secondary)', fontSize: '0.85rem' }}>
                Sauvegarder automatiquement les modifications
              </div>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '26px' }}>
              <input
                type="checkbox"
                checked={preferences.behavior.autoSave}
                onChange={(e) => updatePreference('behavior', 'autoSave', e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute',
                cursor: 'pointer',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: preferences.behavior.autoSave ? 'var(--primary)' : 'var(--card-bg)',
                borderRadius: '26px',
                transition: '0.3s',
              }}>
                <span style={{
                  position: 'absolute',
                  content: '""',
                  height: '20px',
                  width: '20px',
                  left: '3px',
                  bottom: '3px',
                  background: 'white',
                  borderRadius: '50%',
                  transition: '0.3s',
                  transform: preferences.behavior.autoSave ? 'translateX(24px)' : 'translateX(0)',
                }} />
              </span>
            </label>
          </div>

          {preferences.behavior.autoSave && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>Intervalle d'auto-sauvegarde</div>
                <div style={{ color: 'var(--secondary)', fontSize: '0.85rem' }}>
                  Fréquence de sauvegarde automatique
                </div>
              </div>
              <select
                value={preferences.behavior.autoSaveInterval}
                onChange={(e) => updatePreference('behavior', 'autoSaveInterval', parseInt(e.target.value))}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius)',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  color: 'var(--foreground)',
                }}
              >
                <option value="1">1 seconde</option>
                <option value="2">2 secondes</option>
                <option value="5">5 secondes</option>
                <option value="10">10 secondes</option>
                <option value="30">30 secondes</option>
              </select>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>Confirmer avant suppression</div>
              <div style={{ color: 'var(--secondary)', fontSize: '0.85rem' }}>
                Demander confirmation avant de supprimer
              </div>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '26px' }}>
              <input
                type="checkbox"
                checked={preferences.behavior.confirmDelete}
                onChange={(e) => updatePreference('behavior', 'confirmDelete', e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute',
                cursor: 'pointer',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: preferences.behavior.confirmDelete ? 'var(--primary)' : 'var(--card-bg)',
                borderRadius: '26px',
                transition: '0.3s',
              }}>
                <span style={{
                  position: 'absolute',
                  content: '""',
                  height: '20px',
                  width: '20px',
                  left: '3px',
                  bottom: '3px',
                  background: 'white',
                  borderRadius: '50%',
                  transition: '0.3s',
                  transform: preferences.behavior.confirmDelete ? 'translateX(24px)' : 'translateX(0)',
                }} />
              </span>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>Afficher les infobulles</div>
              <div style={{ color: 'var(--secondary)', fontSize: '0.85rem' }}>
                Afficher les conseils et informations
              </div>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '26px' }}>
              <input
                type="checkbox"
                checked={preferences.behavior.showTooltips}
                onChange={(e) => updatePreference('behavior', 'showTooltips', e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute',
                cursor: 'pointer',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: preferences.behavior.showTooltips ? 'var(--primary)' : 'var(--card-bg)',
                borderRadius: '26px',
                transition: '0.3s',
              }}>
                <span style={{
                  position: 'absolute',
                  content: '""',
                  height: '20px',
                  width: '20px',
                  left: '3px',
                  bottom: '3px',
                  background: 'white',
                  borderRadius: '50%',
                  transition: '0.3s',
                  transform: preferences.behavior.showTooltips ? 'translateX(24px)' : 'translateX(0)',
                }} />
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        <button onClick={resetPreferences} className="btn btn-secondary">
          Réinitialiser
        </button>
        <button onClick={savePreferences} disabled={saving} className="btn btn-primary">
          {saving ? 'Sauvegarde...' : 'Enregistrer les préférences'}
        </button>
      </div>
    </div>
  );
}

