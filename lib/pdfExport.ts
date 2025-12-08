/**
 * Utilitaires pour l'export PDF
 */

import { Organism, Transaction } from './queries';
import { formatDate, formatCurrency } from './utils';

interface PDFOptions {
  title: string;
  includeOrganisms?: boolean;
  includeTransactions?: boolean;
  includeStats?: boolean;
}

export function generatePDFContent(
  organisms: Organism[],
  transactions: Transaction[],
  options: PDFOptions
): string {
  let content = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${options.title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 2rem;
          color: #333;
        }
        h1 {
          color: #1e40af;
          border-bottom: 3px solid #1e40af;
          padding-bottom: 0.5rem;
        }
        h2 {
          color: #3b82f6;
          margin-top: 2rem;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 0.75rem;
          text-align: left;
        }
        th {
          background-color: #f3f4f6;
          font-weight: 600;
        }
        .stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin: 1rem 0;
        }
        .stat-card {
          padding: 1rem;
          background: #f9fafb;
          border-radius: 8px;
          border-left: 4px solid #3b82f6;
        }
        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: #1e40af;
        }
        .stat-label {
          color: #6b7280;
          font-size: 0.9rem;
        }
        .footer {
          margin-top: 3rem;
          padding-top: 1rem;
          border-top: 1px solid #ddd;
          text-align: center;
          color: #6b7280;
          font-size: 0.85rem;
        }
      </style>
    </head>
    <body>
      <h1>${options.title}</h1>
      <p>Généré le ${formatDate(new Date().toISOString())}</p>
  `;

  if (options.includeStats) {
    const totalOrganisms = organisms.length;
    const urgentCount = organisms.filter(o => o.status === 'urgent').length;
    const warningCount = organisms.filter(o => o.status === 'warning').length;
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);

    content += `
      <h2>Statistiques</h2>
      <div class="stats">
        <div class="stat-card">
          <div class="stat-value">${totalOrganisms}</div>
          <div class="stat-label">Organismes</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${urgentCount}</div>
          <div class="stat-label">Urgents</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${warningCount}</div>
          <div class="stat-label">Attention</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${formatCurrency(totalIncome)}</div>
          <div class="stat-label">Revenus</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${formatCurrency(totalExpense)}</div>
          <div class="stat-label">Dépenses</div>
        </div>
      </div>
    `;
  }

  if (options.includeOrganisms && organisms.length > 0) {
    content += `
      <h2>Organismes (${organisms.length})</h2>
      <table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Statut</th>
            <th>Message</th>
            <th>URL</th>
            <th>Tags</th>
          </tr>
        </thead>
        <tbody>
    `;

    organisms.forEach(org => {
      content += `
        <tr>
          <td>${org.name}</td>
          <td>${org.status.toUpperCase()}</td>
          <td>${org.message || '-'}</td>
          <td>${org.url || '-'}</td>
          <td>${org.tags?.join(', ') || '-'}</td>
        </tr>
      `;
    });

    content += `
        </tbody>
      </table>
    `;
  }

  if (options.includeTransactions && transactions.length > 0) {
    content += `
      <h2>Transactions (${transactions.length})</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Libellé</th>
            <th>Montant</th>
            <th>Catégorie</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
    `;

    transactions.forEach(t => {
      content += `
        <tr>
          <td>${formatDate(t.date)}</td>
          <td>${t.label}</td>
          <td>${formatCurrency(t.amount)}</td>
          <td>${t.category}</td>
          <td>${t.type === 'income' ? 'Revenu' : 'Dépense'}</td>
        </tr>
      `;
    });

    content += `
        </tbody>
      </table>
    `;
  }

  content += `
      <div class="footer">
        <p>Généré par AdminiBox - ${new Date().toLocaleDateString('fr-FR', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
      </div>
    </body>
    </html>
  `;

  return content;
}

export function downloadPDF(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

