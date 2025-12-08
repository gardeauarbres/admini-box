'use client';

import { useMemo } from 'react';
import { useOrganisms, useTransactions, useDocuments } from '@/lib/queries';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import { formatDate } from '@/lib/utils';

export default function ActivityStats() {
  const { user } = useAuth();
  const { data: organisms = [], isLoading: loadingOrganisms } = useOrganisms(user?.$id || null);
  const { data: transactions = [], isLoading: loadingTransactions } = useTransactions(user?.$id || null);
  const { data: documents = [], isLoading: loadingDocuments } = useDocuments(user?.$id || null);

  const stats = useMemo(() => {
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Organismes
    const totalOrganisms = organisms.length;
    const urgentOrganisms = organisms.filter(o => o.status === 'urgent').length;
    const recentOrganisms = organisms.filter(o => new Date(o.$createdAt || now) > last7Days).length;

    // Transactions
    const totalTransactions = transactions.length;
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const recentTransactions = transactions.filter(t => new Date(t.date) > last7Days).length;

    // Documents
    const totalDocuments = documents.length;
    const recentDocuments = documents.filter(d => new Date(d.date) > last7Days).length;
    const totalSize = documents.reduce((sum, d) => {
      const size = parseFloat(d.size) || 0;
      return sum + size;
    }, 0);

    // Activité récente (30 derniers jours)
    const activity30Days = {
      organisms: organisms.filter(o => new Date(o.$createdAt || now) > last30Days).length,
      transactions: transactions.filter(t => new Date(t.date) > last30Days).length,
      documents: documents.filter(d => new Date(d.date) > last30Days).length,
    };

    return {
      organisms: { total: totalOrganisms, urgent: urgentOrganisms, recent: recentOrganisms },
      transactions: { total: totalTransactions, income: totalIncome, expenses: totalExpenses, recent: recentTransactions },
      documents: { total: totalDocuments, recent: recentDocuments, totalSize },
      activity30Days,
    };
  }, [organisms, transactions, documents]);

  if (loadingOrganisms || loadingTransactions || loadingDocuments) {
    return (
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <LoadingSpinner message="Chargement des statistiques..." />
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: '2rem' }}>
      {/* Statistiques générales */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>📊 Statistiques d'activité</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          {/* Organismes */}
          <div style={{
            padding: '1.5rem',
            borderRadius: 'var(--radius)',
            background: 'var(--form-bg)',
            border: '1px solid var(--card-border)',
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏢</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              {stats.organisms.total}
            </div>
            <div style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>Organismes</div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--secondary)' }}>
              {stats.organisms.urgent} urgent{stats.organisms.urgent > 1 ? 's' : ''}
            </div>
          </div>

          {/* Transactions */}
          <div style={{
            padding: '1.5rem',
            borderRadius: 'var(--radius)',
            background: 'var(--form-bg)',
            border: '1px solid var(--card-border)',
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              {stats.transactions.total}
            </div>
            <div style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>Transactions</div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--secondary)' }}>
              Solde: {(stats.transactions.income - stats.transactions.expenses).toFixed(2)} €
            </div>
          </div>

          {/* Documents */}
          <div style={{
            padding: '1.5rem',
            borderRadius: 'var(--radius)',
            background: 'var(--form-bg)',
            border: '1px solid var(--card-border)',
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📄</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              {stats.documents.total}
            </div>
            <div style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>Documents</div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--secondary)' }}>
              {stats.documents.totalSize.toFixed(2)} KB
            </div>
          </div>
        </div>
      </div>

      {/* Activité récente */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>📈 Activité récente (30 derniers jours)</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
          <div style={{
            padding: '1rem',
            borderRadius: 'var(--radius)',
            background: 'var(--form-bg)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>
              {stats.activity30Days.organisms}
            </div>
            <div style={{ color: 'var(--secondary)', fontSize: '0.85rem' }}>Organismes créés</div>
          </div>
          <div style={{
            padding: '1rem',
            borderRadius: 'var(--radius)',
            background: 'var(--form-bg)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>
              {stats.activity30Days.transactions}
            </div>
            <div style={{ color: 'var(--secondary)', fontSize: '0.85rem' }}>Transactions</div>
          </div>
          <div style={{
            padding: '1rem',
            borderRadius: 'var(--radius)',
            background: 'var(--form-bg)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>
              {stats.activity30Days.documents}
            </div>
            <div style={{ color: 'var(--secondary)', fontSize: '0.85rem' }}>Documents</div>
          </div>
        </div>
      </div>
    </div>
  );
}

