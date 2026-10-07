import React, { useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { DolarWidget } from './DolarWidget';

/**
 * Componente de la Barra de Navegación Superior.
 * Incluye conmutador de Tema (Modo Claro/Oscuro), indicador de cotización Dólar en tiempo real (USD/ARS),
 * acceso restringido por rol al Panel de Administración y gestión de sesión activa.
 */
export const Navbar = () => {
  // Consumo de contextos globales
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const { usuario, logout } = useContext(AuthContext);

  // Verificación de roles administrativos (ADMIN o AGENTE) para habilitar el enlace al Panel
  const esPersonalAdministrativo = usuario && (usuario.rol === 'ADMIN' || usuario.rol === 'AGENTE');

  return (
    <nav className={`navbar navbar-expand-lg sticky-top shadow-sm ${darkMode ? 'navbar-dark bg-dark border-bottom border-secondary' : 'navbar-light bg-white'}`} style={{ zIndex: 1050 }}>
      <div className="container">
        {/* Isologotipo / Marca */}
        <Link className="navbar-brand fw-bold fs-4 d-flex align-items-center" to="/">
          <i className="fa-solid fa-house-chimney text-primary me-2"></i>
          <span>Inmobiliaria <span className="text-primary">MG</span></span>
        </Link>

        {/* Botón Toggler para vista móvil */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Menú de Navegación y Accesos Directos */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-lg-center gap-2">

            {/* Link Público: Búsqueda de Inmuebles */}
            <li className="nav-item">
              <NavLink
                className={({ isActive }) => `nav-link fw-semibold ${isActive ? 'active text-primary' : ''}`}
                to="/"
              >
                <i className="fa-solid fa-magnifying-glass me-1"></i>Buscar Inmuebles
              </NavLink>
            </li>

            {/* Link Restringido: Panel de Administración (Visible únicamente para ADMIN y AGENTE) */}
            {esPersonalAdministrativo && (
              <li className="nav-item ms-lg-2">
                <NavLink
                  className={({ isActive }) => `btn btn-sm ${isActive ? 'btn-primary text-white shadow' : 'btn-outline-primary'} rounded-pill px-3 fw-bold d-flex align-items-center gap-1`}
                  to="/admin"
                >
                  <i className="fa-solid fa-user-gear text-warning me-1"></i>Panel Administración
                </NavLink>
              </li>
            )}

            {/* Selector interactivo Modo Claro / Oscuro */}
            <li className="nav-item ms-lg-2">
              <button
                type="button"
                className={`btn btn-sm rounded-pill d-flex align-items-center gap-2 ${darkMode ? 'btn-outline-light' : 'btn-outline-dark'}`}
                onClick={toggleDarkMode}
                title="Cambiar tema"
              >
                <i className={`fa-solid ${darkMode ? 'fa-sun text-warning' : 'fa-moon text-primary'}`}></i>
                <span className="d-lg-none">{darkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>
              </button>
            </li>

            {/* Indicator de Cotización del Dólar en Tiempo Real */}
            <DolarWidget />

            {/* Gestión de Sesión / Menú de Usuario Autenticado y Rol */}
            <li className="nav-item ms-lg-2">
              {usuario ? (
                <div className="dropdown">
                  <button
                    className="btn btn-sm btn-primary dropdown-toggle rounded-pill px-3 fw-bold d-flex align-items-center gap-2 shadow-sm"
                    type="button"
                    id="dropdownUser"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    {usuario.fotoPerfil ? (
                      <img
                        src={usuario.fotoPerfil}
                        alt="Avatar"
                        className="rounded-circle object-fit-cover border border-white"
                        style={{ width: '22px', height: '22px' }}
                      />
                    ) : (
                      <i className="fa-solid fa-user-circle"></i>
                    )}
                    <span>{usuario.nombre || 'Usuario'}</span>
                  </button>

                  <ul className={`dropdown-menu dropdown-menu-end shadow ${darkMode ? 'dropdown-menu-dark' : ''}`} aria-labelledby="dropdownUser">
                    <li>
                      <span className="dropdown-item-text text-muted small">
                        {usuario.email}
                      </span>
                    </li>
                    <li>
                      <span className="dropdown-item-text text-muted small fw-bold d-flex align-items-center justify-content-between gap-2">
                        Rol:
                        <span className={`badge ${usuario.rol === 'ADMIN' ? 'bg-danger' :
                            usuario.rol === 'AGENTE' ? 'bg-warning text-dark' : 'bg-info text-dark'
                          }`}>
                          {usuario.rol || 'CLIENTE'}
                        </span>
                      </span>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item text-danger" onClick={logout}>
                        <i className="fa-solid fa-right-from-bracket me-2"></i>Cerrar Sesión
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                <Link to="/login" className="btn btn-sm btn-primary text-white rounded-pill px-3 fw-bold shadow-sm d-flex align-items-center gap-1">
                  <i className="fa-solid fa-right-to-bracket me-1"></i>Acceso / Iniciar Sesión
                </Link>
              )}
            </li>

          </ul>
        </div>
      </div>
    </nav>
  );
};