'use client';

import { useState, useEffect } from 'react';
import { saveToStorage, getFromStorage } from '@/lib/storage';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DashboardStats from './DashboardStats';
import AdvancedStats from './AdvancedStats';
import AnalyticsDashboard from './AnalyticsDashboard';
import type { Organism, Transaction } from '@/lib/queries';

// Composant pour rendre un widget draggable
function SortableWidget({ id, children, isEditing }: { id: string; children: React.ReactNode; isEditing: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginBottom: '1.5rem',
    position: 'relative' as const,
    zIndex: isEditing ? 10 : 1, // Mettre au dessus quand on édite
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {/* Poignée de drag uniquement visible en mode édition */}
      {isEditing && (
        <div
          {...listeners}
          style={{
            position: 'absolute',
            top: '-10px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--primary)',
            color: 'white',
            padding: '0.2rem 1rem',
            borderRadius: '20px',
            cursor: 'grab',
            zIndex: 20,
            fontSize: '0.8rem',
            fontWeight: 'bold',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            touchAction: 'none'
          }}
        >
          ✋ Déplacer
        </div>
      )}
      {children}
    </div>
  );
}

interface DashboardWidgetsProps {
  organisms: Organism[];
  transactions: Transaction[];
}

type WidgetId = 'stats' | 'advanced' | 'analytics';

interface WidgetConfig {
  id: WidgetId;
  name: string;
  icon: string;
  enabled: boolean;
  order: number;
}

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: 'stats', name: 'Statistiques', icon: '📊', enabled: true, order: 1 },
  { id: 'advanced', name: 'Statistiques Avancées', icon: '📈', enabled: true, order: 2 },
  { id: 'analytics', name: 'Analytics', icon: '📉', enabled: true, order: 3 },
];

export default function DashboardWidgets({ organisms, transactions }: DashboardWidgetsProps) {
  const [widgets, setWidgets] = useState<WidgetConfig[]>(DEFAULT_WIDGETS);
  const [isEditing, setIsEditing] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Charger la configuration depuis localStorage
  useEffect(() => {
    const saved = getFromStorage<WidgetConfig[]>('dashboard_widgets', DEFAULT_WIDGETS);
    setWidgets(saved);
  }, []);

  // Sauvegarder la configuration
  const saveWidgets = (newWidgets: WidgetConfig[]) => {
    setWidgets(newWidgets);
    saveToStorage('dashboard_widgets', newWidgets);
  };

  // Toggle l'état d'un widget
  const toggleWidget = (widgetId: WidgetId) => {
    const newWidgets = widgets.map(w =>
      w.id === widgetId ? { ...w, enabled: !w.enabled } : w
    );
    saveWidgets(newWidgets);
  };

  // Gestion du Drag & Drop
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setWidgets((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newOrder = arrayMove(items, oldIndex, newIndex).map((item, index) => ({
          ...item,
          order: index + 1
        }));

        saveToStorage('dashboard_widgets', newOrder);
        return newOrder;
      });
    }
  };

  // Réinitialiser à la configuration par défaut
  const resetToDefault = () => {
    if (confirm('Réinitialiser tous les widgets à la configuration par défaut ?')) {
      saveWidgets(DEFAULT_WIDGETS);
    }
  };

  // Trier les widgets par ordre
  const sortedWidgets = [...widgets].sort((a, b) => a.order - b.order);

  // Widgets activés uniquement
  const enabledWidgets = sortedWidgets.filter(w => w.enabled);

  return (
    <div>
      {/* Bouton de configuration */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="btn btn-secondary"
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          {isEditing ? '✅ Terminer' : '⚙️ Configurer les widgets'}
        </button>
      </div>

      {/* Panneau de configuration */}
      {isEditing && (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ⚙️ Configuration des Widgets
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {sortedWidgets.map((widget, index) => (
              <div
                key={widget.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.75rem',
                  background: 'var(--form-bg)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--card-border)',
                }}
              >
                {/* Boutons de déplacement supprimés au profit du Drag & Drop */}

                <span style={{ fontSize: '1.25rem' }}>{widget.icon}</span>

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500 }}>{widget.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>
                    {widget.enabled ? '✅ Activé' : '❌ Désactivé'}
                  </div>
                </div>

                <button
                  onClick={() => toggleWidget(widget.id)}
                  className={`btn ${widget.enabled ? 'btn-secondary' : 'btn-primary'}`}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                >
                  {widget.enabled ? 'Désactiver' : 'Activer'}
                </button>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button
              onClick={resetToDefault}
              className="btn btn-secondary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              🔄 Réinitialiser
            </button>
          </div>
        </div>
      )}

      {/* Affichage des widgets (Draggable) */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={enabledWidgets.map(w => w.id)}
          strategy={verticalListSortingStrategy}
        >
          <div>
            {enabledWidgets.map(widget => {
              let content = null;
              switch (widget.id) {
                case 'stats':
                  content = <DashboardStats organisms={organisms} transactions={transactions} />;
                  break;
                case 'advanced':
                  content = <AdvancedStats organisms={organisms} transactions={transactions} />;
                  break;
                case 'analytics':
                  content = (organisms.length > 0 || transactions.length > 0) ? (
                    <AnalyticsDashboard organisms={organisms} transactions={transactions} />
                  ) : null;
                  break;
              }

              if (!content) return null;

              return (
                <SortableWidget key={widget.id} id={widget.id} isEditing={isEditing}>
                  <div style={{ pointerEvents: isEditing ? 'none' : 'auto', opacity: isEditing ? 0.8 : 1, transition: 'opacity 0.2s' }}>
                    {content}
                  </div>
                </SortableWidget>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

      {enabledWidgets.length === 0 && (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--secondary)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
          <p>Aucun widget activé.</p>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Cliquez sur "Configurer les widgets" pour en activer.
          </p>
        </div>
      )}
    </div>
  );
}

