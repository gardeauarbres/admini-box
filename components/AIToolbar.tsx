'use client';

import React, { useState, useEffect } from 'react';
import { correctText, improveText, summarizeText, translateText, checkAIConfiguration, generateContentStream } from '@/lib/ai-editor';

interface AIToolbarProps {
  content: string;
  onContentChange: (newContent: string) => void;
  onShowResult?: (result: string, type: string) => void;
}

const AIToolbar: React.FC<AIToolbarProps> = ({ content, onContentChange, onShowResult }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showImproveMenu, setShowImproveMenu] = useState(false);
  const [showTranslateMenu, setShowTranslateMenu] = useState(false);
  const [showSummarizeMenu, setShowSummarizeMenu] = useState(false);

  // Helper pour le streaming vers l'éditeur
  const streamToEditor = async (
    payload: any,
    successMessage: string,
    isSummary: boolean = false
  ) => {
    if (!content.trim()) return;

    setIsProcessing(true);
    // Fermer tous les menus
    setShowImproveMenu(false);
    setShowSummarizeMenu(false);
    setShowTranslateMenu(false);

    try {
      let accumulatedText = "";

      // Si ce n'est pas un résumé, on prépare l'éditeur pour le streaming
      // (On efface le contenu pour afficher le flux entrant)
      // Note: pour un résumé, on accumule tout avant d'afficher (limitation de window.confirm)
      if (!isSummary) {
        onContentChange("");
      }

      for await (const chunk of generateContentStream(payload)) {
        accumulatedText += chunk;
        if (!isSummary) {
          onContentChange(accumulatedText);
        }
      }

      if (isSummary) {
        if (onShowResult) {
          onShowResult(accumulatedText, 'summary');
        }
      } else {
        if (onShowResult) {
          onShowResult(successMessage, 'success');
        }
      }

    } catch (error: any) {
      // En cas d'erreur, on restaure le contenu original si on écrivait dans l'éditeur
      // (Sauf si l'utilisateur a déjà écrit par dessus, ce qui est complexe à gérer, 
      //  mais ici on suppose qu'il attend)
      if (!isSummary) {
        onContentChange(content); // Restauration basique
        // Idéalement on aurait un système d'undo/redo plus robuste
      }

      let errorMessage = error.message || 'Erreur inconnue';

      // Messages d'erreur plus clairs
      if (error.message?.includes('429') || error.message?.includes('Too Many Requests')) {
        errorMessage = 'Limite de requêtes atteinte. Veuillez réessayer dans quelques minutes.';
      } else if (error.message?.includes('401') || error.message?.includes('invalid')) {
        errorMessage = 'Clé API IA invalide. Vérifiez votre configuration.';
      } else if (error.message?.includes('500')) {
        errorMessage = 'Erreur serveur IA. Réessayez plus tard.';
      }

      if (onShowResult) {
        onShowResult(errorMessage, 'error');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCorrect = async () => {
    await streamToEditor({
      mode: 'corriger',
      contenu: content,
      lang: 'fr'
    }, 'Texte corrigé avec succès !');
  };

  const handleImprove = async (style: 'professional' | 'simple' | 'clear' | 'concise') => {
    let context = "Amélioration standard";
    if (style === 'professional') context = "Rendre le ton plus professionnel et administratif.";
    if (style === 'simple') context = "Simplifier le langage pour être compris de tous.";
    if (style === 'clear') context = "Clarifier le propos, éviter les ambiguïtés.";
    if (style === 'concise') context = "Raccourcir et aller à l'essentiel.";

    await streamToEditor({
      mode: style === 'professional' ? 'formaliser' : 'ameliorer',
      contenu: content,
      contexte: context,
      lang: 'fr'
    }, 'Texte amélioré avec succès !');
  };

  const handleSummarize = async (length: 'short' | 'medium' | 'detailed') => {
    if (!content.trim() || content.length < 100) {
      if (onShowResult) {
        onShowResult('Le texte doit contenir au moins 100 caractères pour être résumé.', 'warning');
      }
      return;
    }

    // Le résumé reste non-streamé (affiché dans une modale à la fin)
    // Mais on utilise le générateur pour uniformiser
    await streamToEditor({
      mode: 'resumer',
      contenu: content,
      contexte: `Longueur souhaitée : ${length}`,
      lang: 'fr'
    }, '', true);
  };

  const handleTranslate = async (targetLanguage: string) => {
    await streamToEditor({
      mode: 'ameliorer', // Utilise ameliorer pour réécrire/traduire
      contenu: content,
      contexte: `Traduis ce texte en ${targetLanguage}. Garde le ton administratif.`,
      lang: targetLanguage
    }, `Texte traduit en ${targetLanguage} !`);
  };

  return (
    <div style={{
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '1rem',
      padding: '0.75rem',
      background: 'var(--card-bg)',
      border: '1px solid var(--card-border)',
      borderRadius: 'var(--radius)',
      flexWrap: 'wrap',
      alignItems: 'center'
    }}>
      <span style={{ fontSize: '0.85rem', color: 'var(--secondary)', marginRight: '0.5rem' }}>
        🤖 IA:
      </span>

      <button
        onClick={handleCorrect}
        disabled={isProcessing || !content.trim()}
        className="btn btn-secondary"
        style={{
          padding: '0.4rem 0.8rem',
          fontSize: '0.8rem',
          opacity: isProcessing || !content.trim() ? 0.5 : 1,
          cursor: isProcessing || !content.trim() ? 'not-allowed' : 'pointer'
        }}
        title="Corriger l'orthographe et la grammaire"
      >
        {isProcessing ? '⏳' : '🔍'} Corriger
      </button>

      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowImproveMenu(!showImproveMenu)}
          disabled={isProcessing || !content.trim()}
          className="btn btn-secondary"
          style={{
            padding: '0.4rem 0.8rem',
            fontSize: '0.8rem',
            opacity: isProcessing || !content.trim() ? 0.5 : 1
          }}
          title="Améliorer le style"
        >
          📝 Améliorer ▼
        </button>
        {showImproveMenu && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '0.25rem',
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: 'var(--radius)',
            padding: '0.5rem',
            zIndex: 1000,
            minWidth: '150px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <button
              onClick={() => handleImprove('professional')}
              className="btn btn-secondary"
              style={{ width: '100%', marginBottom: '0.25rem', fontSize: '0.8rem', padding: '0.4rem' }}
            >
              Professionnel
            </button>
            <button
              onClick={() => handleImprove('simple')}
              className="btn btn-secondary"
              style={{ width: '100%', marginBottom: '0.25rem', fontSize: '0.8rem', padding: '0.4rem' }}
            >
              Simple
            </button>
            <button
              onClick={() => handleImprove('clear')}
              className="btn btn-secondary"
              style={{ width: '100%', marginBottom: '0.25rem', fontSize: '0.8rem', padding: '0.4rem' }}
            >
              Plus clair
            </button>
            <button
              onClick={() => handleImprove('concise')}
              className="btn btn-secondary"
              style={{ width: '100%', fontSize: '0.8rem', padding: '0.4rem' }}
            >
              Plus concis
            </button>
          </div>
        )}
      </div>

      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowSummarizeMenu(!showSummarizeMenu)}
          disabled={isProcessing || !content.trim() || content.length < 100}
          className="btn btn-secondary"
          style={{
            padding: '0.4rem 0.8rem',
            fontSize: '0.8rem',
            opacity: isProcessing || !content.trim() || content.length < 100 ? 0.5 : 1
          }}
          title="Générer un résumé"
        >
          📄 Résumer ▼
        </button>
        {showSummarizeMenu && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '0.25rem',
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: 'var(--radius)',
            padding: '0.5rem',
            zIndex: 1000,
            minWidth: '150px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <button
              onClick={() => handleSummarize('short')}
              className="btn btn-secondary"
              style={{ width: '100%', marginBottom: '0.25rem', fontSize: '0.8rem', padding: '0.4rem' }}
            >
              Court (2-3 phrases)
            </button>
            <button
              onClick={() => handleSummarize('medium')}
              className="btn btn-secondary"
              style={{ width: '100%', marginBottom: '0.25rem', fontSize: '0.8rem', padding: '0.4rem' }}
            >
              Moyen (paragraphe)
            </button>
            <button
              onClick={() => handleSummarize('detailed')}
              className="btn btn-secondary"
              style={{ width: '100%', fontSize: '0.8rem', padding: '0.4rem' }}
            >
              Détaillé (plusieurs paragraphes)
            </button>
          </div>
        )}
      </div>

      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowTranslateMenu(!showTranslateMenu)}
          disabled={isProcessing || !content.trim()}
          className="btn btn-secondary"
          style={{
            padding: '0.4rem 0.8rem',
            fontSize: '0.8rem',
            opacity: isProcessing || !content.trim() ? 0.5 : 1
          }}
          title="Traduire"
        >
          🌐 Traduire ▼
        </button>
        {showTranslateMenu && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '0.25rem',
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: 'var(--radius)',
            padding: '0.5rem',
            zIndex: 1000,
            minWidth: '150px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            {['anglais', 'espagnol', 'allemand', 'italien', 'portugais'].map(lang => (
              <button
                key={lang}
                onClick={() => handleTranslate(lang)}
                className="btn btn-secondary"
                style={{ width: '100%', marginBottom: '0.25rem', fontSize: '0.8rem', padding: '0.4rem' }}
              >
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIToolbar;

