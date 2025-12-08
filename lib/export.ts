/**
 * Utilitaires pour l'export de données
 */

/**
 * Convertit un tableau d'objets en CSV
 */
export function convertToCSV<T extends Record<string, any>>(
  data: T[],
  headers: { key: keyof T; label: string }[]
): string {
  // Ligne d'en-tête
  const headerRow = headers.map(h => h.label).join(',');
  
  // Lignes de données
  const dataRows = data.map(item => {
    return headers.map(header => {
      const value = item[header.key];
      // Gérer les valeurs qui contiennent des virgules ou des guillemets
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',');
  });
  
  return [headerRow, ...dataRows].join('\n');
}

/**
 * Télécharge un fichier CSV
 */
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Exporte les transactions en CSV
 */
export function exportTransactionsToCSV(transactions: Array<{
  date: string;
  label: string;
  category: string;
  amount: number;
  type: string;
}>): void {
  const headers = [
    { key: 'date' as const, label: 'Date' },
    { key: 'label' as const, label: 'Libellé' },
    { key: 'category' as const, label: 'Catégorie' },
    { key: 'type' as const, label: 'Type' },
    { key: 'amount' as const, label: 'Montant (€)' },
  ];
  
  const csv = convertToCSV(transactions, headers);
  const filename = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csv, filename);
}

/**
 * Exporte les documents en CSV
 */
export function exportDocumentsToCSV(documents: Array<{
  name: string;
  organism: string;
  date: string;
  type: string;
  size: string;
}>): void {
  const headers = [
    { key: 'name' as const, label: 'Nom du fichier' },
    { key: 'organism' as const, label: 'Organisme' },
    { key: 'date' as const, label: 'Date' },
    { key: 'type' as const, label: 'Type' },
    { key: 'size' as const, label: 'Taille' },
  ];
  
  const csv = convertToCSV(documents, headers);
  const filename = `documents_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csv, filename);
}

/**
 * Exporte les organismes en CSV
 */
export function exportOrganismsToCSV(organisms: Array<{
  name: string;
  status: string;
  message: string;
  url?: string;
}>): void {
  const headers = [
    { key: 'name' as const, label: 'Nom' },
    { key: 'status' as const, label: 'Statut' },
    { key: 'message' as const, label: 'Message' },
    { key: 'url' as const, label: 'URL' },
  ];
  
  const csv = convertToCSV(organisms, headers);
  const filename = `organismes_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csv, filename);
}

