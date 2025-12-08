/**
 * Fonction utilitaire pour supprimer toutes les notifications
 * Peut être appelée depuis la console du navigateur ou depuis le code
 */

import { removeFromStorage } from './storage';

export function clearAllNotifications(): void {
  try {
    // Supprimer les notifications
    removeFromStorage('notifications');
    
    // Supprimer les rappels traités
    removeFromStorage('processed_reminders');
    
    console.log('✅ Toutes les notifications ont été supprimées');
    
    // Recharger la page pour appliquer les changements
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  } catch (error) {
    console.error('❌ Erreur lors de la suppression des notifications:', error);
  }
}

// Exposer la fonction globalement pour pouvoir l'appeler depuis la console
if (typeof window !== 'undefined') {
  (window as any).clearAllNotifications = clearAllNotifications;
}

