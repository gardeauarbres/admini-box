'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ConfettiCelebration from '@/components/ConfettiCelebration';
import OrganismCard from '@/components/OrganismCard';
import OrganismForm from '@/components/OrganismForm';
import OrganismTemplates from '@/components/OrganismTemplates';
import Pagination from '@/components/Pagination';
import SkeletonLoader from '@/components/SkeletonLoader';
import DashboardWidgets from '@/components/DashboardWidgets';
import FilterPresets from '@/components/FilterPresets';
import NotificationBell from '@/components/NotificationBell';
import { exportOrganismsToCSV } from '@/lib/export';
import { useAuth } from '@/context/AuthContext';
import { useTransactions } from '@/lib/queries';
import { useToast } from '@/context/ToastContext';
import {
  useOrganisms,
  useCreateOrganism,
  useUpdateOrganism,
  useDeleteOrganism
} from '@/lib/queries';
import { databases } from '@/lib/appwrite';
import { ID, Permission, Role } from 'appwrite';
import type { OrganismFormData } from '@/lib/validations';

export default function Home() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ok' | 'warning' | 'urgent'>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // React Query hooks
  const { data: organisms = [], isLoading, refetch } = useOrganisms(user?.$id || null);
  const { data: transactions = [] } = useTransactions(user?.$id || null);
  const createMutation = useCreateOrganism();
  const updateMutation = useUpdateOrganism();
  const deleteMutation = useDeleteOrganism();

  // Initialize demo data if needed
  useEffect(() => {
    const initializeDemoData = async (userId: string) => {
      const demoOrganisms = [
        { name: 'CAF', status: 'urgent' as const, message: 'Déclaration trimestrielle en retard', url: 'https://www.caf.fr' },
        { name: 'CPAM', status: 'warning' as const, message: 'Mise à jour de vos coordonnées requise', url: 'https://www.ameli.fr' },
        { name: 'AMELI', status: 'ok' as const, message: 'Tout est à jour', url: 'https://www.ameli.fr' },
        { name: 'URSSAF', status: 'warning' as const, message: 'Déclaration mensuelle à venir', url: 'https://www.urssaf.fr' },
        { name: 'Impôts', status: 'ok' as const, message: 'Tout est à jour', url: 'https://www.impots.gouv.fr' },
        { name: 'Pôle Emploi', status: 'ok' as const, message: 'Aucune action requise', url: 'https://www.pole-emploi.fr' },
      ];

      for (const org of demoOrganisms) {
        try {
          await databases.createDocument(
            'adminibox_db',
            'organisms',
            ID.unique(),
            {
              name: org.name,
              status: org.status,
              message: org.message,
              url: org.url,
              userId: userId
            },
            [
              Permission.read(Role.user(userId)),
              Permission.write(Role.user(userId)),
              Permission.update(Role.user(userId)),
              Permission.delete(Role.user(userId)),
            ]
          );
        } catch (error) {
          console.error(`Failed to create organism ${org.name}:`, error);
        }
      }
    };

    if (user && organisms.length === 0 && !isLoading) {
      initializeDemoData(user.$id).then(() => {
        refetch();
      });
    }
  }, [user, organisms.length, isLoading, refetch]);

  // Optimisation avec useMemo
  const urgentCount = useMemo(
    () => organisms.filter(o => o.status === 'urgent').length,
    [organisms]
  );

  // Filtrage et recherche optimisé
  const filteredOrganisms = useMemo(() => {
    const lowerSearch = searchQuery.toLowerCase();
    return organisms.filter(org => {
      const matchesSearch = searchQuery === '' ||
        org.name.toLowerCase().includes(lowerSearch) ||
        org.message?.toLowerCase().includes(lowerSearch) ||
        org.tags?.some(tag => tag.toLowerCase().includes(lowerSearch));
      const matchesStatus = statusFilter === 'all' || org.status === statusFilter;
      const matchesTag = tagFilter === 'all' || org.tags?.includes(tagFilter);
      const matchesFavorites = !favoritesOnly || org.isFavorite === true;
      return matchesSearch && matchesStatus && matchesTag && matchesFavorites;
    });
  }, [organisms, searchQuery, statusFilter, tagFilter, favoritesOnly]);

  // Tous les tags disponibles
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    organisms.forEach(org => {
      org.tags?.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  }, [organisms]);

  // Pagination optimisée
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(filteredOrganisms.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedOrganisms = filteredOrganisms.slice(startIndex, endIndex);
    return { totalPages, paginatedOrganisms };
  }, [filteredOrganisms, currentPage, itemsPerPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // Optimisation avec useCallback
  const handleUpdateOrganism = useCallback(async (organismId: string, updates: {
    name?: string;
    url?: string;
    status?: string;
    message?: string;
    tags?: string[];
    isFavorite?: boolean;
    reminderDate?: string;
    reminderMessage?: string;
    notes?: string;
    attachments?: string;
    events?: string;
  }) => {
    if (!user) return;

    // Filtrer les valeurs undefined/null pour éviter les erreurs Appwrite
    const cleanUpdates: any = {};
    Object.keys(updates).forEach(key => {
      const value = (updates as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        cleanUpdates[key] = value;
      }
    });

    // Vérifier qu'il y a au moins une donnée à mettre à jour
    if (Object.keys(cleanUpdates).length === 0) {
      console.warn('No valid data to update for organism', organismId);
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: organismId,
        userId: user.$id,
        updates: cleanUpdates
      });

      showToast('Organisme mis à jour avec succès', 'success');
    } catch (error) {
      console.error('Failed to update organism:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la mise à jour';
      showToast(errorMessage, 'error');
    }
  }, [user, updateMutation, showToast, organisms]);

  const handleDeleteOrganism = useCallback(async (organismId: string) => {
    if (!user) return;
    try {
      await deleteMutation.mutateAsync({
        id: organismId,
        userId: user.$id
      });
      showToast('Organisme supprimé avec succès', 'success');
    } catch (error) {
      console.error('Failed to delete organism:', error);
      showToast('Erreur lors de la suppression', 'error');
    }
  }, [user, deleteMutation, showToast]);

  const handleExport = useCallback(() => {
    exportOrganismsToCSV(organisms);
    showToast('Export CSV réussi', 'success');
  }, [organisms, showToast]);

  const handleAddOrganism = async (data: any) => {
    if (!user) return;

    try {
      await createMutation.mutateAsync({
        userId: user.$id,
        data: {
          name: data.name,
          status: data.status || 'ok',
          message: data.message || '',
          url: data.url || '',
          tags: data.tags || [],
        }
      });

      setShowAddForm(false);
      setShowTemplates(false);
      showToast('Organisme ajouté avec succès', 'success');
    } catch (error) {
      console.error('Failed to add organism:', error);
      showToast('Erreur lors de l\'ajout de l\'organisme', 'error');
      throw error; // Re-throw pour que le formulaire puisse gérer l'erreur
    }
  };

  const handleMarkAllAsDone = async () => {
    if (!user || !organisms.length) return;

    const urgentOrWarning = organisms.filter(org => org.status === 'urgent' || org.status === 'warning');
    if (urgentOrWarning.length === 0) {
      showToast('Aucune tâche urgente ou en attention à traiter.', 'info');
      return;
    }

    if (!confirm(`Marquer ${urgentOrWarning.length} organismes comme "OK" ?`)) {
      return;
    }

    try {
      await Promise.all(urgentOrWarning.map(org =>
        updateMutation.mutateAsync({
          id: org.$id,
          userId: user.$id,
          updates: { status: 'ok', message: 'Tout est à jour' }
        })
      ));
      showToast('Toutes les tâches ont été marquées comme traitées ! 🎉', 'success');
    } catch (error) {
      console.error('Batch update failed:', error);
      showToast('Erreur lors de la mise à jour massive.', 'error');
    }
  };

  const handleClearCompleted = async () => {
    if (!user || !organisms.length) return;

    const completed = organisms.filter(org => org.status === 'ok');
    if (completed.length === 0) {
      showToast('Aucun organisme "OK" à supprimer.', 'info');
      return;
    }

    if (!confirm(`ATTENTION : Supprimer définitivement ${completed.length} organismes marqués "OK" ?`)) {
      return;
    }

    try {
      await Promise.all(completed.map(org =>
        deleteMutation.mutateAsync({
          id: org.$id,
          userId: user.$id
        })
      ));
      showToast(`${completed.length} organismes supprimés.`, 'success');
    } catch (error) {
      console.error('Batch delete failed:', error);
      showToast('Erreur lors de la suppression massive.', 'error');
    }
  };


  if (isLoading) {
    return (
      <div>
        <header style={{ marginBottom: '3rem' }}>
          <div style={{ height: '40px', width: '300px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', marginBottom: '0.5rem' }} />
          <div style={{ height: '20px', width: '200px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} />
        </header>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ height: '200px', background: 'rgba(255,255,255,0.05)', borderRadius: '1rem' }} />
        </div>
        <SkeletonLoader />
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ textAlign: 'center', marginTop: '4rem' }}>
        <h1 className="section-title">Bienvenue sur AdminiBox</h1>
        <p style={{ marginBottom: '2rem', color: 'var(--secondary)' }}>
          Connectez-vous pour accéder à votre tableau de bord.
        </p>
        <a href="/login" className="btn btn-primary">Se connecter</a>
      </div>
    );
  }

  return (
    <div>
      <header style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <NotificationBell />
          <a
            href="https://www.gardeauarbres.fr/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2px solid var(--primary)',
              transition: 'transform 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            title="Visiter Gard Eau Arbres"
          >
            <img
              src="https://www.gardeauarbres.fr/assets/images/logo_gard_eau_arbres_fini200x200.png"
              alt="Gard Eau Arbres"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </a>
          <h1 className="section-title" style={{ margin: 0, flex: 1 }}>Tableau de Bord Unifié</h1>
        </div>
        <p style={{ color: 'var(--secondary)' }}>
          Bienvenue sur votre Hub des Organismes Administratifs (HOA).
          <br />
          {urgentCount > 0 ? (
            <>Vous avez <strong style={{ color: 'var(--danger)' }}>{urgentCount} action{urgentCount > 1 ? 's' : ''} urgente{urgentCount > 1 ? 's' : ''}</strong> à traiter.</>
          ) : (
            <>Tout est à jour.</>
          )}
        </p>
      </header>

      {/* Widgets personnalisables */}
      <DashboardWidgets organisms={organisms} transactions={transactions} />

      {/* Confetti quand 0 urgence */}
      <ConfettiCelebration urgentCount={urgentCount} />

      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.2rem', opacity: 0.8 }}>Vos Organismes</h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {organisms.length > 0 && (
              <>
                <button
                  onClick={handleMarkAllAsDone}
                  className="btn btn-primary"
                  style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--success)', borderColor: 'var(--success)' }}
                  title="Marquer tous les urgents/warnings comme OK"
                >
                  ✅ Tout valider
                </button>
                <button
                  onClick={handleClearCompleted}
                  className="btn btn-secondary"
                  style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                  title="Supprimer tous les organismes OK"
                >
                  🗑️ Nettoyer terminés
                </button>
                <button
                  onClick={handleExport}
                  className="btn btn-secondary"
                  style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  title="Exporter les organismes en CSV (Ctrl+E)"
                  data-export-button
                  aria-label="Exporter les organismes en CSV"
                >
                  📥 Exporter CSV
                </button>
              </>
            )}
            <button
              onClick={() => {
                setShowTemplates(!showTemplates);
                setShowAddForm(false);
              }}
              className="btn btn-secondary"
              style={{ padding: '0.5rem 1rem' }}
              data-templates-button
              aria-label="Ouvrir les templates d'organismes"
            >
              {showTemplates ? 'Annuler' : '📋 Templates'}
            </button>
            <button
              onClick={() => {
                setShowAddForm(!showAddForm);
                setShowTemplates(false);
              }}
              className="btn btn-primary"
              style={{ padding: '0.5rem 1rem' }}
              data-add-organism
              aria-label="Ajouter un nouvel organisme"
            >
              {showAddForm ? 'Annuler' : '+ Ajouter un organisme'}
            </button>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        {organisms.length > 0 && (
          <>
            {/* Filtres sauvegardés */}
            <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1rem' }}>
              <FilterPresets
                currentFilters={{
                  status: statusFilter,
                  tag: tagFilter,
                  favoritesOnly,
                  searchQuery,
                }}
                onApplyPreset={(filters) => {
                  setStatusFilter(filters.status || 'all');
                  setTagFilter(filters.tag || 'all');
                  setFavoritesOnly(filters.favoritesOnly || false);
                  setSearchQuery(filters.searchQuery || '');
                }}
              />
            </div>
            <div style={{
              display: 'flex',
              gap: '1rem',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              alignItems: 'center'
            }}>
              <input
                type="text"
                placeholder="🔍 Rechercher un organisme..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: '200px',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius)',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  color: 'var(--foreground)',
                  fontSize: '0.9rem'
                }}
              />
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  onClick={() => setFavoritesOnly(!favoritesOnly)}
                  className={`btn ${favoritesOnly ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                  title="Afficher uniquement les favoris"
                >
                  ⭐ {favoritesOnly ? 'Favoris' : 'Tous'}
                </button>
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`btn ${statusFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                >
                  Tous
                </button>
                <button
                  onClick={() => setStatusFilter('ok')}
                  className={`btn ${statusFilter === 'ok' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                >
                  OK
                </button>
                <button
                  onClick={() => setStatusFilter('warning')}
                  className={`btn ${statusFilter === 'warning' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                >
                  Attention
                </button>
                <button
                  onClick={() => setStatusFilter('urgent')}
                  className={`btn ${statusFilter === 'urgent' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                >
                  Urgent
                </button>
                {allTags.length > 0 && (
                  <select
                    value={tagFilter}
                    onChange={(e) => setTagFilter(e.target.value)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: 'var(--radius)',
                      background: 'var(--input-bg)',
                      border: '1px solid var(--input-border)',
                      color: 'var(--foreground)',
                      fontSize: '0.85rem',
                    }}
                  >
                    <option value="all">Tous les tags</option>
                    {allTags.map(tag => (
                      <option key={tag} value={tag}>#{tag}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </>
        )}

        {showTemplates && (
          <OrganismTemplates
            onSelectTemplate={(template) => {
              handleAddOrganism({
                name: template.name,
                url: template.url,
                status: 'ok',
                message: template.message,
                tags: template.tags,
              });
              setShowTemplates(false);
            }}
          />
        )}

        {showAddForm && (
          <OrganismForm
            onSubmit={handleAddOrganism}
            onCancel={() => setShowAddForm(false)}
            isSubmitting={createMutation.isPending}
          />
        )}

        {organisms.length === 0 ? (
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--secondary)' }}>
            Aucun organisme configuré.
          </div>
        ) : filteredOrganisms.length === 0 ? (
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--secondary)' }}>
            Aucun organisme ne correspond à votre recherche.
          </div>
        ) : (
          <>
            <motion.div
              layout
              className="grid-dashboard"
            >
              <AnimatePresence mode="popLayout">
                {paginationData.paginatedOrganisms.map((org) => (
                  <OrganismCard
                    key={org.$id}
                    name={org.name}
                    status={org.status}
                    message={org.message}
                    icon="🏛️"
                    url={org.url}
                    tags={org.tags}
                    isFavorite={org.isFavorite}
                    reminderDate={org.reminderDate}
                    reminderMessage={org.reminderMessage}
                    notes={org.notes}
                    attachments={org.attachments}
                    events={org.events}
                    organismId={org.$id}
                    onUpdate={(updates) => handleUpdateOrganism(org.$id, updates)}
                    onDelete={() => handleDeleteOrganism(org.$id)}
                    onToggleFavorite={() => handleUpdateOrganism(org.$id, { isFavorite: !org.isFavorite })}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
            {(searchQuery || statusFilter !== 'all' || tagFilter !== 'all' || favoritesOnly) && (
              <div style={{ marginTop: '1rem', textAlign: 'center', color: 'var(--secondary)', fontSize: '0.9rem' }}>
                {filteredOrganisms.length} organisme{filteredOrganisms.length > 1 ? 's' : ''} trouvé{filteredOrganisms.length > 1 ? 's' : ''} sur {organisms.length}
              </div>
            )}
            {paginationData.totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={paginationData.totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={filteredOrganisms.length}
              />
            )}
          </>
        )}
      </section>
    </div >
  );
}
