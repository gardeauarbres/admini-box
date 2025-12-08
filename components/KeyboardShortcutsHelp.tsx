'use client';

import { useState, useEffect } from 'react';

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  { keys: ['Ctrl', 'K'], description: 'Recherche globale', category: 'Navigation' },
  { keys: ['Ctrl', 'N'], description: 'Ajouter un organisme', category: 'Actions' },
  { keys: ['Ctrl', 'Shift', 'N'], description: 'Ouvrir les templates', category: 'Actions' },
  { keys: ['Ctrl', 'E'], description: 'Exporter les données', category: 'Actions' },
  { keys: ['Escape'], description: 'Fermer les formulaires/modales', category: 'Navigation' },
  { keys: ['?'], description: 'Afficher cette aide', category: 'Aide' },
  { keys: ['/', 'F'], description: 'Focus sur la recherche', category: 'Navigation' },
  { keys: ['Arrow Up/Down'], description: 'Navigation dans les listes', category: 'Navigation' },
];

export default function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);
  const [showOnMount, setShowOnMount] = useState(false);

  useEffect(() => {
    // Afficher automatiquement au premier chargement si jamais ouvert
    const hasSeenHelp = localStorage.getItem('keyboard-shortcuts-seen');
    if (!hasSeenHelp) {
      setTimeout(() => {
        setIsOpen(true);
        setShowOnMount(true);
      }, 2000);
    }
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        setIsOpen(true);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        if (showOnMount) {
          localStorage.setItem('keyboard-shortcuts-seen', 'true');
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, showOnMount]);

  if (!isOpen) return null;

  const categories = Array.from(new Set(shortcuts.map(s => s.category)));

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '1rem',
      }}
      onClick={() => {
        setIsOpen(false);
        if (showOnMount) {
          localStorage.setItem('keyboard-shortcuts-seen', 'true');
        }
      }}
    >
      <div
        className="glass-panel"
        style={{
          maxWidth: '600px',
          width: '100%',
          maxHeight: '80vh',
          overflowY: 'auto',
          padding: '2rem',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>⌨️ Raccourcis clavier</h2>
          <button
            onClick={() => {
              setIsOpen(false);
              if (showOnMount) {
                localStorage.setItem('keyboard-shortcuts-seen', 'true');
              }
            }}
            className="btn btn-secondary"
            style={{ padding: '0.5rem 1rem' }}
            aria-label="Fermer l'aide"
          >
            ✕
          </button>
        </div>

        {categories.map(category => (
          <div key={category} style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--primary)' }}>
              {category}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {shortcuts
                .filter(s => s.category === category)
                .map((shortcut, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius)',
                      background: 'var(--form-bg)',
                      border: '1px solid var(--card-border)',
                    }}
                  >
                    <span style={{ color: 'var(--foreground)' }}>{shortcut.description}</span>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      {shortcut.keys.map((key, keyIndex) => (
                        <span
                          key={keyIndex}
                          style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            background: 'var(--card-bg)',
                            border: '1px solid var(--card-border)',
                            fontSize: '0.8rem',
                            fontFamily: 'monospace',
                            color: 'var(--foreground)',
                            fontWeight: 500,
                          }}
                        >
                          {key}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}

        <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--form-bg)', borderRadius: 'var(--radius)', fontSize: '0.9rem', color: 'var(--secondary)' }}>
          💡 Appuyez sur <kbd style={{ padding: '0.2rem 0.4rem', background: 'var(--card-bg)', borderRadius: '4px', fontFamily: 'monospace' }}>?</kbd> à tout moment pour afficher cette aide
        </div>
      </div>
    </div>
  );
}

