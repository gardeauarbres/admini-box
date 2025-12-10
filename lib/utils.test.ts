import { describe, it, expect } from 'vitest';
import { formatDate, calculateBalance, calculateIncome, calculateExpense, formatCurrency, formatFileSize } from './utils';

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

    describe('Formatting Utilities', () => {
        it('formatCurrency should format EUR correctly', () => {
            const result = formatCurrency(1000.50);
            expect(result).toContain('€');
            // Check for localized number format (space as separator in FR)
            expect(result.replace(/\s/g, ' ')).toMatch(/1 000,50/);
        });

        it('formatFileSize should handle bytes and formatting', () => {
            expect(formatFileSize(0)).toBe('0 Bytes');
            expect(formatFileSize(1024)).toBe('1 KB');
            expect(formatFileSize(1024 * 1024 * 5)).toBe('5 MB');
        });
    });
});
