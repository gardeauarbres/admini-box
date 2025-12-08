'use client';

import { useState } from 'react';
import { useToast } from '@/context/ToastContext';

interface OrganismTemplate {
  id: string;
  name: string;
  icon: string;
  url: string;
  message: string;
  tags: string[];
  description: string;
}

const templates: OrganismTemplate[] = [
  {
    id: 'caf',
    name: 'CAF',
    icon: '🏛️',
    url: 'https://www.caf.fr',
    message: 'Caisse d\'allocations familiales',
    tags: ['administration', 'social'],
    description: 'Gestion des allocations familiales et aides sociales'
  },
  {
    id: 'cpam',
    name: 'CPAM',
    icon: '🏥',
    url: 'https://www.ameli.fr',
    message: 'Caisse primaire d\'assurance maladie',
    tags: ['santé', 'administration'],
    description: 'Assurance maladie et remboursements'
  },
  {
    id: 'urssaf',
    name: 'URSSAF',
    icon: '💼',
    url: 'https://www.urssaf.fr',
    message: 'Union de recouvrement des cotisations de sécurité sociale',
    tags: ['travail', 'cotisations'],
    description: 'Déclarations et paiements des cotisations sociales'
  },
  {
    id: 'impots',
    name: 'Impôts',
    icon: '📊',
    url: 'https://www.impots.gouv.fr',
    message: 'Direction générale des finances publiques',
    tags: ['fiscalité', 'administration'],
    description: 'Déclarations fiscales et paiements'
  },
  {
    id: 'pole-emploi',
    name: 'Pôle Emploi',
    icon: '💼',
    url: 'https://www.pole-emploi.fr',
    message: 'Service public de l\'emploi',
    tags: ['emploi', 'social'],
    description: 'Demandeurs d\'emploi et offres'
  },
  {
    id: 'msa',
    name: 'MSA',
    icon: '🌾',
    url: 'https://www.msa.fr',
    message: 'Mutualité sociale agricole',
    tags: ['agriculture', 'santé'],
    description: 'Protection sociale agricole'
  },
  {
    id: 'prefecture',
    name: 'Préfecture',
    icon: '🏛️',
    url: 'https://www.service-public.fr',
    message: 'Services de la préfecture',
    tags: ['administration', 'papiers'],
    description: 'Titres de séjour, cartes d\'identité, etc.'
  },
  {
    id: 'caisse-retraite',
    name: 'Caisse de Retraite',
    icon: '👴',
    url: 'https://www.lassuranceretraite.fr',
    message: 'Caisse nationale d\'assurance vieillesse',
    tags: ['retraite', 'social'],
    description: 'Gestion de la retraite'
  },
];

interface OrganismTemplatesProps {
  onSelectTemplate: (template: OrganismTemplate) => void;
}

export default function OrganismTemplates({ onSelectTemplate }: OrganismTemplatesProps) {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSelectTemplate = (template: OrganismTemplate) => {
    onSelectTemplate(template);
    showToast(`Template "${template.name}" sélectionné`, 'success');
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>📋 Templates d'organismes</h3>
        <p style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>
          Sélectionnez un modèle pré-configuré pour créer rapidement un organisme
        </p>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="🔍 Rechercher un template..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: 'var(--radius)',
            background: 'var(--input-bg)',
            border: '1px solid var(--input-border)',
            color: 'var(--foreground)',
            fontSize: '0.9rem'
          }}
        />
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
        gap: '1rem' 
      }}>
        {filteredTemplates.map(template => (
          <button
            key={template.id}
            onClick={() => handleSelectTemplate(template)}
            style={{
              padding: '1.5rem',
              borderRadius: 'var(--radius)',
              background: 'var(--form-bg)',
              border: '1px solid var(--card-border)',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              color: 'var(--foreground)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--card-bg)';
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--form-bg)';
              e.currentTarget.style.borderColor = 'var(--card-border)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '2rem' }}>{template.icon}</span>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>
                  {template.name}
                </h4>
                <p style={{ 
                  fontSize: '0.85rem', 
                  color: 'var(--secondary)', 
                  margin: '0.25rem 0 0 0' 
                }}>
                  {template.description}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
              {template.tags.map(tag => (
                <span
                  key={tag}
                  style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    background: 'var(--card-bg)',
                    border: '1px solid var(--card-border)',
                    fontSize: '0.75rem',
                    color: 'var(--secondary)',
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center', 
          color: 'var(--secondary)' 
        }}>
          Aucun template ne correspond à votre recherche
        </div>
      )}
    </div>
  );
}

