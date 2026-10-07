import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importación de Proveedores de Contexto Global (Tema y Autenticación)
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

// Importación de componentes compartidos
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ChatWidget } from './components/ChatWidget';

// Importación de las páginas principales
import { Home } from './pages/Home';
import { Admin } from './pages/Admin';
import { Login } from './pages/Login';
import { PropertyDetail } from './pages/PropertyDetail';

/**
 * Componente Principal (App)
 * Configura los proveedores de estado global, el enrutamiento general de la SPA
 * y la estructura de layout flexible (Navbar + Contenido dinámico + ChatWidget + Footer).
 */
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          {/* Layout en columna de altura completa para mantener el Footer al final */}
          <div className="d-flex flex-column min-vh-100">
            {/* Barra de navegación superior */}
            <Navbar />

            {/* Contenedor principal expandible */}
            <div className="flex-grow-1">
              <Routes>
                {/* Ruta principal pública: Catálogo y Búsqueda de Inmuebles */}
                <Route path="/" element={<Home />} />

                {/* Ruta de autenticación: Inicio de sesión y Registro */}
                <Route path="/login" element={<Login />} />

                {/* Ruta de gestión: Panel de Administración para Agentes */}
                <Route path="/admin" element={<Admin />} />

                {/* Ruta de detalle: Vista extendida de un inmueble específico por ID */}
                <Route path="/propiedad/:id" element={<PropertyDetail />} />
              </Routes>
            </div>

            {/* Widget flotante de soporte / Chat en Vivo vía WebSockets */}
            <ChatWidget />

            {/* Pie de página general */}
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;