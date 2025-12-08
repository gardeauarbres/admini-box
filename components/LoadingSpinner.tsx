'use client';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({ 
  size = 'medium', 
  message = 'Chargement...',
  fullScreen = false 
}: LoadingSpinnerProps) {
  const sizeMap = {
    small: '1rem',
    medium: '2rem',
    large: '3rem'
  };

  const spinnerSize = sizeMap[size];

  const content = (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      gap: '1rem',
      padding: fullScreen ? '4rem' : '2rem'
    }}>
      <div
        className="spinner"
        style={{
          width: spinnerSize,
          height: spinnerSize,
          border: `3px solid rgba(255, 255, 255, 0.1)`,
          borderTop: `3px solid var(--primary)`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}
      />
      {message && (
        <p style={{ 
          color: 'var(--secondary)', 
          fontSize: '0.9rem',
          margin: 0
        }}>
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {content}
      </div>
    );
  }

  return content;
}

