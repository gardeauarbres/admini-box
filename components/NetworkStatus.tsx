'use client';

import { useNetwork } from '@/context/NetworkContext';
import { useToast } from '@/context/ToastContext';
import { useEffect, useRef } from 'react';

export default function NetworkStatus() {
  const { isOnline, isSlowConnection } = useNetwork();
  const { showToast } = useToast();

  const hasShownOfflineRef = useRef(false);
  const hasShownSlowRef = useRef(false);

  useEffect(() => {
    if (!isOnline && !hasShownOfflineRef.current) {
      hasShownOfflineRef.current = true;
      showToast('Vous êtes hors ligne. Certaines fonctionnalités peuvent être limitées.', 'info');
    } else if (isOnline) {
      hasShownOfflineRef.current = false;
    }
  }, [isOnline, showToast]);

  useEffect(() => {
    if (isSlowConnection && !hasShownSlowRef.current) {
      hasShownSlowRef.current = true;
      showToast('Connexion lente détectée. Le chargement peut être plus long.', 'info');
    } else if (!isSlowConnection) {
      hasShownSlowRef.current = false;
    }
  }, [isSlowConnection, showToast]);

  if (!isOnline) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'var(--danger)',
        color: 'white',
        padding: '0.75rem',
        textAlign: 'center',
        zIndex: 10000,
        fontSize: '0.9rem',
        fontWeight: 500
      }}>
        ⚠️ Vous êtes hors ligne
      </div>
    );
  }

  return null;
}

