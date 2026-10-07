import React, { useContext, useState } from 'react';
import { ThemeContext } from '../context/ThemeContext';

/**
 * Componente que representa cada inmueble en la grilla pública.
 * Incluye datos clave, insignias de estado, previsualización dinámica de imágenes (soporta backend Spring Boot),
 * funcionalidad para compartir contenido y botones para vista rápida o ficha completa.
 */
export const PropertyCard = ({ propiedad, onVerDetalle, onVerDetalleCompleto }) => {
  const { darkMode } = useContext(ThemeContext);
  const [copiado, setCopiado] = useState(false);

  // Servidor backend donde se alojan las imágenes físicas subidas por el FileStorageService
  const BACKEND_URL = 'http://localhost:8080';

  // Imagen por defecto si la propiedad no cuenta con fotos asociadas
  const defaultImage = 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=600&q=80';
  
  /**
   * Resuelve dinámicamente la portada del inmueble.
   * Prioriza el nuevo modelo de Fotos devuelto por Spring Boot (`foto.url` o `foto.urlFoto`),
   * soporta URLs relativas del backend agregando `http://localhost:8080`,
   * y ofrece fallback seguro si no existen imágenes.
   */
  const obtenerCoverImage = () => {
    if (!propiedad) return defaultImage;

    // 1. Prioridad: Arreglo de entidades FotoPropiedad desde el backend
    if (propiedad.fotos && propiedad.fotos.length > 0) {
      const primeraFoto = propiedad.fotos[0];
      const ruta = primeraFoto.url || primeraFoto.urlFoto || primeraFoto.nombreArchivo;

      if (ruta) {
        // Si la ruta ya incluye protocolo (http/https), se retorna directamente
        if (ruta.startsWith('http')) return ruta;
        // Si la ruta viene relativa (/uploads/propiedades/...), le anteponemos el servidor
        return `${BACKEND_URL}${ruta.startsWith('/') ? '' : '/'}${ruta}`;
      }
    }

    // 2. Segunda opción: Arreglo genérico de strings/base64 de imágenes
    if (propiedad.imagenes && propiedad.imagenes.length > 0) {
      const img = propiedad.imagenes[0];
      if (typeof img === 'string') {
        if (img.startsWith('http') || img.startsWith('data:image')) return img;
        return `${BACKEND_URL}${img.startsWith('/') ? '' : '/'}${img}`;
      }
    }

    // 3. Tercera opción: Campo simple `imagenUrl` legacy
    if (propiedad.imagenUrl) {
      if (propiedad.imagenUrl.startsWith('http')) return propiedad.imagenUrl;
      return `${BACKEND_URL}${propiedad.imagenUrl.startsWith('/') ? '' : '/'}${propiedad.imagenUrl}`;
    }

    // Fallback final
    return defaultImage;
  };

  /**
   * Maneja la acción de compartir contenido mediante la API nativa navigator.share
   * o copiando el enlace al portapapeles como fallback.
   */
  const handleCompartir = (e) => {
    e.stopPropagation();
    const urlPropiedad = `${window.location.origin}/propiedades/${propiedad.id}`;
    const shareData = {
      title: propiedad.titulo,
      text: `¡Mira esta propiedad en alquiler/venta!: ${propiedad.titulo} - ${propiedad.moneda || 'USD'} ${propiedad.precio?.toLocaleString('es-AR')}`,
      url: urlPropiedad,
    };

    if (navigator.share) {
      navigator.share(shareData).catch((err) => console.log('Error al compartir:', err));
    } else {
      navigator.clipboard.writeText(urlPropiedad);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  return (
    <div className="col">
      <div className={`card card-property h-100 shadow-sm position-relative border-0 rounded-3 overflow-hidden ${
        darkMode ? 'bg-dark text-white border border-secondary' : 'bg-white'
      }`}>
        {/* Insignia de Operación (VENTA / ALQUILER) */}
        <span className={`badge position-absolute top-0 start-0 m-3 px-3 py-2 fs-6 shadow-sm ${
          propiedad?.tipoOperacion === 'VENTA' ? 'bg-danger' : 'bg-success'
        }`}>
          {propiedad?.tipoOperacion || 'PROPIEDAD'}
        </span>

        {/* Insignia Opcional de Destacado y Botón Compartir */}
        <div className="position-absolute top-0 end-0 m-3 d-flex gap-2 z-3">
          {propiedad?.destacada && (
            <span className="badge bg-warning text-dark px-3 py-2 fs-6 shadow-sm">
              <i className="fa-solid fa-star me-1"></i>Destacado
            </span>
          )}

          <button 
            type="button" 
            className="btn btn-light btn-sm rounded-circle shadow-sm d-flex align-items-center justify-content-center"
            style={{ width: '32px', height: '32px' }}
            onClick={handleCompartir}
            title="Compartir inmueble"
          >
            <i className={`fa-solid ${copiado ? 'fa-check text-success' : 'fa-share-nodes text-dark'}`}></i>
          </button>
        </div>

        {/* Portada del Inmueble con resolución dinámica y control de fallos */}
        <img
          src={obtenerCoverImage()}
          className="card-img-top object-fit-cover"
          alt={propiedad?.titulo || 'Inmueble'}
          style={{ height: '220px' }}
          onError={(e) => {
            // Manejo de error en caso de que la imagen del backend no exista física o de red
            e.target.onerror = null;
            e.target.src = defaultImage;
          }}
        />

        {/* Cuerpo de la Tarjeta */}
        <div className="card-body d-flex flex-column p-3">
          <h5 className="card-title text-truncate fw-bold mb-1" title={propiedad?.titulo}>
            {propiedad?.titulo || 'Sin título'}
          </h5>

          <p className="text-muted small mb-2 text-truncate">
            <i className="fa-solid fa-location-dot me-1 text-primary"></i>
            {propiedad?.direccion ? `${propiedad.direccion}, ` : ''}{propiedad?.ciudad || 'Ubicación no especificada'}
          </p>

          <p className="price-tag fs-4 fw-bold text-primary mb-3">
            {propiedad?.moneda || 'USD'} {Number(propiedad?.precio || 0).toLocaleString('es-AR')}
          </p>

          {/* Especificaciones Rápidas */}
          <div className={`d-flex justify-content-between text-muted small border-top pt-2 mt-auto ${
            darkMode ? 'border-secondary text-light opacity-75' : ''
          }`}>
            <span><i className="fa-solid fa-door-open me-1"></i>{propiedad?.ambientes ?? '-'} amb</span>
            <span><i className="fa-solid fa-bed me-1"></i>{propiedad?.dormitorios ?? '-'} dorm</span>
            <span><i className="fa-solid fa-bath me-1"></i>{propiedad?.banos ?? '-'} baños</span>
            <span><i className="fa-solid fa-ruler-combined me-1"></i>{propiedad?.superficieTotal ?? '-'} m²</span>
          </div>

          {/* Acciones de Navegación y Modal */}
          <div className="d-flex gap-2 mt-3">
            <button
              onClick={() => onVerDetalle && onVerDetalle(propiedad)}
              className="btn btn-outline-secondary btn-sm flex-fill fw-semibold"
              title="Vista previa rápida"
            >
              <i className="fa-solid fa-eye me-1"></i> Rápida
            </button>

            <button
              onClick={() => onVerDetalleCompleto && onVerDetalleCompleto(propiedad?.id)}
              className="btn btn-primary btn-sm flex-fill fw-bold"
              title="Ver ficha completa de la propiedad"
            >
              Ficha <i className="fa-solid fa-arrow-right ms-1"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};