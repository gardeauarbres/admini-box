'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useOrganisms } from '@/lib/queries';
import { useAuth } from '@/context/AuthContext';
import { usePersistentNotifications } from '@/context/PersistentNotificationsContext';
import { getFromStorage, saveToStorage } from '@/lib/storage';

const PROCESSED_REMINDERS_KEY = 'processed_reminders';

export default function ReminderNotifications() {
  const { user } = useAuth();
  const { data: organisms = [] } = useOrganisms(user?.$id || null);
  const { addNotification, notifications } = usePersistentNotifications();
  const hasCheckedRef = useRef(false);

  const reminders = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return organisms
      .filter(org => org.reminderDate)
      .map(org => {
        const reminderDate = new Date(org.reminderDate!);
        reminderDate.setHours(0, 0, 0, 0);
        const diffTime = reminderDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return {
          organismId: org.$id,
          organism: org,
          daysUntil: diffDays,
          isOverdue: diffDays < 0,
          isToday: diffDays === 0,
          isSoon: diffDays > 0 && diffDays <= 7,
        };
      })
      .filter(r => r.isOverdue || r.isToday || r.isSoon);
  }, [organisms]);

  const remindersRef = useRef<string>('');
  const lastCheckRef = useRef<number>(0);

  useEffect(() => {
    // Ne pas vérifier trop souvent (minimum 1 minute entre les vérifications)
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    
    if (lastCheckRef.current > oneMinuteAgo && hasCheckedRef.current) {
      return;
    }

    // Ne pas créer de notifications si on n'a pas d'organismes
    if (reminders.length === 0) {
      return;
    }

    // Créer une signature des rappels pour détecter les changements
    const remindersSignature = JSON.stringify(reminders.map(r => `${r.organismId}-${r.daysUntil}`));
    
    // Ne vérifier que si les rappels ont changé
    if (remindersSignature === remindersRef.current && hasCheckedRef.current) {
      return;
    }
    
    remindersRef.current = remindersSignature;
    lastCheckRef.current = now;

    // Charger les rappels déjà traités depuis localStorage
    const processedReminders = getFromStorage<Record<string, number>>(PROCESSED_REMINDERS_KEY, {});
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    // Nettoyer les anciens rappels traités (plus de 24h)
    const cleanedProcessed = Object.fromEntries(
      Object.entries(processedReminders).filter(([_, timestamp]) => timestamp > oneDayAgo)
    );

    // Vérifier chaque rappel
    reminders.forEach(reminder => {
      const { organismId, organism, daysUntil, isOverdue, isToday, isSoon } = reminder;
      
      // Créer une clé unique pour ce rappel (basée sur l'organisme et le jour)
      const reminderKey = `${organismId}-${daysUntil}`;
      
      // Vérifier si ce rappel a déjà été traité aujourd'hui
      const lastProcessed = cleanedProcessed[reminderKey];
      if (lastProcessed && (now - lastProcessed) < 24 * 60 * 60 * 1000) {
        return; // Déjà traité dans les dernières 24h
      }

      // Vérifier aussi dans les notifications existantes pour éviter les doublons
      const notificationMessage = isOverdue
        ? `Rappel dépassé pour ${organism.name}${organism.reminderMessage ? `: ${organism.reminderMessage}` : ''}`
        : isToday
        ? `Rappel aujourd'hui pour ${organism.name}${organism.reminderMessage ? `: ${organism.reminderMessage}` : ''}`
        : `Rappel dans ${daysUntil} jour${daysUntil > 1 ? 's' : ''} pour ${organism.name}${organism.reminderMessage ? `: ${organism.reminderMessage}` : ''}`;

      // Ne pas vérifier dans notifications car cela peut changer à chaque render
      // On se fie uniquement à processedReminders
      
      if (isOverdue) {
        addNotification(
          notificationMessage,
          'error',
          {
            title: 'Rappel dépassé',
            category: 'organismes',
            priority: 'high',
            actionUrl: '/',
            actionLabel: 'Voir l\'organisme',
          }
        );
        cleanedProcessed[reminderKey] = now;
      } else if (isToday) {
        addNotification(
          notificationMessage,
          'reminder',
          {
            title: 'Rappel aujourd\'hui',
            category: 'organismes',
            priority: 'high',
            actionUrl: '/',
            actionLabel: 'Voir l\'organisme',
          }
        );
        cleanedProcessed[reminderKey] = now;
      } else if (isSoon && daysUntil <= 3) {
        addNotification(
          notificationMessage,
          'reminder',
          {
            title: 'Rappel à venir',
            category: 'organismes',
            priority: 'medium',
            actionUrl: '/',
            actionLabel: 'Voir l\'organisme',
          }
        );
        cleanedProcessed[reminderKey] = now;
      }
    });

    // Sauvegarder les rappels traités
    saveToStorage(PROCESSED_REMINDERS_KEY, cleanedProcessed);
    hasCheckedRef.current = true;
  }, [reminders, addNotification]); // Retirer notifications des dépendances

  // Ne rien afficher, juste gérer les notifications
  return null;
}

