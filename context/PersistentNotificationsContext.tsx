'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, ReactNode } from 'react';
import { saveToStorage, getFromStorage } from '@/lib/storage';

export interface PersistentNotification {
  id: string;
  title?: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'reminder' | 'system';
  timestamp: number;
  read: boolean;
  actionUrl?: string; // URL pour une action rapide
  actionLabel?: string; // Label du bouton d'action
  category?: string; // Catégorie (organismes, transactions, documents, etc.)
  priority?: 'low' | 'medium' | 'high'; // Priorité
  expiresAt?: number; // Date d'expiration (timestamp)
}

interface PersistentNotificationsContextType {
  notifications: PersistentNotification[];
  addNotification: (
    message: string, 
    type?: PersistentNotification['type'],
    options?: {
      title?: string;
      actionUrl?: string;
      actionLabel?: string;
      category?: string;
      priority?: 'low' | 'medium' | 'high';
      expiresAt?: number;
    }
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  clearByCategory: (category: string) => void;
  unreadCount: number;
}

const PersistentNotificationsContext = createContext<PersistentNotificationsContextType | undefined>(undefined);

export const PersistentNotificationsProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<PersistentNotification[]>([]);
  const isInitializedRef = useRef(false);
  const savingRef = useRef(false);
  const notificationsRef = useRef<PersistentNotification[]>([]);

  // Charger les notifications depuis localStorage au montage (une seule fois)
  useEffect(() => {
    if (isInitializedRef.current) return;
    
    const saved = getFromStorage<PersistentNotification[]>('notifications', []);
    const now = Date.now();
    
    // Si trop de notifications (plus de 1000), nettoyer complètement
    if (saved.length > 1000) {
      console.warn(`⚠️ Trop de notifications (${saved.length}). Nettoyage complet...`);
      setNotifications([]);
      isInitializedRef.current = true;
      return;
    }
    
    // Supprimer les notifications expirées ou de plus de 7 jours
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const filtered = saved.filter(n => {
      if (n.expiresAt && n.expiresAt < now) return false;
      return n.timestamp > sevenDaysAgo;
    });
    
    // Limiter à 100 notifications maximum pour éviter les problèmes de performance
    const limited = filtered.slice(0, 100);
    
    if (limited.length !== filtered.length) {
      console.warn(`⚠️ ${filtered.length - limited.length} anciennes notifications supprimées (limite de 100)`);
    }
    
    setNotifications(limited);
    notificationsRef.current = limited;
    isInitializedRef.current = true;
  }, []);

  // Sauvegarder dans localStorage à chaque changement (avec protection contre les boucles)
  useEffect(() => {
    if (!isInitializedRef.current) return;
    
    // Comparer avec la référence précédente pour éviter les sauvegardes inutiles
    const prevNotificationsStr = JSON.stringify(notificationsRef.current);
    const currentNotificationsStr = JSON.stringify(notifications);
    
    if (prevNotificationsStr === currentNotificationsStr) {
      return; // Pas de changement réel
    }
    
    notificationsRef.current = notifications;
    
    if (savingRef.current) return;
    
    savingRef.current = true;
    try {
      saveToStorage('notifications', notifications);
    } catch (error) {
      console.error('Error saving notifications:', error);
    } finally {
      // Utiliser setTimeout pour éviter les boucles
      setTimeout(() => {
        savingRef.current = false;
      }, 0);
    }
  }, [notifications]);

  const addNotification = useCallback((
    message: string, 
    type: PersistentNotification['type'] = 'info',
    options?: {
      title?: string;
      actionUrl?: string;
      actionLabel?: string;
      category?: string;
      priority?: 'low' | 'medium' | 'high';
      expiresAt?: number;
    }
  ) => {
    setNotifications(prev => {
      const now = Date.now();
      
      // Vérifier si une notification similaire existe déjà (éviter les doublons)
      // Vérifier dans les 24 dernières heures pour les rappels, 1 heure pour les autres
      const timeWindow = options?.category === 'organismes' ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000;
      const isDuplicate = prev.some(n => 
        n.message === message && 
        n.type === type &&
        n.category === options?.category &&
        (now - n.timestamp) < timeWindow
      );
      
      if (isDuplicate) {
        return prev;
      }

      const newNotification: PersistentNotification = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        title: options?.title,
        message,
        type,
        timestamp: now,
        read: false,
        actionUrl: options?.actionUrl,
        actionLabel: options?.actionLabel,
        category: options?.category,
        priority: options?.priority || 'medium',
        expiresAt: options?.expiresAt,
      };

      return [newNotification, ...prev];
    });
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const clearByCategory = useCallback((category: string) => {
    setNotifications(prev => prev.filter(n => n.category !== category));
  }, []);

  const unreadCount = useMemo(() => 
    notifications.filter(n => !n.read).length,
    [notifications]
  );

  return (
    <PersistentNotificationsContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        clearByCategory,
        unreadCount,
      }}
    >
      {children}
    </PersistentNotificationsContext.Provider>
  );
};

export const usePersistentNotifications = () => {
  const context = useContext(PersistentNotificationsContext);
  if (context === undefined) {
    throw new Error('usePersistentNotifications must be used within a PersistentNotificationsProvider');
  }
  return context;
};

