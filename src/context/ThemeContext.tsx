import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  matrixEnabled: boolean;
  toggleMatrix: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'io_it_theme';
const MATRIX_STORAGE_KEY = 'io_it_matrix_enabled';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'dark' || stored === 'light') {
        return stored;
      }
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
      }
    } catch (e) {
      console.error('Error reading theme preference:', e);
    }
    return 'dark'; // default to datacenter dark
  });

  const [matrixEnabled, setMatrixEnabled] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(MATRIX_STORAGE_KEY);
      return stored !== null ? stored === 'true' : true;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
        root.style.colorScheme = 'light';
      }
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (e) {
      console.error('Error updating theme classes:', e);
    }
  }, [theme]);

  // Synchronize matrix-mode-active class for intense neon glow styling
  useEffect(() => {
    try {
      const root = document.documentElement;
      if (theme === 'dark' && matrixEnabled) {
        root.classList.add('matrix-mode-active');
      } else {
        root.classList.remove('matrix-mode-active');
      }
      localStorage.setItem(MATRIX_STORAGE_KEY, String(matrixEnabled));
    } catch (e) {
      console.error('Error updating matrix class:', e);
    }
  }, [theme, matrixEnabled]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleMatrix = () => {
    setMatrixEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(MATRIX_STORAGE_KEY, String(next));
      } catch {}
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, matrixEnabled, toggleMatrix }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

