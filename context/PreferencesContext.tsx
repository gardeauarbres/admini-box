'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { getFromStorage } from '@/lib/storage';

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
    autoSaveInterval: number;
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

interface PreferencesContextType {
  preferences: UserPreferences;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  
  const preferences = user
    ? getFromStorage<UserPreferences>(`preferences_${user.$id}`, defaultPreferences)
    : defaultPreferences;

  return (
    <PreferencesContext.Provider value={{ preferences }}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    return { preferences: defaultPreferences };
  }
  return context;
};

