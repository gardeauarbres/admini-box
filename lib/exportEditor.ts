/**
 * Fonctions d'export pour les documents de l'éditeur
 */

export interface ExportOptions {
  title: string;
  content: string;
  format?: 'text' | 'markdown' | 'html';
  metadata?: {
    wordCount?: number;
    characterCount?: number;
    createdAt?: string;
    updatedAt?: string;
  };
}

/**
 * Export en PDF (utilise l'API du navigateur pour générer un PDF)
 */
export function exportToPDF(options: ExportOptions): void {
  const { title, content, format = 'text', metadata } = options;

  // Créer une fenêtre pour le PDF
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Impossible d\'ouvrir une nouvelle fenêtre');
  }

  // Convertir le contenu selon le format
  let htmlContent = content;
  if (format === 'markdown') {
    // Conversion Markdown basique (on pourrait utiliser une librairie comme marked)
    htmlContent = convertMarkdownToHTML(content);
  } else if (format === 'text') {
    htmlContent = content.replace(/\n/g, '<br>');
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style>
          @page {
            margin: 2cm;
          }
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          h1 {
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          .metadata {
            font-size: 0.85rem;
            color: #7f8c8d;
            margin-bottom: 30px;
            padding: 10px;
            background: #ecf0f1;
            border-radius: 5px;
          }
          .content {
            text-align: justify;
          }
          @media print {
            body {
              margin: 0;
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(title)}</h1>
        ${metadata ? `
          <div class="metadata">
            <strong>Statistiques:</strong><br>
            ${metadata.wordCount ? `Mots: ${metadata.wordCount} | ` : ''}
            ${metadata.characterCount ? `Caractères: ${metadata.characterCount} | ` : ''}
            ${metadata.updatedAt ? `Dernière modification: ${new Date(metadata.updatedAt).toLocaleDateString('fr-FR')}` : ''}
          </div>
        ` : ''}
        <div class="content">
          ${htmlContent}
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();

  // Attendre que le contenu soit chargé avant d'imprimer
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };
}

/**
 * Export en HTML (télécharge un fichier HTML)
 */
export function exportToHTML(options: ExportOptions): void {
  const { title, content, format = 'text', metadata } = options;

  // Convertir le contenu selon le format
  let htmlContent = content;
  if (format === 'markdown') {
    htmlContent = convertMarkdownToHTML(content);
  } else if (format === 'text') {
    htmlContent = content.replace(/\n/g, '<br>');
  }

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h1 {
      color: #2c3e50;
      border-bottom: 2px solid #3498db;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    .metadata {
      font-size: 0.85rem;
      color: #7f8c8d;
      margin-bottom: 30px;
      padding: 15px;
      background: #ecf0f1;
      border-radius: 5px;
    }
    .content {
      text-align: justify;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${escapeHtml(title)}</h1>
    ${metadata ? `
      <div class="metadata">
        <strong>Statistiques:</strong><br>
        ${metadata.wordCount ? `Mots: ${metadata.wordCount} | ` : ''}
        ${metadata.characterCount ? `Caractères: ${metadata.characterCount} | ` : ''}
        ${metadata.createdAt ? `Créé le: ${new Date(metadata.createdAt).toLocaleDateString('fr-FR')} | ` : ''}
        ${metadata.updatedAt ? `Modifié le: ${new Date(metadata.updatedAt).toLocaleDateString('fr-FR')}` : ''}
      </div>
    ` : ''}
    <div class="content">
      ${htmlContent}
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/[^a-z0-9]/gi, '_')}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export en texte brut
 */
export function exportToText(options: ExportOptions): void {
  const { title, content, metadata } = options;

  let text = `${title}\n${'='.repeat(title.length)}\n\n`;
  
  if (metadata) {
    text += `Statistiques:\n`;
    if (metadata.wordCount) text += `Mots: ${metadata.wordCount}\n`;
    if (metadata.characterCount) text += `Caractères: ${metadata.characterCount}\n`;
    if (metadata.updatedAt) text += `Dernière modification: ${new Date(metadata.updatedAt).toLocaleDateString('fr-FR')}\n`;
    text += '\n';
  }
  
  text += content;

  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/[^a-z0-9]/gi, '_')}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Conversion Markdown basique vers HTML
 */
function convertMarkdownToHTML(markdown: string): string {
  let html = markdown;
  
  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  
  // Line breaks
  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/\n/g, '<br>');
  
  // Wrap in paragraphs
  html = '<p>' + html + '</p>';
  
  return html;
}

/**
 * Échapper les caractères HTML
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

