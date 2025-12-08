'use client';

import { useState, useEffect, useRef } from 'react';
import { formatDate } from '@/lib/utils';

interface OrganismReminderProps {
  reminderDate?: string;
  reminderMessage?: string;
  onReminderChange: (date?: string, message?: string) => void;
}

export default function OrganismReminder({ reminderDate, reminderMessage, onReminderChange }: OrganismReminderProps) {
  const [date, setDate] = useState(reminderDate || '');
  const [message, setMessage] = useState(reminderMessage || '');
  const [isActive, setIsActive] = useState(!!reminderDate);
  const isInitialMountRef = useRef(true);
  const lastReminderDateRef = useRef(reminderDate);
  const lastReminderMessageRef = useRef(reminderMessage);

  // Synchroniser les états locaux avec les props quand elles changent de l'extérieur
  useEffect(() => {
    if (reminderDate !== lastReminderDateRef.current || reminderMessage !== lastReminderMessageRef.current) {
      lastReminderDateRef.current = reminderDate;
      lastReminderMessageRef.current = reminderMessage;
      setDate(reminderDate || '');
      setMessage(reminderMessage || '');
      setIsActive(!!reminderDate);
    }
  }, [reminderDate, reminderMessage]);

  // Ne pas appeler onReminderChange au montage initial
  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }

    // Appeler onReminderChange seulement quand l'utilisateur modifie les valeurs
    if (isActive && date) {
      onReminderChange(date, message || undefined);
    } else if (!isActive) {
      onReminderChange(undefined, undefined);
    }
  }, [isActive, date, message]); // Retirer onReminderChange des dépendances

  const getReminderStatus = () => {
    if (!reminderDate) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reminder = new Date(reminderDate);
    reminder.setHours(0, 0, 0, 0);
    const diffTime = reminder.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: 'overdue', text: 'Rappel dépassé', days: Math.abs(diffDays) };
    } else if (diffDays === 0) {
      return { status: 'today', text: 'Rappel aujourd\'hui', days: 0 };
    } else if (diffDays <= 7) {
      return { status: 'soon', text: `Dans ${diffDays} jour${diffDays > 1 ? 's' : ''}`, days: diffDays };
    } else {
      return { status: 'upcoming', text: `Dans ${diffDays} jours`, days: diffDays };
    }
  };

  const reminderStatus = getReminderStatus();
  const minDate = new Date().toISOString().split('T')[0]; // Aujourd'hui

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>📅 Activer un rappel</span>
        </label>
        {reminderStatus && (
          <span style={{
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 600,
            background: reminderStatus.status === 'overdue' ? 'var(--danger)' : 
                        reminderStatus.status === 'today' ? 'var(--warning)' :
                        reminderStatus.status === 'soon' ? 'var(--primary)' : 'var(--secondary)',
            color: 'white',
          }}>
            {reminderStatus.text}
          </span>
        )}
      </div>

      {isActive && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: 'var(--secondary)' }}>
              Date du rappel
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={minDate}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: 'var(--radius)',
                background: 'var(--input-bg)',
                border: '1px solid var(--input-border)',
                color: 'var(--foreground)',
                fontSize: '0.85rem',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: 'var(--secondary)' }}>
              Message de rappel (optionnel)
            </label>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ex: Déclaration à faire..."
              maxLength={200}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: 'var(--radius)',
                background: 'var(--input-bg)',
                border: '1px solid var(--input-border)',
                color: 'var(--foreground)',
                fontSize: '0.85rem',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

