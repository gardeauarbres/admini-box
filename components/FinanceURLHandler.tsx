'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface FinanceURLHandlerProps {
    onOpenAddForm: () => void;
    onHighlightScanner: () => void;
    onPrefillData: (data: any) => void;
}

export default function FinanceURLHandler({ onOpenAddForm, onHighlightScanner, onPrefillData }: FinanceURLHandlerProps) {
    const searchParams = useSearchParams();

    useEffect(() => {
        const action = searchParams.get('action');
        const amount = searchParams.get('amount');
        const label = searchParams.get('label');
        const category = searchParams.get('category');

        if (action === 'add') {
            if (amount || label) {
                onPrefillData({
                    amount: amount ? parseFloat(amount) : undefined,
                    label: label || undefined,
                    category: category || 'Autre',
                    type: 'expense'
                });
            }
            onOpenAddForm();
        } else if (action === 'scan') {
            onHighlightScanner();
        }
    }, [searchParams, onOpenAddForm, onHighlightScanner, onPrefillData]);

    return null;
}
