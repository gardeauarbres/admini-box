'use client';

import { useState, useMemo } from 'react';
import { formatDate } from '@/lib/utils';

interface ChangeHistoryItem {
  id: string;
  date: string;
  field: string;
  oldValue: string;
  newValue: string;
  userId: string;
}

interface ChangeHistoryProps {
  history: ChangeHistoryItem[];
  maxItems?: number;
}

export default function ChangeHistory({ history, maxItems = 10 }: ChangeHistoryProps) {
  const [expanded, setExpanded] = useState(false);

  const sortedHistory = useMemo(() => {
    return [...history]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, expanded ? undefined : maxItems);
  }, [history, expanded, maxItems]);

  if (history.length === 0) {
    return (
      <div style={{ 
        padding: '1rem', 
        textAlign: 'center', 
        color: 'var(--secondary)', 
        fontSize: '0.9rem' 
      }}>
        Aucun historique disponible
      </div>
    );
  }

  const getFieldLabel = (field: string) => {
    const labels: Record<string, string> = {
      name: 'Nom',
      status: 'Statut',
      message: 'Message',
      url: 'URL',
      tags: 'Tags',
      isFavorite: 'Favori',
      reminderDate: 'Date de rappel',
      reminderMessage: 'Message de rappel',
    };
    return labels[field] || field;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>📜 Historique des modifications</h4>
        {history.length > maxItems && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
          >
            {expanded ? 'Réduire' : `Voir tout (${history.length})`}
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: expanded ? 'none' : '300px', overflowY: 'auto' }}>
        {sortedHistory.map((item) => (
          <div
            key={item.id}
            style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius)',
              background: 'var(--form-bg)',
              border: '1px solid var(--card-border)',
              fontSize: '0.85rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 500, color: 'var(--primary)' }}>
                {getFieldLabel(item.field)}
              </span>
              <span style={{ color: 'var(--secondary)', fontSize: '0.75rem' }}>
                {formatDate(item.date)}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--secondary)' }}>Ancien:</span>
              <span style={{ 
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                background: 'var(--danger)20',
                color: 'var(--danger)',
                fontSize: '0.8rem',
              }}>
                {item.oldValue || '(vide)'}
              </span>
              <span style={{ color: 'var(--secondary)' }}>→</span>
              <span style={{ 
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                background: 'var(--success)20',
                color: 'var(--success)',
                fontSize: '0.8rem',
              }}>
                {item.newValue || '(vide)'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

