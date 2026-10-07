import React, { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

/**
 * Componente Widget para la visualización de la Cotización del Dólar en Tiempo Real (USD / ARS).
 * Consume la API pública gratuita DolarAPI (https://dolarapi.com/v1/dolares)
 * Muestra valores Oficial y Blue en un badge interactivo con actualización en tiempo real.
 */
export const DolarWidget = () => {
  const { darkMode } = useContext(ThemeContext);

  const [cotizaciones, setCotizaciones] = useState({
    oficial: null,
    blue: null,
    tarjeta: null
  });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);

  /**
   * Consulta las cotizaciones actuales en tiempo real desde DolarAPI
   */
  const obtenerCotizaciones = async () => {
    setCargando(true);
    setError(false);
    try {
      const response = await fetch('https://dolarapi.com/v1/dolares', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) throw new Error('Error al obtener cotización');

      const data = await response.json();
      
      const oficialData = data.find(d => d.casa === 'oficial') || data[0];
      const blueData = data.find(d => d.casa === 'blue') || data[1];
      const tarjetaData = data.find(d => d.casa === 'tarjeta');

      setCotizaciones({
        oficial: oficialData,
        blue: blueData,
        tarjeta: tarjetaData
      });
      setUltimaActualizacion(new Date());
    } catch (err) {
      console.warn('Uso de cotización de contingencia por fallo de red:', err);
      setError(true);
      // Valores por defecto seguros en caso de desconexión de red externa
      setCotizaciones({
        oficial: { compra: 1040, venta: 1080, nombre: 'Oficial' },
        blue: { compra: 1220, venta: 1250, nombre: 'Blue' }
      });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerCotizaciones();

    // Actualización automática cada 5 minutos (300.000 ms)
    const interval = setInterval(obtenerCotizaciones, 300000);
    return () => clearInterval(interval);
  }, []);

  const formatMonto = (valor) => {
    if (valor === undefined || valor === null) return '-';
    return `$${Number(valor).toLocaleString('es-AR')}`;
  };

  return (
    <li className="nav-item ms-lg-2">
      <div className="dropdown">
        <button
          type="button"
          className={`btn btn-sm rounded-pill d-flex align-items-center gap-2 px-3 shadow-sm transition-all ${
            darkMode 
              ? 'btn-dark border border-secondary text-light' 
              : 'btn-light border text-dark'
          }`}
          id="dropdownDolar"
          data-bs-toggle="dropdown"
          aria-expanded="false"
          title="Cotización del Dólar en Argentina (USD/ARS)"
        >
          <span className="badge bg-success bg-opacity-25 text-success rounded-circle p-1 d-flex align-items-center justify-content-center">
            <i className="fa-solid fa-dollar-sign"></i>
          </span>

          {cargando ? (
            <span className="small text-muted">
              <span className="spinner-border spinner-border-sm me-1" role="status" style={{ width: '10px', height: '10px' }}></span>
              Cotizando...
            </span>
          ) : (
            <span className="small fw-semibold d-flex align-items-center gap-2">
              <span>
                <strong className="text-primary">Oficial:</strong> {formatMonto(cotizaciones.oficial?.venta)}
              </span>
              <span className="opacity-50">|</span>
              <span>
                <strong className="text-success">Blue:</strong> {formatMonto(cotizaciones.blue?.venta)}
              </span>
            </span>
          )}

          <i className="fa-solid fa-chevron-down extra-small opacity-50 ms-1"></i>
        </button>

        {/* Menú Desplegable con Detalle Completo de Compra / Venta */}
        <div 
          className={`dropdown-menu dropdown-menu-end p-3 shadow-lg rounded-3 border-0 ${
            darkMode ? 'dropdown-menu-dark bg-dark text-white border border-secondary' : 'bg-white text-dark'
          }`} 
          style={{ width: '260px', zIndex: 1060 }}
          aria-labelledby="dropdownDolar"
        >
          <div className="d-flex align-items-center justify-content-between mb-2 border-bottom pb-2">
            <h6 className="m-0 fw-bold fs-6 d-flex align-items-center gap-2">
              <i className="fa-solid fa-money-bill-transfer text-success"></i>
              <span>Cotización Dólar ARS</span>
            </h6>
            <button 
              type="button" 
              className="btn btn-sm btn-link text-decoration-none p-0" 
              onClick={obtenerCotizaciones}
              title="Actualizar cotizaciones"
            >
              <i className={`fa-solid fa-rotate-right ${cargando ? 'fa-spin text-primary' : 'text-muted'}`}></i>
            </button>
          </div>

          {/* Dólar Oficial */}
          {cotizaciones.oficial && (
            <div className={`p-2 rounded mb-2 ${darkMode ? 'bg-secondary bg-opacity-20' : 'bg-light'}`}>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="fw-bold small text-primary">Dólar Oficial</span>
                <span className="badge bg-primary bg-opacity-10 text-primary extra-small">BCRA</span>
              </div>
              <div className="d-flex justify-content-between text-muted small">
                <span>Compra: <strong>{formatMonto(cotizaciones.oficial.compra)}</strong></span>
                <span>Venta: <strong className="text-dark fw-bold">{formatMonto(cotizaciones.oficial.venta)}</strong></span>
              </div>
            </div>
          )}

          {/* Dólar Blue */}
          {cotizaciones.blue && (
            <div className={`p-2 rounded mb-2 ${darkMode ? 'bg-secondary bg-opacity-20' : 'bg-light'}`}>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="fw-bold small text-success">Dólar Blue</span>
                <span className="badge bg-success bg-opacity-10 text-success extra-small">Libre</span>
              </div>
              <div className="d-flex justify-content-between text-muted small">
                <span>Compra: <strong>{formatMonto(cotizaciones.blue.compra)}</strong></span>
                <span>Venta: <strong className="text-dark fw-bold">{formatMonto(cotizaciones.blue.venta)}</strong></span>
              </div>
            </div>
          )}

          {/* Dólar Tarjeta / Turista (si existiera) */}
          {cotizaciones.tarjeta && (
            <div className={`p-2 rounded mb-2 ${darkMode ? 'bg-secondary bg-opacity-20' : 'bg-light'}`}>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="fw-bold small text-warning">Dólar Tarjeta</span>
              </div>
              <div className="d-flex justify-content-between text-muted small">
                <span>Venta: <strong className="text-dark fw-bold">{formatMonto(cotizaciones.tarjeta.venta)}</strong></span>
              </div>
            </div>
          )}

          <div className="mt-2 text-center">
            <small className="text-muted opacity-75" style={{ fontSize: '0.7rem' }}>
              {error ? 'Cotización estimada' : `Actualizado: ${ultimaActualizacion ? ultimaActualizacion.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recientemente'}`}
            </small>
          </div>
        </div>
      </div>
    </li>
  );
};
