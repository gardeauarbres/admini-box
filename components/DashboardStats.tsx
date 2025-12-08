'use client';

import { useMemo } from 'react';
import type { Organism, Transaction } from '@/lib/queries';
import { calculateBalance, calculateIncome, calculateExpense } from '@/lib/utils';

interface DashboardStatsProps {
  organisms: Organism[];
  transactions: Transaction[];
}

export default function DashboardStats({ organisms, transactions }: DashboardStatsProps) {
  const stats = useMemo(() => {
    const urgentCount = organisms.filter(o => o.status === 'urgent').length;
    const warningCount = organisms.filter(o => o.status === 'warning').length;
    const okCount = organisms.filter(o => o.status === 'ok').length;
    
    const totalBalance = calculateBalance(transactions);
    const totalIncome = calculateIncome(transactions);
    const totalExpense = calculateExpense(transactions);
    
    const recentTransactions = transactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return transactionDate >= thirtyDaysAgo;
      })
      .length;

    return {
      organisms: {
        total: organisms.length,
        urgent: urgentCount,
        warning: warningCount,
        ok: okCount,
      },
      finances: {
        balance: totalBalance,
        income: totalIncome,
        expense: totalExpense,
        recentTransactions,
      }
    };
  }, [organisms, transactions]);

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
      gap: '1.5rem', 
      marginBottom: '2rem' 
    }}>
      {/* Statut des organismes */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ color: 'var(--secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
          📊 Organismes
        </h3>
        <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          {stats.organisms.total}
        </div>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--secondary)' }}>
          <span style={{ color: 'var(--danger)' }}>🔴 {stats.organisms.urgent}</span>
          <span style={{ color: 'var(--warning)' }}>🟡 {stats.organisms.warning}</span>
          <span style={{ color: 'var(--success)' }}>🟢 {stats.organisms.ok}</span>
        </div>
      </div>

      {/* Solde financier */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ color: 'var(--secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
          💰 Solde Total
        </h3>
        <div style={{ 
          fontSize: '2rem', 
          fontWeight: 700,
          color: stats.finances.balance >= 0 ? 'var(--success)' : 'var(--danger)'
        }}>
          {stats.finances.balance >= 0 ? '+' : ''}{stats.finances.balance.toFixed(2)} €
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--secondary)', marginTop: '0.5rem' }}>
          {stats.finances.recentTransactions} transaction{stats.finances.recentTransactions > 1 ? 's' : ''} (30j)
        </div>
      </div>

      {/* Revenus */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ color: 'var(--secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
          📈 Revenus
        </h3>
        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>
          +{stats.finances.income.toFixed(2)} €
        </div>
        {transactions.length > 0 && (
          <div style={{ fontSize: '0.85rem', color: 'var(--secondary)', marginTop: '0.5rem' }}>
            Moyenne: {(stats.finances.income / transactions.filter(t => t.type === 'income').length || 0).toFixed(2)} €
          </div>
        )}
      </div>

      {/* Dépenses */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ color: 'var(--secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
          📉 Dépenses
        </h3>
        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--danger)' }}>
          {stats.finances.expense.toFixed(2)} €
        </div>
        {transactions.length > 0 && (
          <div style={{ fontSize: '0.85rem', color: 'var(--secondary)', marginTop: '0.5rem' }}>
            Moyenne: {(stats.finances.expense / transactions.filter(t => t.type === 'expense').length || 0).toFixed(2)} €
          </div>
        )}
      </div>
    </div>
  );
}

