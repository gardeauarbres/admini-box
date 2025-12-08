/**
 * Gestionnaire d'erreurs centralisé avec retry
 */

export interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  onRetry?: (attempt: number) => void;
}

/**
 * Exécute une fonction avec retry automatique
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    onRetry
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxRetries) {
        if (onRetry) {
          onRetry(attempt + 1);
        }
        
        // Backoff exponentiel
        const delay = retryDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Unknown error');
}

/**
 * Gère les erreurs Appwrite de manière conviviale
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // Erreurs de connexion
    if (message.includes('network') || message.includes('fetch')) {
      return 'Erreur de connexion. Vérifiez votre connexion internet.';
    }
    
    // Erreurs d'authentification
    if (message.includes('unauthorized') || message.includes('session')) {
      return 'Session expirée. Veuillez vous reconnecter.';
    }
    
    // Erreurs de validation
    if (message.includes('invalid') || message.includes('required')) {
      return 'Données invalides. Vérifiez vos saisies.';
    }
    
    // Erreurs de permissions
    if (message.includes('permission') || message.includes('forbidden')) {
      return 'Vous n\'avez pas les permissions nécessaires.';
    }
    
    // Erreurs de quota
    if (message.includes('quota') || message.includes('limit')) {
      return 'Limite atteinte. Veuillez réessayer plus tard.';
    }
    
    // Message d'erreur par défaut
    return error.message || 'Une erreur s\'est produite.';
  }
  
  return 'Une erreur inattendue s\'est produite.';
}

/**
 * Log les erreurs de manière structurée
 */
export function logError(error: unknown, context?: string) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;
  
  console.error(`[${context || 'Error'}]`, {
    message: errorMessage,
    stack: errorStack,
    timestamp: new Date().toISOString()
  });
}

