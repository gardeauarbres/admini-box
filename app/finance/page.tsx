'use client';

import React, { useState, useCallback } from 'react';
import FinanceTable from '@/components/FinanceTable';
import FinancialCharts from '@/components/FinancialCharts';
import SmartScanner from '@/components/SmartScanner';
import ProtectedRoute from '@/components/ProtectedRoute';
import { calculateIncome, calculateExpense, formatFileSize } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useTransactions, useCreateDocument, useCreateTransaction } from '@/lib/queries';
import { useToast } from '@/context/ToastContext';
import { Suspense } from 'react';
import FinanceURLHandler from '@/components/FinanceURLHandler';

export default function FinancePage() {
    const { user } = useAuth();
    const { data: transactions = [] } = useTransactions(user?.$id || null);

    // State for Smart Scanner interaction
    const [showTransactionForm, setShowTransactionForm] = useState(false);
    const [transactionInitialData, setTransactionInitialData] = useState<any>(null);

    const handleHighlightScanner = useCallback(() => {
        // Smooth scroll to scanner
        const scannerElement = document.getElementById('smart-scanner');
        if (scannerElement) {
            scannerElement.scrollIntoView({ behavior: 'smooth' });
            scannerElement.classList.add('highlight-pulse');
            setTimeout(() => scannerElement.classList.remove('highlight-pulse'), 2000);
        }
    }, []);
    const stats = React.useMemo(() => {
        return {
            income: calculateIncome(transactions),
            expense: calculateExpense(transactions)
        };
    }, [transactions]);

    const [budget, setBudget] = useState(0);
    const [isEditingBudget, setIsEditingBudget] = useState(false);

    React.useEffect(() => {
        const saved = localStorage.getItem('admini_box_budget_limit');
        if (saved) setBudget(parseFloat(saved));
    }, []);

    const saveBudget = (val: number) => {
        setBudget(val);
        localStorage.setItem('admini_box_budget_limit', val.toString());
        setIsEditingBudget(false);
    };

    const [analysisResult, setAnalysisResult] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);



    // Hooks for saving document
    const [isSavingDoc, setIsSavingDoc] = useState(false);
    const { showToast } = useToast();
    const createDocumentMutation = useCreateDocument();
    const createTransactionMutation = useTransactions(null); // Just to get query key if needed, but actually we need useCreateTransaction
    const createTransMutation = useCreateTransaction();

    const handleScanComplete = useCallback(async (data: { amount?: number, date?: string, merchant?: string, category?: string, file?: File }) => {
        let savedFileId = undefined;

        if (data.file && user) {
            setIsSavingDoc(true);
            try {
                // Determine doc type based on merchant or label
                const docType = 'Reçu/Facture';

                // Upload to Documents
                await createDocumentMutation.mutateAsync({
                    userId: user.$id,
                    file: data.file,
                    metadata: {
                        name: `Justificatif - ${data.merchant || 'Inconnu'} - ${data.date || new Date().toLocaleDateString()}`,
                        date: data.date || new Date().toISOString(),
                        organism: data.merchant || 'Autre',
                        type: docType,
                        size: formatFileSize(data.file.size)
                    }
                });
                showToast("Document enregistré dans vos dossiers !", "success");
            } catch (err) {
                console.error("Failed to save scanned doc:", err);
                showToast("Erreur sauvegarde document", "error");
            } finally {
                setIsSavingDoc(false);
            }
        }

        // Auto-create transaction if critical data is present
        if (data.amount && data.merchant && user) {
            try {
                await createTransMutation.mutateAsync({
                    userId: user.$id,
                    data: {
                        amount: data.amount, // Negatif/Positif ? Vision renvoie souvent positif. Il faut assumer une dépense.
                        date: data.date || new Date().toISOString().split('T')[0],
                        label: data.merchant,
                        category: data.category || 'Autre',
                        type: 'expense' // Default to expense
                    }
                });
                showToast("Transaction créée automatiquement !", "success");

                // Do NOT open form if successful
                return;
            } catch (error) {
                console.error("Auto-create failed", error);
                showToast("Erreur création auto, ouverture formulaire", "error");
                // Fallthrough to open form
            }
        }

        setTransactionInitialData({
            amount: data.amount,
            date: data.date,
            label: data.merchant,
            type: 'expense',
            category: 'Autre'
        });
        setShowTransactionForm(true);
    }, [user, createDocumentMutation, createTransMutation, showToast]);

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        try {
            const response = await fetch('/api/ai/finance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    income: stats.income,
                    expenses: stats.expense,
                    balance: stats.income - stats.expense,
                    transactions: transactions.slice(0, 5) // Send top 5 transactions context
                })
            });
            const data = await response.json();
            if (data.analysis) {
                setAnalysisResult(data.analysis);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <ProtectedRoute>
            <div>
                <Suspense fallback={null}>
                    <FinanceURLHandler
                        onOpenAddForm={() => setShowTransactionForm(true)}
                        onHighlightScanner={handleHighlightScanner}
                    />
                </Suspense>
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
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: (stats.income - stats.expense) >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                            {(stats.income - stats.expense).toFixed(2)} €
                        </div>
                    </div>
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <h3 style={{ color: 'var(--secondary)', fontSize: '0.9rem', margin: 0 }}>Budget Mensuel</h3>
                            <button onClick={() => setIsEditingBudget(!isEditingBudget)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>⚙️</button>
                        </div>

                        {isEditingBudget ? (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="number"
                                    defaultValue={budget}
                                    onBlur={(e) => saveBudget(parseFloat(e.target.value))}
                                    onKeyDown={(e) => { if (e.key === 'Enter') saveBudget(parseFloat(e.currentTarget.value)); }}
                                    autoFocus
                                    style={{ width: '100%', padding: '0.25rem', borderRadius: '4px', border: '1px solid var(--input-border)', background: 'var(--input-bg)', color: 'var(--foreground)' }}
                                />
                            </div>
                        ) : (
                            <>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--foreground)' }}>
                                    {budget > 0 ? `${budget.toFixed(2)} €` : 'Non défini'}
                                </div>
                                {budget > 0 && (
                                    <div style={{ marginTop: '0.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem', color: 'var(--secondary)' }}>
                                            <span>{Math.round((Math.abs(stats.expense) / budget) * 100)}% utilisé</span>
                                            <span>Reste {Math.max(0, budget - Math.abs(stats.expense)).toFixed(2)} €</span>
                                        </div>
                                        <div style={{ height: '6px', background: 'var(--card-border)', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div style={{
                                                height: '100%',
                                                width: `${Math.min(100, (Math.abs(stats.expense) / budget) * 100)}%`,
                                                background: (Math.abs(stats.expense) > budget) ? 'var(--danger)' : (Math.abs(stats.expense) > budget * 0.8) ? 'var(--warning)' : 'var(--success)',
                                                transition: 'width 0.5s ease'
                                            }} />
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                    {/* Graphiques financiers */}
                    <div className="glass-panel" style={{ padding: '1.5rem', gridColumn: '1 / -1' }}>
                        <FinancialCharts transactions={transactions} />
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                    <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        className="btn btn-primary"
                        style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', border: 'none', color: 'white' }}
                    >
                        {isAnalyzing ? 'Analyse en cours...' : '💡 Analyse IA'}
                    </button>
                </div>

                {/* Smart Scanner Section */}
                <div id="smart-scanner">
                    <SmartScanner onScanComplete={handleScanComplete} />
                </div>

                {analysisResult && (
                    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', borderLeft: '4px solid var(--accent)' }}>
                        <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            ✨ Le conseil de votre Assistant
                        </h3>
                        <div style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>
                            {analysisResult}
                        </div>
                    </div>
                )}



                <FinanceTable
                    showForm={showTransactionForm}
                    onCloseForm={() => setShowTransactionForm(false)}
                    initialData={transactionInitialData}
                />
            </div>
        </ProtectedRoute>
    );
}
