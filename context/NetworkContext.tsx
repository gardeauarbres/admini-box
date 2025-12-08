'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface NetworkContextType {
  isOnline: boolean;
  isSlowConnection: boolean;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider = ({ children }: { children: ReactNode }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [isSlowConnection, setIsSlowConnection] = useState(false);

  useEffect(() => {
    // Détection de la connexion
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Détection de la vitesse de connexion
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      const updateConnection = () => {
        if (connection) {
          // 2G ou connexion lente
          setIsSlowConnection(
            connection.effectiveType === 'slow-2g' || 
            connection.effectiveType === '2g' ||
            connection.saveData === true
          );
        }
      };

      updateConnection();
      connection.addEventListener('change', updateConnection);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        connection.removeEventListener('change', updateConnection);
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <NetworkContext.Provider value={{ isOnline, isSlowConnection }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};

