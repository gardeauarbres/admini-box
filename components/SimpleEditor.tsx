'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { saveFormDraft, getFormDraft, clearFormDraft } from '@/lib/storage';
import { saveDraftHybrid, getDraftHybrid, removeDraftHybrid } from '@/lib/storage/hybridStorage';
import { useEditor } from '@/hooks/useEditor';
import { useIntelligentAutoSave } from '@/hooks/useIntelligentAutoSave';
import { useTextStats } from '@/hooks/useTextStats';
import { exportToPDF, exportToHTML, exportToText } from '@/lib/exportEditor';
import AIToolbar from './AIToolbar';

interface SimpleEditorProps {
    documentId?: string; // Optionnel : pour éditer un document existant
    onDocumentCreated?: (documentId: string) => void; // Callback après création
    initialTitle?: string;
    initialContent?: string;
}

const SimpleEditor: React.FC<SimpleEditorProps> = ({ documentId, onDocumentCreated, initialTitle, initialContent }) => {
    const { user } = useAuth();
    const { showToast } = useToast();

    // Récupérer le brouillon sauvegardé (seulement si pas de documentId)
    const [savedDraft, setSavedDraft] = useState<{ title: string; content: string } | null>(null);

    useEffect(() => {
        if (!documentId) {
            getDraftHybrid<{ title: string; content: string }>('editor', { title: '', content: '' }).then(draft => {
                setSavedDraft(draft);
            });
        }
    }, [documentId]);

    // États locaux
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
    const [showPreview, setShowPreview] = useState(false);
    const [format, setFormat] = useState<'text' | 'markdown' | 'html'>('text');

    // Hook principal de l'éditeur
    const {
        localContent,
        setLocalContent,
        localTitle,
        setLocalTitle,
        isDirty,
        remoteDocument,
        isLoading,
        save,
        isSaving,
        settings,
    } = useEditor({
        documentId,
        autoSave: true, // Valeur par défaut, sera mise à jour par settings après chargement
        autoSaveInterval: 30000, // Valeur par défaut
        format, // Passer le format actuel
    });

    // Initialiser avec le brouillon ou les props initiales si nouveau document
    useEffect(() => {
        if (!documentId && !localContent && !localTitle) {
            if (savedDraft && (savedDraft.content || savedDraft.title)) {
                setLocalContent(savedDraft.content || '');
                setLocalTitle(savedDraft.title || '');
            } else if (initialTitle || initialContent) {
                setLocalContent(initialContent || '');
                setLocalTitle(initialTitle || '');
            }
        }
    }, [documentId, savedDraft, localContent, localTitle, setLocalContent, setLocalTitle, initialTitle, initialContent]);

    // Mettre à jour autoSaveEnabled quand settings est chargé
    useEffect(() => {
        if (settings?.autoSave !== undefined) {
            setAutoSaveEnabled(settings.autoSave);
        }
    }, [settings?.autoSave]);

    // Mettre à jour le format depuis remoteDocument
    useEffect(() => {
        if (remoteDocument?.format) {
            setFormat(remoteDocument.format);
        }
    }, [remoteDocument?.format]);
    const documentIdRef = useRef<string | undefined>(documentId);

    // Mettre à jour le ref quand documentId change
    useEffect(() => {
        documentIdRef.current = documentId;
    }, [documentId]);

    // Fonction de sauvegarde avec gestion des brouillons
    const handleSave = useCallback(async () => {
        if (!user) {
            showToast('Vous devez être connecté pour sauvegarder.', 'error');
            return;
        }

        if (!localTitle.trim() || !localContent.trim()) {
            showToast('Veuillez entrer un titre et du contenu.', 'error');
            return;
        }

        try {
            // Sauvegarder avec le format actuel
            const savedDocumentId = await save();
            // Mettre à jour le format dans le document si nécessaire
            if (documentId && remoteDocument && format !== remoteDocument.format) {
                // Le format sera mis à jour lors de la prochaine sauvegarde automatique
                // ou on peut forcer une mise à jour ici si nécessaire
            }
            setLastSaved(new Date());

            // Si c'est un nouveau document, appeler le callback
            if (!documentIdRef.current && savedDocumentId && onDocumentCreated) {
                onDocumentCreated(savedDocumentId);
            }

            // Nettoyer le brouillon après sauvegarde réussie
            if (!documentIdRef.current) {
                removeDraftHybrid('editor');
                // Optionnel : réinitialiser pour nouveau document
                // setLocalContent('');
                // setLocalTitle('');
            }

            showToast('Document sauvegardé avec succès !', 'success');
        } catch (error) {
            console.error('Error saving document:', error);
            showToast(`Erreur lors de la sauvegarde: ${(error as Error).message}`, 'error');
        }
    }, [user, localTitle, localContent, save, showToast, onDocumentCreated]);

    // Sauvegarde automatique du brouillon (seulement pour nouveaux documents)
    useEffect(() => {
        if (documentId) return; // Pas de brouillon pour documents existants

        const timer = setTimeout(() => {
            if (localTitle || localContent) {
                // Utiliser le stockage hybride pour gros documents
                saveDraftHybrid('editor', { title: localTitle, content: localContent });
            }
        }, 2000); // Debounce de 2 secondes

        return () => clearTimeout(timer);
    }, [localTitle, localContent, documentId]);

    // Auto-sauvegarde intelligente
    useIntelligentAutoSave({
        content: localContent,
        title: localTitle,
        saveFn: async (content: string, title: string) => {
            if (!user || !autoSaveEnabled || isSaving) return;

            // Sauvegarder seulement si on a un documentId (document existant)
            if (documentIdRef.current) {
                try {
                    await save();
                    setLastSaved(new Date());
                } catch (error) {
                    console.error('Auto-save failed:', error);
                }
            }
        },
        inactivityDelay: 5000, // 5 secondes d'inactivité
        maxInterval: (settings?.autoSaveInterval ?? 30) * 1000, // Intervalle max (convertir secondes en ms)
        enabled: autoSaveEnabled && !!user && !!documentIdRef.current, // Seulement pour documents existants
    });

    // Raccourci clavier Ctrl+S
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSave();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleSave]);

    // Statistiques du texte (optimisées)
    const stats = useTextStats(localContent);

    // Affichage du chargement
    if (isLoading && documentId) {
        return (
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
                <p>Chargement du document...</p>
            </div>
        );
    }

    return (
        <div className="glass-panel" style={{ padding: '2rem', height: '100%' }}>
            <div style={{ marginBottom: '1rem' }}>
                <input
                    type="text"
                    placeholder="Titre du document..."
                    value={localTitle}
                    onChange={(e) => setLocalTitle(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '1rem',
                        background: 'var(--input-bg)',
                        border: '1px solid var(--card-border)',
                        borderRadius: 'var(--radius)',
                        color: 'var(--foreground)',
                        fontSize: '1.2rem',
                        marginBottom: '1rem'
                    }}
                />
            </div>

            {/* Barre d'outils */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
                flexWrap: 'wrap',
                gap: '1rem',
                fontSize: '0.85rem',
                color: 'var(--secondary)'
            }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <span>📝 {stats.words} mots</span>
                    <span>🔤 {stats.characters} caractères</span>
                    <span>📄 {stats.paragraphs} paragraphe{stats.paragraphs > 1 ? 's' : ''}</span>
                    {isDirty && (
                        <span style={{ color: 'var(--warning)', fontWeight: 600 }}>
                            ● Modifications non sauvegardées
                        </span>
                    )}
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {documentId && (
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={autoSaveEnabled}
                                onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                                style={{ cursor: 'pointer' }}
                            />
                            <span>Auto-sauvegarde intelligente</span>
                        </label>
                    )}
                    {lastSaved && (
                        <span style={{ fontSize: '0.75rem' }}>
                            Dernière sauvegarde: {lastSaved.toLocaleTimeString('fr-FR')}
                        </span>
                    )}
                </div>
            </div>

            {/* Barre d'outils IA */}
            <AIToolbar
                content={localContent}
                onContentChange={setLocalContent}
                onShowResult={(message, type) => {
                    if (type === 'summary') {
                        // Afficher le résumé dans une modale ou un panneau
                        const confirmed = confirm(`Résumé généré:\n\n${message}\n\nVoulez-vous remplacer le texte par ce résumé ?`);
                        if (confirmed) {
                            setLocalContent(message);
                        }
                    } else {
                        showToast(message, type === 'error' ? 'error' : type === 'warning' ? 'info' : 'success');
                    }
                }}
            />

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <button
                    onClick={() => setShowPreview(!showPreview)}
                    className={`btn ${showPreview ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                >
                    {showPreview ? '✏️ Éditer' : '👁️ Prévisualiser'}
                </button>
            </div>

            {showPreview && format === 'markdown' ? (
                <div
                    style={{
                        width: '100%',
                        height: '400px',
                        padding: '1rem',
                        background: 'var(--input-bg)',
                        border: '1px solid var(--input-border)',
                        borderRadius: 'var(--radius)',
                        color: 'var(--foreground)',
                        overflow: 'auto',
                        fontFamily: 'inherit',
                        lineHeight: '1.6',
                        fontSize: '1rem'
                    }}
                    dangerouslySetInnerHTML={{ __html: convertMarkdownToHTML(localContent) }}
                />
            ) : (
                <textarea
                    value={localContent}
                    onChange={(e) => setLocalContent(e.target.value)}
                    placeholder="Commencez à écrire... (Ctrl+S pour sauvegarder)"
                    style={{
                        width: '100%',
                        height: '400px',
                        padding: '1rem',
                        background: 'var(--input-bg)',
                        border: '1px solid var(--input-border)',
                        borderRadius: 'var(--radius)',
                        color: 'var(--foreground)',
                        resize: 'vertical',
                        fontFamily: 'inherit',
                        lineHeight: '1.6',
                        fontSize: '1rem'
                    }}
                />
            )}

            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => {
                            try {
                                exportToPDF({
                                    title: localTitle,
                                    content: localContent,
                                    format,
                                    metadata: {
                                        wordCount: stats.words,
                                        characterCount: stats.characters,
                                        updatedAt: lastSaved?.toISOString() || new Date().toISOString(),
                                    }
                                });
                                showToast('Export PDF lancé', 'success');
                            } catch (error) {
                                console.error('Export PDF error:', error);
                                showToast('Erreur lors de l\'export PDF', 'error');
                            }
                        }}
                        disabled={!localTitle.trim() || !localContent.trim()}
                        className="btn btn-secondary"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                        title="Exporter en PDF"
                    >
                        📄 PDF
                    </button>
                    <button
                        onClick={() => {
                            try {
                                exportToHTML({
                                    title: localTitle,
                                    content: localContent,
                                    format,
                                    metadata: {
                                        wordCount: stats.words,
                                        characterCount: stats.characters,
                                        createdAt: remoteDocument?.$createdAt,
                                        updatedAt: remoteDocument?.$updatedAt || lastSaved?.toISOString(),
                                    }
                                });
                                showToast('Export HTML réussi', 'success');
                            } catch (error) {
                                console.error('Export HTML error:', error);
                                showToast('Erreur lors de l\'export HTML', 'error');
                            }
                        }}
                        disabled={!localTitle.trim() || !localContent.trim()}
                        className="btn btn-secondary"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                        title="Exporter en HTML"
                    >
                        🌐 HTML
                    </button>
                    <button
                        onClick={() => {
                            try {
                                exportToText({
                                    title: localTitle,
                                    content: localContent,
                                    format,
                                    metadata: {
                                        wordCount: stats.words,
                                        characterCount: stats.characters,
                                        updatedAt: remoteDocument?.$updatedAt || lastSaved?.toISOString(),
                                    }
                                });
                                showToast('Export texte réussi', 'success');
                            } catch (error) {
                                console.error('Export text error:', error);
                                showToast('Erreur lors de l\'export texte', 'error');
                            }
                        }}
                        disabled={!localTitle.trim() || !localContent.trim()}
                        className="btn btn-secondary"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                        title="Exporter en texte"
                    >
                        📝 TXT
                    </button>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving || !localTitle.trim() || !localContent.trim()}
                    className="btn btn-primary"
                    title="Ctrl+S"
                >
                    {isSaving ? 'Sauvegarde...' : documentId ? '💾 Enregistrer les modifications' : '💾 Sauvegarder dans mes documents'}
                </button>
            </div>
        </div>
    );
};

// Conversion Markdown basique vers HTML
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
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

    // Code blocks
    html = html.replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>');
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Line breaks
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/\n/g, '<br>');

    // Wrap in paragraphs
    html = '<p>' + html + '</p>';

    return html;
}

export default SimpleEditor;
