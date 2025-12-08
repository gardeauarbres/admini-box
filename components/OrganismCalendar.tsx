'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { formatDate, formatFullDate } from '@/lib/utils';

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  description?: string;
  type: 'deadline' | 'appointment' | 'reminder' | 'other';
}

interface OrganismCalendarProps {
  organismId: string;
  events?: string; // Events stockés comme string JSON dans Appwrite
  onUpdateEvents: (events: CalendarEvent[]) => void;
}

export default function OrganismCalendar({ organismId, events, onUpdateEvents }: OrganismCalendarProps) {
  const [localEvents, setLocalEvents] = useState<CalendarEvent[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    description: '',
    type: 'reminder' as CalendarEvent['type'],
  });

  const eventsRef = useRef<string | undefined>(events);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    // Ne charger qu'une seule fois au montage ou si events change vraiment
    const currentEventsStr = events || '';
    const previousEventsStr = eventsRef.current || '';
    
    if (currentEventsStr !== previousEventsStr || !hasInitializedRef.current) {
      eventsRef.current = events;
      hasInitializedRef.current = true;
      
      // Charger les événements depuis le string JSON
      if (events) {
        try {
          const parsed = JSON.parse(events);
          const parsedArray = Array.isArray(parsed) ? parsed : [];
          // Utiliser une fonction de mise à jour pour éviter les dépendances
          setLocalEvents(prev => {
            const prevStr = JSON.stringify(prev);
            const newStr = JSON.stringify(parsedArray);
            return prevStr === newStr ? prev : parsedArray;
          });
        } catch {
          setLocalEvents(prev => prev.length > 0 ? [] : prev);
        }
      } else {
        setLocalEvents(prev => prev.length > 0 ? [] : prev);
      }
    }
  }, [events]);

  const handleAddEvent = () => {
    if (!newEvent.title.trim()) return;

    const event: CalendarEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: newEvent.title.trim(),
      date: newEvent.date,
      time: newEvent.time || undefined,
      description: newEvent.description.trim() || undefined,
      type: newEvent.type,
    };

    const updatedEvents = [...localEvents, event].sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time || '00:00'}`);
      const dateB = new Date(`${b.date} ${b.time || '00:00'}`);
      return dateA.getTime() - dateB.getTime();
    });

    setLocalEvents(updatedEvents);
    
    // Utiliser setTimeout pour éviter les mises à jour synchrones qui causent des boucles
    setTimeout(() => {
      onUpdateEvents(updatedEvents);
    }, 0);
    
    setNewEvent({
      title: '',
      date: new Date().toISOString().split('T')[0],
      time: '',
      description: '',
      type: 'reminder',
    });
    setShowAddForm(false);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (!confirm('Supprimer cet événement ?')) return;

    const updatedEvents = localEvents.filter(e => e.id !== eventId);
    setLocalEvents(updatedEvents);
    
    // Utiliser setTimeout pour éviter les mises à jour synchrones qui causent des boucles
    setTimeout(() => {
      onUpdateEvents(updatedEvents);
    }, 0);
  };

  const upcomingEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return localEvents
      .filter(event => {
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate >= today;
      })
      .slice(0, 5);
  }, [localEvents]);

  const getEventIcon = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'deadline': return '⏰';
      case 'appointment': return '📅';
      case 'reminder': return '🔔';
      default: return '📌';
    }
  };

  const getEventColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'deadline': return 'var(--danger)';
      case 'appointment': return 'var(--primary)';
      case 'reminder': return 'var(--warning)';
      default: return 'var(--secondary)';
    }
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          📅 Calendrier ({localEvents.length})
        </h4>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
          >
            {showAddForm ? 'Annuler' : '+ Événement'}
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
          >
            {isExpanded ? 'Réduire' : 'Voir'}
          </button>
        </div>
      </div>

      {/* Événements à venir (aperçu) */}
      {!isExpanded && upcomingEvents.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
          {upcomingEvents.map((event) => (
            <div
              key={event.id}
              style={{
                padding: '0.5rem',
                borderRadius: 'var(--radius)',
                background: 'var(--form-bg)',
                border: `1px solid ${getEventColor(event.type)}40`,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>{getEventIcon(event.type)}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {event.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>
                  {formatDate(event.date)} {event.time && `à ${event.time}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isExpanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Formulaire d'ajout */}
          {showAddForm && (
            <div style={{ 
              padding: '1rem', 
              borderRadius: 'var(--radius)', 
              background: 'var(--form-bg)',
              border: '1px solid var(--card-border)'
            }}>
              <h5 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', fontWeight: 600 }}>Nouvel événement</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <input
                  type="text"
                  placeholder="Titre de l'événement *"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  style={{
                    padding: '0.5rem',
                    borderRadius: 'var(--radius)',
                    background: 'var(--input-bg)',
                    border: '1px solid var(--input-border)',
                    color: 'var(--foreground)',
                    fontSize: '0.85rem',
                  }}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    style={{
                      padding: '0.5rem',
                      borderRadius: 'var(--radius)',
                      background: 'var(--input-bg)',
                      border: '1px solid var(--input-border)',
                      color: 'var(--foreground)',
                      fontSize: '0.85rem',
                    }}
                  />
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    style={{
                      padding: '0.5rem',
                      borderRadius: 'var(--radius)',
                      background: 'var(--input-bg)',
                      border: '1px solid var(--input-border)',
                      color: 'var(--foreground)',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as CalendarEvent['type'] })}
                  style={{
                    padding: '0.5rem',
                    borderRadius: 'var(--radius)',
                    background: 'var(--input-bg)',
                    border: '1px solid var(--input-border)',
                    color: 'var(--foreground)',
                    fontSize: '0.85rem',
                  }}
                >
                  <option value="reminder">🔔 Rappel</option>
                  <option value="deadline">⏰ Échéance</option>
                  <option value="appointment">📅 Rendez-vous</option>
                  <option value="other">📌 Autre</option>
                </select>
                <textarea
                  placeholder="Description (optionnel)"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  rows={2}
                  style={{
                    padding: '0.5rem',
                    borderRadius: 'var(--radius)',
                    background: 'var(--input-bg)',
                    border: '1px solid var(--input-border)',
                    color: 'var(--foreground)',
                    fontSize: '0.85rem',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                />
                <button
                  onClick={handleAddEvent}
                  className="btn btn-primary"
                  style={{ padding: '0.5rem 1rem' }}
                  disabled={!newEvent.title.trim()}
                >
                  Ajouter l'événement
                </button>
              </div>
            </div>
          )}

          {/* Liste des événements */}
          {localEvents.length === 0 ? (
            <div style={{ 
              padding: '1rem', 
              textAlign: 'center', 
              color: 'var(--secondary)', 
              fontSize: '0.85rem',
              fontStyle: 'italic'
            }}>
              Aucun événement programmé
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto' }}>
              {localEvents.map((event) => {
                const eventDate = new Date(event.date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                eventDate.setHours(0, 0, 0, 0);
                const isPast = eventDate < today;
                const isToday = eventDate.getTime() === today.getTime();

                return (
                  <div
                    key={event.id}
                    style={{
                      padding: '0.75rem',
                      borderRadius: 'var(--radius)',
                      background: isPast ? 'var(--form-bg)' : 'var(--card-bg)',
                      border: `1px solid ${isToday ? getEventColor(event.type) : 'var(--card-border)'}`,
                      opacity: isPast ? 0.6 : 1,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: '1.2rem' }}>{getEventIcon(event.type)}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ 
                            fontWeight: 500, 
                            fontSize: '0.85rem',
                            marginBottom: '0.25rem',
                            color: isToday ? getEventColor(event.type) : 'var(--foreground)'
                          }}>
                            {event.title}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginBottom: '0.25rem' }}>
                            {formatFullDate(event.date)} {event.time && `à ${event.time}`}
                            {isToday && <span style={{ color: getEventColor(event.type), fontWeight: 600 }}> (Aujourd'hui)</span>}
                            {isPast && <span style={{ color: 'var(--danger)' }}> (Passé)</span>}
                          </div>
                          {event.description && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontStyle: 'italic' }}>
                              {event.description}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="btn btn-secondary"
                        style={{ 
                          fontSize: '0.7rem', 
                          padding: '0.25rem 0.5rem',
                          background: 'var(--danger)20',
                          color: 'var(--danger)',
                          border: 'none'
                        }}
                        title="Supprimer"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

