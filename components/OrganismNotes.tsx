'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { formatDate, formatFullDate } from '@/lib/utils';

interface Note {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
}

interface OrganismNotesProps {
  organismId: string;
  notes?: string; // Notes stockées comme string JSON dans Appwrite
  onUpdateNotes: (notes: Note[]) => void;
}

export default function OrganismNotes({ organismId, notes, onUpdateNotes }: OrganismNotesProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [localNotes, setLocalNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const notesRef = useRef<string | undefined>(notes);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    // Ne charger qu'une seule fois au montage ou si notes change vraiment
    const currentNotesStr = notes || '';
    const previousNotesStr = notesRef.current || '';
    
    if (currentNotesStr !== previousNotesStr || !hasInitializedRef.current) {
      notesRef.current = notes;
      hasInitializedRef.current = true;
      
      // Charger les notes depuis le string JSON
      if (notes) {
        try {
          const parsed = JSON.parse(notes);
          const parsedArray = Array.isArray(parsed) ? parsed : [];
          // Utiliser une fonction de mise à jour pour éviter les dépendances
          setLocalNotes(prev => {
            const prevStr = JSON.stringify(prev);
            const newStr = JSON.stringify(parsedArray);
            return prevStr === newStr ? prev : parsedArray;
          });
        } catch {
          setLocalNotes(prev => prev.length > 0 ? [] : prev);
        }
      } else {
        setLocalNotes(prev => prev.length > 0 ? [] : prev);
      }
    }
  }, [notes]);

  const handleAddNote = () => {
    if (!newNote.trim() || !user) return;

    const note: Note = {
      id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: newNote.trim(),
      createdAt: new Date().toISOString(),
      userId: user.$id,
    };

    const updatedNotes = [note, ...localNotes];
    setLocalNotes(updatedNotes);
    
    // Utiliser setTimeout pour éviter les mises à jour synchrones qui causent des boucles
    setTimeout(() => {
      onUpdateNotes(updatedNotes);
    }, 0);
    
    setNewNote('');
    showToast('Note ajoutée', 'success');
  };

  const handleDeleteNote = (noteId: string) => {
    if (!confirm('Supprimer cette note ?')) return;

    const updatedNotes = localNotes.filter(n => n.id !== noteId);
    setLocalNotes(updatedNotes);
    
    // Utiliser setTimeout pour éviter les mises à jour synchrones qui causent des boucles
    setTimeout(() => {
      onUpdateNotes(updatedNotes);
    }, 0);
    
    showToast('Note supprimée', 'success');
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          📝 Notes ({localNotes.length})
        </h4>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="btn btn-secondary"
          style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
        >
          {isExpanded ? 'Réduire' : 'Voir'}
        </button>
      </div>

      {isExpanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Formulaire d'ajout */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Ajouter une note..."
              rows={2}
              style={{
                flex: 1,
                padding: '0.5rem',
                borderRadius: 'var(--radius)',
                background: 'var(--input-bg)',
                border: '1px solid var(--input-border)',
                color: 'var(--foreground)',
                fontSize: '0.85rem',
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  handleAddNote();
                }
              }}
            />
            <button
              onClick={handleAddNote}
              className="btn btn-primary"
              style={{ padding: '0.5rem 1rem', alignSelf: 'flex-start' }}
              disabled={!newNote.trim()}
            >
              Ajouter
            </button>
          </div>

          {/* Liste des notes */}
          {localNotes.length === 0 ? (
            <div style={{ 
              padding: '1rem', 
              textAlign: 'center', 
              color: 'var(--secondary)', 
              fontSize: '0.85rem',
              fontStyle: 'italic'
            }}>
              Aucune note pour le moment
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto' }}>
              {localNotes.map((note) => (
                <div
                  key={note.id}
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius)',
                    background: 'var(--form-bg)',
                    border: '1px solid var(--card-border)',
                    position: 'relative',
                  }}
                >
                  <div style={{ 
                    fontSize: '0.85rem', 
                    color: 'var(--foreground)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    marginBottom: '0.5rem'
                  }}>
                    {note.content}
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    fontSize: '0.75rem',
                    color: 'var(--secondary)'
                  }}>
                    <span>{formatFullDate(note.createdAt)}</span>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="btn btn-secondary"
                      style={{ 
                        fontSize: '0.7rem', 
                        padding: '0.25rem 0.5rem',
                        background: 'var(--danger)20',
                        color: 'var(--danger)',
                        border: 'none'
                      }}
                      title="Supprimer la note"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

