import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

/**
 * Proveedor del contexto para gestionar la autenticación, registro y sesión del usuario.
 * Sincroniza las credenciales y el estado global con localStorage para mantener la sesión persistente,
 * e incluye 'credentials: include' en las peticiones HTTP para ser compatible con la política CORS del backend.
 */
export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Restaura la sesión guardada en localStorage al iniciar la aplicación
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUsuario(JSON.parse(savedUser));
      } catch (e) {
        console.error('Error al parsear el usuario del localStorage:', e);
        localStorage.removeItem('user');
      }
    }
    setCargando(false);
  }, []);

  /**
   * Petición de inicio de sesión contra el backend en Spring Boot (/api/auth/login)
   */
  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Compatible con la configuración CorsConfiguration.setAllowCredentials(true)
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error en las credenciales');
      }

      const userData = await response.json();
      setUsuario(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  /**
   * Petición para registrar un nuevo usuario (/api/auth/register)
   */
  const registro = async (datosRegistro) => {
    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Compatible con la configuración CorsConfiguration.setAllowCredentials(true)
        body: JSON.stringify(datosRegistro),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al registrar el usuario');
      }

      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  /**
   * Cierra la sesión activa y elimina las credenciales del almacenamiento local
   */
  const logout = () => {
    setUsuario(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ usuario, login, registro, logout, cargando }}>
      {children}
    </AuthContext.Provider>
  );
};