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
  AreaChart,
  Area,
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

  // Neon Colors Palette
  const NEON_COLORS = {
    primary: '#00f3ff', // Cyan
    success: '#00ff41', // Lime
    danger: '#ff0055',  // Neon Red
    warning: '#ffee00', // Yellow
    secondary: '#94a3b8',
    purple: '#bd00ff',
    pink: '#ff00ff'
  };

  if (transactions.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--secondary)' }}>
        Aucune donnée disponible pour les graphiques.
        <br />
        <span style={{ fontSize: '0.9rem' }}>Ajoutez des transactions pour voir les graphiques.</span>
      </div>
    );
  }

  // Custom Tooltip for Neon Theme
  const CustomTooltip = ({ active, payload, label, formatter }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'rgba(10, 10, 15, 0.85)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '1rem',
          boxShadow: '0 0 20px rgba(0,0,0,0.5)',
          color: '#fff'
        }}>
          <p style={{ fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.9rem' }}>{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color || '#fff', fontSize: '0.85rem' }}>
              {formatter ? formatter(entry.value, entry.name) : `${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: 'grid', gap: '2rem', marginBottom: '2rem' }}>
      {/* GLOW FILTERS DEFINITION */}
      <svg style={{ height: 0, width: 0, position: 'absolute' }}>
        <defs>
          <filter id="neonGlowPrimary" height="300%" width="300%" x="-75%" y="-75%">
            <feMorphology operator="dilate" radius="1" in="SourceAlpha" result="thicken" />
            <feGaussianBlur in="thicken" stdDeviation="4" result="blurred" />
            <feFlood floodColor={NEON_COLORS.primary} result="glowColor" />
            <feComposite in="glowColor" in2="blurred" operator="in" result="softGlow_colored" />
            <feMerge>
              <feMergeNode in="softGlow_colored" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="neonGlowSuccess" height="300%" width="300%" x="-75%" y="-75%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blurred" />
            <feFlood floodColor={NEON_COLORS.success} result="glowColor" />
            <feComposite in="glowColor" in2="blurred" operator="in" result="softGlow_colored" />
            <feMerge>
              <feMergeNode in="softGlow_colored" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="neonGlowDanger" height="300%" width="300%" x="-75%" y="-75%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blurred" />
            <feFlood floodColor={NEON_COLORS.danger} result="glowColor" />
            <feComposite in="glowColor" in2="blurred" operator="in" result="softGlow_colored" />
            <feMerge>
              <feMergeNode in="softGlow_colored" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Graphique en ligne - Évolution du solde */}
      {balanceData.length > 0 && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--foreground)', textShadow: `0 0 10px ${NEON_COLORS.primary}40` }}>
            📈 Évolution du Solde
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={balanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSolde" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={NEON_COLORS.primary} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={NEON_COLORS.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="var(--secondary)"
                style={{ fontSize: '0.75rem' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="var(--secondary)"
                style={{ fontSize: '0.75rem' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}€`}
              />
              <Tooltip content={<CustomTooltip formatter={(value: number) => [`${value} €`, 'Solde']} />} />
              <Area
                type="monotone"
                dataKey="solde"
                stroke={NEON_COLORS.primary}
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorSolde)"
                filter="url(#neonGlowPrimary)"
                isAnimationActive={true}
              />
            </AreaChart>
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
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  isAnimationActive={true}
                >
                  {expenseByCategory.map((entry, index) => {
                    const colors = [NEON_COLORS.primary, NEON_COLORS.success, NEON_COLORS.warning, NEON_COLORS.danger, NEON_COLORS.purple, NEON_COLORS.pink];
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Pie>
                <Tooltip content={<CustomTooltip formatter={(value: number) => `${value.toFixed(2)} €`} />} />
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
                <defs>
                  {/* Gradients reuse logic if needed, but solid neon is punchier for bars */}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis width={0} tick={false} axisLine={false} />
                <YAxis
                  stroke="var(--secondary)"
                  style={{ fontSize: '0.75rem' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar dataKey="montant" radius={[8, 8, 8, 8]} isAnimationActive={true}>
                  {incomeVsExpense.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.name === 'Revenus' ? NEON_COLORS.success : NEON_COLORS.danger}
                      filter={entry.name === 'Revenus' ? "url(#neonGlowSuccess)" : "url(#neonGlowDanger)"}
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

