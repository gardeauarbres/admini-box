'use client';

import React, { useState, useEffect } from 'react';
import { correctText, improveText, summarizeText, translateText, checkAIConfiguration } from '@/lib/ai-editor';

interface AIToolbarProps {
  content: string;
  onContentChange: (newContent: string) => void;
  onShowResult?: (result: string, type: string) => void;
}

const AIToolbar: React.FC<AIToolbarProps> = ({ content, onContentChange, onShowResult }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiAvailable, setAiAvailable] = useState(false);
  const [showImproveMenu, setShowImproveMenu] = useState(false);
  const [showTranslateMenu, setShowTranslateMenu] = useState(false);
  const [showSummarizeMenu, setShowSummarizeMenu] = useState(false);

  useEffect(() => {
    checkAIConfiguration().then(setAiAvailable);
  }, []);

  if (!aiAvailable) {
    return null; // Ne pas afficher si OpenAI n'est pas configuré
  }

  const handleCorrect = async () => {
    if (!content.trim()) return;
    
    setIsProcessing(true);
    try {
      const result = await correctText(content);
      if (result.changes) {
        onContentChange(result.correctedText);
        if (onShowResult) {
          onShowResult('Texte corrigé avec succès !', 'success');
        }
      } else {
        if (onShowResult) {
          onShowResult('Aucune correction nécessaire.', 'info');
        }
      }
    } catch (error: any) {
      let errorMessage = error.message || 'Erreur inconnue';
      
      // Messages d'erreur plus clairs
      if (error.message?.includes('429') || error.message?.includes('Too Many Requests')) {
        errorMessage = 'Limite de requêtes OpenAI atteinte. Veuillez réessayer dans quelques minutes.';
      } else if (error.message?.includes('401') || error.message?.includes('invalid')) {
        errorMessage = 'Clé API OpenAI invalide. Vérifiez votre configuration dans .env.local';
      } else if (error.message?.includes('500')) {
        errorMessage = 'Erreur serveur OpenAI. Réessayez plus tard.';
      }
      
      if (onShowResult) {
        onShowResult(errorMessage, 'error');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImprove = async (style: 'professional' | 'simple' | 'clear' | 'concise') => {
    if (!content.trim()) return;
    
    setIsProcessing(true);
    setShowImproveMenu(false);
    try {
      const result = await improveText(content, style);
      onContentChange(result.improvedText);
      if (onShowResult) {
        onShowResult('Texte amélioré avec succès !', 'success');
      }
    } catch (error: any) {
      let errorMessage = error.message || 'Erreur inconnue';
      
      // Messages d'erreur plus clairs
      if (error.message?.includes('429') || error.message?.includes('Too Many Requests')) {
        errorMessage = 'Limite de requêtes OpenAI atteinte. Veuillez réessayer dans quelques minutes.';
      } else if (error.message?.includes('401') || error.message?.includes('invalid')) {
        errorMessage = 'Clé API OpenAI invalide. Vérifiez votre configuration dans .env.local';
      } else if (error.message?.includes('500')) {
        errorMessage = 'Erreur serveur OpenAI. Réessayez plus tard.';
      }
      
      if (onShowResult) {
        onShowResult(errorMessage, 'error');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSummarize = async (length: 'short' | 'medium' | 'detailed') => {
    if (!content.trim() || content.length < 100) {
      if (onShowResult) {
        onShowResult('Le texte doit contenir au moins 100 caractères pour être résumé.', 'warning');
      }
      return;
    }
    
    setIsProcessing(true);
    setShowSummarizeMenu(false);
    try {
      const result = await summarizeText(content, length);
      if (onShowResult) {
        onShowResult(result.summary, 'summary');
      }
    } catch (error: any) {
      let errorMessage = error.message || 'Erreur inconnue';
      
      // Messages d'erreur plus clairs
      if (error.message?.includes('429') || error.message?.includes('Too Many Requests')) {
        errorMessage = 'Limite de requêtes OpenAI atteinte. Veuillez réessayer dans quelques minutes.';
      } else if (error.message?.includes('401') || error.message?.includes('invalid')) {
        errorMessage = 'Clé API OpenAI invalide. Vérifiez votre configuration dans .env.local';
      } else if (error.message?.includes('500')) {
        errorMessage = 'Erreur serveur OpenAI. Réessayez plus tard.';
      }
      
      if (onShowResult) {
        onShowResult(errorMessage, 'error');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTranslate = async (targetLanguage: string) => {
    if (!content.trim()) return;
    
    setIsProcessing(true);
    setShowTranslateMenu(false);
    try {
      const result = await translateText(content, targetLanguage);
      onContentChange(result.translatedText);
      if (onShowResult) {
        onShowResult(`Texte traduit en ${targetLanguage} !`, 'success');
      }
    } catch (error: any) {
      let errorMessage = error.message || 'Erreur inconnue';
      
      // Messages d'erreur plus clairs
      if (error.message?.includes('429') || error.message?.includes('Too Many Requests')) {
        errorMessage = 'Limite de requêtes OpenAI atteinte. Veuillez réessayer dans quelques minutes.';
      } else if (error.message?.includes('401') || error.message?.includes('invalid')) {
        errorMessage = 'Clé API OpenAI invalide. Vérifiez votre configuration dans .env.local';
      } else if (error.message?.includes('500')) {
        errorMessage = 'Erreur serveur OpenAI. Réessayez plus tard.';
      }
      
      if (onShowResult) {
        onShowResult(errorMessage, 'error');
      }
    } finally {
      setIsProcessing(false);
    }
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

