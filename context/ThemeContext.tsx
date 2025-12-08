'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // Initialiser avec le thème par défaut ou depuis localStorage
  const getInitialTheme = (): Theme => {
    if (typeof window === 'undefined') return 'dark';
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme) return savedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [mounted, setMounted] = useState(false);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    if (newTheme === 'light') {
      root.style.setProperty('--background', '#f8fafc');
      root.style.setProperty('--foreground', '#0f172a');
      root.style.setProperty('--card-bg', 'rgba(255, 255, 255, 0.9)');
      root.style.setProperty('--card-border', 'rgba(0, 0, 0, 0.1)');
      root.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.8)');
      root.style.setProperty('--glass-border', 'rgba(0, 0, 0, 0.08)');
      root.style.setProperty('--secondary', '#475569');
      root.style.setProperty('--input-bg', 'rgba(255, 255, 255, 0.9)');
      root.style.setProperty('--input-border', 'rgba(0, 0, 0, 0.15)');
      root.style.setProperty('--button-secondary-bg', 'rgba(0, 0, 0, 0.05)');
      root.style.setProperty('--button-secondary-hover', 'rgba(0, 0, 0, 0.1)');
      root.style.setProperty('--form-bg', 'rgba(0, 0, 0, 0.03)');
      root.style.setProperty('--title-gradient-start', '#0f172a');
      root.style.setProperty('--title-gradient-end', '#475569');
    } else {
      root.style.setProperty('--background', '#0f172a');
      root.style.setProperty('--foreground', '#f8fafc');
      root.style.setProperty('--card-bg', 'rgba(30, 41, 59, 0.7)');
      root.style.setProperty('--card-border', 'rgba(148, 163, 184, 0.1)');
      root.style.setProperty('--glass-bg', 'rgba(15, 23, 42, 0.6)');
      root.style.setProperty('--glass-border', 'rgba(255, 255, 255, 0.05)');
      root.style.setProperty('--secondary', '#64748b');
      root.style.setProperty('--input-bg', 'rgba(255, 255, 255, 0.05)');
      root.style.setProperty('--input-border', 'rgba(148, 163, 184, 0.2)');
      root.style.setProperty('--button-secondary-bg', 'rgba(255, 255, 255, 0.1)');
      root.style.setProperty('--button-secondary-hover', 'rgba(255, 255, 255, 0.15)');
      root.style.setProperty('--form-bg', 'rgba(255, 255, 255, 0.05)');
      root.style.setProperty('--title-gradient-start', '#f8fafc');
      root.style.setProperty('--title-gradient-end', '#94a3b8');
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  // Appliquer le thème initial au montage
  useEffect(() => {
    applyTheme(theme);
    setMounted(true);
  }, []);

  // Toujours retourner le Provider pour que useTheme fonctionne
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

