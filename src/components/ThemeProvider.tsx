import { useEffect, useState, createContext, useContext, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';

type Theme = 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'dark' | 'light';
  persistTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  setTheme: () => {},
  resolvedTheme: 'dark',
  persistTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('resona_theme');
    if (saved && (saved === 'dark' || saved === 'light' || saved === 'system')) {
      return saved as Theme;
    }
    const userTheme = useAuthStore.getState().user?.preferences?.theme;
    if (userTheme && (userTheme === 'dark' || userTheme === 'light' || userTheme === 'system')) {
      return userTheme as Theme;
    }
    return 'dark';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('dark');

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('resona_theme', newTheme);
  }, []);

  const persistTheme = useCallback(() => {
    localStorage.setItem('resona_theme', theme);
  }, [theme]);

  // Sync theme if auth user changes and has preferences
  useEffect(() => {
    const unsub = useAuthStore.subscribe((state) => {
      const prefTheme = state.user?.preferences?.theme;
      if (prefTheme && (prefTheme === 'dark' || prefTheme === 'light' || prefTheme === 'system')) {
        setThemeState(prefTheme as Theme);
        localStorage.setItem('resona_theme', prefTheme);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const resolveTheme = () => {
      if (theme === 'system') {
        setResolvedTheme(mediaQuery.matches ? 'dark' : 'light');
      } else {
        setResolvedTheme(theme);
      }
    };

    resolveTheme();

    const handler = () => resolveTheme();
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(resolvedTheme);
    localStorage.setItem('resona_theme', theme);
  }, [resolvedTheme, theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme, persistTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
