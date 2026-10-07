import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Importación de Contextos Globales (Modo Oscuro y Autenticación)
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

// Estilos globales de Bootstrap y personalizados
import './styles/custom.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

/**
 * Punto de entrada principal de la aplicación React.
 * Envuelve la App con los proveedores de Contexto para disponibilizar
 * el tema (Oscuro/Claro) y el estado de Sesión en toda la jerarquía de componentes.
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);