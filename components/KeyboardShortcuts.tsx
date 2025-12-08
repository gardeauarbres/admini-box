'use client';

import { useEffect } from 'react';
import { setupKeyboardShortcuts } from '@/lib/keyboard';

export default function KeyboardShortcuts() {
  useEffect(() => {
    setupKeyboardShortcuts();
  }, []);

  return null;
}

