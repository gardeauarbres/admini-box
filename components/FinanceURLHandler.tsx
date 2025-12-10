'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface FinanceURLHandlerProps {
    onOpenAddForm: () => void;
    onHighlightScanner: () => void;
}

export default function FinanceURLHandler({ onOpenAddForm, onHighlightScanner }: FinanceURLHandlerProps) {
    const searchParams = useSearchParams();

    useEffect(() => {
        const action = searchParams.get('action');
        if (action === 'add') {
            onOpenAddForm();
        } else if (action === 'scan') {
            onHighlightScanner();
        }
    }, [searchParams, onOpenAddForm, onHighlightScanner]);

    return null;
}
