'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import type { Transaction } from '@/lib/queries';

interface FinancialChartsProps {
  transactions: Transaction[];
}

const COLORS = {
  success: '#10b981',
  danger: '#ef4444',
  primary: '#3b82f6',
  warning: '#f59e0b',
  secondary: '#64748b'
};

export default function FinancialCharts({ transactions }: FinancialChartsProps) {
  // Données pour le graphique en ligne (évolution du solde)
  const balanceData = useMemo(() => {
    if (transactions.length === 0) return [];

    const sorted = [...transactions].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let balance = 0;
    return sorted.map(t => {
      balance += t.amount;
      // Formatage manuel pour éviter les problèmes SSR avec toLocaleDateString
      const date = new Date(t.date);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return {
        date: `${day}/${month}`,
        solde: parseFloat(balance.toFixed(2))
      };
    });
  }, [transactions]);

  // Données pour le graphique en camembert (catégories de dépenses)
  const expenseByCategory = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const categoryMap = new Map<string, number>();

    expenses.forEach(t => {
      const current = categoryMap.get(t.category) || 0;
      categoryMap.set(t.category, current + Math.abs(t.amount));
    });

    return Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Données pour le graphique en barres (revenus vs dépenses)
  const incomeVsExpense = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + Math.abs(t.amount), 0);

    return [
      { name: 'Revenus', montant: parseFloat(income.toFixed(2)) },
      { name: 'Dépenses', montant: parseFloat(expense.toFixed(2)) }
    ];
  }, [transactions]);

  const pieColors = [
    COLORS.primary,
    COLORS.success,
    COLORS.warning,
    COLORS.danger,
    COLORS.secondary,
    '#8b5cf6',
    '#ec4899',
    '#14b8a6'
  ];

  if (transactions.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--secondary)' }}>
        Aucune donnée disponible pour les graphiques.
        <br />
        <span style={{ fontSize: '0.9rem' }}>Ajoutez des transactions pour voir les graphiques.</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: '2rem', marginBottom: '2rem' }}>
      {/* Graphique en ligne - Évolution du solde */}
      {balanceData.length > 0 && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--foreground)' }}>
            📈 Évolution du Solde
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={balanceData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
              <XAxis
                dataKey="date"
                stroke="var(--secondary)"
                style={{ fontSize: '0.75rem' }}
              />
              <YAxis
                stroke="var(--secondary)"
                style={{ fontSize: '0.75rem' }}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--card-border)',
                  borderRadius: 'var(--radius)',
                  color: 'var(--foreground)'
                }}
              />
              <Line
                type="monotone"
                dataKey="solde"
                stroke={COLORS.primary}
                strokeWidth={2}
                name="Solde (€)"
                isAnimationActive={false}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {/* Graphique en camembert - Dépenses par catégorie */}
        {expenseByCategory.length > 0 && (
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--foreground)' }}>
              🥧 Dépenses par Catégorie
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <Pie
                  data={expenseByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  isAnimationActive={false}
                >
                  {expenseByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}-${entry.name}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--card-border)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--foreground)'
                  }}
                  formatter={(value: number) => `${value.toFixed(2)} €`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Graphique en barres - Revenus vs Dépenses */}
        {incomeVsExpense.length > 0 && (
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--foreground)' }}>
              📊 Revenus vs Dépenses
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={incomeVsExpense} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
                <XAxis
                  dataKey="name"
                  stroke="var(--secondary)"
                  style={{ fontSize: '0.75rem' }}
                />
                <YAxis
                  stroke="var(--secondary)"
                  style={{ fontSize: '0.75rem' }}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--card-border)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--foreground)'
                  }}
                  formatter={(value: number) => `${value.toFixed(2)} €`}
                />
                <Bar
                  dataKey="montant"
                  fill={COLORS.primary}
                  radius={[8, 8, 0, 0]}
                  isAnimationActive={false}
                >
                  {incomeVsExpense.map((entry, index) => (
                    <Cell
                      key={`cell-${index}-${entry.name}`}
                      fill={entry.name === 'Revenus' ? COLORS.success : COLORS.danger}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

