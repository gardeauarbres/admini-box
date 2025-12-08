'use client';

import { useState, useRef, useEffect } from 'react';
import { usePersistentNotifications } from '@/context/PersistentNotificationsContext';

export default function NotificationBell() {
  const { notifications, markAsRead, deleteNotification, clearAll, unreadCount } = usePersistentNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'var(--success)';
      case 'warning': return 'var(--warning)';
      case 'error': return 'var(--danger)';
      default: return 'var(--primary)';
    }
  };

  // Trier les notifications : non lues en premier, puis par date
  const sortedNotifications = [...notifications].sort((a, b) => {
    if (a.read !== b.read) return a.read ? 1 : -1;
    return b.timestamp - a.timestamp;
  });

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative',
          background: 'var(--button-secondary-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: '1.25rem',
          color: 'var(--foreground)',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--button-secondary-hover)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'var(--button-secondary-bg)';
        }}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} non lues)` : ''}`}
        title={`Notifications${unreadCount > 0 ? ` (${unreadCount} non lues)` : ''}`}
      >
        🔔
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: 'var(--danger)',
              color: 'white',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.7rem',
              fontWeight: 600,
              border: '2px solid var(--background)',
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="glass-panel"
          style={{
            position: 'fixed',
            top: '80px',
            left: '1rem',
            width: '400px',
            maxHeight: 'calc(100vh - 100px)',
            overflowY: 'auto',
            zIndex: 9999,
            padding: '1rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: 'var(--radius)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>
              Notifications {unreadCount > 0 && `(${unreadCount})`}
            </h3>
            {notifications.length > 0 && (
              <button
                onClick={() => {
                  if (confirm(`Supprimer toutes les ${notifications.length} notifications ?`)) {
                    clearAll();
                    setIsOpen(false);
                  }
                }}
                className="btn btn-secondary"
                style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
              >
                🗑️ Tout supprimer
              </button>
            )}
          </div>

          {sortedNotifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--secondary)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔔</div>
              <p>Aucune notification</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {sortedNotifications.map(notification => (
                <div
                  key={notification.id}
                  className="glass-panel"
                  style={{
                    padding: '0.75rem',
                    borderLeft: `4px solid ${getTypeColor(notification.type)}`,
                    opacity: notification.read ? 0.7 : 1,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => {
                    if (!notification.read) {
                      markAsRead(notification.id);
                    }
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--form-bg)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--card-bg)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
                      <span style={{ fontSize: '1.1rem' }}>{getTypeIcon(notification.type)}</span>
                      <div style={{ flex: 1 }}>
                        {notification.title && (
                          <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem', fontWeight: 600 }}>
                            {notification.title}
                          </p>
                        )}
                        <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.4 }}>
                          {notification.message}
                        </p>
                        {notification.actionUrl && notification.actionLabel && (
                          <a
                            href={notification.actionUrl}
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                              setIsOpen(false);
                            }}
                            style={{
                              display: 'inline-block',
                              marginTop: '0.5rem',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              background: 'var(--primary)',
                              color: 'white',
                              fontSize: '0.8rem',
                              textDecoration: 'none',
                            }}
                          >
                            {notification.actionLabel} →
                          </a>
                        )}
                        <p style={{
                          margin: '0.5rem 0 0 0',
                          fontSize: '0.7rem',
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
                        fontSize: '1.1rem',
                        padding: '0',
                        lineHeight: 1,
                        opacity: 0.6,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '1';
                        e.currentTarget.style.color = 'var(--danger)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '0.6';
                        e.currentTarget.style.color = 'var(--secondary)';
                      }}
                      aria-label="Supprimer"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

