'use client';

import { useState } from 'react';
import { useToast } from '@/context/ToastContext';

interface OrganismTagsProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  availableTags?: string[]; // Tags suggérés
}

export default function OrganismTags({ tags, onTagsChange, availableTags = [] }: OrganismTagsProps) {
  const { showToast } = useToast();
  const [newTag, setNewTag] = useState('');
  const [showInput, setShowInput] = useState(false);

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (!trimmedTag) return;

    if (tags.includes(trimmedTag)) {
      showToast('Ce tag existe déjà', 'error');
      return;
    }

    if (tags.length >= 10) {
      showToast('Maximum 10 tags autorisés', 'error');
      return;
    }

    if (trimmedTag.length > 20) {
      showToast('Un tag ne peut pas dépasser 20 caractères', 'error');
      return;
    }

    onTagsChange([...tags, trimmedTag]);
    setNewTag('');
    setShowInput(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSelectSuggestedTag = (tag: string) => {
    if (!tags.includes(tag)) {
      onTagsChange([...tags, tag]);
    }
  };

  const suggestedTags = availableTags.filter(tag => !tags.includes(tag));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
        {tags.map(tag => (
          <span
            key={tag}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.25rem 0.75rem',
              borderRadius: '999px',
              background: 'var(--primary)',
              color: 'white',
              fontSize: '0.85rem',
              fontWeight: 500,
            }}
          >
            {tag}
            <button
              onClick={() => handleRemoveTag(tag)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '1rem',
                padding: 0,
                lineHeight: 1,
              }}
              title="Supprimer le tag"
            >
              ×
            </button>
          </span>
        ))}

        {!showInput && tags.length < 10 && (
          <button
            onClick={() => setShowInput(true)}
            style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '999px',
              background: 'var(--form-bg)',
              border: '1px dashed var(--card-border)',
              color: 'var(--secondary)',
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            + Ajouter un tag
          </button>
        )}
      </div>

      {showInput && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                } else if (e.key === 'Escape') {
                  setShowInput(false);
                  setNewTag('');
                }
              }}
              placeholder="Nouveau tag..."
              maxLength={20}
              style={{
                flex: 1,
                padding: '0.5rem',
                borderRadius: 'var(--radius)',
                background: 'var(--input-bg)',
                border: '1px solid var(--input-border)',
                color: 'var(--foreground)',
                fontSize: '0.85rem',
              }}
              autoFocus
            />
            <button
              onClick={handleAddTag}
              className="btn btn-primary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              Ajouter
            </button>
            <button
              onClick={() => {
                setShowInput(false);
                setNewTag('');
              }}
              className="btn btn-secondary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              Annuler
            </button>
          </div>

          {suggestedTags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>Suggestions :</span>
              {suggestedTags.slice(0, 5).map(tag => (
                <button
                  key={tag}
                  onClick={() => handleSelectSuggestedTag(tag)}
                  style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '999px',
                    background: 'var(--form-bg)',
                    border: '1px solid var(--card-border)',
                    color: 'var(--foreground)',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                  }}
                >
                  + {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

