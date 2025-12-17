import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'system';

export function useTheme(initial?: Theme) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (initial) return initial;
    return (localStorage.getItem('leafy-theme') as Theme) || 'system';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const applyTheme = () => {
      const isDark =
        theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

      if (isDark) root.classList.add('dark');
      else root.classList.remove('dark');
    };

    applyTheme();
    try { localStorage.setItem('leafy-theme', theme); } catch {}

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [theme]);

  return [theme, setTheme] as const;
}

export default useTheme;
