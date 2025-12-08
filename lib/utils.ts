/**
 * Utilitaires pour l'application AdminiBox
 */

/**
 * Formate un montant en euros
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

/**
 * Formate une date au format français
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

/**
 * Formate une date complète au format français
 */
export function formatFullDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/**
 * Formate une taille de fichier en format lisible
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Débounce une fonction
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Calcule le solde total à partir des transactions
 */
export function calculateBalance(transactions: Array<{ amount: number }>): number {
  return transactions.reduce((acc, t) => acc + t.amount, 0);
}

/**
 * Calcule les revenus totaux
 */
export function calculateIncome(transactions: Array<{ type: string; amount: number }>): number {
  return transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);
}

/**
 * Calcule les dépenses totales
 */
export function calculateExpense(transactions: Array<{ type: string; amount: number }>): number {
  return transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);
}

