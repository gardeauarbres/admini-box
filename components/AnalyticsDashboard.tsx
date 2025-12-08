'use client';

import { useMemo } from 'react';
import { Organism, Transaction } from '@/lib/queries';
import { formatCurrency } from '@/lib/utils';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AnalyticsDashboardProps {
  organisms: Organism[];
  transactions: Transaction[];
}

const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'];

export default function AnalyticsDashboard({ organisms, transactions }: AnalyticsDashboardProps) {
  // Mémoriser les données brutes pour éviter les recalculs et les références instables
  // Utiliser une clé de dépendance basée sur la longueur et les IDs pour éviter les re-renders inutiles
  const organismsKey = useMemo(() =>
    organisms.map(o => o.$id).join(','),
    [organisms]
  );
  const transactionsKey = useMemo(() =>
    transactions.map(t => t.$id).join(','),
    [transactions]
  );

  const organismsData = useMemo(() => organisms, [organismsKey]);
  const transactionsData = useMemo(() => transactions, [transactionsKey]);

  const analytics = useMemo(() => {
    // Statistiques des organismes par statut
    const organismsByStatus = organismsData.reduce((acc, org) => {
      acc[org.status] = (acc[org.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Transactions par mois (12 derniers mois)
    const transactionsByMonth = transactionsData.reduce((acc, t) => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!acc[monthKey]) {
        acc[monthKey] = { income: 0, expense: 0, month: monthKey };
      }
      if (t.type === 'income') {
        acc[monthKey].income += t.amount;
      } else {
        acc[monthKey].expense += Math.abs(t.amount);
      }
      return acc;
    }, {} as Record<string, { income: number; expense: number; month: string }>);

    // Trier et formater les données mensuelles
    const monthlyData = Object.values(transactionsByMonth)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12)
      .map(item => {
        try {
          const date = new Date(item.month + '-01');
          if (isNaN(date.getTime())) {
            return {
              ...item,
              month: item.month,
              balance: item.income - item.expense,
            };
          }
          // Utiliser une méthode compatible SSR
          const monthNames = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
          const month = monthNames[date.getMonth()];
          const year = date.getFullYear();
          return {
            ...item,
            month: `${month} ${year}`,
            balance: item.income - item.expense,
          };
        } catch (error) {
          return {
            ...item,
            month: item.month,
            balance: item.income - item.expense,
          };
        }
      });

    // Transactions par catégorie
    const transactionsByCategory = transactionsData
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
        return acc;
      }, {} as Record<string, number>);

    const categoryData = Object.entries(transactionsByCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    // Évolution des organismes par statut (30 derniers jours)
    const organismsEvolution = organismsData.reduce((acc, org) => {
      try {
        const createdAt = org.$createdAt || new Date().toISOString();
        const createdDate = new Date(createdAt);
        if (isNaN(createdDate.getTime())) return acc;
        const daysAgo = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysAgo <= 30 && daysAgo >= 0) {
          const week = Math.floor(daysAgo / 7);
          if (!acc[week]) {
            acc[week] = { ok: 0, warning: 0, urgent: 0, week: `Semaine ${4 - week}` };
          }
          if (org.status && acc[week][org.status] !== undefined) {
            acc[week][org.status]++;
          }
        }
      } catch (error) {
        // Ignorer les erreurs de date
      }
      return acc;
    }, {} as Record<number, { ok: number; warning: number; urgent: number; week: string }>);

    const evolutionData = Object.values(organismsEvolution)
      .sort((a, b) => a.week.localeCompare(b.week));

    // Tags les plus utilisés
    const tagsUsage = organismsData.reduce((acc, org) => {
      org.tags?.forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const topTags = Object.entries(tagsUsage)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Organismes avec rappels
    const organismsWithReminders = organismsData.filter(o => o.reminderDate).length;
    const overdueReminders = organismsData.filter(o => {
      if (!o.reminderDate) return false;
      try {
        const reminderDate = new Date(o.reminderDate);
        if (isNaN(reminderDate.getTime())) return false;
        return reminderDate < new Date();
      } catch (error) {
        return false;
      }
    }).length;

    return {
      organismsByStatus: [
        { name: 'OK', value: organismsByStatus.ok || 0, color: '#10b981' },
        { name: 'Attention', value: organismsByStatus.warning || 0, color: '#f59e0b' },
        { name: 'Urgent', value: organismsByStatus.urgent || 0, color: '#ef4444' },
      ],
      monthlyData,
      categoryData,
      evolutionData,
      topTags,
      organismsWithReminders,
      overdueReminders,
    };
  }, [organismsData, transactionsData]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 600 }}>
          📊 Tableau de bord Analytics
        </h2>
        <p style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>
          Analyse approfondie de vos données et tendances
        </p>
      </header>

      {/* Cartes de résumé */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--secondary)', marginBottom: '0.5rem' }}>
            Organismes avec rappels
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>
            {analytics.organismsWithReminders}
          </div>
          {analytics.overdueReminders > 0 && (
            <div style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '0.25rem' }}>
              {analytics.overdueReminders} en retard
            </div>
          )}
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--secondary)', marginBottom: '0.5rem' }}>
            Tags populaires
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>
            {analytics.topTags.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginTop: '0.25rem' }}>
            {analytics.topTags[0]?.name || 'Aucun'}
          </div>
        </div>
      </div>

      {/* Graphique : Organismes par statut */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: 600 }}>
          Répartition des organismes par statut
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <Pie
              data={analytics.organismsByStatus}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              isAnimationActive={false}
            >
              {analytics.organismsByStatus.map((entry, index) => (
                <Cell key={`cell-${index}-${entry.name}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Graphique : Évolution financière */}
      {analytics.monthlyData.length > 0 && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: 600 }}>
            Évolution financière (12 derniers mois)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.monthlyData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
              <XAxis dataKey="month" stroke="var(--secondary)" />
              <YAxis stroke="var(--secondary)" />
              <Tooltip
                contentStyle={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--card-border)',
                  borderRadius: 'var(--radius)'
                }}
              />
              {/* Legend désactivé temporairement pour éviter les boucles infinies */}
              {/* <Legend wrapperStyle={{ paddingTop: '20px' }} iconSize={12} /> */}
              <Line
                type="monotone"
                dataKey="income"
                stroke="#10b981"
                strokeWidth={2}
                name="Revenus"
                isAnimationActive={false}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="expense"
                stroke="#ef4444"
                strokeWidth={2}
                name="Dépenses"
                isAnimationActive={false}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Solde"
                strokeDasharray="5 5"
                isAnimationActive={false}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Graphique : Dépenses par catégorie */}
      {analytics.categoryData.length > 0 && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: 600 }}>
            Dépenses par catégorie
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.categoryData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
              <XAxis dataKey="name" stroke="var(--secondary)" />
              <YAxis stroke="var(--secondary)" />
              <Tooltip
                contentStyle={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--card-border)',
                  borderRadius: 'var(--radius)'
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Bar dataKey="value" fill="#3b82f6" name="Montant" isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tags les plus utilisés */}
      {analytics.topTags.length > 0 && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: 600 }}>
            Tags les plus utilisés
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {analytics.topTags.map((tag, index) => (
              <div key={tag.name} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '2rem',
                  height: '2rem',
                  borderRadius: '50%',
                  background: COLORS[index % COLORS.length],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.9rem'
                }}>
                  {index + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>
                    #{tag.name}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>
                    Utilisé {tag.value} fois
                  </div>
                </div>
                <div style={{
                  width: '100px',
                  height: '8px',
                  background: 'var(--card-bg)',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div
                    style={{
                      height: '100%',
                      background: COLORS[index % COLORS.length],
                      width: `${(tag.value / analytics.topTags[0].value) * 100}%`,
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

