'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { 
  useTransactions, 
  useCreateTransaction, 
  useDeleteTransaction 
} from '@/lib/queries';
import TransactionForm from './TransactionForm';
import Pagination from './Pagination';
import LoadingSpinner from './LoadingSpinner';
import { calculateBalance, calculateIncome, calculateExpense } from '@/lib/utils';
import { exportTransactionsToCSV } from '@/lib/export';
import type { TransactionFormData } from '@/lib/validations';

const FinanceTable: React.FC<{ onStatsUpdate?: (stats: { income: number; expense: number }) => void }> = ({ onStatsUpdate }) => {
    const { user } = useAuth();
    const { showToast } = useToast();
    
    // Form state
    const [showForm, setShowForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('Tous');
    const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // React Query hooks
    const { data: transactions = [], isLoading } = useTransactions(user?.$id || null);
    const createMutation = useCreateTransaction();
    const deleteMutation = useDeleteTransaction();

    // Calcul des stats optimisé avec useMemo
    const stats = useMemo(() => {
        if (transactions.length === 0) return { income: 0, expense: 0 };
        return {
            income: calculateIncome(transactions),
            expense: calculateExpense(transactions)
        };
    }, [transactions]);

    // Mise à jour des stats avec useRef pour éviter les boucles infinies
    const onStatsUpdateRef = useRef(onStatsUpdate);
    useEffect(() => {
        onStatsUpdateRef.current = onStatsUpdate;
    }, [onStatsUpdate]);

    useEffect(() => {
        if (onStatsUpdateRef.current) {
            onStatsUpdateRef.current(stats);
        }
    }, [stats]);

    // Filtrage et recherche optimisé
    const filteredTransactions = useMemo(() => {
        const lowerSearch = searchQuery.toLowerCase();
        return transactions.filter(t => {
            const matchesSearch = searchQuery === '' || 
                t.label.toLowerCase().includes(lowerSearch) ||
                t.category.toLowerCase().includes(lowerSearch);
            const matchesCategory = categoryFilter === 'Tous' || t.category === categoryFilter;
            const matchesType = typeFilter === 'all' || t.type === typeFilter;
            return matchesSearch && matchesCategory && matchesType;
        });
    }, [transactions, searchQuery, categoryFilter, typeFilter]);

    // Pagination optimisée
    const paginationData = useMemo(() => {
        const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);
        return { totalPages, paginatedTransactions };
    }, [filteredTransactions, currentPage, itemsPerPage]);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, categoryFilter, typeFilter]);

    const categories = ['Tous', ...Array.from(new Set(transactions.map(t => t.category)))];

    const handleAddTransaction = async (data: TransactionFormData) => {
        if (!user) return;

        try {
            await createMutation.mutateAsync({
                userId: user.$id,
                data
            });

            setShowForm(false);
            showToast('Transaction ajoutée avec succès', 'success');
        } catch (error) {
            console.error('Error adding transaction:', error);
            showToast('Erreur lors de l\'ajout', 'error');
            throw error;
        }
    };

    const handleDelete = useCallback(async (id: string) => {
        if (!confirm('Supprimer cette transaction ?') || !user) return;
        try {
            await deleteMutation.mutateAsync({ id, userId: user.$id });
            showToast('Transaction supprimée avec succès', 'success');
        } catch (error) {
            console.error('Error deleting transaction:', error);
            showToast('Erreur lors de la suppression', 'error');
        }
    }, [user, deleteMutation, showToast]);

    const totalBalance = useMemo(() => calculateBalance(transactions), [transactions]);

    if (isLoading) return <LoadingSpinner message="Chargement des transactions..." />;

    return (
        <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Transactions Récentes</h3>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--secondary)' }}>Solde Actuel</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: totalBalance >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                        {totalBalance.toFixed(2)} €
                    </div>
                </div>
            </div>

            {/* Barre de recherche et filtres */}
            {transactions.length > 0 && (
                <div style={{ 
                    display: 'flex', 
                    gap: '1rem', 
                    marginBottom: '1.5rem', 
                    flexWrap: 'wrap',
                    alignItems: 'center'
                }}>
                    <input
                        type="text"
                        placeholder="🔍 Rechercher une transaction..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            flex: 1,
                            minWidth: '200px',
                            padding: '0.75rem',
                            borderRadius: 'var(--radius)',
                            background: 'var(--form-bg)',
                            border: '1px solid var(--card-border)',
                            color: 'var(--foreground)',
                            fontSize: '0.9rem'
                        }}
                    />
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        style={{
                            padding: '0.75rem',
                            borderRadius: 'var(--radius)',
                            background: 'var(--form-bg)',
                            border: '1px solid var(--card-border)',
                            color: 'var(--foreground)',
                            fontSize: '0.9rem'
                        }}
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value as 'all' | 'income' | 'expense')}
                        style={{
                            padding: '0.75rem',
                            borderRadius: 'var(--radius)',
                            background: 'var(--form-bg)',
                            border: '1px solid var(--card-border)',
                            color: 'var(--foreground)',
                            fontSize: '0.9rem'
                        }}
                    >
                        <option value="all">Tous les types</option>
                        <option value="income">Revenus</option>
                        <option value="expense">Dépenses</option>
                    </select>
                </div>
            )}

            {showForm && (
                <TransactionForm
                    onSubmit={handleAddTransaction}
                    onCancel={() => setShowForm(false)}
                    isSubmitting={createMutation.isPending}
                />
            )}

            {!showForm && (
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    <button onClick={() => setShowForm(true)} className="btn btn-secondary">
                        + Nouvelle Transaction
                    </button>
                    {transactions.length > 0 && (
                        <button 
                            onClick={() => exportTransactionsToCSV(transactions)} 
                            className="btn btn-secondary"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            title="Exporter les transactions en CSV"
                        >
                            📥 Exporter CSV
                        </button>
                    )}
                </div>
            )}

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--card-border)', textAlign: 'left' }}>
                            <th style={{ padding: '1rem', color: 'var(--secondary)' }}>Date</th>
                            <th style={{ padding: '1rem', color: 'var(--secondary)' }}>Libellé</th>
                            <th style={{ padding: '1rem', color: 'var(--secondary)' }}>Catégorie</th>
                            <th style={{ padding: '1rem', color: 'var(--secondary)', textAlign: 'right' }}>Montant</th>
                            <th style={{ padding: '1rem', color: 'var(--secondary)' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginationData.paginatedTransactions.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--secondary)' }}>
                                    {transactions.length === 0 
                                        ? 'Aucune transaction enregistrée'
                                        : 'Aucune transaction ne correspond à votre recherche'
                                    }
                                </td>
                            </tr>
                        ) : (
                            paginationData.paginatedTransactions.map(t => (
                            <tr key={t.$id} style={{ borderBottom: '1px solid var(--card-border)' }}>
                                <td style={{ padding: '1rem', color: 'var(--secondary)' }}>{t.date}</td>
                                <td style={{ padding: '1rem', fontWeight: 500 }}>{t.label}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '4px',
                                        background: 'var(--form-bg)',
                                        fontSize: '0.85rem'
                                    }}>
                                        {t.category}
                                    </span>
                                </td>
                                <td style={{
                                    padding: '1rem',
                                    textAlign: 'right',
                                    fontWeight: 600,
                                    color: t.type === 'income' ? 'var(--success)' : 'var(--foreground)'
                                }}>
                                    {t.amount > 0 ? '+' : ''}{t.amount.toFixed(2)} €
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <button
                                        onClick={() => handleDelete(t.$id)}
                                        className="btn btn-secondary"
                                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', color: 'var(--danger)' }}
                                        disabled={deleteMutation.isPending}
                                    >
                                        X
                                    </button>
                                </td>
                            </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {paginationData.totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={paginationData.totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={filteredTransactions.length}
                />
            )}

            {(searchQuery || categoryFilter !== 'Tous' || typeFilter !== 'all') && filteredTransactions.length > 0 && (
                <div style={{ marginTop: '1rem', textAlign: 'center', color: 'var(--secondary)', fontSize: '0.9rem' }}>
                    {filteredTransactions.length} transaction{filteredTransactions.length > 1 ? 's' : ''} trouvée{filteredTransactions.length > 1 ? 's' : ''} sur {transactions.length}
                </div>
            )}
        </div>
    );
};

export default FinanceTable;
