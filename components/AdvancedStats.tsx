'use client';

import { useMemo } from 'react';
import { Organism, Transaction } from '@/lib/queries';
import { formatCurrency } from '@/lib/utils';

interface AdvancedStatsProps {
  organisms: Organism[];
  transactions: Transaction[];
}

export default function AdvancedStats({ organisms, transactions }: AdvancedStatsProps) {
  const stats = useMemo(() => {
    // Statistiques des organismes
    const totalOrganisms = organisms.length;
    const urgentOrganisms = organisms.filter(o => o.status === 'urgent').length;
    const warningOrganisms = organisms.filter(o => o.status === 'warning').length;
    const favoriteOrganisms = organisms.filter(o => o.isFavorite).length;
    const organismsWithReminders = organisms.filter(o => o.reminderDate).length;

    // Statistiques financières
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = totalIncome - totalExpenses;

    // Transactions par catégorie
    const expensesByCategory = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const topExpenseCategory = Object.entries(expensesByCategory)
      .sort(([, a], [, b]) => b - a)[0];

    // Transactions par mois
    const transactionsByMonth = transactions.reduce((acc, t) => {
      const month = new Date(t.date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostActiveMonth = Object.entries(transactionsByMonth)
      .sort(([, a], [, b]) => b - a)[0];

    // Tags les plus utilisés
    const tagCounts = organisms.reduce((acc, org) => {
      org.tags?.forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const topTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return {
      organisms: {
        total: totalOrganisms,
        urgent: urgentOrganisms,
        warning: warningOrganisms,
        favorites: favoriteOrganisms,
        withReminders: organismsWithReminders,
        topTags,
      },
      finance: {
        totalIncome,
        totalExpenses,
        balance,
        topExpenseCategory: topExpenseCategory ? [topExpenseCategory[0], topExpenseCategory[1]] : null,
        mostActiveMonth: mostActiveMonth ? [mostActiveMonth[0], mostActiveMonth[1]] : null,
      },
    };
  }, [organisms, transactions]);

  return (
    <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 600 }}>
        📊 Statistiques avancées
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        {/* Organismes */}
        <div style={{ padding: '1.5rem', background: 'var(--form-bg)', borderRadius: 'var(--radius)', border: '1px solid var(--card-border)' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 600, color: 'var(--primary)' }}>
            🏛️ Organismes
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--secondary)' }}>Total:</span>
              <span style={{ fontWeight: 600 }}>{stats.organisms.total}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--secondary)' }}>Urgents:</span>
              <span style={{ fontWeight: 600, color: 'var(--danger)' }}>{stats.organisms.urgent}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--secondary)' }}>Attention:</span>
              <span style={{ fontWeight: 600, color: 'var(--warning)' }}>{stats.organisms.warning}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--secondary)' }}>Favoris:</span>
              <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{stats.organisms.favorites}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--secondary)' }}>Avec rappels:</span>
              <span style={{ fontWeight: 600 }}>{stats.organisms.withReminders}</span>
            </div>
          </div>
        </div>

        {/* Finances */}
        <div style={{ padding: '1.5rem', background: 'var(--form-bg)', borderRadius: 'var(--radius)', border: '1px solid var(--card-border)' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 600, color: 'var(--primary)' }}>
            💰 Finances
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--secondary)' }}>Revenus:</span>
              <span style={{ fontWeight: 600, color: 'var(--success)' }}>{formatCurrency(stats.finance.totalIncome)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--secondary)' }}>Dépenses:</span>
              <span style={{ fontWeight: 600, color: 'var(--danger)' }}>{formatCurrency(stats.finance.totalExpenses)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid var(--card-border)' }}>
              <span style={{ color: 'var(--secondary)' }}>Solde:</span>
              <span style={{ fontWeight: 600, color: stats.finance.balance >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                {formatCurrency(stats.finance.balance)}
              </span>
            </div>
            {stats.finance.topExpenseCategory && (
              <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--card-border)', fontSize: '0.9rem' }}>
                <div style={{ color: 'var(--secondary)' }}>Catégorie principale:</div>
                <div style={{ fontWeight: 600 }}>{stats.finance.topExpenseCategory[0]}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>
                  {formatCurrency(stats.finance.topExpenseCategory[1] as number)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tags populaires */}
        <div style={{ padding: '1.5rem', background: 'var(--form-bg)', borderRadius: 'var(--radius)', border: '1px solid var(--card-border)' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 600, color: 'var(--primary)' }}>
            🏷️ Tags populaires
          </h3>
          {stats.organisms.topTags.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {stats.organisms.topTags.map(([tag, count]) => (
                <div key={tag} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ 
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    background: 'var(--card-bg)',
                    border: '1px solid var(--card-border)',
                    fontSize: '0.85rem',
                  }}>
                    #{tag}
                  </span>
                  <span style={{ fontWeight: 600, color: 'var(--secondary)' }}>{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>Aucun tag utilisé</div>
          )}
        </div>

        {/* Activité */}
        {stats.finance.mostActiveMonth && (
          <div style={{ padding: '1.5rem', background: 'var(--form-bg)', borderRadius: 'var(--radius)', border: '1px solid var(--card-border)' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 600, color: 'var(--primary)' }}>
              📅 Activité
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>Mois le plus actif:</div>
              <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{stats.finance.mostActiveMonth[0]}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>
                {stats.finance.mostActiveMonth[1]} transaction{stats.finance.mostActiveMonth[1] !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

