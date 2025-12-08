'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useUserProfile } from '@/lib/queries';

interface ShareOrganismProps {
  organismId: string;
  organismName: string;
  onClose: () => void;
}

export default function ShareOrganism({ organismId, organismName, onClose }: ShareOrganismProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { data: profile } = useUserProfile(user?.$id || null);
  const [shareMethod, setShareMethod] = useState<'link' | 'email'>('link');
  const [email, setEmail] = useState('');
  const [copied, setCopied] = useState(false);

  const shareLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/share/organism/${organismId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    showToast('Lien copié dans le presse-papiers', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareByEmail = () => {
    if (!email.trim()) {
      showToast('Veuillez entrer une adresse email', 'error');
      return;
    }

    const subject = encodeURIComponent(`Partage d'organisme: ${organismName}`);
    const body = encodeURIComponent(
      `Bonjour,\n\nJe souhaite partager avec vous l'organisme "${organismName}" depuis AdminiBox.\n\n` +
      `Lien: ${shareLink}\n\n` +
      `Cordialement,\n${profile?.firstName || user?.name || 'Utilisateur'}`
    );

    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    showToast('Email prêt à être envoyé', 'success');
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          maxWidth: '500px',
          width: '100%',
          padding: '2rem',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>🔗 Partager "{organismName}"</h3>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '0.5rem 1rem' }}
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        {/* Méthode de partage */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <button
              onClick={() => setShareMethod('link')}
              className={`btn ${shareMethod === 'link' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1, padding: '0.75rem' }}
            >
              📋 Lien
            </button>
            <button
              onClick={() => setShareMethod('email')}
              className={`btn ${shareMethod === 'email' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1, padding: '0.75rem' }}
            >
              📧 Email
            </button>
          </div>

          {shareMethod === 'link' ? (
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--secondary)' }}>
                Lien de partage
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: 'var(--radius)',
                    background: 'var(--input-bg)',
                    border: '1px solid var(--input-border)',
                    color: 'var(--foreground)',
                    fontSize: '0.85rem',
                  }}
                />
                <button
                  onClick={handleCopyLink}
                  className={`btn ${copied ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.75rem 1.5rem' }}
                >
                  {copied ? '✓ Copié' : '📋 Copier'}
                </button>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginTop: '0.5rem' }}>
                Partagez ce lien pour donner accès à cet organisme
              </p>
            </div>
          ) : (
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--secondary)' }}>
                Adresse email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius)',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  color: 'var(--foreground)',
                  fontSize: '0.85rem',
                  marginBottom: '0.5rem',
                }}
              />
              <button
                onClick={handleShareByEmail}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem' }}
                disabled={!email.trim()}
              >
                📧 Ouvrir le client email
              </button>
              <p style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginTop: '0.5rem' }}>
                Un email sera préparé avec le lien de partage
              </p>
            </div>
          )}
        </div>

        {/* Options de partage */}
        <div style={{ 
          padding: '1rem', 
          background: 'var(--form-bg)', 
          borderRadius: 'var(--radius)',
          marginTop: '1rem'
        }}>
          <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', fontWeight: 600 }}>
            Options de partage
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked style={{ cursor: 'pointer' }} />
              <span>Permettre la modification</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked style={{ cursor: 'pointer' }} />
              <span>Inclure les notes et pièces jointes</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" style={{ cursor: 'pointer' }} />
              <span>Lien expirable (7 jours)</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

