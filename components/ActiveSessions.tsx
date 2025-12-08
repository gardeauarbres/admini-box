'use client';

import { useState, useEffect } from 'react';
import { account } from '@/lib/appwrite';
import { Models } from 'appwrite';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import LoadingSpinner from './LoadingSpinner';
import { formatDate } from '@/lib/utils';

export default function ActiveSessions() {
  const { user, checkUser } = useAuth();
  const { showToast } = useToast();
  const [sessions, setSessions] = useState<Models.Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, [user]);

  const fetchSessions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const sessionsList = await account.listSessions();
      setSessions(sessionsList.sessions);

      // Trouver la session actuelle
      const currentSession = await account.getSession('current');
      setCurrentSessionId(currentSession.$id);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      showToast('Erreur lors du chargement des sessions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!user) return;

    try {
      // Ne pas supprimer la session actuelle
      if (sessionId === currentSessionId) {
        showToast('Vous ne pouvez pas supprimer votre session actuelle', 'error');
        return;
      }

      await account.deleteSession(sessionId);
      showToast('Session supprimée avec succès', 'success');
      await fetchSessions();
    } catch (error: any) {
      console.error('Error deleting session:', error);
      showToast('Erreur lors de la suppression de la session', 'error');
    }
  };

  const handleDeleteAllSessions = async () => {
    if (!user) return;

    if (!confirm('Êtes-vous sûr de vouloir supprimer toutes les autres sessions ? Vous serez déconnecté de tous les autres appareils.')) {
      return;
    }

    try {
      // Supprimer toutes les sessions sauf la session actuelle
      for (const session of sessions) {
        if (session.$id !== currentSessionId) {
          try {
            await account.deleteSession(session.$id);
          } catch (error) {
            console.warn('Error deleting session:', session.$id, error);
          }
        }
      }

      showToast('Toutes les autres sessions ont été supprimées', 'success');
      await fetchSessions();
    } catch (error) {
      console.error('Error deleting all sessions:', error);
      showToast('Erreur lors de la suppression des sessions', 'error');
    }
  };

  const getDeviceInfo = (session: Models.Session) => {
    const os = session.osName || 'Inconnu';
    const browser = session.clientName || 'Inconnu';
    return { os, browser };
  };

  const getLocationInfo = (session: Models.Session) => {
    // Appwrite ne fournit pas directement la localisation, mais on peut utiliser l'IP
    return session.ip || 'Inconnu';
  };

  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <LoadingSpinner message="Chargement des sessions..." />
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>📱 Sessions actives</h3>
          <p style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>
            Gérez les appareils connectés à votre compte
          </p>
        </div>
        {sessions.length > 1 && (
          <button
            onClick={handleDeleteAllSessions}
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
          >
            Déconnecter tous les autres appareils
          </button>
        )}
      </div>

      {sessions.length === 0 ? (
        <p style={{ color: 'var(--secondary)', textAlign: 'center', padding: '2rem' }}>
          Aucune session active
        </p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {sessions.map((session) => {
            const { os, browser } = getDeviceInfo(session);
            const isCurrent = session.$id === currentSessionId;
            const location = getLocationInfo(session);

            return (
              <div
                key={session.$id}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius)',
                  background: isCurrent ? 'var(--form-bg)' : 'var(--card-bg)',
                  border: `1px solid ${isCurrent ? 'var(--primary)' : 'var(--card-border)'}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>
                      {os.includes('Windows') ? '🪟' : os.includes('Mac') ? '🍎' : os.includes('Linux') ? '🐧' : os.includes('Android') ? '🤖' : os.includes('iOS') ? '📱' : '💻'}
                    </span>
                    <strong>{os}</strong>
                    {isCurrent && (
                      <span style={{
                        fontSize: '0.75rem',
                        padding: '0.25rem 0.5rem',
                        borderRadius: 'var(--radius)',
                        background: 'var(--primary)',
                        color: 'white',
                      }}>
                        Session actuelle
                      </span>
                    )}
                  </div>
                  <div style={{ color: 'var(--secondary)', fontSize: '0.85rem' }}>
                    <div>{browser}</div>
                    <div>IP: {location}</div>
                    <div>Dernière activité: {formatDate(new Date(session.$createdAt).toISOString())}</div>
                    {session.provider && (
                      <div>Connexion: {session.provider}</div>
                    )}
                  </div>
                </div>
                {!isCurrent && (
                  <button
                    onClick={() => handleDeleteSession(session.$id)}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                  >
                    Déconnecter
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

