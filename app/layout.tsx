import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"], display: 'swap' });

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "AdminiBox - Centralized SaaS",
  description: "Simplify your administrative life.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AdminiBox",
  },
  formatDetection: {
    telephone: false,
  },
};

import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { QueryProvider } from "@/context/QueryProvider";
import { ThemeProvider } from "@/context/ThemeContext";
import { NetworkProvider } from "@/context/NetworkContext";
import { PersistentNotificationsProvider } from "@/context/PersistentNotificationsContext";
import Navigation from "@/components/Navigation";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";
import ErrorBoundary from "@/components/ErrorBoundary";
import NetworkStatus from "@/components/NetworkStatus";
import PersistentNotifications from "@/components/PersistentNotifications";
import ReminderNotifications from "@/components/ReminderNotifications";
import AutoBackup from "@/components/AutoBackup";
import KeyboardShortcutsHelp from "@/components/KeyboardShortcutsHelp";
import PageTransition from "@/components/PageTransition";
import OnboardingOverlay from "@/components/OnboardingOverlay";
import VoiceManager from "@/components/VoiceManager";
import RealtimeManager from "@/components/RealtimeManager";
import GamifiedCookies from "@/components/GamifiedCookies";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <QueryProvider>
          <ThemeProvider>
            <NetworkProvider>
              <PersistentNotificationsProvider>
                <ErrorBoundary>
                  <AuthProvider>
                    <ToastProvider>
                      <KeyboardShortcuts />
                      <KeyboardShortcutsHelp />
                      <NetworkStatus />
                      <PersistentNotifications />
                      <ReminderNotifications />
                      <AutoBackup />
                      <OnboardingOverlay />
                      <RealtimeManager />
                      <RealtimeManager />
                      <VoiceManager />
                      <GamifiedCookies />
                      <div className="layout-wrapper">
                        <Navigation />
                        <main className="container">
                          <PageTransition>
                            {children}
                          </PageTransition>
                        </main>
                      </div>
                    </ToastProvider>
                  </AuthProvider>
                </ErrorBoundary>
              </PersistentNotificationsProvider>
            </NetworkProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
