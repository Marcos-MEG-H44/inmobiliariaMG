import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { InmobiliariaAPI } from '../api/inmobiliariaApi';
import { PropertyCard } from '../components/PropertyCard';
import { PropertyFilter } from '../components/PropertyFilter';
import { PropertyModal } from '../components/PropertyModal';
import { ThemeContext } from '../context/ThemeContext';

/**
 * Vista Principal / Catálogo de Propiedades
 * Integra el banner principal, filtros de búsqueda dinámicos, listado en grilla responsive,
 * vista rápida en modal y redirección a la página de detalle extenso (/propiedad/:id).
 */
export const Home = () => {
  const [propiedades, setPropiedades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [propiedadSeleccionada, setPropiedadSeleccionada] = useState(null);

  // Contexto de tema para ajustar contraste dinámico
  const { darkMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  // Carga inicial de datos al montar el componente
  useEffect(() => {
    cargarPropiedades();
  }, []);

  /**
   * Obtiene la totalidad de propiedades registradas desde el backend
   */
  const cargarPropiedades = async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await InmobiliariaAPI.getPropiedades();
      setPropiedades(data || []);
    } catch (err) {
      console.error('Error al cargar propiedades:', err);
      setError('No se pudo conectar con el servidor. Asegúrate de que el backend Spring Boot esté corriendo en el puerto 8080.');
    } finally {
      setCargando(false);
    }
  };

  /**
   * Maneja el filtrado de propiedades según los parámetros recibidos de PropertyFilter
   */
  const handleBuscar = async (filtros) => {
    setCargando(true);
    setError(null);
    try {
      const data = await InmobiliariaAPI.buscarPropiedades(filtros);
      setPropiedades(data || []);
    } catch (err) {
      console.error('Error al filtrar propiedades:', err);
      setError('Ocurrió un error al procesar los filtros de búsqueda.');
    } finally {
      setCargando(false);
    }
  };

  /**
   * Redirecciona a la página de detalle extendido
   */
  const handleVerDetalleCompleto = (id) => {
    navigate(`/propiedad/${id}`);
  };

  return (
    <>
      {/* Banner Principal con soporte para Modo Oscuro */}
      <header className={`hero-banner text-center py-5 shadow-sm mb-4 ${darkMode ? 'bg-dark text-white border-bottom border-secondary' : 'bg-primary text-white'}`}>
        <div className="container py-3">
          <h1 className="display-4 fw-bold mb-2">Tu próximo hogar está acá</h1>
          <p className="lead opacity-90 m-0">Casas, Departamentos y Terrenos en Coronel Pringles y la región</p>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="container mb-5">
        {/* Componente de Filtros */}
        <PropertyFilter onBuscar={handleBuscar} />

        {/* Encabezado del Listado */}
        <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-2">
          <h3 className={`fw-bold m-0 ${darkMode ? 'text-white' : 'text-dark'}`}>
            Propiedades Disponibles <span className="badge bg-primary rounded-pill fs-6 align-middle ms-2">{propiedades.length}</span>
          </h3>
          <button 
            type="button" 
            className="btn btn-sm btn-outline-secondary rounded-pill"
            onClick={cargarPropiedades}
            title="Recargar listado completó"
          >
            <i className="fa-solid fa-rotate me-1"></i> Restablecer catálogo
          </button>
        </div>

        {/* Estado: Cargando */}
        {cargando && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-3 text-muted fw-semibold">Buscando inmuebles disponible...</p>
          </div>
        )}

        {/* Estado: Error */}
        {error && (
          <div className="alert alert-danger text-center p-4 shadow-sm rounded-3 my-4" role="alert">
            <i className="fa-solid fa-triangle-exclamation fa-2x mb-2 d-block"></i>
            <p className="mb-0 fw-semibold">{error}</p>
            <button className="btn btn-outline-danger btn-sm mt-3 rounded-pill" onClick={cargarPropiedades}>
              Reintentar conexión
            </button>
          </div>
        )}

        {/* Estado: Sin Resultados */}
        {!cargando && !error && propiedades.length === 0 && (
          <div className="text-center py-5 my-4 text-muted">
            <i className="fa-solid fa-house-circle-exclamation fa-4x mb-3 text-secondary"></i>
            <h4>No se encontraron propiedades</h4>
            <p className="mb-3">Intenta ajustando o limpiando los criterios de búsqueda.</p>
            <button className="btn btn-primary rounded-pill btn-sm" onClick={cargarPropiedades}>
              Ver todas las propiedades
            </button>
          </div>
        )}

        {/* Grilla de Tarjetas de Propiedades */}
        {!cargando && !error && propiedades.length > 0 && (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {propiedades.map(prop => (
              <PropertyCard
                key={prop.id}
                propiedad={prop}
                onVerDetalle={(p) => setPropiedadSeleccionada(p)}
                onVerDetalleCompleto={(id) => handleVerDetalleCompleto(id)}
              />
            ))}
          </div>
        )}

        {/* Modal de Detalle Rápido */}
        <PropertyModal
          propiedad={propiedadSeleccionada}
          onClose={() => setPropiedadSeleccionada(null)}
          onVerMasInfo={(id) => {
            setPropiedadSeleccionada(null);
            handleVerDetalleCompleto(id);
          }}
        />
      </main>
    </>
  );
};