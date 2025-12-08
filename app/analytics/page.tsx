'use client';

import { useAuth } from '@/context/AuthContext';
import { useOrganisms, useTransactions } from '@/lib/queries';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/LoadingSpinner';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { data: organisms = [], isLoading: organismsLoading } = useOrganisms(user?.$id || null);
  const { data: transactions = [], isLoading: transactionsLoading } = useTransactions(user?.$id || null);

  if (organismsLoading || transactionsLoading) {
    return (
      <ProtectedRoute>
        <LoadingSpinner message="Chargement des analytics..." />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div>
        <header style={{ marginBottom: '2rem' }}>
          <h1 className="section-title">📊 Analytics & Rapports</h1>
          <p style={{ color: 'var(--secondary)' }}>
            Analysez vos données et visualisez les tendances
          </p>
        </header>

        {organisms.length > 0 || transactions.length > 0 ? (
          <AnalyticsDashboard organisms={organisms} transactions={transactions} />
        ) : (
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--secondary)' }}>
              Aucune donnée disponible pour les analytics. Ajoutez des organismes et des transactions pour voir les statistiques.
            </p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

