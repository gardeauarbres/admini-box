'use client';

import { useState } from 'react';
import { useOrganisms, useTransactions, useDocuments, useUserProfile } from '@/lib/queries';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import LoadingSpinner from './LoadingSpinner';
import { formatDate } from '@/lib/utils';
import { generatePDFContent, downloadPDF } from '@/lib/pdfExport';

export default function DataExport() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { data: profile } = useUserProfile(user?.$id || null);
  const { data: organisms = [] } = useOrganisms(user?.$id || null);
  const { data: transactions = [] } = useTransactions(user?.$id || null);
  const { data: documents = [] } = useDocuments(user?.$id || null);
  const [exporting, setExporting] = useState(false);

  const exportToJSON = () => {
    if (!user) return;

    setExporting(true);
    try {
      const exportData = {
        exportDate: new Date().toISOString(),
        user: {
          id: user.$id,
          email: user.email,
          name: user.name,
          createdAt: user.$createdAt,
        },
        profile: profile ? {
          firstName: profile.firstName,
          lastName: profile.lastName,
          birthDate: profile.birthDate,
          phone: profile.phone,
          bio: profile.bio,
          address: profile.address,
          profession: profile.profession,
          company: profile.company,
          professionalEmail: profile.professionalEmail,
          website: profile.website,
        } : null,
        organisms: organisms.map(org => ({
          name: org.name,
          status: org.status,
          message: org.message,
          url: org.url,
          createdAt: org.$createdAt,
        })),
        transactions: transactions.map(t => ({
          date: t.date,
          label: t.label,
          amount: t.amount,
          category: t.category,
          type: t.type,
        })),
        documents: documents.map(doc => ({
          name: doc.name,
          date: doc.date,
          organism: doc.organism,
          type: doc.type,
          size: doc.size,
        })),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `adminibox-export-${formatDate(new Date().toISOString()).replace(/\//g, '-')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast('Données exportées avec succès', 'success');
    } catch (error) {
      console.error('Error exporting data:', error);
      showToast('Erreur lors de l\'export', 'error');
    } finally {
      setExporting(false);
    }
  };

  const exportToCSV = () => {
    if (!user) return;

    setExporting(true);
    try {
      // Créer un CSV combiné
      let csv = 'Type,Date,Nom/Label,Montant,Statut/Catégorie,Autres\n';
      
      // Organismes
      organisms.forEach(org => {
        csv += `Organisme,${formatDate(org.$createdAt || '')},${org.name},,${org.status},"${org.message || ''}"\n`;
      });
      
      // Transactions
      transactions.forEach(t => {
        csv += `Transaction,${t.date},${t.label},${t.amount},${t.category},${t.type}\n`;
      });
      
      // Documents
      documents.forEach(doc => {
        csv += `Document,${doc.date},${doc.name},,${doc.type},"${doc.organism}"\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `adminibox-export-${formatDate(new Date().toISOString()).replace(/\//g, '-')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast('Données exportées en CSV avec succès', 'success');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      showToast('Erreur lors de l\'export CSV', 'error');
    } finally {
      setExporting(false);
    }
  };

  const exportToPDF = () => {
    if (!user) return;

    setExporting(true);
    try {
      const content = generatePDFContent(organisms, transactions, {
        title: `Rapport AdminiBox - ${formatDate(new Date().toISOString())}`,
        includeOrganisms: true,
        includeTransactions: true,
        includeStats: true,
      });

      downloadPDF(content, `adminibox-rapport-${formatDate(new Date().toISOString()).replace(/\//g, '-')}`);
      showToast('Rapport généré avec succès', 'success');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      showToast('Erreur lors de la génération du rapport', 'error');
    } finally {
      setExporting(false);
    }
  };

  const dataCount = organisms.length + transactions.length + documents.length;

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <div>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>📥 Export de données (RGPD)</h3>
        <p style={{ color: 'var(--secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Téléchargez toutes vos données personnelles au format JSON ou CSV. Conforme RGPD.
        </p>
      </div>

      <div style={{
        padding: '1rem',
        borderRadius: 'var(--radius)',
        background: 'var(--form-bg)',
        marginBottom: '1.5rem',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ color: 'var(--secondary)' }}>Données disponibles :</span>
          <strong>{dataCount} éléments</strong>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>
          • {organisms.length} organismes<br />
          • {transactions.length} transactions<br />
          • {documents.length} documents<br />
          {profile && '• Profil utilisateur'}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={exportToJSON}
          disabled={exporting || dataCount === 0}
          className="btn btn-primary"
        >
          {exporting ? 'Export...' : '📄 Exporter en JSON'}
        </button>
        <button
          onClick={exportToCSV}
          disabled={exporting || dataCount === 0}
          className="btn btn-secondary"
        >
          {exporting ? 'Export...' : '📊 Exporter en CSV'}
        </button>
        <button
          onClick={exportToPDF}
          disabled={exporting || dataCount === 0}
          className="btn btn-secondary"
        >
          {exporting ? 'Export...' : '📑 Exporter en PDF/HTML'}
        </button>
      </div>

      {dataCount === 0 && (
        <p style={{ color: 'var(--secondary)', fontSize: '0.85rem', marginTop: '1rem', fontStyle: 'italic' }}>
          Aucune donnée à exporter pour le moment.
        </p>
      )}
    </div>
  );
}

