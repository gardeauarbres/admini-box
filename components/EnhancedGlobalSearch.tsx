'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useOrganisms, useTransactions, useDocuments } from '@/lib/queries';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { formatDate, formatCurrency } from '@/lib/utils';

interface SearchResult {
  type: 'organism' | 'transaction' | 'document';
  id: string;
  title: string;
  subtitle: string;
  url?: string;
  metadata?: Record<string, any>;
}

type FilterType = 'all' | 'organism' | 'transaction' | 'document';

export default function EnhancedGlobalSearch() {
  const { user } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const lastSelectedIndexRef = useRef(-1);

  const { data: organisms = [] } = useOrganisms(user?.$id || null);
  const { data: transactions = [] } = useTransactions(user?.$id || null);
  const { data: documents = [] } = useDocuments(user?.$id || null);

  const results = useMemo(() => {
    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase();
    const searchResults: SearchResult[] = [];

    // Recherche dans les organismes
    if (filter === 'all' || filter === 'organism') {
      organisms.forEach(org => {
        const matchesName = org.name.toLowerCase().includes(lowerQuery);
        const matchesMessage = org.message?.toLowerCase().includes(lowerQuery);
        const matchesUrl = org.url?.toLowerCase().includes(lowerQuery);
        const matchesTags = org.tags?.some(tag => tag.toLowerCase().includes(lowerQuery));
        
        if (matchesName || matchesMessage || matchesUrl || matchesTags) {
          const relevance = matchesName ? 3 : (matchesMessage ? 2 : 1);
          searchResults.push({
            type: 'organism',
            id: org.$id,
            title: org.name,
            subtitle: org.message || org.url || 'Organisme',
            url: org.url,
            metadata: { 
              status: org.status, 
              relevance,
              tags: org.tags,
              isFavorite: org.isFavorite 
            },
          });
        }
      });
    }

    // Recherche dans les transactions
    if (filter === 'all' || filter === 'transaction') {
      transactions.forEach(t => {
        const matchesLabel = t.label.toLowerCase().includes(lowerQuery);
        const matchesCategory = t.category.toLowerCase().includes(lowerQuery);
        const matchesAmount = t.amount.toString().includes(query);
        
        if (matchesLabel || matchesCategory || matchesAmount) {
          const relevance = matchesLabel ? 3 : (matchesCategory ? 2 : 1);
          searchResults.push({
            type: 'transaction',
            id: t.$id,
            title: t.label,
            subtitle: `${t.category} - ${formatDate(t.date)} - ${formatCurrency(t.amount)}`,
            metadata: { 
              amount: t.amount, 
              type: t.type,
              category: t.category,
              relevance 
            },
          });
        }
      });
    }

    // Recherche dans les documents
    if (filter === 'all' || filter === 'document') {
      documents.forEach(doc => {
        const matchesName = doc.name.toLowerCase().includes(lowerQuery);
        const matchesOrganism = doc.organism.toLowerCase().includes(lowerQuery);
        const matchesType = doc.type.toLowerCase().includes(lowerQuery);
        
        if (matchesName || matchesOrganism || matchesType) {
          const relevance = matchesName ? 3 : (matchesOrganism ? 2 : 1);
          searchResults.push({
            type: 'document',
            id: doc.$id,
            title: doc.name,
            subtitle: `${doc.type} - ${doc.organism} - ${formatDate(doc.date)}`,
            metadata: { 
              type: doc.type,
              organism: doc.organism,
              size: doc.size,
              relevance 
            },
          });
        }
      });
    }

    // Trier par pertinence
    return searchResults
      .sort((a, b) => (b.metadata?.relevance || 0) - (a.metadata?.relevance || 0))
      .slice(0, 15); // Limiter à 15 résultats
  }, [query, organisms, transactions, documents, filter]);

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(0);
    
    switch (result.type) {
      case 'organism':
        router.push('/');
        // Scroll vers l'organisme si possible
        setTimeout(() => {
          const element = document.querySelector(`[data-organism-id="${result.id}"]`);
          element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
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
      setSelectedIndex(0);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      handleResultClick(results[selectedIndex]);
    }
  };

  // Scroll vers le résultat sélectionné (seulement si l'index a vraiment changé)
  useEffect(() => {
    if (
      resultsRef.current && 
      selectedIndex >= 0 && 
      results.length > 0 &&
      selectedIndex !== lastSelectedIndexRef.current &&
      !isScrollingRef.current
    ) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        isScrollingRef.current = true;
        lastSelectedIndexRef.current = selectedIndex;
        
        // Utiliser requestAnimationFrame pour éviter les boucles infinies
        requestAnimationFrame(() => {
          try {
            selectedElement.scrollIntoView({ block: 'nearest', behavior: 'auto' });
          } catch (e) {
            // Ignorer les erreurs de scroll
          }
          // Réinitialiser le flag après un court délai
          setTimeout(() => {
            isScrollingRef.current = false;
          }, 100);
        });
      }
    }
  }, [selectedIndex, results.length]);

  // Réinitialiser l'index quand les résultats changent
  useEffect(() => {
    if (results.length > 0 && selectedIndex >= results.length) {
      setSelectedIndex(0);
      lastSelectedIndexRef.current = -1;
    } else if (results.length === 0) {
      setSelectedIndex(0);
      lastSelectedIndexRef.current = -1;
    }
  }, [query, filter, results.length, selectedIndex]);

  // Statistiques de recherche
  const stats = useMemo(() => {
    const byType = results.reduce((acc, r) => {
      acc[r.type] = (acc[r.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return byType;
  }, [results]);

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
      <div style={{ position: 'relative' }}>
        <input
          ref={inputRef}
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
            padding: '0.75rem 3rem 0.75rem 1rem',
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

      {isOpen && (
        <div
          className="glass-panel"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '0.5rem',
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: 'var(--radius)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            maxHeight: '500px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
          }}
        >
          {/* Filtres */}
          {query.trim() && (
            <div style={{
              padding: '0.75rem',
              borderBottom: '1px solid var(--card-border)',
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap',
            }}>
              <button
                onClick={() => setFilter('all')}
                className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
              >
                Tout ({results.length})
              </button>
              <button
                onClick={() => setFilter('organism')}
                className={`btn ${filter === 'organism' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
              >
                🏢 Organismes ({stats.organism || 0})
              </button>
              <button
                onClick={() => setFilter('transaction')}
                className={`btn ${filter === 'transaction' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
              >
                💰 Transactions ({stats.transaction || 0})
              </button>
              <button
                onClick={() => setFilter('document')}
                className={`btn ${filter === 'document' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
              >
                📄 Documents ({stats.document || 0})
              </button>
            </div>
          )}

          {/* Résultats */}
          <div
            ref={resultsRef}
            style={{
              maxHeight: '400px',
              overflowY: 'auto',
            }}
          >
            {!query.trim() ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--secondary)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
                <p>Tapez pour rechercher...</p>
                <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                  Utilisez les filtres pour affiner votre recherche
                </p>
              </div>
            ) : results.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--secondary)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
                <p>Aucun résultat trouvé pour "{query}"</p>
                <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                  Essayez avec d'autres mots-clés
                </p>
              </div>
            ) : (
              <>
                <div style={{
                  padding: '0.75rem 1rem',
                  borderBottom: '1px solid var(--card-border)',
                  fontSize: '0.85rem',
                  color: 'var(--secondary)',
                  fontWeight: 500,
                  background: 'var(--form-bg)',
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
                      background: index === selectedIndex ? 'var(--form-bg)' : 'transparent',
                      border: 'none',
                      borderBottom: index < results.length - 1 ? '1px solid var(--card-border)' : 'none',
                      cursor: 'pointer',
                      color: 'var(--foreground)',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={() => {
                      if (index !== selectedIndex && !isScrollingRef.current) {
                        setSelectedIndex(index);
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '1.2rem' }}>
                        {result.type === 'organism' && '🏢'}
                        {result.type === 'transaction' && '💰'}
                        {result.type === 'document' && '📄'}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: 500 }}>{result.title}</span>
                          {result.metadata?.isFavorite && (
                            <span style={{ fontSize: '0.9rem' }} title="Favori">⭐</span>
                          )}
                          {result.metadata?.status && (
                            <span style={{
                              fontSize: '0.7rem',
                              padding: '0.1rem 0.4rem',
                              borderRadius: '4px',
                              background: result.metadata.status === 'urgent' ? 'var(--danger)' : 
                                        result.metadata.status === 'warning' ? 'var(--warning)' : 'var(--success)',
                              color: 'white',
                            }}>
                              {result.metadata.status}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>
                          {result.subtitle}
                        </div>
                        {result.metadata?.tags && result.metadata.tags.length > 0 && (
                          <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                            {result.metadata.tags.slice(0, 3).map((tag: string) => (
                              <span key={tag} style={{
                                fontSize: '0.7rem',
                                padding: '0.1rem 0.4rem',
                                borderRadius: '4px',
                                background: 'var(--button-secondary-bg)',
                                color: 'var(--foreground)',
                              }}>
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* Overlay pour fermer la recherche */}
      {isOpen && (
        <div
          onClick={() => {
            setIsOpen(false);
            setQuery('');
            setSelectedIndex(0);
          }}
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

