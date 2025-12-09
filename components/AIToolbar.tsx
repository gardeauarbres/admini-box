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
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generatePrompt, setGeneratePrompt] = useState("");

  // Helper pour le streaming vers l'éditeur
  const streamToEditor = async (
    payload: any,
    successMessage: string,
    isSummary: boolean = false
  ) => {
    // On autorise le contenu vide seulement si on est en mode 'generer'
    if (!content.trim() && payload.mode !== 'generer') return;

    setIsProcessing(true);
    // Fermer tous les menus
    setShowImproveMenu(false);
    setShowSummarizeMenu(false);
    setShowTranslateMenu(false);

    try {
      let accumulatedText = "";

      // Si ce n'est pas un résumé, on prépare l'éditeur pour le streaming
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
      if (!isSummary) {
        onContentChange(content); // Restauration basique en cas d'erreur
      }

      let errorMessage = error.message || 'Erreur inconnue';

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

  const handleGenerate = async () => {
    if (!generatePrompt.trim()) return;

    setShowGenerateModal(false);
    await streamToEditor({
      mode: 'generer',
      contenu: '',
      contexte: generatePrompt,
      lang: 'fr'
    }, 'Contenu généré avec succès !');
    setGeneratePrompt("");
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

    await streamToEditor({
      mode: 'resumer',
      contenu: content,
      contexte: `Longueur souhaitée : ${length}`,
      lang: 'fr'
    }, '', true);
  };

  const handleTranslate = async (targetLanguage: string) => {
    await streamToEditor({
      mode: 'ameliorer',
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

      {/* Bouton Assistant Rédacteur */}
      <button
        onClick={() => setShowGenerateModal(true)}
        disabled={isProcessing}
        className="btn btn-primary"
        style={{
          padding: '0.4rem 0.8rem',
          fontSize: '0.8rem',
          opacity: isProcessing ? 0.5 : 1,
          background: 'linear-gradient(135deg, var(--primary), var(--accent))',
          border: 'none',
          color: 'white'
        }}
        title="Générer un texte depuis une instruction"
      >
        ✨ Assistant
      </button>

      {/* Modal pour le prompt de génération */}
      {showGenerateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2000
        }}>
          <div className="glass-panel" style={{
            width: '90%',
            maxWidth: '500px',
            padding: '1.5rem',
            background: 'var(--card-bg)'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>✨ Assistant Rédacteur</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--secondary)', marginBottom: '1rem' }}>
              Décrivez ce que vous voulez rédiger (ex: "Une lettre de résiliation pour ma salle de sport", "Un email de relance pour une facture impayée").
            </p>
            <textarea
              value={generatePrompt}
              onChange={(e) => setGeneratePrompt(e.target.value)}
              placeholder="Votre instruction..."
              style={{
                width: '100%',
                height: '100px',
                padding: '0.75rem',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--input-border)',
                background: 'var(--input-bg)',
                color: 'var(--foreground)',
                marginBottom: '1rem',
                resize: 'none'
              }}
              autoFocus
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="btn btn-secondary"
              >
                Annuler
              </button>
              <button
                onClick={handleGenerate}
                className="btn btn-primary"
                disabled={!generatePrompt.trim()}
              >
                Générer
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ width: '1px', height: '20px', background: 'var(--card-border)', margin: '0 0.5rem' }} />

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

