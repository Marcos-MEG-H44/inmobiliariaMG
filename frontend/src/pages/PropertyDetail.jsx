import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { InmobiliariaAPI } from '../api/inmobiliariaApi';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';

/**
 * Vista detallada de una propiedad específica (/propiedad/:id)
 * Muestra información completa, galería de fotos y ficha del agente responsable.
 */
export const PropertyDetail = () => {
  const { id } = useParams();
  const { darkMode } = useContext(ThemeContext);
  const { usuario } = useContext(AuthContext);

  const [propiedad, setPropiedad] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiado, setCopiado] = useState(false);

  // Estado para el formulario directo de consulta
  const [mensajeConsulta, setMensajeConsulta] = useState({
    nombre: usuario ? `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim() : '',
    email: usuario?.email || '',
    telefono: usuario?.telefono || '',
    mensaje: ''
  });
  const [enviandoConsulta, setEnviandoConsulta] = useState(false);
  const [consultaEnviada, setConsultaEnviada] = useState(false);
  const [errorConsulta, setErrorConsulta] = useState(null);

  const BACKEND_URL = 'http://localhost:8080';
  const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1000&q=80';

  const [indiceFoto, setIndiceFoto] = useState(0);

  // Helper para convertir rutas relativas en URLs absolutas de Spring Boot
  const resolverUrlImagen = (ruta) => {
    if (!ruta) return DEFAULT_IMAGE;
    if (typeof ruta === 'object') {
      ruta = ruta.urlFoto || ruta.url || ruta.nombreArchivo;
    }
    if (!ruta) return DEFAULT_IMAGE;
    if (ruta.startsWith('http://') || ruta.startsWith('https://') || ruta.startsWith('blob:') || ruta.startsWith('data:image')) {
      return ruta;
    }
    return `${BACKEND_URL}${ruta.startsWith('/') ? '' : '/'}${ruta}`;
  };

  // Obtener lista unificada de imágenes con URLs resueltas
  const galeriaFotos = useMemo(() => {
    if (!propiedad) return [DEFAULT_IMAGE];

    let lista = [];
    if (propiedad.fotos && propiedad.fotos.length > 0) {
      lista = propiedad.fotos.map(f => resolverUrlImagen(f));
    } else if (propiedad.imagenes && propiedad.imagenes.length > 0) {
      lista = propiedad.imagenes.map(f => resolverUrlImagen(f));
    } else if (propiedad.imagenUrl) {
      lista = [resolverUrlImagen(propiedad.imagenUrl)];
    }

    return lista.length > 0 ? lista : [DEFAULT_IMAGE];
  }, [propiedad]);

  // Imagen activa según el índice actual
  const imagenSeleccionada = galeriaFotos[indiceFoto] || galeriaFotos[0] || DEFAULT_IMAGE;

  // Funciones de navegación del carrusel (Anterior / Siguiente)
  const handleAnterior = () => {
    setIndiceFoto(prev => (prev === 0 ? galeriaFotos.length - 1 : prev - 1));
  };

  const handleSiguiente = () => {
    setIndiceFoto(prev => (prev === galeriaFotos.length - 1 ? 0 : prev + 1));
  };

  // Carga de la propiedad desde la API REST
  useEffect(() => {
    let isMounted = true;

    const cargarDetallePropiedad = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await InmobiliariaAPI.getPropiedadPorId(id);
        
        if (!isMounted) return;

        if (!data) {
          setError('La propiedad solicitada no existe o no se encuentra disponible.');
          setLoading(false);
          return;
        }

        setPropiedad(data);
        setIndiceFoto(0);
      } catch (err) {
        if (isMounted) {
          console.error('Error al cargar la propiedad:', err);
          setError('No se pudo conectar con el servidor para obtener los detalles de la propiedad.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    cargarDetallePropiedad();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Copia la URL actual al portapapeles
  const copiarEnlace = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  // Autocompletar datos del usuario autenticado
  useEffect(() => {
    if (usuario) {
      setMensajeConsulta(prev => ({
        ...prev,
        nombre: prev.nombre || `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim(),
        email: prev.email || usuario.email || '',
        telefono: prev.telefono || usuario.telefono || ''
      }));
    }
  }, [usuario]);

  // Manejador del formulario de consulta
  const handleConsultaChange = (e) => {
    const { name, value } = e.target;
    setMensajeConsulta(prev => ({ ...prev, [name]: value }));
  };

  const handleEnviarConsulta = async (e) => {
    e.preventDefault();
    setEnviandoConsulta(true);
    setErrorConsulta(null);

    try {
      const ubicacionTexto = `${propiedad?.direccion || ''}${propiedad?.ciudad ? ', ' + propiedad.ciudad : ''}`;
      const mensajeFinal = mensajeConsulta.mensaje ||
        `Hola, me interesa la propiedad "${propiedad?.titulo || 'Inmueble'}" ubicada en ${ubicacionTexto} (Ref: #${id}). Quisiera recibir más información y coordinar una visita.`;

      const payload = {
        propiedadId: Number(id),
        nombreContacto: mensajeConsulta.nombre,
        emailContacto: mensajeConsulta.email,
        telefonoContacto: mensajeConsulta.telefono,
        mensaje: mensajeFinal,
        origen: 'WEB',
        clienteId: usuario?.id || null
      };

      await InmobiliariaAPI.crearConsulta(payload);

      setConsultaEnviada(true);
      setMensajeConsulta({
        nombre: usuario ? `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim() : '',
        email: usuario?.email || '',
        telefono: usuario?.telefono || '',
        mensaje: ''
      });
      setTimeout(() => setConsultaEnviada(false), 6000);
    } catch (err) {
      console.error('Error al enviar la consulta:', err);
      setErrorConsulta('No se pudo enviar la consulta. Intenta nuevamente.');
    } finally {
      setEnviandoConsulta(false);
    }
  };

  // Datos del Agente con mapeo exacto de fotoPerfil y fallback seguro
  const agente = useMemo(() => {
    const defaultAvatar = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=250&auto=format&fit=crop';
    
    if (!propiedad?.agente) {
      return {
        nombre: 'Inmobiliaria',
        apellido: 'MG',
        telefono: '2923410901',
        email: 'contacto@inmobiliariamg.com',
        foto: defaultAvatar
      };
    }

    return {
      nombre: propiedad.agente.nombre || 'Agente',
      apellido: propiedad.agente.apellido || '',
      telefono: propiedad.agente.telefono || '2923410901',
      email: propiedad.agente.email || 'contacto@inmobiliariamg.com',
      foto: propiedad.agente.fotoPerfil || propiedad.agente.foto || defaultAvatar
    };
  }, [propiedad]);

  // Enlaces de compartir
  const { urlWhatsApp, urlEmail, urlWhatsAppAgente } = useMemo(() => {
    const titulo = propiedad?.titulo || 'Propiedad';
    const textoCompartir = `¡Mirá esta propiedad en Inmobiliaria MG!: ${titulo} - ${window.location.href}`;
    const telefonoLimpio = (agente.telefono || '').replace(/[^0-9]/g, '');

    return {
      urlWhatsApp: `https://wa.me/?text=${encodeURIComponent(textoCompartir)}`,
      urlEmail: `mailto:?subject=${encodeURIComponent(titulo)}&body=${encodeURIComponent(textoCompartir)}`,
      urlWhatsAppAgente: `https://wa.me/${telefonoLimpio}?text=${encodeURIComponent(`Hola, quisiera consultar por la propiedad "${titulo}" (ID: ${id}).`)}`
    };
  }, [propiedad, agente, id]);

  if (loading) {
    return (
      <div className="container py-5 text-center my-5">
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Cargando detalles...</span>
        </div>
        <p className="mt-3 text-muted fw-semibold">Cargando ficha del inmueble...</p>
      </div>
    );
  }

  if (error || !propiedad) {
    return (
      <div className="container py-5 text-center my-5">
        <div className="alert alert-warning shadow-sm d-inline-block p-4 rounded-4" style={{ maxWidth: '500px' }}>
          <i className="fa-solid fa-house-circle-exclamation fa-3x mb-3 text-warning"></i>
          <h4>Propiedad no encontrada</h4>
          <p className="text-muted">{error || 'El inmueble que estás buscando no existe o fue retirado.'}</p>
          <Link to="/" className="btn btn-primary rounded-pill px-4 mt-2">
            <i className="fa-solid fa-arrow-left me-2"></i>Volver al catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`container py-4 ${darkMode ? 'text-white' : ''}`}>
      {/* Navegación */}
      <nav aria-label="breadcrumb" className="mb-3">
        <Link to="/" className="btn btn-outline-secondary btn-sm rounded-pill px-3">
          <i className="fa-solid fa-arrow-left me-1"></i> Volver al catálogo
        </Link>
      </nav>

      <div className="row g-4">
        {/* Galería e Información Principal */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-3 bg-dark position-relative">
            {/* Imagen Principal */}
            <img 
              src={imagenSeleccionada} 
              alt={propiedad.titulo} 
              className="w-100 object-fit-cover" 
              style={{ maxHeight: '480px', minHeight: '340px' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = DEFAULT_IMAGE;
              }}
            />

            {/* Controles del Carrusel (Flechas de navegación lateral) */}
            {galeriaFotos.length > 1 && (
              <>
                <button
                  type="button"
                  className="btn btn-dark btn-sm rounded-circle position-absolute top-50 start-0 translate-middle-y ms-3 p-2 bg-opacity-75 border-0 shadow d-flex align-items-center justify-content-center"
                  style={{ width: '42px', height: '42px', zIndex: 10 }}
                  onClick={handleAnterior}
                  title="Imagen anterior"
                  aria-label="Imagen anterior"
                >
                  <i className="fa-solid fa-chevron-left fa-lg"></i>
                </button>

                <button
                  type="button"
                  className="btn btn-dark btn-sm rounded-circle position-absolute top-50 end-0 translate-middle-y me-3 p-2 bg-opacity-75 border-0 shadow d-flex align-items-center justify-content-center"
                  style={{ width: '42px', height: '42px', zIndex: 10 }}
                  onClick={handleSiguiente}
                  title="Imagen siguiente"
                  aria-label="Imagen siguiente"
                >
                  <i className="fa-solid fa-chevron-right fa-lg"></i>
                </button>

                {/* Contador de fotos en el visor */}
                <span className="badge bg-dark bg-opacity-75 position-absolute bottom-0 end-0 m-3 px-3 py-2 rounded-pill font-monospace shadow-sm" style={{ zIndex: 10 }}>
                  <i className="fa-solid fa-camera me-1 text-warning"></i>
                  {indiceFoto + 1} / {galeriaFotos.length}
                </span>
              </>
            )}
          </div>

          {/* Carrusel de Miniaturas */}
          {galeriaFotos.length > 1 && (
            <div className="d-flex gap-2 overflow-x-auto pb-2 mb-4">
              {galeriaFotos.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`btn p-0 border-0 rounded-3 overflow-hidden transition-all ${
                    indiceFoto === idx ? 'ring-2 ring-primary border border-primary border-3 shadow-sm' : 'opacity-75'
                  }`}
                  onClick={() => setIndiceFoto(idx)}
                >
                  <img
                    src={img}
                    alt={`Vista miniatura ${idx + 1}`}
                    className="object-fit-cover d-block"
                    style={{ width: '90px', height: '65px' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = DEFAULT_IMAGE;
                    }}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Detalles Técnicos */}
          <div className={`card border-0 shadow-sm rounded-4 p-4 ${darkMode ? 'bg-dark border border-secondary text-white' : 'bg-white'}`}>
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
              <h2 className="fw-bold m-0">{propiedad.titulo}</h2>
              <span className={`badge fs-6 px-3 py-2 ${propiedad.tipoOperacion === 'VENTA' ? 'bg-danger' : 'bg-success'}`}>
                {propiedad.tipoOperacion}
              </span>
            </div>

            <p className="text-muted mb-4">
              <i className="fa-solid fa-location-dot text-danger me-1"></i>
              {propiedad.direccion}{propiedad.ciudad ? `, ${propiedad.ciudad}` : ''}{propiedad.provincia ? `, ${propiedad.provincia}` : ''}
            </p>

            <hr className={darkMode ? 'border-secondary' : ''} />

            {/* Matriz de Especificaciones */}
            <div className="row text-center py-2 g-3">
              <div className="col-6 col-sm-3">
                <div className={`p-3 rounded-3 ${darkMode ? 'bg-secondary bg-opacity-20' : 'bg-light'}`}>
                  <i className="fa-solid fa-door-open text-primary fs-3 d-block mb-1"></i>
                  <small className="text-muted d-block">Ambientes</small>
                  <strong>{propiedad.ambientes || '-'}</strong>
                </div>
              </div>
              <div className="col-6 col-sm-3">
                <div className={`p-3 rounded-3 ${darkMode ? 'bg-secondary bg-opacity-20' : 'bg-light'}`}>
                  <i className="fa-solid fa-bed text-primary fs-3 d-block mb-1"></i>
                  <small className="text-muted d-block">Dormitorios</small>
                  <strong>{propiedad.dormitorios || '-'}</strong>
                </div>
              </div>
              <div className="col-6 col-sm-3">
                <div className={`p-3 rounded-3 ${darkMode ? 'bg-secondary bg-opacity-20' : 'bg-light'}`}>
                  <i className="fa-solid fa-bath text-primary fs-3 d-block mb-1"></i>
                  <small className="text-muted d-block">Baños</small>
                  <strong>{propiedad.banos || '-'}</strong>
                </div>
              </div>
              <div className="col-6 col-sm-3">
                <div className={`p-3 rounded-3 ${darkMode ? 'bg-secondary bg-opacity-20' : 'bg-light'}`}>
                  <i className="fa-solid fa-ruler-combined text-primary fs-3 d-block mb-1"></i>
                  <small className="text-muted d-block">Sup. Total</small>
                  <strong>{propiedad.superficieTotal ? `${propiedad.superficieTotal} m²` : (propiedad.superficie ? `${propiedad.superficie} m²` : '-')}</strong>
                </div>
              </div>
            </div>

            <hr className={darkMode ? 'border-secondary' : ''} />

            <h5 className="fw-bold mb-3">Descripción de la propiedad</h5>
            <p className={`lh-lg mb-0 ${darkMode ? 'text-light opacity-75' : 'text-secondary'}`} style={{ whiteSpace: 'pre-line' }}>
              {propiedad.descripcion || 'Sin descripción detallada proporcionada para esta propiedad.'}
            </p>
          </div>
        </div>

        {/* Panel Lateral */}
        <div className="col-lg-4">
          <div className={`card border-0 shadow-sm rounded-4 p-4 sticky-top ${
            darkMode ? 'bg-dark border border-secondary text-white' : 'bg-white'
          }`} style={{ top: '90px' }}>
            
            <small className="text-muted text-uppercase fw-bold tracking-wider">Precio de publicación</small>
            <h2 className="fw-bold text-primary my-2 fs-1">
              {propiedad.precio ? `${propiedad.moneda || '$'} ${Number(propiedad.precio).toLocaleString('es-AR')}` : 'Consultar precio'}
            </h2>

            <hr className={darkMode ? 'border-secondary' : ''} />

            {/* Agente */}
            <h6 className="fw-bold mb-3">Agente asignado</h6>
            <div className="d-flex align-items-center gap-3 mb-3">
              <img 
                src={agente.foto} 
                alt={`${agente.nombre} ${agente.apellido}`} 
                className="rounded-circle object-fit-cover shadow-sm"
                style={{ width: '60px', height: '60px' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=250&auto=format&fit=crop';
                }}
              />
              <div>
                <h6 className="fw-bold mb-0">{agente.nombre} {agente.apellido}</h6>
                <small className="text-muted d-block">Asesor Inmobiliario</small>
                {agente.telefono && (
                  <small className="text-primary fw-semibold">
                    <i className="fa-solid fa-phone me-1"></i>{agente.telefono}
                  </small>
                )}
              </div>
            </div>

            {/* WhatsApp */}
            <a 
              href={urlWhatsAppAgente}
              target="_blank" 
              rel="noreferrer"
              className="btn btn-success w-100 fw-bold rounded-3 py-2 mb-3 d-flex align-items-center justify-content-center gap-2 shadow-sm"
            >
              <i className="fa-brands fa-whatsapp fs-5"></i> Consultar por WhatsApp
            </a>

            {/* Formulario */}
            <div className={`p-3 rounded-3 mb-3 ${darkMode ? 'bg-secondary bg-opacity-10 border border-secondary' : 'bg-light'}`}>
              <h6 className="fw-bold mb-2 fs-6">Enviar mensaje directo</h6>
              
              {consultaEnviada ? (
                <div className="alert alert-success m-0 p-2 text-center small" role="alert">
                  <i className="fa-solid fa-circle-check me-1"></i>¡Consulta enviada con éxito! Nos contactaremos a la brevedad.
                </div>
              ) : (
                <form onSubmit={handleEnviarConsulta} className="d-flex flex-column gap-2">
                  {errorConsulta && (
                    <div className="alert alert-danger m-0 p-2 text-center small" role="alert">
                      <i className="fa-solid fa-triangle-exclamation me-1"></i>{errorConsulta}
                    </div>
                  )}
                  <input 
                    type="text" 
                    name="nombre" 
                    placeholder="Tu nombre" 
                    value={mensajeConsulta.nombre} 
                    onChange={handleConsultaChange} 
                    required 
                    className={`form-control form-control-sm ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}
                  />
                  <input 
                    type="email" 
                    name="email" 
                    placeholder="Tu email" 
                    value={mensajeConsulta.email} 
                    onChange={handleConsultaChange} 
                    required 
                    className={`form-control form-control-sm ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}
                  />
                  <input 
                    type="tel" 
                    name="telefono" 
                    placeholder="Teléfono (opcional)" 
                    value={mensajeConsulta.telefono} 
                    onChange={handleConsultaChange} 
                    className={`form-control form-control-sm ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}
                  />
                  <textarea 
                    name="mensaje" 
                    rows="2" 
                    placeholder="Hola, me interesa este inmueble..." 
                    value={mensajeConsulta.mensaje} 
                    onChange={handleConsultaChange} 
                    required 
                    className={`form-control form-control-sm ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}
                  ></textarea>
                  
                  <button 
                    type="submit" 
                    disabled={enviandoConsulta} 
                    className="btn btn-primary btn-sm fw-bold w-100 mt-1"
                  >
                    {enviandoConsulta ? (
                      <><span className="spinner-border spinner-border-sm me-1"></span>Enviando...</>
                    ) : (
                      <><i className="fa-solid fa-paper-plane me-1"></i>Enviar Consulta</>
                    )}
                  </button>
                </form>
              )}
            </div>

            <hr className={darkMode ? 'border-secondary' : ''} />

            {/* Compartir */}
            <h6 className="fw-bold mb-2 fs-6">Compartir ficha</h6>
            <div className="d-flex gap-2">
              <a 
                href={urlWhatsApp} 
                target="_blank" 
                rel="noreferrer" 
                className="btn btn-outline-success flex-grow-1 btn-sm"
                title="Compartir en WhatsApp"
              >
                <i className="fa-brands fa-whatsapp me-1"></i> WhatsApp
              </a>

              <a 
                href={urlEmail} 
                className="btn btn-outline-secondary flex-grow-1 btn-sm"
                title="Compartir por Email"
              >
                <i className="fa-solid fa-envelope me-1"></i> Email
              </a>

              <button 
                type="button" 
                className={`btn ${copiado ? 'btn-success' : 'btn-outline-primary'} flex-grow-1 btn-sm`}
                onClick={copiarEnlace}
                title="Copiar enlace directo"
              >
                <i className={`fa-solid ${copiado ? 'fa-check' : 'fa-link'} me-1`}></i>
                {copiado ? '¡Copiado!' : 'Enlace'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};