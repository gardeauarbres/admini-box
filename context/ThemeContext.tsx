'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes';

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

export const useTheme = () => {
  const context = useNextTheme();

  // Shim pour maintenir la compatibilité avec l'ancienne API si nécessaire
  // L'ancienne API avait `toggleTheme`
  const toggleTheme = () => {
    context.setTheme(context.theme === 'dark' ? 'light' : 'dark');
  };

  return {
    ...context,
    toggleTheme,
  };
};
