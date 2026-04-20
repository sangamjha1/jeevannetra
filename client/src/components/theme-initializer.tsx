'use client';

import { useEffect } from 'react';

export function ThemeInitializer() {
  useEffect(() => {
    try {
      const theme = localStorage.getItem('hospital-theme') || 'dark';
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return null;
}
