'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { saveToStorage, getFromStorage } from '@/lib/storage';

interface FilterPreset {
  id: string;
  name: string;
  filters: {
    status?: 'all' | 'ok' | 'warning' | 'urgent';
    tag?: string;
    favoritesOnly?: boolean;
    searchQuery?: string;
  };
}

interface FilterPresetsProps {
  currentFilters: {
    status: 'all' | 'ok' | 'warning' | 'urgent';
    tag: string;
    favoritesOnly: boolean;
    searchQuery: string;
  };
  onApplyPreset: (filters: FilterPreset['filters']) => void;
}

export default function FilterPresets({ currentFilters, onApplyPreset }: FilterPresetsProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [presetName, setPresetName] = useState('');

  useEffect(() => {
    if (user) {
      const saved = getFromStorage<FilterPreset[]>(`filterPresets_${user.$id}`, []);
      setPresets(saved);
    }
  }, [user]);

  const handleSavePreset = () => {
    if (!presetName.trim() || !user) return;

    const preset: FilterPreset = {
      id: `preset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: presetName.trim(),
      filters: { ...currentFilters },
    };

    const updated = [preset, ...presets];
    setPresets(updated);
    saveToStorage(`filterPresets_${user.$id}`, updated);
    setPresetName('');
    setShowSaveDialog(false);
    showToast('Filtre sauvegardé', 'success');
  };

  const handleDeletePreset = (id: string) => {
    if (!user || !confirm('Supprimer ce filtre sauvegardé ?')) return;

    const updated = presets.filter(p => p.id !== id);
    setPresets(updated);
    saveToStorage(`filterPresets_${user.$id}`, updated);
    showToast('Filtre supprimé', 'success');
  };

  const handleApplyPreset = (preset: FilterPreset) => {
    onApplyPreset(preset.filters);
    showToast(`Filtre "${preset.name}" appliqué`, 'success');
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--secondary)' }}>
          🔖 Filtres sauvegardés
        </h4>
        <button
          onClick={() => setShowSaveDialog(!showSaveDialog)}
          className="btn btn-secondary"
          style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
        >
          {showSaveDialog ? 'Annuler' : '+ Sauvegarder'}
        </button>
      </div>

      {showSaveDialog && (
        <div style={{ 
          padding: '0.75rem', 
          borderRadius: 'var(--radius)', 
          background: 'var(--form-bg)',
          border: '1px solid var(--card-border)',
          marginBottom: '0.75rem',
          display: 'flex',
          gap: '0.5rem'
        }}>
          <input
            type="text"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            placeholder="Nom du filtre..."
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: 'var(--radius)',
              background: 'var(--input-bg)',
              border: '1px solid var(--input-border)',
              color: 'var(--foreground)',
              fontSize: '0.85rem',
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSavePreset();
              }
            }}
          />
          <button
            onClick={handleSavePreset}
            className="btn btn-primary"
            style={{ padding: '0.5rem 1rem' }}
            disabled={!presetName.trim()}
          >
            Sauvegarder
          </button>
        </div>
      )}

      {presets.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {presets.map((preset) => (
            <div
              key={preset.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius)',
                background: 'var(--form-bg)',
                border: '1px solid var(--card-border)',
                fontSize: '0.85rem',
              }}
            >
              <button
                onClick={() => handleApplyPreset(preset)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  cursor: 'pointer',
                  fontWeight: 500,
                  padding: 0,
                }}
              >
                {preset.name}
              </button>
              <button
                onClick={() => handleDeletePreset(preset.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--danger)',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  padding: '0.25rem',
                  lineHeight: 1,
                }}
                title="Supprimer"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ 
          fontSize: '0.85rem', 
          color: 'var(--secondary)', 
          fontStyle: 'italic',
          padding: '0.5rem'
        }}>
          Aucun filtre sauvegardé
        </div>
      )}
    </div>
  );
}

