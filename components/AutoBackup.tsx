'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useOrganisms, useTransactions, useDocuments, useUserProfile } from '@/lib/queries';
import { saveToStorage, getFromStorage } from '@/lib/storage';

interface BackupData {
  timestamp: number;
  organisms: any[];
  transactions: any[];
  documents: any[];
  profile: any;
}

export default function AutoBackup() {
  const { user } = useAuth();
  const { data: organisms = [] } = useOrganisms(user?.$id || null);
  const { data: transactions = [] } = useTransactions(user?.$id || null);
  const { data: documents = [] } = useDocuments(user?.$id || null);
  const { data: profile } = useUserProfile(user?.$id || null);
  const [lastBackup, setLastBackup] = useState<number | null>(null);

  const lastBackupRef = useRef<number | null>(null);
  const backupInProgressRef = useRef(false);
  const initializedRef = useRef(false);

  // Initialiser le dernier backup une seule fois
  useEffect(() => {
    if (!user || initializedRef.current) return;
    
    const saved = getFromStorage<number>(`lastBackup_${user.$id}`, 0);
    lastBackupRef.current = saved;
    setLastBackup(saved);
    initializedRef.current = true;
  }, [user?.$id]);

  // Effect pour déclencher le backup quand nécessaire
  useEffect(() => {
    if (!user || backupInProgressRef.current || !initializedRef.current) return;
    
    const saved = lastBackupRef.current || getFromStorage<number>(`lastBackup_${user.$id}`, 0);
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    // Ne faire le backup que si nécessaire et si les données sont prêtes
    if (saved < oneDayAgo) {
      backupInProgressRef.current = true;
      
      try {
        const backupData: BackupData = {
          timestamp: now,
          organisms: organisms.map(org => ({
            name: org.name,
            status: org.status,
            message: org.message,
            url: org.url,
            tags: org.tags,
            isFavorite: org.isFavorite,
            reminderDate: org.reminderDate,
            reminderMessage: org.reminderMessage,
          })),
          transactions: transactions.map(t => ({
            date: t.date,
            label: t.label,
            amount: t.amount,
            category: t.category,
            type: t.type,
          })),
          documents: documents.map(doc => ({
            name: doc.name,
            date: doc.date,
            organism: doc.organism,
            type: doc.type,
            size: doc.size,
          })),
          profile: profile ? {
            firstName: profile.firstName,
            lastName: profile.lastName,
            profession: profile.profession,
            company: profile.company,
          } : null,
        };

        saveToStorage(`backup_${user.$id}`, backupData);
        saveToStorage(`lastBackup_${user.$id}`, now);
        lastBackupRef.current = now;
        setLastBackup(now);
        
        // Garder seulement les 7 derniers backups
        const backups = getFromStorage<BackupData[]>(`backups_${user.$id}`, []);
        backups.push(backupData);
        const recentBackups = backups.slice(-7);
        saveToStorage(`backups_${user.$id}`, recentBackups);
      } catch (error) {
        console.error('Error performing backup:', error);
      } finally {
        backupInProgressRef.current = false;
      }
    }
  }, [user?.$id]); // Utiliser seulement l'ID de l'utilisateur pour éviter les re-renders

  // Ne rien afficher, juste gérer les backups en arrière-plan
  return null;
}
