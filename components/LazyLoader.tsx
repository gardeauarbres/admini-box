'use client';

import { lazy, Suspense, ComponentType } from 'react';
import LoadingSpinner from './LoadingSpinner';

/**
 * HOC pour le lazy loading avec fallback
 */
export function withLazyLoading<P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>
) {
  const LazyComponent = lazy(importFunc);

  return function LazyWrapper(props: P) {
    return (
      <Suspense fallback={<LoadingSpinner message="Chargement..." />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

/**
 * Lazy load un composant avec un nom personnalisé
 */
export function lazyLoad<P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  fallbackMessage?: string
) {
  const LazyComponent = lazy(importFunc);

  return function LazyWrapper(props: P) {
    return (
      <Suspense fallback={<LoadingSpinner message={fallbackMessage || "Chargement..."} />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

