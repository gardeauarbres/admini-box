import { describe, it, expect } from 'vitest';
import { formatDate, calculateBalance, calculateIncome, calculateExpense } from './utils';

describe('utils', () => {
    describe('formatDate', () => {
        it('should format date correctly', () => {
            const dateStr = '2023-01-01T12:00:00Z';
            // Output depends on locale, but should be a string
            const result = formatDate(dateStr);
            expect(result).toBeTypeOf('string');
            expect(result).toContain('01');
            expect(result).toContain('2023');
        });
    });

    describe('Financial calculations', () => {
        const transactions = [
            { amount: 100, type: 'income' },
            { amount: -50, type: 'expense' },
            { amount: 200, type: 'income' },
        ] as any[];

        it('should calculate income correctly', () => {
            expect(calculateIncome(transactions)).toBe(300);
        });

        it('should calculate expense correctly', () => {
            expect(calculateExpense(transactions)).toBe(50);
        });

        it('should calculate balance correctly', () => {
            expect(calculateBalance(transactions)).toBe(250);
        });

        it('should handle empty transactions', () => {
            expect(calculateIncome([])).toBe(0);
            expect(calculateExpense([])).toBe(0);
            expect(calculateBalance([])).toBe(0);
        });
    });
});
