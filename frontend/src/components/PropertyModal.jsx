import React, { useContext, useState, useEffect } from 'react';
import { ThemeContext } from '../context/ThemeContext';

/**
 * Modal emergente con la previsualización rápida de la propiedad seleccionada.
 * Soporta galería de fotos devueltas por Spring Boot (servidor local),
 * resumen de especificaciones, descripción y ficha del agente.
 */
export const PropertyModal = ({ propiedad, onClose, onVerMasInfo }) => {
  const { darkMode } = useContext(ThemeContext);
  const [fotoSeleccionadaIndex, setFotoSeleccionadaIndex] = useState(0);

  // Servidor backend donde se alojan las imágenes físicas subidas por Spring Boot
  const BACKEND_URL = 'http://localhost:8080';

  // Imagen por defecto en caso de no poseer multimedia registrada
  const defaultImage = 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=600&q=80';

  // Reiniciar el índice de la foto seleccionada al cambiar de propiedad
  useEffect(() => {
    setFotoSeleccionadaIndex(0);
  }, [propiedad]);

  if (!propiedad) return null;

  /**
   * Resuelve la lista completa de URLs de fotos de la propiedad.
   * Procesa tanto el listado `fotos` del backend como fallbacks legados.
   */
  const obtenerListaFotos = () => {
    const lista = [];

    // 1. Arreglo de FotoPropiedad devuelto por Spring Boot
    if (propiedad.fotos && propiedad.fotos.length > 0) {
      propiedad.fotos.forEach((foto) => {
        const ruta = foto.url || foto.urlFoto || foto.nombreArchivo;
        if (ruta) {
          lista.push(ruta.startsWith('http') ? ruta : `${BACKEND_URL}${ruta.startsWith('/') ? '' : '/'}${ruta}`);
        }
      });
    }

    // 2. Arreglo de cadenas/base64 legacy si existiera
    if (lista.length === 0 && propiedad.imagenes && propiedad.imagenes.length > 0) {
      propiedad.imagenes.forEach((img) => {
        if (typeof img === 'string') {
          lista.push(img.startsWith('http') || img.startsWith('data:image') ? img : `${BACKEND_URL}${img.startsWith('/') ? '' : '/'}${img}`);
        }
      });
    }

    // 3. Campo simple `imagenUrl` legacy
    if (lista.length === 0 && propiedad.imagenUrl) {
      const ruta = propiedad.imagenUrl;
      lista.push(ruta.startsWith('http') ? ruta : `${BACKEND_URL}${ruta.startsWith('/') ? '' : '/'}${ruta}`);
    }

    // Fallback: Si no tiene imágenes, retornar lista con la imagen por defecto
    return lista.length > 0 ? lista : [defaultImage];
  };

  const listaFotos = obtenerListaFotos();
  const fotoActual = listaFotos[fotoSeleccionadaIndex] || defaultImage;

  return (
    <div 
      className="modal fade show d-block" 
      tabIndex="-1" 
      style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1055 }}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className={`modal-content shadow-lg border-0 ${
          darkMode ? 'bg-dark text-white border border-secondary' : 'bg-white'
        }`}>
          {/* Encabezado del Modal */}
          <div className="modal-header bg-dark text-white border-bottom border-secondary">
            <h5 className="modal-title fw-bold text-truncate me-2">{propiedad.titulo || 'Detalle de la propiedad'}</h5>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={onClose}
              aria-label="Cerrar modal"
            ></button>
          </div>

          {/* Cuerpo del Modal */}
          <div className="modal-body p-4">
            {/* Visor de Imagen Principal */}
            <div className="position-relative mb-2">
              <img 
                src={fotoActual} 
                alt={propiedad.titulo} 
                className="img-fluid rounded w-100 object-fit-cover shadow-sm" 
                style={{ maxHeight: '360px' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = defaultImage;
                }}
              />
              <span className={`badge position-absolute top-0 start-0 m-3 px-3 py-2 fs-6 ${
                propiedad.tipoOperacion === 'VENTA' ? 'bg-danger' : 'bg-success'
              }`}>
                {propiedad.tipoOperacion || 'PROPIEDAD'}
              </span>
            </div>

            {/* Galería de Miniaturas (si hay más de una foto) */}
            {listaFotos.length > 1 && (
              <div className="d-flex gap-2 overflow-auto mb-3 pb-1">
                {listaFotos.map((fotoUrl, idx) => (
                  <img
                    key={idx}
                    src={fotoUrl}
                    alt={`Miniatura ${idx + 1}`}
                    className={`rounded border ${idx === fotoSeleccionadaIndex ? 'border-primary border-3' : 'opacity-75'}`}
                    style={{ width: '70px', height: '50px', objectFit: 'cover', cursor: 'pointer' }}
                    onClick={() => setFotoSeleccionadaIndex(idx)}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = defaultImage;
                    }}
                  />
                ))}
              </div>
            )}

            {/* Precio y Ubicación */}
            <div className="row g-2 mb-4 align-items-center border-bottom pb-3">
              <div className="col-12 col-md-6">
                <h3 className="m-0 text-primary fw-bold">
                  {propiedad.moneda || 'USD'} {Number(propiedad.precio || 0).toLocaleString('es-AR')}
                </h3>
              </div>
              <div className="col-12 col-md-6 text-md-end text-muted small">
                <i className="fa-solid fa-location-dot me-1 text-primary"></i>
                {propiedad.direccion}{propiedad.ciudad ? `, ${propiedad.ciudad}` : ''}{propiedad.provincia ? `, ${propiedad.provincia}` : ''}
              </div>
            </div>

            {/* Descripción */}
            <div className="mb-4">
              <h6 className="fw-bold border-bottom pb-2">Descripción General</h6>
              <p className={`mb-0 ${darkMode ? 'text-light opacity-75' : 'text-secondary'}`} style={{ whiteSpace: 'pre-line' }}>
                {propiedad.descripcion || 'Sin descripción detallada disponible para esta propiedad.'}
              </p>
            </div>

            {/* Ficha de Características Rápidas */}
            <h6 className="fw-bold border-bottom pb-2">Especificaciones Principales</h6>
            <div className="row g-2 text-center mb-4">
              <div className="col-4 col-sm-2">
                <div className={`p-2 rounded border ${darkMode ? 'bg-secondary bg-opacity-20 border-secondary' : 'bg-light'}`}>
                  <small className="text-muted d-block small">Tipo</small>
                  <strong className="small">{propiedad.tipoPropiedad || '-'}</strong>
                </div>
              </div>
              <div className="col-4 col-sm-2">
                <div className={`p-2 rounded border ${darkMode ? 'bg-secondary bg-opacity-20 border-secondary' : 'bg-light'}`}>
                  <small className="text-muted d-block small">Ambientes</small>
                  <strong>{propiedad.ambientes ?? '-'}</strong>
                </div>
              </div>
              <div className="col-4 col-sm-2">
                <div className={`p-2 rounded border ${darkMode ? 'bg-secondary bg-opacity-20 border-secondary' : 'bg-light'}`}>
                  <small className="text-muted d-block small">Dormitorios</small>
                  <strong>{propiedad.dormitorios ?? '-'}</strong>
                </div>
              </div>
              <div className="col-4 col-sm-2">
                <div className={`p-2 rounded border ${darkMode ? 'bg-secondary bg-opacity-20 border-secondary' : 'bg-light'}`}>
                  <small className="text-muted d-block small">Baños</small>
                  <strong>{propiedad.banos ?? '-'}</strong>
                </div>
              </div>
              <div className="col-4 col-sm-2">
                <div className={`p-2 rounded border ${darkMode ? 'bg-secondary bg-opacity-20 border-secondary' : 'bg-light'}`}>
                  <small className="text-muted d-block small">Sup. Cub.</small>
                  <strong>{propiedad.superficieCubierta ? `${propiedad.superficieCubierta} m²` : '-'}</strong>
                </div>
              </div>
              <div className="col-4 col-sm-2">
                <div className={`p-2 rounded border ${darkMode ? 'bg-secondary bg-opacity-20 border-secondary' : 'bg-light'}`}>
                  <small className="text-muted d-block small">Sup. Total</small>
                  <strong>{propiedad.superficieTotal ? `${propiedad.superficieTotal} m²` : '-'}</strong>
                </div>
              </div>
            </div>

            {/* Información del Agente de Contacto */}
            {propiedad.agente && (
              <div className={`alert p-3 mb-0 d-flex align-items-center ${
                darkMode ? 'alert-dark border-secondary' : 'alert-info'
              }`}>
                <i className="fa-solid fa-user-tie fa-2x me-3 text-primary"></i>
                <div>
                  <div className="fw-bold">Agente Responsable: {propiedad.agente.nombre} {propiedad.agente.apellido}</div>
                  <small className="d-block text-muted">
                    <i className="fa-solid fa-phone me-1"></i>
                    {propiedad.agente.telefono || 'Atención personalizada disponible'}
                  </small>
                </div>
              </div>
            )}
          </div>

          {/* Pie del Modal con Acciones */}
          <div className={`modal-footer ${darkMode ? 'border-secondary' : ''}`}>
            <button type="button" className="btn btn-secondary rounded-pill btn-sm px-3" onClick={onClose}>
              Cerrar
            </button>
            {onVerMasInfo && (
              <button 
                type="button" 
                className="btn btn-primary rounded-pill btn-sm px-4 fw-bold"
                onClick={() => onVerMasInfo(propiedad.id)}
              >
                Ver Ficha Completa <i className="fa-solid fa-arrow-right ms-1"></i>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};