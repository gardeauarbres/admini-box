'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import MagneticButton from '@/components/MagneticButton';

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

        {/* Onglets Animés */}
        <div style={{
          marginBottom: '2rem',
          borderBottom: '1px solid var(--card-border)',
          position: 'relative'
        }}>
          <div style={{
            display: 'flex',
            gap: '1rem',
            overflowX: 'auto',
            paddingBottom: '0.5rem',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}>
            {tabs.map(tab => (
              <MagneticButton key={tab.id} strength={10}>
                <button
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    color: activeTab === tab.id ? 'var(--primary)' : 'var(--secondary)',
                    fontWeight: activeTab === tab.id ? 600 : 500,
                    fontSize: '0.95rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'color 0.2s',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <span>{tab.icon}</span>
                  {tab.label.replace(tab.icon + ' ', '')} {/* Hack pour éviter de dupliquer l'icône si déjà dans le label */}

                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTabUnderline"
                      style={{
                        position: 'absolute',
                        bottom: '-0.5rem',
                        left: 0,
                        right: 0,
                        height: '2px',
                        backgroundColor: 'var(--primary)',
                        borderRadius: '2px'
                      }}
                    />
                  )}
                </button>
              </MagneticButton>
            ))}
          </div>
        </div>

        {/* Contenu des onglets avec transition */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && <ProfileOverview profile={profile} />}
            {activeTab === 'personal' && <PersonalProfileForm profile={profile} />}
            {activeTab === 'professional' && <ProfessionalProfileForm profile={profile} />}
            {activeTab === 'security' && <SecuritySettings />}
            {activeTab === 'activity' && <ActivityStats />}
            {activeTab === 'preferences' && <UserPreferences />}
            {activeTab === 'notifications' && <EmailNotifications />}
            {activeTab === 'export' && <DataExport />}
          </motion.div>
        </AnimatePresence>
      </div>
    </ProtectedRoute>
  );
}

