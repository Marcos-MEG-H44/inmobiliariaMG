import React, { useState, useEffect, useContext, useMemo, useCallback, memo } from 'react';
import { InmobiliariaAPI } from '../api/inmobiliariaApi';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { ConsultasCrm } from '../components/ConsultasCrm';

/**
 * Función auxiliar para sanitizar cadenas y prevenir vulnerabilidades XSS en HTML dinámico
 */
const escapeHTML = (str = '') => {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

/**
 * Subcomponente Memoizado: Tarjeta KPI
 */
const KPICard = memo(({ title, value, iconClass, colorClass, darkMode }) => (
  <div className="col-md-4">
    <div className={`card border-0 shadow-sm p-3 rounded-3 ${darkMode ? 'bg-secondary bg-opacity-25 text-white' : 'bg-white'}`}>
      <div className="d-flex align-items-center justify-content-between">
        <div>
          <span className="text-muted small fw-semibold text-uppercase">{title}</span>
          <h3 className="fw-bold m-0 mt-1">{value}</h3>
        </div>
        <div className={`p-3 bg-${colorClass} bg-opacity-10 rounded-circle text-${colorClass}`}>
          <i className={`${iconClass} fa-lg`}></i>
        </div>
      </div>
    </div>
  </div>
));
KPICard.displayName = 'KPICard';

/**
 * Subcomponente Memoizado: Barra de Progreso para Distribución
 */
const ProgressBarItem = memo(({ tipo, cantidad, porcentaje }) => (
  <div className="col-md-6">
    <div className="d-flex justify-content-between small fw-semibold mb-1">
      <span>{tipo}</span>
      <span>{cantidad} ({porcentaje}%)</span>
    </div>
    <div className="progress" style={{ height: '12px' }}>
      <div
        className="progress-bar bg-primary progress-bar-striped progress-bar-animated"
        role="progressbar"
        style={{ width: `${porcentaje}%` }}
        aria-valuenow={porcentaje}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label={`Distribución de ${tipo}`}
      ></div>
    </div>
  </div>
));
ProgressBarItem.displayName = 'ProgressBarItem';

/**
 * Subcomponente Memoizado: Fila de la Tabla de Propiedades
 */
const TableRowItem = memo(({ p, darkMode, onPDF, onEdit, onDelete }) => (
  <tr>
    <td>
      <span className="fw-semibold d-block">
        {p.destacada && <i className="fa-solid fa-star text-warning me-1" title="Destacada"></i>}
        {p.titulo}
      </span>
      <span className="text-muted small">{p.direccion}, {p.ciudad}</span>
    </td>
    <td>
      <span className={`badge rounded-pill ${p.tipoOperacion === 'VENTA' ? 'bg-success' : 'bg-info text-dark'}`}>
        {p.tipoOperacion}
      </span>
    </td>
    <td className="fw-bold">
      {p.moneda} {p.precio?.toLocaleString()}
    </td>
    <td className="text-end">
      <div className="d-flex justify-content-end gap-1">
        <button
          onClick={() => onPDF(p)}
          className="btn btn-outline-danger btn-sm rounded-circle"
          title="Descargar Ficha PDF"
          aria-label={`Descargar PDF de ${p.titulo}`}
        >
          <i className="fa-solid fa-file-pdf"></i>
        </button>
        <button
          onClick={() => onEdit(p)}
          className="btn btn-outline-primary btn-sm rounded-circle"
          title="Editar Propiedad"
          aria-label={`Editar ${p.titulo}`}
        >
          <i className="fa-solid fa-pen-to-square"></i>
        </button>
        <button
          onClick={() => onDelete(p.id)}
          className="btn btn-outline-danger btn-sm rounded-circle"
          title="Eliminar Propiedad"
          aria-label={`Eliminar ${p.titulo}`}
        >
          <i className="fa-solid fa-trash-can"></i>
        </button>
      </div>
    </td>
  </tr>
));
TableRowItem.displayName = 'TableRowItem';

/**
 * Panel de Administración completo para gestión CRUD de Propiedades,
 * Reportes Estadísticos (Gráficos), Exportación a Excel (CSV) y Generación de PDF.
 */
export const Admin = () => {
  const { usuario } = useContext(AuthContext);
  const esAdmin = usuario?.rol === 'ADMIN';

  const [tabActiva, setTabActiva] = useState('propiedades');
  const [propiedades, setPropiedades] = useState([]);
  const [agentes, setAgentes] = useState([]);
  const [archivosNuevos, setArchivosNuevos] = useState([]);
  const [fotosMeta, setFotosMeta] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Estado para creación de nuevos usuarios por parte del Administrador
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    password: 'agente123',
    rol: 'AGENTE'
  });
  const [guardandoUsuario, setGuardandoUsuario] = useState(false);

  const handleCrearUsuarioSubmit = async (e) => {
    e.preventDefault();
    if (!nuevoUsuario.email || !nuevoUsuario.nombre || !nuevoUsuario.password) {
      alert('Nombre, Email y Contraseña son campos obligatorios.');
      return;
    }
    setGuardandoUsuario(true);
    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoUsuario)
      });
      if (!response.ok) {
        const txt = await response.text();
        throw new Error(txt || 'Error al registrar el nuevo usuario.');
      }
      alert(`¡Usuario ${nuevoUsuario.nombre} ${nuevoUsuario.apellido} registrado correctamente!`);
      setNuevoUsuario({ nombre: '', apellido: '', email: '', telefono: '', password: 'agente123', rol: 'AGENTE' });
      await cargarDatos();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setGuardandoUsuario(false);
    }
  };

  // Servidor backend donde se alojan las imágenes locales de XAMPP
  const BACKEND_URL = 'http://localhost:8080';

  /**
   * Resuelve URLs relativas agregando el servidor HTTP de backend si no incluyen protocolo.
   */
  const formatUrl = useCallback((ruta) => {
    if (!ruta) return '';
    if (typeof ruta === 'object') ruta = ruta.urlFoto || ruta.url || ruta.nombreArchivo;
    if (!ruta) return '';
    if (ruta.startsWith('http://') || ruta.startsWith('https://') || ruta.startsWith('blob:') || ruta.startsWith('data:image')) {
      return ruta;
    }
    return `${BACKEND_URL}${ruta.startsWith('/') ? '' : '/'}${ruta}`;
  }, []);

  // Tema global para soporte de Modo Oscuro
  const { darkMode } = useContext(ThemeContext);

  const initialFormState = useMemo(() => ({
    titulo: '',
    descripcion: '',
    tipoPropiedad: 'CASA',
    tipoOperacion: 'VENTA',
    precio: '',
    moneda: 'USD',
    direccion: '',
    ciudad: 'Coronel Pringles',
    provincia: 'Buenos Aires',
    ambientes: 2,
    dormitorios: 1,
    banos: 1,
    superficieTotal: '',
    superficieCubierta: '',
    cochera: false,
    patio: false,
    estado: 'DISPONIBLE',
    destacada: false,
    agenteId: '',
    imagenes: []
  }), []);

  const [formData, setFormData] = useState(initialFormState);

  // Carga asíncrona de datos con prevención de actualización en componente desmontado
  const cargarDatos = useCallback(async () => {
    let isMounted = true;
    setCargando(true);
    try {
      const [listPropiedades, listAgentes] = await Promise.all([
        InmobiliariaAPI.getPropiedades(),
        InmobiliariaAPI.getUsuarios()
      ]);

      if (isMounted) {
        const propData = listPropiedades || [];
        const agentData = listAgentes || [];
        setPropiedades(propData);
        setAgentes(agentData);

        // Si hay agentes y no hay un agente seleccionado en el formulario, asignamos el primero
        if (agentData.length > 0) {
          setFormData(prev => prev.agenteId ? prev : { ...prev, agenteId: agentData[0].id });
        }
      }
    } catch (err) {
      console.error('Error al cargar datos de gestión:', err);
    } finally {
      if (isMounted) setCargando(false);
    }
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let cleanup;
    cargarDatos().then(cls => { cleanup = cls; });
    return () => { if (cleanup) cleanup(); };
  }, [cargarDatos]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  // Procesamiento de selección de archivos tipo File para envío multipart y vista previa
  const handleImagenesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const baseIndex = archivosNuevos.length;
    setArchivosNuevos(prev => [...prev, ...files]);

    const newMeta = files.map((file, idx) => ({
      id: null,
      url: URL.createObjectURL(file),
      isNew: true,
      fileIndex: baseIndex + idx
    }));

    setFotosMeta(prev => [...prev, ...newMeta]);
    setFormData(prev => ({
      ...prev,
      imagenes: [...prev.imagenes, ...newMeta.map(m => m.url)]
    }));

    // Limpieza del input tipo file
    e.target.value = '';
  };

  const handleQuitarImagen = useCallback(async (index) => {
    const item = fotosMeta[index];
    if (!item) return;

    // Si la foto ya existe en el backend con su ID, la eliminamos individualmente
    if (item.id) {
      if (window.confirm('¿Deseas eliminar esta foto de la propiedad de forma permanente?')) {
        try {
          await InmobiliariaAPI.eliminarFoto(item.id);
        } catch (err) {
          console.error('Error al eliminar foto:', err);
          alert('Error al eliminar la foto de la base de datos.');
          return;
        }
      } else {
        return;
      }
    }

    if (item.isNew && item.fileIndex !== undefined) {
      setArchivosNuevos(prev => prev.filter((_, idx) => idx !== item.fileIndex));
    }

    setFotosMeta(prev => prev.filter((_, idx) => idx !== index));
    setFormData(prev => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, idx) => idx !== index)
    }));
  }, [fotosMeta]);

  const handleEditar = useCallback((propiedad) => {
    setEditingId(propiedad.id);
    setArchivosNuevos([]);

    // Extraer fotos existentes con sus IDs de MySQL
    let metaList = [];
    if (propiedad.fotos && propiedad.fotos.length > 0) {
      metaList = propiedad.fotos.map(f => ({
        id: f.id,
        url: formatUrl(f.urlFoto || f.url || f.nombreArchivo),
        isNew: false
      }));
    } else if (propiedad.imagenes && propiedad.imagenes.length > 0) {
      metaList = propiedad.imagenes.map((img) => ({
        id: typeof img === 'object' ? img.id : null,
        url: formatUrl(typeof img === 'object' ? (img.urlFoto || img.url) : img),
        isNew: false
      }));
    }

    setFotosMeta(metaList);
    setFormData({
      titulo: propiedad.titulo || '',
      descripcion: propiedad.descripcion || '',
      tipoPropiedad: propiedad.tipoPropiedad || 'CASA',
      tipoOperacion: propiedad.tipoOperacion || 'VENTA',
      precio: propiedad.precio ? propiedad.precio.toString() : '',
      moneda: propiedad.moneda || 'USD',
      direccion: propiedad.direccion || '',
      ciudad: propiedad.ciudad || 'Coronel Pringles',
      provincia: propiedad.provincia || 'Buenos Aires',
      ambientes: propiedad.ambientes || 1,
      dormitorios: propiedad.dormitorios || 0,
      banos: propiedad.banos || 1,
      superficieTotal: propiedad.superficieTotal ? propiedad.superficieTotal.toString() : '',
      superficieCubierta: propiedad.superficieCubierta ? propiedad.superficieCubierta.toString() : '',
      cochera: Boolean(propiedad.cochera),
      patio: Boolean(propiedad.patio),
      estado: propiedad.estado || 'DISPONIBLE',
      destacada: Boolean(propiedad.destacada),
      agenteId: propiedad.agente?.id ? propiedad.agente.id.toString() : (agentes.length > 0 ? agentes[0].id : ''),
      imagenes: metaList.map(m => m.url)
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [agentes, formatUrl]);

  const handleCancelarEdicion = useCallback(() => {
    setEditingId(null);
    setArchivosNuevos([]);
    setFotosMeta([]);
    setFormData({
      ...initialFormState,
      agenteId: agentes.length > 0 ? agentes[0].id : ''
    });
  }, [initialFormState, agentes]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.titulo.trim() || !formData.precio || !formData.direccion.trim()) {
      alert('Por favor, completa los campos obligatorios (Título, Precio y Dirección).');
      return;
    }

    setGuardando(true);
    try {
      const idAgenteSelected = formData.agenteId ? parseInt(formData.agenteId, 10) : null;
      const payload = {
        ...formData,
        precio: parseFloat(formData.precio) || 0,
        superficieTotal: formData.superficieTotal ? parseFloat(formData.superficieTotal) : null,
        superficieCubierta: formData.superficieCubierta ? parseFloat(formData.superficieCubierta) : null,
        ambientes: parseInt(formData.ambientes, 10) || 1,
        dormitorios: parseInt(formData.dormitorios, 10) || 0,
        banos: parseInt(formData.banos, 10) || 1,
        agenteId: idAgenteSelected
      };

      // Eliminar referencias a objetos o listas para evitar enviar cadenas como "[object Object]"
      delete payload.agente;
      delete payload.imagenes;
      delete payload.fotos;

      if (editingId) {
        await InmobiliariaAPI.actualizarPropiedad(editingId, payload, archivosNuevos, idAgenteSelected);
        alert('Propiedad actualizada exitosamente.');
      } else {
        await InmobiliariaAPI.crearPropiedad(payload, archivosNuevos, idAgenteSelected);
        alert('Propiedad creada exitosamente.');
      }

      handleCancelarEdicion();
      await cargarDatos();
    } catch (err) {
      console.error('Error en operación de base de datos:', err);
      alert(editingId ? `Error al actualizar la propiedad: ${err.message}` : `Error al guardar la propiedad: ${err.message}`);
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = useCallback(async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta propiedad?')) {
      try {
        await InmobiliariaAPI.eliminarPropiedad(id);
        if (editingId === id) handleCancelarEdicion();
        await cargarDatos();
      } catch (err) {
        console.error('Error al eliminar registro:', err);
        alert('Error al eliminar la propiedad');
      }
    }
  }, [editingId, handleCancelarEdicion, cargarDatos]);

  // ==========================================
  // EXPORTACIÓN A EXCEL (CSV) Y PDF
  // ==========================================

  const exportarExcel = useCallback(() => {
    if (propiedades.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }

    const headers = ["ID", "Titulo", "Tipo", "Operacion", "Precio", "Moneda", "Direccion", "Ciudad", "Ambientes", "Estado"];
    const rows = propiedades.map(p => [
      p.id,
      `"${(p.titulo || '').replace(/"/g, '""')}"`,
      p.tipoPropiedad,
      p.tipoOperacion,
      p.precio,
      p.moneda,
      `"${(p.direccion || '').replace(/"/g, '""')}"`,
      `"${(p.ciudad || '').replace(/"/g, '""')}"`,
      p.ambientes,
      p.estado
    ]);

    const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map(e => e.join(";"))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Reporte_Inmobiliaria_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [propiedades]);

  const exportarPDF = useCallback((propiedad = null) => {
    const ventanaImp = window.open('', '_blank');
    if (!ventanaImp) {
      alert('Por favor permite las ventanas emergentes para generar el PDF.');
      return;
    }

    const tituloReporte = propiedad
      ? `Ficha Técnica - ${escapeHTML(propiedad.titulo)}`
      : 'Reporte General de Propiedades';

    const itemsHTML = propiedad ? `
      <div style="border:1px solid #ccc; padding:20px; border-radius:8px;">
        <h2>${escapeHTML(propiedad.titulo)}</h2>
        <p><strong>Tipo:</strong> ${escapeHTML(propiedad.tipoPropiedad)} | <strong>Operación:</strong> ${escapeHTML(propiedad.tipoOperacion)}</p>
        <p><strong>Precio:</strong> ${escapeHTML(propiedad.moneda)} ${propiedad.precio?.toLocaleString()}</p>
        <p><strong>Ubicación:</strong> ${escapeHTML(propiedad.direccion)}, ${escapeHTML(propiedad.ciudad)}</p>
        <p><strong>Detalles:</strong> ${propiedad.ambientes} amb. | ${propiedad.dormitorios} dorm. | ${propiedad.banos} baños</p>
        <p><strong>Descripción:</strong> ${escapeHTML(propiedad.descripcion) || 'Sin descripción'}</p>
      </div>
    ` : `
      <table style="width:100%; border-collapse:collapse; margin-top:20px;">
        <thead>
          <tr style="background:#0d6efd; color:white;">
            <th style="padding:8px; border:1px solid #ddd;">ID</th>
            <th style="padding:8px; border:1px solid #ddd;">Título</th>
            <th style="padding:8px; border:1px solid #ddd;">Tipo</th>
            <th style="padding:8px; border:1px solid #ddd;">Operación</th>
            <th style="padding:8px; border:1px solid #ddd;">Precio</th>
          </tr>
        </thead>
        <tbody>
          ${propiedades.map(p => `
            <tr>
              <td style="padding:8px; border:1px solid #ddd;">${p.id}</td>
              <td style="padding:8px; border:1px solid #ddd;">${escapeHTML(p.titulo)}</td>
              <td style="padding:8px; border:1px solid #ddd;">${escapeHTML(p.tipoPropiedad)}</td>
              <td style="padding:8px; border:1px solid #ddd;">${escapeHTML(p.tipoOperacion)}</td>
              <td style="padding:8px; border:1px solid #ddd;">${escapeHTML(p.moneda)} ${p.precio?.toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    ventanaImp.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${tituloReporte}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; color: #333; }
            h1 { color: #0d6efd; border-bottom: 2px solid #0d6efd; padding-bottom: 10px; }
            .fecha { color: #666; font-size: 12px; float: right; }
          </style>
        </head>
        <body>
          <span class="fecha">Generado el: ${new Date().toLocaleDateString()}</span>
          <h1>Inmobiliaria - ${tituloReporte}</h1>
          ${itemsHTML}
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    ventanaImp.document.close();
  }, [propiedades]);

  // ==========================================
  // CÁLCULOS MEMOIZADOS DE MÉTRICAS Y GRÁFICOS
  // ==========================================

  const totalVentas = useMemo(() =>
    propiedades.filter(p => p.tipoOperacion === 'VENTA').length,
    [propiedades]);

  const totalAlquileres = useMemo(() =>
    propiedades.filter(p => p.tipoOperacion === 'ALQUILER').length,
    [propiedades]);

  const tiposCounts = useMemo(() => {
    return propiedades.reduce((acc, p) => {
      acc[p.tipoPropiedad] = (acc[p.tipoPropiedad] || 0) + 1;
      return acc;
    }, {});
  }, [propiedades]);

  return (
    <main className="container my-4">
      {/* Encabezado del Panel y Botones de Exportación */}
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 border-bottom pb-3 gap-2">
        <div>
          <h2 className="fw-bold m-0 d-flex align-items-center gap-2">
            <i className="fa-solid fa-user-gear text-primary"></i>
            <span>Panel de Control</span>
          </h2>
          <p className="text-muted small m-0">Gestión integral, métricas avanzadas y reportes</p>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <button className="btn btn-outline-success btn-sm rounded-pill" onClick={exportarExcel} title="Exportar a Excel">
            <i className="fa-solid fa-file-excel me-1"></i> Excel (.csv)
          </button>
          <button className="btn btn-outline-danger btn-sm rounded-pill" onClick={() => exportarPDF()} title="Exportar Reporte PDF">
            <i className="fa-solid fa-file-pdf me-1"></i> Reporte PDF
          </button>
          <button className="btn btn-outline-primary btn-sm rounded-pill" onClick={cargarDatos} disabled={cargando}>
            <i className="fa-solid fa-rotate me-1"></i> Actualizar
          </button>
        </div>
      </div>

      {/* Pestañas de Navegación del Panel */}
      <ul className="nav nav-tabs mb-4 fw-semibold border-bottom">
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link border-0 py-2 px-4 rounded-top-3 d-flex align-items-center gap-2 ${tabActiva === 'propiedades' ? 'active bg-primary text-white' : (darkMode ? 'text-white-50' : 'text-secondary')}`}
            onClick={() => setTabActiva('propiedades')}
          >
            <i className="fa-solid fa-house-chimney"></i> Gestión de Propiedades
          </button>
        </li>
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link border-0 py-2 px-4 rounded-top-3 d-flex align-items-center gap-2 ${tabActiva === 'consultas' ? 'active bg-primary text-white' : (darkMode ? 'text-white-50' : 'text-secondary')}`}
            onClick={() => setTabActiva('consultas')}
          >
            <i className="fa-solid fa-comments"></i> Consultas CRM / Envíos
          </button>
        </li>
        {esAdmin && (
          <li className="nav-item">
            <button
              type="button"
              className={`nav-link border-0 py-2 px-4 rounded-top-3 d-flex align-items-center gap-2 ${tabActiva === 'usuarios' ? 'active bg-primary text-white' : (darkMode ? 'text-white-50' : 'text-secondary')}`}
              onClick={() => setTabActiva('usuarios')}
            >
              <i className="fa-solid fa-user-plus"></i> Alta de Usuarios / Agentes
            </button>
          </li>
        )}
      </ul>

      {tabActiva === 'consultas' ? (
        <div className={`card shadow-sm border-0 p-4 rounded-4 ${darkMode ? 'bg-dark border border-secondary' : 'bg-white'}`}>
          <ConsultasCrm />
        </div>
      ) : tabActiva === 'usuarios' ? (
        <div className={`card shadow-sm border-0 p-4 rounded-4 max-w-lg mx-auto ${darkMode ? 'bg-dark border border-secondary text-white' : 'bg-white'}`} style={{ maxWidth: '650px' }}>
          <h5 className="fw-bold text-primary mb-3 d-flex align-items-center gap-2">
            <i className="fa-solid fa-user-plus"></i> Registrar Nuevo Agente o Usuario
          </h5>
          <p className="text-muted small">El registro público está desactivado. Utiliza este formulario exclusivo de Administrador para dar de alta nuevos miembros del equipo.</p>
          
          <form onSubmit={handleCrearUsuarioSubmit} className="row g-3">
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Nombre</label>
              <input
                type="text"
                className={`form-control ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}
                value={nuevoUsuario.nombre}
                onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value })}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Apellido</label>
              <input
                type="text"
                className={`form-control ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}
                value={nuevoUsuario.apellido}
                onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, apellido: e.target.value })}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Correo Electrónico</label>
              <input
                type="email"
                className={`form-control ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}
                value={nuevoUsuario.email}
                onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, email: e.target.value })}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Teléfono</label>
              <input
                type="tel"
                className={`form-control ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}
                value={nuevoUsuario.telefono}
                onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, telefono: e.target.value })}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Contraseña Inicial</label>
              <input
                type="password"
                className={`form-control ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}
                value={nuevoUsuario.password}
                onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, password: e.target.value })}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Rol Asignado</label>
              <select
                className={`form-select ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}
                value={nuevoUsuario.rol}
                onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, rol: e.target.value })}
              >
                <option value="AGENTE">AGENTE (Asesor Inmobiliario)</option>
                <option value="ADMIN">ADMIN (Administrador)</option>
                <option value="CLIENTE">CLIENTE</option>
              </select>
            </div>
            <div className="col-12 pt-3">
              <button type="submit" disabled={guardandoUsuario} className="btn btn-primary w-100 fw-bold rounded-pill">
                {guardandoUsuario ? 'Registrando...' : 'Dar de Alta Usuario'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          {/* Tarjetas KPI de Métricas Rápidas */}
          <div className="row g-3 mb-4">
            <KPICard title="Total Inmuebles" value={propiedades.length} iconClass="fa-solid fa-building" colorClass="primary" darkMode={darkMode} />
            <KPICard title="En Venta" value={totalVentas} iconClass="fa-solid fa-tags" colorClass="success" darkMode={darkMode} />
            <KPICard title="En Alquiler" value={totalAlquileres} iconClass="fa-solid fa-key" colorClass="info" darkMode={darkMode} />
          </div>

      {/* SECCIÓN DE GRÁFICOS VISUALES */}
      <div className={`card shadow-sm border-0 p-4 rounded-3 mb-4 ${darkMode ? 'bg-dark border border-secondary text-white' : 'bg-white'}`}>
        <h5 className="card-title mb-3 fw-bold text-primary d-flex align-items-center gap-2">
          <i className="fa-solid fa-chart-column"></i> Distribución de Inmuebles por Tipo
        </h5>

        {propiedades.length === 0 ? (
          <p className="text-muted small m-0">No hay suficientes datos para generar gráficos visuales.</p>
        ) : (
          <div className="row g-3 align-items-center">
            {Object.keys(tiposCounts).map(tipo => {
              const cantidad = tiposCounts[tipo];
              const porcentaje = Math.round((cantidad / propiedades.length) * 100);
              return (
                <ProgressBarItem
                  key={tipo}
                  tipo={tipo}
                  cantidad={cantidad}
                  porcentaje={porcentaje}
                />
              );
            })}
          </div>
        )}
      </div>

      <div className="row g-4">
        {/* Formulario de Alta / Edición de Propiedad */}
        <div className="col-lg-5">
          <div className={`card shadow-sm border-0 p-4 rounded-3 ${darkMode ? 'bg-dark border border-secondary text-white' : 'bg-white'}`}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="card-title fw-bold text-primary m-0 d-flex align-items-center gap-2">
                <i className={`fa-solid ${editingId ? 'fa-pen-to-square' : 'fa-circle-plus'}`}></i>
                {editingId ? 'Editar Propiedad' : 'Nueva Propiedad'}
              </h5>
              {editingId && (
                <button type="button" className="btn btn-sm btn-outline-secondary rounded-pill" onClick={handleCancelarEdicion}>
                  Cancelar
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="row g-3">
              <div className="col-12">
                <label htmlFor="titulo" className="form-label small fw-semibold">Título de la publicación</label>
                <input
                  id="titulo"
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  className={`form-control ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}
                  placeholder="Ej: Casa céntrica 3 dormitorios"
                  required
                />
              </div>

              <div className="col-12">
                <label htmlFor="descripcion" className="form-label small fw-semibold">Descripción</label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  rows="2"
                  value={formData.descripcion}
                  onChange={handleChange}
                  className={`form-control ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}
                  placeholder="Detalles sobre el inmueble..."
                />
              </div>

              <div className="col-md-6">
                <label htmlFor="tipoOperacion" className="form-label small fw-semibold">Operación</label>
                <select
                  id="tipoOperacion"
                  name="tipoOperacion"
                  value={formData.tipoOperacion}
                  onChange={handleChange}
                  className={`form-select ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}
                >
                  <option value="VENTA">Venta</option>
                  <option value="ALQUILER">Alquiler</option>
                  <option value="ALQUILER_TEMPORARIO">Alquiler Temporario</option>
                </select>
              </div>

              <div className="col-md-6">
                <label htmlFor="tipoPropiedad" className="form-label small fw-semibold">Tipo de Inmueble</label>
                <select
                  id="tipoPropiedad"
                  name="tipoPropiedad"
                  value={formData.tipoPropiedad}
                  onChange={handleChange}
                  className={`form-select ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}
                >
                  <option value="CASA">Casa</option>
                  <option value="DEPARTAMENTO">Departamento</option>
                  <option value="TERRENO">Terreno</option>
                  <option value="LOCAL">Local</option>
                  <option value="CAMPO">Campo</option>
                </select>
              </div>

              <div className="col-md-7">
                <label htmlFor="precio" className="form-label small fw-semibold">Precio</label>
                <input
                  id="precio"
                  type="number"
                  step="0.01"
                  name="precio"
                  value={formData.precio}
                  onChange={handleChange}
                  className={`form-control ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="col-md-5">
                <label htmlFor="moneda" className="form-label small fw-semibold">Moneda</label>
                <select
                  id="moneda"
                  name="moneda"
                  value={formData.moneda}
                  onChange={handleChange}
                  className={`form-select ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}
                >
                  <option value="USD">USD ($)</option>
                  <option value="ARS">ARS ($)</option>
                </select>
              </div>

              <div className="col-12">
                <label htmlFor="direccion" className="form-label small fw-semibold">Dirección</label>
                <input
                  id="direccion"
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  className={`form-control ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}
                  placeholder="Calle y altura"
                  required
                />
              </div>

              <div className="col-md-6">
                <label htmlFor="ciudad" className="form-label small fw-semibold">Ciudad</label>
                <input
                  id="ciudad"
                  type="text"
                  name="ciudad"
                  value={formData.ciudad}
                  onChange={handleChange}
                  className={`form-control ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}
                  required
                />
              </div>

              <div className="col-md-6">
                <label htmlFor="agenteId" className="form-label small fw-semibold">Agente Asignado</label>
                <select
                  id="agenteId"
                  name="agenteId"
                  value={formData.agenteId}
                  onChange={handleChange}
                  className={`form-select ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}
                >
                  {agentes.length === 0 ? (
                    <option value="">Sin Agentes</option>
                  ) : (
                    agentes.map(ag => (
                      <option key={ag.id} value={ag.id}>{ag.nombre} {ag.apellido}</option>
                    ))
                  )}
                </select>
              </div>

              <div className="col-md-4">
                <label htmlFor="ambientes" className="form-label small fw-semibold">Ambientes</label>
                <input
                  id="ambientes"
                  type="number"
                  name="ambientes"
                  value={formData.ambientes}
                  onChange={handleChange}
                  className={`form-control ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}
                  min="1"
                />
              </div>

              <div className="col-md-4">
                <label htmlFor="dormitorios" className="form-label small fw-semibold">Dormitorios</label>
                <input
                  id="dormitorios"
                  type="number"
                  name="dormitorios"
                  value={formData.dormitorios}
                  onChange={handleChange}
                  className={`form-control ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}
                  min="0"
                />
              </div>

              <div className="col-md-4">
                <label htmlFor="banos" className="form-label small fw-semibold">Baños</label>
                <input
                  id="banos"
                  type="number"
                  name="banos"
                  value={formData.banos}
                  onChange={handleChange}
                  className={`form-control ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}
                  min="1"
                />
              </div>

              <div className="col-md-6">
                <label htmlFor="superficieTotal" className="form-label small fw-semibold">Superficie Total (m²)</label>
                <input
                  id="superficieTotal"
                  type="number"
                  step="0.01"
                  name="superficieTotal"
                  value={formData.superficieTotal}
                  onChange={handleChange}
                  className={`form-control ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}
                  placeholder="Ej: 250"
                />
              </div>

              <div className="col-md-6">
                <label htmlFor="superficieCubierta" className="form-label small fw-semibold">Superficie Cubierta (m²)</label>
                <input
                  id="superficieCubierta"
                  type="number"
                  step="0.01"
                  name="superficieCubierta"
                  value={formData.superficieCubierta}
                  onChange={handleChange}
                  className={`form-control ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}
                  placeholder="Ej: 110"
                />
              </div>

              <div className="col-12 d-flex flex-wrap gap-3 pt-1">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" name="cochera" id="cochera" checked={formData.cochera} onChange={handleChange} />
                  <label className="form-check-label small" htmlFor="cochera">Cochera</label>
                </div>
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" name="patio" id="patio" checked={formData.patio} onChange={handleChange} />
                  <label className="form-check-label small" htmlFor="patio">Patio</label>
                </div>
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" name="destacada" id="destacada" checked={formData.destacada} onChange={handleChange} />
                  <label className="form-check-label small fw-semibold text-warning" htmlFor="destacada">
                    <i className="fa-solid fa-star me-1"></i>Destacada
                  </label>
                </div>
              </div>

              <div className="col-12 border-top pt-3 mt-2">
                <label htmlFor="imagenesInput" className="form-label small fw-semibold d-block">Imágenes de la propiedad</label>
                <input
                  id="imagenesInput"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImagenesChange}
                  className={`form-control form-control-sm ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}
                />

                {formData.imagenes.length > 0 && (
                  <div className="d-flex flex-wrap gap-2 mt-3">
                    {formData.imagenes.map((img, index) => (
                      <div key={index} className="position-relative">
                        <img
                          src={formatUrl(img)}
                          alt={`Preview ${index + 1}`}
                          className="rounded border object-fit-cover"
                          style={{ width: '65px', height: '65px' }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=600&q=80';
                          }}
                        />
                        <button
                          type="button"
                          className="btn btn-danger btn-sm position-absolute top-0 end-0 p-0 rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: '20px', height: '20px', fontSize: '10px', transform: 'translate(30%, -30%)' }}
                          onClick={() => handleQuitarImagen(index)}
                          title="Quitar foto"
                          aria-label={`Quitar foto ${index + 1}`}
                        >
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="col-12 pt-2">
                <button type="submit" className="btn btn-primary w-100 fw-bold py-2 shadow-sm rounded-pill" disabled={guardando}>
                  {guardando ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <i className={`fa-solid ${editingId ? 'fa-pen-to-square' : 'fa-floppy-disk'} me-1`}></i>
                      {editingId ? 'Guardar Cambios' : 'Guardar Propiedad'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Listado / Tabla de Gestión */}
        <div className="col-lg-7">
          <div className={`card shadow-sm border-0 p-4 rounded-3 ${darkMode ? 'bg-dark border border-secondary text-white' : 'bg-white'}`}>
            <h5 className="card-title mb-3 fw-bold d-flex align-items-center gap-2">
              <i className="fa-solid fa-list-check text-primary"></i> Listado Registrado
            </h5>

            {cargando ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="small text-muted mt-2">Cargando registros...</p>
              </div>
            ) : propiedades.length === 0 ? (
              <div className="text-center py-4 text-muted">
                <i className="fa-solid fa-folder-open fa-2x mb-2"></i>
                <p>No hay propiedades registradas aún.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className={`table align-middle ${darkMode ? 'table-dark table-hover' : 'table-hover'}`}>
                  <thead>
                    <tr className="border-bottom">
                      <th>Título</th>
                      <th>Operación</th>
                      <th>Precio</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {propiedades.map(p => (
                      <TableRowItem
                        key={p.id}
                        p={p}
                        darkMode={darkMode}
                        onPDF={exportarPDF}
                        onEdit={handleEditar}
                        onDelete={handleEliminar}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
        </>
      )}
    </main>
  );
};