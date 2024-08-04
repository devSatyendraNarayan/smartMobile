// src/context/ThemeContext.js
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('theme');
      return savedTheme || 'light';
    } catch (error) {
      console.error('Failed to retrieve theme from localStorage:', error);
      return 'light';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('theme', theme);
    } catch (error) {
      console.error('Failed to save theme to localStorage:', error);
    }
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  const contextValue = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
