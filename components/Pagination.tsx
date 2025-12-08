'use client';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
}

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange,
  itemsPerPage,
  totalItems
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginTop: '2rem',
      flexWrap: 'wrap',
      gap: '1rem'
    }}>
      <div style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>
        Affichage de {startItem} à {endItem} sur {totalItems}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="btn btn-secondary"
          style={{ 
            padding: '0.5rem 1rem',
            fontSize: '0.85rem',
            opacity: currentPage === 1 ? 0.5 : 1,
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
          }}
        >
          ← Précédent
        </button>

        {getPageNumbers().map((page, index) => (
          page === '...' ? (
            <span key={`ellipsis-${index}`} style={{ padding: '0.5rem', color: 'var(--secondary)' }}>
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={`btn ${currentPage === page ? 'btn-primary' : 'btn-secondary'}`}
              style={{ 
                padding: '0.5rem 0.75rem',
                fontSize: '0.85rem',
                minWidth: '2.5rem'
              }}
            >
              {page}
            </button>
          )
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="btn btn-secondary"
          style={{ 
            padding: '0.5rem 1rem',
            fontSize: '0.85rem',
            opacity: currentPage === totalPages ? 0.5 : 1,
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
          }}
        >
          Suivant →
        </button>
      </div>
    </div>
  );
}

