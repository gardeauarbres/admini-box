'use client';

import { usePersistentNotifications } from '@/context/PersistentNotificationsContext';
import { useMemo } from 'react';

export default function PersistentNotifications() {
  const { notifications, markAsRead, deleteNotification, clearAll, unreadCount } = usePersistentNotifications();

  const unreadNotifications = useMemo(
    () => notifications.filter(n => !n.read).slice(0, 5),
    [notifications]
  );

  if (unreadNotifications.length === 0) return null;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'var(--success)';
      case 'warning': return 'var(--warning)';
      case 'error': return 'var(--danger)';
      default: return 'var(--primary)';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'reminder': return '📅';
      case 'system': return '⚙️';
      default: return 'ℹ️';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '1rem',
      right: '1rem',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      maxWidth: '400px',
      maxHeight: '80vh',
      overflowY: 'auto'
    }}>
      {unreadNotifications.map(notification => (
        <div
          key={notification.id}
          className="glass-panel"
          style={{
            padding: '1rem',
            borderLeft: `4px solid ${getTypeColor(notification.type)}`,
            animation: 'slideUp 0.3s ease-out',
            cursor: 'pointer'
          }}
          onClick={() => markAsRead(notification.id)}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', flex: 1 }}>
              <span style={{ fontSize: '1.25rem' }}>{getTypeIcon(notification.type)}</span>
              <div style={{ flex: 1 }}>
                {notification.title && (
                  <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', fontWeight: 600 }}>
                    {notification.title}
                  </p>
                )}
                <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5 }}>
                  {notification.message}
                </p>
                {notification.actionUrl && notification.actionLabel && (
                  <a
                    href={notification.actionUrl}
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(notification.id);
                    }}
                    style={{
                      display: 'inline-block',
                      marginTop: '0.5rem',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '4px',
                      background: 'var(--primary)',
                      color: 'white',
                      fontSize: '0.85rem',
                      textDecoration: 'none',
                    }}
                  >
                    {notification.actionLabel} →
                  </a>
                )}
                <p style={{ 
                  margin: '0.5rem 0 0 0', 
                  fontSize: '0.75rem', 
                  color: 'var(--secondary)' 
                }}>
                  {new Date(notification.timestamp).toLocaleString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                  {notification.category && ` • ${notification.category}`}
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteNotification(notification.id);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--secondary)',
                cursor: 'pointer',
                fontSize: '1.25rem',
                padding: '0',
                lineHeight: 1
              }}
              aria-label="Fermer"
            >
              ×
            </button>
          </div>
        </div>
      ))}
      
      {unreadCount > 5 && (
        <div className="glass-panel" style={{ 
          padding: '0.75rem', 
          textAlign: 'center',
          fontSize: '0.85rem',
          color: 'var(--secondary)'
        }}>
          +{unreadCount - 5} autre{unreadCount - 5 > 1 ? 's' : ''} notification{unreadCount - 5 > 1 ? 's' : ''}
        </div>
      )}
      
      {notifications.length > 0 && (
        <button
          onClick={() => {
            if (confirm(`Êtes-vous sûr de vouloir supprimer toutes les ${notifications.length} notifications ?`)) {
              clearAll();
            }
          }}
          className="btn btn-danger"
          style={{
            padding: '0.75rem',
            fontSize: '0.85rem',
            marginTop: '0.5rem'
          }}
        >
          🗑️ Supprimer toutes les notifications ({notifications.length})
        </button>
      )}
    </div>
  );
}

