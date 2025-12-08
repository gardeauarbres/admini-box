'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { useUserProfile } from '@/lib/queries';
import LoadingSpinner from '@/components/LoadingSpinner';
import PersonalProfileForm from '@/components/PersonalProfileForm';
import ProfessionalProfileForm from '@/components/ProfessionalProfileForm';
import ProfileOverview from '@/components/ProfileOverview';
import AvatarUpload from '@/components/AvatarUpload';
import SecuritySettings from '@/components/SecuritySettings';
import ActivityStats from '@/components/ActivityStats';
import DataExport from '@/components/DataExport';
import UserPreferences from '@/components/UserPreferences';
import EmailNotifications from '@/components/EmailNotifications';

type TabType = 'overview' | 'personal' | 'professional' | 'security' | 'activity' | 'export' | 'preferences' | 'notifications';

export default function ProfilePage() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useUserProfile(user?.$id || null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  if (isLoading) {
    return (
      <ProtectedRoute>
        <LoadingSpinner message="Chargement du profil..." />
      </ProtectedRoute>
    );
  }

  const tabs = [
    { id: 'overview' as TabType, label: '📊 Vue d\'ensemble', icon: '📊' },
    { id: 'personal' as TabType, label: '👤 Personnel', icon: '👤' },
    { id: 'professional' as TabType, label: '💼 Professionnel', icon: '💼' },
    { id: 'security' as TabType, label: '🔐 Sécurité', icon: '🔐' },
    { id: 'activity' as TabType, label: '📈 Activité', icon: '📈' },
    { id: 'preferences' as TabType, label: '⚙️ Préférences', icon: '⚙️' },
    { id: 'notifications' as TabType, label: '📧 Notifications', icon: '📧' },
    { id: 'export' as TabType, label: '📥 Export', icon: '📥' },
  ];

  return (
    <ProtectedRoute>
      <div>
        <header style={{ marginBottom: '3rem' }}>
          <h1 className="section-title">Mon Profil</h1>
          <p style={{ color: 'var(--secondary)' }}>
            Gérez vos informations personnelles et professionnelles
          </p>
        </header>

        {/* En-tête du profil avec avatar */}
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <AvatarUpload 
              currentAvatar={profile?.avatar} 
              size={100}
            />
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                {profile 
                  ? `${profile.firstName} ${profile.lastName}`
                  : user?.name || 'Utilisateur'
                }
              </h2>
              <p style={{ color: 'var(--secondary)', marginBottom: '0.5rem' }}>
                {user?.email}
              </p>
              {profile?.profession && (
                <p style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>
                  💼 {profile.profession}
                  {profile.company && ` chez ${profile.company}`}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          marginBottom: '2rem',
          borderBottom: '2px solid var(--card-border)',
          overflowX: 'auto',
          paddingBottom: '0.5rem'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: activeTab === tab.id ? 'var(--radius) var(--radius) 0 0' : 'var(--radius)',
                borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : 'none',
                marginBottom: activeTab === tab.id ? '-2px' : '0',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenu des onglets */}
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
          {activeTab === 'overview' && (
            <ProfileOverview profile={profile} />
          )}
          {activeTab === 'personal' && (
            <PersonalProfileForm profile={profile} />
          )}
          {activeTab === 'professional' && (
            <ProfessionalProfileForm profile={profile} />
          )}
          {activeTab === 'security' && (
            <SecuritySettings />
          )}
          {activeTab === 'activity' && (
            <ActivityStats />
          )}
          {activeTab === 'preferences' && (
            <UserPreferences />
          )}
          {activeTab === 'notifications' && (
            <EmailNotifications />
          )}
          {activeTab === 'export' && (
            <DataExport />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

