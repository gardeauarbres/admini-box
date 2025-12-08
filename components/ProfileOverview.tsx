'use client';

import { useMemo } from 'react';
import type { UserProfile } from '@/lib/queries';
import { formatDate } from '@/lib/utils';

interface ProfileOverviewProps {
  profile: UserProfile | null | undefined;
}

export default function ProfileOverview({ profile }: ProfileOverviewProps) {
  const completion = useMemo(() => {
    if (!profile) return 0;
    
    let completed = 0;
    const total = 15;
    
    // Personnel (7 champs)
    if (profile.firstName) completed++;
    if (profile.lastName) completed++;
    if (profile.birthDate) completed++;
    if (profile.phone) completed++;
    if (profile.bio) completed++;
    if (profile.address?.city) completed++;
    if (profile.avatar) completed++;
    
    // Professionnel (8 champs)
    if (profile.profession) completed++;
    if (profile.company) completed++;
    if (profile.professionalEmail) completed++;
    if (profile.professionalPhone) completed++;
    if (profile.website) completed++;
    if (profile.sector) completed++;
    if (profile.status) completed++;
    if (profile.jobDescription) completed++;
    
    return Math.round((completed / total) * 100);
  }, [profile]);

  if (!profile) {
    return (
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
        <h3 style={{ marginBottom: '1rem' }}>Bienvenue ! 👋</h3>
        <p style={{ color: 'var(--secondary)', marginBottom: '2rem' }}>
          Commencez par remplir vos informations personnelles et professionnelles
        </p>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem' 
        }}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👤</div>
            <h4 style={{ marginBottom: '0.5rem' }}>Profil Personnel</h4>
            <p style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>
              Ajoutez vos informations personnelles
            </p>
          </div>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💼</div>
            <h4 style={{ marginBottom: '0.5rem' }}>Profil Professionnel</h4>
            <p style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>
              Complétez vos informations professionnelles
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: '2rem' }}>
      {/* Barre de progression */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem' }}>Complétude du profil</h3>
          <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>
            {completion}%
          </span>
        </div>
        <div style={{
          width: '100%',
          height: '12px',
          background: 'var(--card-bg)',
          borderRadius: '999px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${completion}%`,
            height: '100%',
            background: completion === 100 
              ? 'linear-gradient(90deg, var(--success), var(--primary))'
              : 'linear-gradient(90deg, var(--primary), var(--accent))',
            transition: 'width 0.5s ease',
            borderRadius: '999px'
          }} />
        </div>
      </div>

      {/* Informations personnelles */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          👤 Informations Personnelles
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <div>
            <div style={{ color: 'var(--secondary)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Nom complet</div>
            <div style={{ fontWeight: 500 }}>
              {profile.firstName} {profile.lastName}
            </div>
          </div>
          {profile.birthDate && (
            <div>
              <div style={{ color: 'var(--secondary)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Date de naissance</div>
              <div>{formatDate(profile.birthDate)}</div>
            </div>
          )}
          {profile.phone && (
            <div>
              <div style={{ color: 'var(--secondary)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Téléphone</div>
              <div>{profile.phone}</div>
            </div>
          )}
          {profile.address?.city && (
            <div>
              <div style={{ color: 'var(--secondary)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Adresse</div>
              <div>
                {profile.address.street && `${profile.address.street}, `}
                {profile.address.postalCode} {profile.address.city}
                {profile.address.country && `, ${profile.address.country}`}
              </div>
            </div>
          )}
          {profile.bio && (
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ color: 'var(--secondary)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Bio</div>
              <div style={{ fontStyle: 'italic', color: 'var(--secondary)' }}>{profile.bio}</div>
            </div>
          )}
        </div>
      </div>

      {/* Informations professionnelles */}
      {(profile.profession || profile.company) && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            💼 Informations Professionnelles
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            {profile.profession && (
              <div>
                <div style={{ color: 'var(--secondary)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Profession</div>
                <div style={{ fontWeight: 500 }}>{profile.profession}</div>
              </div>
            )}
            {profile.company && (
              <div>
                <div style={{ color: 'var(--secondary)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Entreprise</div>
                <div>{profile.company}</div>
              </div>
            )}
            {profile.professionalEmail && (
              <div>
                <div style={{ color: 'var(--secondary)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Email professionnel</div>
                <div>{profile.professionalEmail}</div>
              </div>
            )}
            {profile.website && (
              <div>
                <div style={{ color: 'var(--secondary)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Site web</div>
                <a 
                  href={profile.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: 'var(--primary)', textDecoration: 'underline' }}
                >
                  {profile.website}
                </a>
              </div>
            )}
            {profile.sector && (
              <div>
                <div style={{ color: 'var(--secondary)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Secteur</div>
                <div>{profile.sector}</div>
              </div>
            )}
            {profile.status && (
              <div>
                <div style={{ color: 'var(--secondary)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Statut</div>
                <div>
                  {profile.status === 'employee' && 'Salarié'}
                  {profile.status === 'freelancer' && 'Indépendant'}
                  {profile.status === 'retired' && 'Retraité'}
                  {profile.status === 'student' && 'Étudiant'}
                  {profile.status === 'other' && 'Autre'}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

