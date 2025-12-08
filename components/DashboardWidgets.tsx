'use client';

import { useState, useEffect } from 'react';
import { saveToStorage, getFromStorage } from '@/lib/storage';
import DashboardStats from './DashboardStats';
import AdvancedStats from './AdvancedStats';
import AnalyticsDashboard from './AnalyticsDashboard';
import type { Organism, Transaction } from '@/lib/queries';

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

  // Réorganiser les widgets (monter)
  const moveUp = (index: number) => {
    if (index === 0) return;
    const newWidgets = [...widgets];
    [newWidgets[index - 1], newWidgets[index]] = [newWidgets[index], newWidgets[index - 1]];
    newWidgets[index - 1].order = index;
    newWidgets[index].order = index + 1;
    saveWidgets(newWidgets);
  };

  // Réorganiser les widgets (descendre)
  const moveDown = (index: number) => {
    if (index === widgets.length - 1) return;
    const newWidgets = [...widgets];
    [newWidgets[index], newWidgets[index + 1]] = [newWidgets[index + 1], newWidgets[index]];
    newWidgets[index].order = index + 1;
    newWidgets[index + 1].order = index + 2;
    saveWidgets(newWidgets);
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
                <button
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  className="btn btn-icon"
                  style={{ opacity: index === 0 ? 0.3 : 1 }}
                  title="Monter"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveDown(index)}
                  disabled={index === sortedWidgets.length - 1}
                  className="btn btn-icon"
                  style={{ opacity: index === sortedWidgets.length - 1 ? 0.3 : 1 }}
                  title="Descendre"
                >
                  ↓
                </button>
                
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

      {/* Affichage des widgets */}
      <div>
        {enabledWidgets.map(widget => {
          switch (widget.id) {
            case 'stats':
              return (
                <div key={widget.id}>
                  <DashboardStats organisms={organisms} transactions={transactions} />
                </div>
              );
            case 'advanced':
              return (
                <div key={widget.id}>
                  <AdvancedStats organisms={organisms} transactions={transactions} />
                </div>
              );
            case 'analytics':
              return (organisms.length > 0 || transactions.length > 0) ? (
                <div key={widget.id}>
                  <AnalyticsDashboard organisms={organisms} transactions={transactions} />
                </div>
              ) : null;
            default:
              return null;
          }
        })}
      </div>

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

