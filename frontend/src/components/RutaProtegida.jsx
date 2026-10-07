import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * Componente Wrapper para proteger rutas privadas en función de la autenticación
 * y los roles autorizados (ADMIN, AGENTE, CLIENTE).
 */
export const RutaProtegida = ({ children, rolesPermitidos = [] }) => {
    const { usuario, cargando } = useContext(AuthContext);

    if (cargando) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando sesión...</span>
                </div>
            </div>
        );
    }

    // Si no está autenticado, redirige al login
    if (!usuario) {
        return <Navigate to="/login" replace />;
    }

    // Si se definieron roles requeridos y el usuario no coincide, redirige al inicio
    if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(usuario.rol)) {
        return <Navigate to="/" replace />;
    }

    return children;
};