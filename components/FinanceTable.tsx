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
import SmartScanner from './SmartScanner';
import { calculateBalance, calculateIncome, calculateExpense } from '@/lib/utils';
import { exportTransactionsToCSV } from '@/lib/export';
import type { TransactionFormData } from '@/lib/validations';

interface FinanceTableProps {
    showForm?: boolean;
    onCloseForm?: () => void;
    initialData?: Partial<TransactionFormData>;
}

const FinanceTable: React.FC<FinanceTableProps> = ({ showForm: externalShowForm, onCloseForm, initialData }) => {
    const { user } = useAuth();
    const { showToast } = useToast();

    // Form state managed internally if not provided externally
    const [internalShowForm, setInternalShowForm] = useState(false);
    const showForm = externalShowForm !== undefined ? externalShowForm : internalShowForm;
    const setShowForm = (show: boolean) => {
        if (onCloseForm && !show) onCloseForm();
        setInternalShowForm(show);
    };
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('Tous');
    const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [scannedData, setScannedData] = useState<Partial<TransactionFormData> | undefined>(undefined);
    const itemsPerPage = 10;

    // React Query hooks
    const { data: transactions = [], isLoading } = useTransactions(user?.$id || null);
    const createMutation = useCreateTransaction();
    const deleteMutation = useDeleteTransaction();

    // Stats are now calculated in parent, but we keep this if needed for internal logic?
    // Actually, we don't need to calculate stats here if we don't pass them up.
    // However, looking at the code, stats were ONLY used to pass up.
    // So we can remove the memo and effects completely.

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

    const [showScanner, setShowScanner] = useState(false);

    const categories = ['Tous', ...Array.from(new Set(transactions.map(t => t.category)))];

    const handleScanComplete = (data: { amount?: number, date?: string, merchant?: string, category?: string }) => {
        setScannedData({
            amount: data.amount,
            date: data.date,
            label: data.merchant ? `Achat ${data.merchant}` : undefined,
            category: data.category || 'Autre',
            type: 'expense' // Default to expense for receipts
        });
        setShowScanner(false);
        setShowForm(true);
        showToast('Données du reçu extraites !', 'success');
    };

    const handleAddTransaction = async (data: TransactionFormData) => {
        if (!user) return;

        try {
            await createMutation.mutateAsync({
                userId: user.$id,
                data
            });

            setShowForm(false);
            setScannedData(undefined); // Reset scanned data
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

            {showScanner && (
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h4 style={{ margin: 0 }}>Scanner un reçu</h4>
                        <button onClick={() => setShowScanner(false)} className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem' }}>Annuler</button>
                    </div>
                    <SmartScanner onScanComplete={handleScanComplete} />
                </div>
            )}

            {showForm && (
                <TransactionForm
                    onSubmit={handleAddTransaction}
                    onCancel={() => {
                        setShowForm(false);
                        setScannedData(undefined);
                    }}
                    isSubmitting={createMutation.isPending}
                    initialData={scannedData || initialData}
                />
            )}

            {!showForm && !showScanner && (
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    <button onClick={() => setShowForm(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>+</span> Nouvelle Transaction
                    </button>
                    <button onClick={() => setShowScanner(true)} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>📸</span> Scanner Reçu (IA)
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

            {/* Vue Mobile (Cartes) */}
            <div className="visible-mobile" style={{ display: 'none' }}>
                {paginationData.paginatedTransactions.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--secondary)' }}>
                        {transactions.length === 0
                            ? 'Aucune transaction enregistrée'
                            : 'Aucune transaction ne correspond à votre recherche'
                        }
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {paginationData.paginatedTransactions.map(t => (
                            <div key={t.$id} className="glass-panel" style={{ padding: '1rem', position: 'relative' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: 600 }}>{t.label}</span>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>{t.date}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '4px',
                                        background: 'var(--form-bg)',
                                        fontSize: '0.8rem'
                                    }}>
                                        {t.category}
                                    </span>
                                    <span style={{
                                        fontWeight: 700,
                                        color: t.type === 'income' ? 'var(--success)' : 'var(--foreground)'
                                    }}>
                                        {t.amount > 0 ? '+' : ''}{t.amount.toFixed(2)} €
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleDelete(t.$id)}
                                    className="btn btn-secondary"
                                    style={{
                                        position: 'absolute',
                                        top: '0.5rem',
                                        right: '0.5rem',
                                        display: 'none' // Masqué par défaut sur mobile pour éviter les clics accidentels ? Non, on peut le mettre en bas.
                                    }}
                                >
                                    X
                                </button>
                                <div style={{ marginTop: '0.75rem', textAlign: 'right' }}>
                                    <button
                                        onClick={() => handleDelete(t.$id)}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: 'var(--danger)',
                                            fontSize: '0.85rem',
                                            textDecoration: 'underline'
                                        }}
                                    >
                                        Supprimer
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Vue Desktop (Tableau) */}
            <div className="hidden-mobile" style={{ overflowX: 'auto' }}>
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
