/**
 * Utilitaires pour la navigation au clavier
 */

/**
 * Raccourcis clavier globaux
 */
export function setupKeyboardShortcuts() {
  if (typeof window === 'undefined') return;

  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K pour la recherche globale
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      // Focus sur la barre de recherche globale si disponible
      const globalSearch = document.querySelector('[data-global-search]') as HTMLInputElement;
      if (globalSearch) {
        globalSearch.focus();
        globalSearch.select();
      } else {
        // Sinon, chercher n'importe quelle barre de recherche
        const searchInput = document.querySelector('input[type="text"][placeholder*="Rechercher"], input[type="text"][placeholder*="rechercher"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }
    }

    // Ctrl/Cmd + N pour nouveau (ajouter un organisme)
    if ((e.ctrlKey || e.metaKey) && e.key === 'n' && !e.shiftKey) {
      e.preventDefault();
      const addButton = document.querySelector('[data-add-organism]') as HTMLButtonElement;
      if (addButton) {
        addButton.click();
      }
    }

    // Ctrl/Cmd + Shift + N pour templates
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'N') {
      e.preventDefault();
      const templatesButton = document.querySelector('[data-templates-button]') as HTMLButtonElement;
      if (templatesButton) {
        templatesButton.click();
      }
    }

    // Ctrl/Cmd + E pour exporter
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
      e.preventDefault();
      const exportButton = document.querySelector('[data-export-button]') as HTMLButtonElement;
      if (exportButton) {
        exportButton.click();
      }
    }

    // Échap pour fermer les modales/formulaires
    if (e.key === 'Escape') {
      // Fermer les formulaires ouverts
      const forms = document.querySelectorAll('form[style*="display"], [data-modal]');
      forms.forEach(form => {
        const formElement = form as HTMLElement;
        if (formElement.style.display !== 'none' && formElement.style.display !== '') {
          const cancelButton = formElement.querySelector('button[type="button"], [data-close]') as HTMLButtonElement;
          if (cancelButton) {
            cancelButton.click();
          }
        }
      });
    }

    // ? pour afficher l'aide des raccourcis
    if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const helpButton = document.querySelector('[data-help-shortcuts]') as HTMLButtonElement;
      if (helpButton) {
        helpButton.click();
      }
    }
  });
}

/**
 * Navigation au clavier dans les listes
 */
export function handleListKeyboardNavigation(
  e: React.KeyboardEvent,
  currentIndex: number,
  totalItems: number,
  onSelect: (index: number) => void
) {
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      onSelect(Math.min(currentIndex + 1, totalItems - 1));
      break;
    case 'ArrowUp':
      e.preventDefault();
      onSelect(Math.max(currentIndex - 1, 0));
      break;
    case 'Home':
      e.preventDefault();
      onSelect(0);
      break;
    case 'End':
      e.preventDefault();
      onSelect(totalItems - 1);
      break;
  }
}

