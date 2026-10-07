import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { InmobiliariaAPI } from '../api/inmobiliariaApi';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';

/**
 * Componente para la gestión e historial detallado de consultas del CRM.
 * - Incluye fotos, dirección y estado actual del inmueble en cada registro.
 * - Filtra por rol (ADMIN ve todas y puede borrar; AGENTE ve las correspondientes a sus propiedades).
 * - Muestra las consultas por orden estricto de llegada.
 */
export const ConsultasCrm = () => {
  const [consultas, setConsultas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [filtroAgente, setFiltroAgente] = useState('TODOS');
  const [ordenCronologico, setOrdenCronologico] = useState('DESC');

  const { darkMode } = useContext(ThemeContext);
  const { usuario } = useContext(AuthContext);

  const esAdmin = usuario?.rol === 'ADMIN';
  const esAgente = usuario?.rol === 'AGENTE';

  const BACKEND_URL = 'http://localhost:8080';
  const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=400&q=80';

  const formatUrl = (ruta) => {
    if (!ruta) return DEFAULT_IMAGE;
    if (typeof ruta === 'object') ruta = ruta.urlFoto || ruta.url || ruta.nombreArchivo;
    if (!ruta) return DEFAULT_IMAGE;
    if (ruta.startsWith('http://') || ruta.startsWith('https://') || ruta.startsWith('blob:') || ruta.startsWith('data:image')) {
      return ruta;
    }
    return `${BACKEND_URL}${ruta.startsWith('/') ? '' : '/'}${ruta}`;
  };

  useEffect(() => {
    cargarConsultas();
  }, [usuario]);

  const cargarConsultas = async () => {
    try {
      setCargando(true);
      let data = [];

      if (esAgente && !esAdmin && usuario?.id) {
        // Carga directa por API o filtro amplio por email/id
        data = await InmobiliariaAPI.getConsultasPorAgente(usuario.id);
        if (!data || data.length === 0) {
          // Fallback a todas si las propiedades se asignaron por email
          const todas = await InmobiliariaAPI.getConsultas();
          data = todas.filter(c =>
            c.agenteId === usuario.id ||
            (c.agenteEmail && c.agenteEmail.toLowerCase() === usuario.email.toLowerCase()) ||
            (c.agenteNombre && usuario.nombre && c.agenteNombre.toLowerCase().includes(usuario.nombre.toLowerCase()))
          );
        }
      } else {
        data = await InmobiliariaAPI.getConsultas();
      }

      setConsultas(data || []);
      setError(null);
    } catch (err) {
      console.error('Error al cargar consultas:', err);
      setError('No se pudieron obtener las consultas del servidor.');
    } finally {
      setCargando(false);
    }
  };

  const handleCambioEstado = async (id, nuevoEstado) => {
    try {
      await InmobiliariaAPI.cambiarEstadoConsulta(id, nuevoEstado);
      setConsultas((prev) =>
        prev.map((c) => (c.id === id ? { ...c, estado: nuevoEstado } : c))
      );
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      alert('No se pudo actualizar el estado de la consulta.');
    }
  };

  const handleEliminarConsulta = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta consulta definitivamente?')) return;
    try {
      await InmobiliariaAPI.eliminarConsulta(id);
      setConsultas((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Error al eliminar consulta:', err);
      alert('Error al eliminar la consulta de la base de datos.');
    }
  };

  // Obtener lista de agentes para filtro de Admin
  const agentesUnicos = Array.from(
    new Set(consultas.map((c) => c.agenteNombre).filter(Boolean))
  );

  // Filtrado y ordenamiento cronológico por fecha de llegada
  const consultasProcesadas = consultas
    .filter((c) => {
      if (filtroEstado !== 'TODOS' && c.estado !== filtroEstado) return false;
      if (esAdmin && filtroAgente !== 'TODOS' && c.agenteNombre !== filtroAgente) return false;
      return true;
    })
    .sort((a, b) => {
      const fechaA = new Date(a.fechaConsulta || 0).getTime();
      const fechaB = new Date(b.fechaConsulta || 0).getTime();
      return ordenCronologico === 'DESC' ? fechaB - fechaA : fechaA - fechaB;
    });

  const getOrigenBadge = (origen) => {
    switch (origen) {
      case 'WHATSAPP':
        return <span className="badge bg-success text-white"><i className="fa-brands fa-whatsapp me-1"></i>WhatsApp</span>;
      case 'EMAIL':
        return <span className="badge bg-secondary text-white"><i className="fa-solid fa-envelope me-1"></i>Email</span>;
      case 'WEB':
      default:
        return <span className="badge bg-primary text-white"><i className="fa-solid fa-globe me-1"></i>Portal Web</span>;
    }
  };

  const getEstadoBadgeClass = (estado) => {
    switch (estado) {
      case 'PENDIENTE': return 'bg-warning text-dark';
      case 'EN_PROCESO': return 'bg-info text-dark';
      case 'ATENDIDA': return 'bg-success text-white';
      case 'CANCELADA': return 'bg-danger text-white';
      default: return 'bg-secondary text-white';
    }
  };

  const getEstadoPropiedadBadge = (estadoProp) => {
    switch (estadoProp) {
      case 'DISPONIBLE': return <span className="badge bg-success bg-opacity-20 text-success border border-success border-opacity-25 ms-1" style={{ fontSize: '0.7rem' }}>DISPONIBLE</span>;
      case 'RESERVADA': return <span className="badge bg-warning bg-opacity-20 text-warning border border-warning border-opacity-25 ms-1" style={{ fontSize: '0.7rem' }}>RESERVADA</span>;
      case 'VENDIDA': return <span className="badge bg-danger bg-opacity-20 text-danger border border-danger border-opacity-25 ms-1" style={{ fontSize: '0.7rem' }}>VENDIDA</span>;
      case 'ALQUILADA': return <span className="badge bg-info bg-opacity-20 text-info border border-info border-opacity-25 ms-1" style={{ fontSize: '0.7rem' }}>ALQUILADA</span>;
      default: return null;
    }
  };

  const formatearFecha = (fechaIso) => {
    if (!fechaIso) return 'Fecha no registrada';
    try {
      const d = new Date(fechaIso);
      return d.toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return fechaIso;
    }
  };

  if (cargando) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 text-muted small">Cargando consultas por orden de llegada...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger shadow-sm rounded-3 p-4 text-center my-3">
        <i className="fa-solid fa-triangle-exclamation fa-2x mb-2 text-danger"></i>
        <p className="m-0 fw-semibold">{error}</p>
        <button className="btn btn-outline-danger btn-sm mt-3 rounded-pill" onClick={cargarConsultas}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className={`p-1 ${darkMode ? 'text-white' : ''}`}>
      {/* Encabezado e Indicador de Vista */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-3">
        <div>
          <h4 className="fw-bold m-0 d-flex align-items-center gap-2">
            <i className="fa-solid fa-inbox text-primary"></i>
            <span>Bandeja de Consultas Recibidas</span>
          </h4>
          <p className="text-muted small m-0 mt-1">
            {esAdmin ? (
              <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-2 py-1">
                <i className="fa-solid fa-shield-halved me-1"></i>Vista Administrador: Todas las consultas y opción de borrado
              </span>
            ) : (
              <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2 py-1">
                <i className="fa-solid fa-user-tie me-1"></i>Vista Agente: Mensajes asignados ({usuario?.nombre} {usuario?.apellido})
              </span>
            )}
          </p>
        </div>

        <div className="d-flex flex-wrap align-items-center gap-2">
          {/* Orden Cronológico */}
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary rounded-pill"
            onClick={() => setOrdenCronologico(prev => prev === 'DESC' ? 'ASC' : 'DESC')}
            title="Cambiar orden cronológico"
          >
            <i className={`fa-solid ${ordenCronologico === 'DESC' ? 'fa-arrow-down-short-wide text-primary' : 'fa-arrow-up-wide-short text-warning'} me-1`}></i>
            {ordenCronologico === 'DESC' ? 'Más recientes primero' : 'Más antiguas primero'}
          </button>

          <button className="btn btn-outline-primary btn-sm rounded-pill" onClick={cargarConsultas} title="Actualizar consultas">
            <i className="fa-solid fa-rotate me-1"></i>Actualizar
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className={`p-3 mb-4 rounded-3 d-flex flex-wrap align-items-center gap-3 ${darkMode ? 'bg-secondary bg-opacity-15 border border-secondary' : 'bg-light'}`}>
        <div className="d-flex align-items-center gap-2">
          <span className="small text-muted fw-semibold">Estado Seguimiento:</span>
          <select
            className={`form-select form-select-sm rounded-pill ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}
            style={{ width: '160px' }}
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="TODOS">Todos ({consultas.length})</option>
            <option value="PENDIENTE">Pendientes</option>
            <option value="EN_PROCESO">En Proceso</option>
            <option value="ATENDIDA">Atendidas</option>
            <option value="CANCELADA">Canceladas</option>
          </select>
        </div>

        {/* Filtro por Agente (Solo ADMIN) */}
        {esAdmin && agentesUnicos.length > 0 && (
          <div className="d-flex align-items-center gap-2">
            <span className="small text-muted fw-semibold">Filtrar por Agente:</span>
            <select
              className={`form-select form-select-sm rounded-pill ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}
              style={{ width: '200px' }}
              value={filtroAgente}
              onChange={(e) => setFiltroAgente(e.target.value)}
            >
              <option value="TODOS">Todos los agentes</option>
              {agentesUnicos.map((agente, idx) => (
                <option key={idx} value={agente}>{agente}</option>
              ))}
            </select>
          </div>
        )}

        <div className="ms-auto small text-muted">
          Mostrando <strong>{consultasProcesadas.length}</strong> mensajes por fecha de llegada
        </div>
      </div>

      {consultasProcesadas.length === 0 ? (
        <div className={`card text-center p-5 border-0 shadow-sm rounded-4 ${darkMode ? 'bg-dark text-white border border-secondary' : 'bg-white'}`}>
          <i className="fa-solid fa-envelope-open-text text-muted fa-3x mb-3"></i>
          <h5>No se encontraron consultas</h5>
          <p className="text-muted small">No hay envíos registrados para el filtro o agente seleccionado.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className={`table align-middle ${darkMode ? 'table-dark table-hover' : 'table-hover'}`}>
            <thead>
              <tr className="border-bottom">
                <th style={{ width: '18%' }}>Llegada & Contacto</th>
                <th style={{ width: '30%' }}>Inmueble, Dirección & Agente</th>
                <th style={{ width: '25%' }}>Mensaje de Consulta</th>
                <th style={{ width: '10%' }}>Canal</th>
                <th style={{ width: '17%' }}>Acciones y Responder</th>
              </tr>
            </thead>
            <tbody>
              {consultasProcesadas.map((c) => {
                const telefonoLimpio = c.telefonoContacto ? c.telefonoContacto.replace(/[^0-9]/g, '') : '';
                const textoWhatsApp = `Hola ${c.nombreContacto}, te contacto de Inmobiliaria MG respecto a tu consulta sobre: "${c.propiedadTitulo}" (${c.propiedadDireccion || ''}) Ref: #${c.propiedadId || c.id}.`;
                const linkWhatsApp = telefonoLimpio ? `https://wa.me/${telefonoLimpio}?text=${encodeURIComponent(textoWhatsApp)}` : null;

                const asuntoEmail = `Respuesta a tu consulta sobre ${c.propiedadTitulo} - Inmobiliaria MG`;
                const cuerpoEmail = `Hola ${c.nombreContacto},\n\nGracias por escribirnos. Con respecto a tu consulta por "${c.propiedadTitulo}" ubicada en ${c.propiedadDireccion || ''} (Ref: #${c.propiedadId || c.id}):\n\n`;
                const linkEmail = `mailto:${c.emailContacto}?subject=${encodeURIComponent(asuntoEmail)}&body=${encodeURIComponent(cuerpoEmail)}`;

                return (
                  <tr key={c.id}>
                    {/* Fecha de Llegada & Contacto */}
                    <td>
                      <div className="text-primary fw-semibold small mb-1">
                        <i className="fa-regular fa-clock me-1"></i>{formatearFecha(c.fechaConsulta)}
                      </div>
                      <div className="fw-bold fs-6">{c.nombreContacto || 'Contacto sin nombre'}</div>
                      <div className="text-muted small">
                        <i className="fa-solid fa-envelope me-1 text-secondary"></i>
                        <a href={`mailto:${c.emailContacto}`} className="text-decoration-none text-reset">{c.emailContacto}</a>
                      </div>
                      {c.telefonoContacto && (
                        <div className="text-muted small mt-1">
                          <i className="fa-solid fa-phone me-1"></i>{c.telefonoContacto}
                        </div>
                      )}
                    </td>

                    {/* Inmueble con Foto Miniatura, Dirección y Agente */}
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={formatUrl(c.propiedadFoto)}
                          alt={c.propiedadTitulo}
                          className="rounded-3 border object-fit-cover shadow-sm flex-shrink-0"
                          style={{ width: '65px', height: '65px' }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = DEFAULT_IMAGE;
                          }}
                        />
                        <div>
                          {c.propiedadId ? (
                            <Link to={`/propiedad/${c.propiedadId}`} className="fw-bold text-primary text-decoration-none d-block">
                              <i className="fa-solid fa-house me-1"></i>{c.propiedadTitulo}
                            </Link>
                          ) : (
                            <span className="fw-semibold text-secondary d-block">
                              <i className="fa-solid fa-circle-info me-1"></i>{c.propiedadTitulo || 'Consulta General'}
                            </span>
                          )}

                          {c.propiedadDireccion && (
                            <div className="text-muted small">
                              <i className="fa-solid fa-location-dot text-danger me-1"></i>{c.propiedadDireccion}
                            </div>
                          )}

                          <div className="d-flex align-items-center gap-1 mt-1">
                            <span className="small text-muted me-1">
                              <i className="fa-solid fa-user-tie text-primary me-1"></i>{c.agenteNombre || 'Sin Agente Asignado'}
                            </span>
                            {getEstadoPropiedadBadge(c.propiedadEstado)}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Mensaje de la Consulta */}
                    <td>
                      <div
                        className={`p-2 px-3 rounded-3 small ${darkMode ? 'bg-secondary bg-opacity-20 text-light' : 'bg-light text-dark'}`}
                        style={{ whiteSpace: 'pre-line', maxHeight: '110px', overflowY: 'auto' }}
                      >
                        {c.mensaje || 'Sin contenido de mensaje'}
                      </div>
                    </td>

                    {/* Canal Origen */}
                    <td>
                      {getOrigenBadge(c.origen)}
                    </td>

                    {/* Acciones para Responder y Borrar */}
                    <td>
                      <div className="d-flex flex-column gap-2">
                        {/* Selector de Estado */}
                        <div className="d-flex align-items-center gap-1">
                          <span className={`badge ${getEstadoBadgeClass(c.estado)} flex-shrink-0`}>
                            {c.estado}
                          </span>
                          <select
                            className={`form-select form-select-sm rounded-pill ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}
                            style={{ fontSize: '0.78rem' }}
                            value={c.estado || 'PENDIENTE'}
                            onChange={(e) => handleCambioEstado(c.id, e.target.value)}
                          >
                            <option value="PENDIENTE">PENDIENTE</option>
                            <option value="EN_PROCESO">EN PROCESO</option>
                            <option value="ATENDIDA">ATENDIDA</option>
                            <option value="CANCELADA">CANCELADA</option>
                          </select>
                        </div>

                        {/* Botones Directos de Respuesta y Borrado */}
                        <div className="d-flex gap-1 flex-wrap align-items-center">
                          {linkWhatsApp && (
                            <a
                              href={linkWhatsApp}
                              target="_blank"
                              rel="noreferrer"
                              onClick={() => {
                                if (c.estado === 'PENDIENTE') handleCambioEstado(c.id, 'EN_PROCESO');
                              }}
                              className="btn btn-success btn-sm py-1 px-2 rounded-pill flex-grow-1 text-nowrap"
                              style={{ fontSize: '0.75rem' }}
                              title="Responder por WhatsApp"
                            >
                              <i className="fa-brands fa-whatsapp me-1"></i>WhatsApp
                            </a>
                          )}

                          <a
                            href={linkEmail}
                            onClick={() => {
                              if (c.estado === 'PENDIENTE') handleCambioEstado(c.id, 'EN_PROCESO');
                            }}
                            className="btn btn-outline-secondary btn-sm py-1 px-2 rounded-pill flex-grow-1 text-nowrap"
                            style={{ fontSize: '0.75rem' }}
                            title="Responder por Email"
                          >
                            <i className="fa-solid fa-reply me-1"></i>Email
                          </a>

                          {/* Borrar Consulta (Exclusivo Administrador) */}
                          {esAdmin && (
                            <button
                              type="button"
                              onClick={() => handleEliminarConsulta(c.id)}
                              className="btn btn-outline-danger btn-sm py-1 px-2 rounded-circle"
                              title="Eliminar consulta"
                              aria-label="Eliminar consulta"
                            >
                              <i className="fa-solid fa-trash-can"></i>
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ConsultasCrm;