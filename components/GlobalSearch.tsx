'use client';

import { useState, useMemo } from 'react';
import { useOrganisms, useTransactions, useDocuments } from '@/lib/queries';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';

interface SearchResult {
  type: 'organism' | 'transaction' | 'document';
  id: string;
  title: string;
  subtitle: string;
  url?: string;
}

export default function GlobalSearch() {
  const { user } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const { data: organisms = [] } = useOrganisms(user?.$id || null);
  const { data: transactions = [] } = useTransactions(user?.$id || null);
  const { data: documents = [] } = useDocuments(user?.$id || null);

  const results = useMemo(() => {
    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase();
    const searchResults: SearchResult[] = [];

    // Recherche dans les organismes
    organisms.forEach(org => {
      if (
        org.name.toLowerCase().includes(lowerQuery) ||
        org.message?.toLowerCase().includes(lowerQuery) ||
        org.url?.toLowerCase().includes(lowerQuery)
      ) {
        searchResults.push({
          type: 'organism',
          id: org.$id,
          title: org.name,
          subtitle: org.message || org.url || 'Organisme',
          url: org.url,
        });
      }
    });

    // Recherche dans les transactions
    transactions.forEach(t => {
      if (
        t.label.toLowerCase().includes(lowerQuery) ||
        t.category.toLowerCase().includes(lowerQuery)
      ) {
        searchResults.push({
          type: 'transaction',
          id: t.$id,
          title: t.label,
          subtitle: `${t.category} - ${formatDate(t.date)} - ${t.amount.toFixed(2)} €`,
        });
      }
    });

    // Recherche dans les documents
    documents.forEach(doc => {
      if (
        doc.name.toLowerCase().includes(lowerQuery) ||
        doc.organism.toLowerCase().includes(lowerQuery) ||
        doc.type.toLowerCase().includes(lowerQuery)
      ) {
        searchResults.push({
          type: 'document',
          id: doc.$id,
          title: doc.name,
          subtitle: `${doc.type} - ${doc.organism} - ${doc.date}`,
        });
      }
    });

    return searchResults.slice(0, 10); // Limiter à 10 résultats
  }, [query, organisms, transactions, documents]);

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false);
    setQuery('');
    
    switch (result.type) {
      case 'organism':
        router.push('/');
        break;
      case 'transaction':
        router.push('/finance');
        break;
      case 'document':
        router.push('/documents');
        break;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setQuery('');
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '500px' }}>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          placeholder="Rechercher dans l'application... (Ctrl+K)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          data-global-search
          style={{
            width: '100%',
            padding: '0.75rem 2.5rem 0.75rem 1rem',
            borderRadius: 'var(--radius)',
            background: 'var(--input-bg)',
            border: '1px solid var(--input-border)',
            color: 'var(--foreground)',
            fontSize: '0.9rem',
          }}
        />
        <span style={{
          position: 'absolute',
          right: '1rem',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--secondary)',
          fontSize: '1.2rem',
        }}>
          🔍
        </span>
      </div>

      {isOpen && query.trim() && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '0.5rem',
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: 'var(--radius)',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          maxHeight: '400px',
          overflowY: 'auto',
          zIndex: 1000,
        }}>
          {results.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--secondary)' }}>
              Aucun résultat trouvé
            </div>
          ) : (
            <>
              <div style={{
                padding: '0.75rem 1rem',
                borderBottom: '1px solid var(--card-border)',
                fontSize: '0.85rem',
                color: 'var(--secondary)',
                fontWeight: 500,
              }}>
                {results.length} résultat{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''}
              </div>
              {results.map((result, index) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    textAlign: 'left',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: index < results.length - 1 ? '1px solid var(--card-border)' : 'none',
                    cursor: 'pointer',
                    color: 'var(--foreground)',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--form-bg)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>
                      {result.type === 'organism' && '🏢'}
                      {result.type === 'transaction' && '💰'}
                      {result.type === 'document' && '📄'}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>
                        {result.title}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>
                        {result.subtitle}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      )}

      {/* Overlay pour fermer la recherche */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
          }}
        />
      )}
    </div>
  );
}

