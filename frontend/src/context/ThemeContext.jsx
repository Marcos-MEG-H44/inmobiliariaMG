import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

/**
 * Proveedor del contexto para gestionar el tema (Modo Oscuro / Modo Claro).
 * Guarda la preferencia en el localStorage del navegador.
 */
export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('bg-dark', 'text-white');
      document.body.setAttribute('data-bs-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('bg-dark', 'text-white');
      document.body.removeAttribute('data-bs-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};