'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useToast } from '@/context/ToastContext';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="glass-panel" style={{ 
          padding: '3rem', 
          textAlign: 'center',
          margin: '2rem auto',
          maxWidth: '600px'
        }}>
          <h2 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>
            ⚠️ Une erreur s'est produite
          </h2>
          <p style={{ color: 'var(--secondary)', marginBottom: '2rem' }}>
            {this.state.error?.message || 'Une erreur inattendue s\'est produite.'}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button onClick={this.handleReset} className="btn btn-primary">
              Réessayer
            </button>
            <button 
              onClick={() => window.location.reload()} 
              className="btn btn-secondary"
            >
              Recharger la page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

