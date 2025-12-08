'use client';

import React, { useState, useCallback } from 'react';
import FinanceTable from '@/components/FinanceTable';
import FinancialCharts from '@/components/FinancialCharts';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useTransactions } from '@/lib/queries';
import { useAuth } from '@/context/AuthContext';

export default function FinancePage() {
    const { user } = useAuth();
    const { data: transactions = [] } = useTransactions(user?.$id || null);
    const [stats, setStats] = useState({ income: 0, expense: 0 });

    // Utiliser useCallback pour éviter les re-renders infinis
    const handleStatsUpdate = useCallback((newStats: { income: number; expense: number }) => {
        setStats(newStats);
    }, []);

    return (
        <ProtectedRoute>
            <div>
                <header style={{ marginBottom: '3rem' }}>
                    <h1 className="section-title">Comptabilité & Suivi Financier (CSF)</h1>
                    <p style={{ color: 'var(--secondary)' }}>
                        Suivez vos finances et liez vos justificatifs en un clin d'œil.
                    </p>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <h3 style={{ color: 'var(--secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Revenus (Total)</h3>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>
                            +{stats.income.toFixed(2)} €
                        </div>
                    </div>
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <h3 style={{ color: 'var(--secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Dépenses (Total)</h3>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--danger)' }}>
                            {stats.expense.toFixed(2)} €
                        </div>
                    </div>
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <h3 style={{ color: 'var(--secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Solde</h3>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: (stats.income + stats.expense) >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                            {(stats.income + stats.expense).toFixed(2)} €
                        </div>
                    </div>
                </div>

                {/* Graphiques financiers */}
                <FinancialCharts transactions={transactions} />

                {/* Table des transactions */}
                <FinanceTable onStatsUpdate={handleStatsUpdate} />
            </div>
        </ProtectedRoute>
    );
}
