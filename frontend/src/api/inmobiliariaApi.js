// URL Base donde corre el servidor Backend Java Spring Boot
const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Obtiene el token de autenticación del almacenamiento local (si existe).
 * @returns {Object} Cabeceras de autenticación JWT.
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

/**
 * Convierte un objeto de JavaScript y una lista opcional de archivos binarios 
 * en un objeto FormData compatible con el backend Spring Boot (Multipart/Form-Data).
 * 
 * @param {Object} propiedadData - Atributos de la propiedad (titulo, precio, etc.).
 * @param {Array|FileList} archivosImagenes - Lista de archivos binarios de imágenes seleccionados.
 * @param {number|string|null} agenteId - ID del agente asignado (opcional).
 * @returns {FormData} Objeto FormData listo para enviar por HTTP POST/PUT.
 */
const construirPropiedadFormData = (propiedadData = {}, archivosImagenes = [], agenteId = null) => {
  const formData = new FormData();

  // 1. Iterar y adjuntar los atributos textuales/numéricos de la propiedad
  Object.keys(propiedadData).forEach((clave) => {
    // Prevenir enviar la entidad o atributos 'agente', 'imagenes' o 'fotos' como cadenas "[object Object]"
    if (clave === 'agente' || clave === 'imagenes' || clave === 'fotos' || clave === 'files') return;

    const valor = propiedadData[clave];
    if (valor !== null && valor !== undefined && valor !== '') {
      formData.append(clave, valor);
    }
  });

  // 2. Adjuntar el ID del agente explícitamente si fue provisto
  const idAgenteFinal = agenteId || (propiedadData.agenteId ? propiedadData.agenteId : (propiedadData.agente && propiedadData.agente.id ? propiedadData.agente.id : null));
  if (idAgenteFinal) {
    formData.append('agenteId', idAgenteFinal);
  }

  // 3. Adjuntar cada archivo binario con el nombre de parámetro 'imagenes'
  if (archivosImagenes && archivosImagenes.length > 0) {
    Array.from(archivosImagenes).forEach((archivo) => {
      if (archivo instanceof File || archivo instanceof Blob) {
        formData.append('imagenes', archivo);
      }
    });
  }

  return formData;
};

/**
 * Módulo de comunicación con los endpoints REST del Backend Java Spring Boot.
 * Gestiona peticiones HTTP para propiedades, usuarios, consultas CRM, contratos y pagos.
 */
export const InmobiliariaAPI = {

  // ==========================================
  // --- PROPIEDADES ---
  // ==========================================

  /**
   * Obtiene la lista completa de propiedades registradas.
   * @returns {Promise<Array>} Lista de objetos de propiedades.
   */
  async getPropiedades() {
    const response = await fetch(`${API_BASE_URL}/propiedades`, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        ...getAuthHeaders()
      },
      cache: 'no-store'
    });
    if (!response.ok) throw new Error('Error al obtener la lista de propiedades.');
    return await response.json();
  },

  /**
   * Obtiene los detalles de una propiedad por su ID.
   * @param {number|string} id - Identificador de la propiedad.
   * @returns {Promise<Object>} Datos detallados de la propiedad.
   */
  async getPropiedadPorId(id) {
    const response = await fetch(`${API_BASE_URL}/propiedades/${id}`, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        ...getAuthHeaders()
      },
      cache: 'no-store'
    });
    if (!response.ok) throw new Error(`Error al obtener la propiedad con ID ${id}.`);
    return await response.json();
  },

  /**
   * Realiza una búsqueda de propiedades utilizando filtros dinámicos.
   * @param {Object} filtros - Filtros como tipoOperacion, tipoPropiedad, ciudad, etc.
   * @returns {Promise<Array>} Resultado de propiedades filtradas.
   */
  async buscarPropiedades(filtros = {}) {
    const params = new URLSearchParams();
    if (filtros.ciudad) params.append('ciudad', filtros.ciudad);
    if (filtros.tipoOperacion) params.append('tipoOperacion', filtros.tipoOperacion);
    if (filtros.tipoPropiedad) params.append('tipoPropiedad', filtros.tipoPropiedad);
    if (filtros.precioMin) params.append('precioMin', filtros.precioMin);
    if (filtros.precioMax) params.append('precioMax', filtros.precioMax);
    if (filtros.ambientes) params.append('ambientes', filtros.ambientes);
    if (filtros.dormitorios) params.append('dormitorios', filtros.dormitorios);
    if (filtros.estado) params.append('estado', filtros.estado);

    const response = await fetch(`${API_BASE_URL}/propiedades/buscar?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        ...getAuthHeaders()
      },
      cache: 'no-store'
    });
    if (!response.ok) throw new Error('Error al filtrar las propiedades.');
    return await response.json();
  },

  /**
   * Registra una nueva propiedad adjuntando sus datos y archivos binarios de imágenes.
   * Utiliza FormData (multipart/form-data) para sincronizarse con Spring Boot.
   * 
   * @param {Object} propiedadData - Objeto con datos de la propiedad (titulo, precio, etc.).
   * @param {Array|FileList} archivosImagenes - Archivos de imagen seleccionados desde un input tipo file.
   * @param {number|string|null} agenteId - ID opcional del agente responsable.
   * @returns {Promise<Object>} Objeto de la propiedad recién creada.
   */
  async crearPropiedad(propiedadData, archivosImagenes = [], agenteId = null) {
    const formData = construirPropiedadFormData(propiedadData, archivosImagenes, agenteId);

    const response = await fetch(`${API_BASE_URL}/propiedades`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders()
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Error al crear la propiedad y subir sus imágenes.');
    }
    return await response.json();
  },

  /**
   * Actualiza una propiedad existente enviando sus nuevos datos y/o imágenes binarias.
   * 
   * @param {number|string} id - Identificador de la propiedad a modificar.
   * @param {Object} propiedadData - Datos actualizados de la propiedad.
   * @param {Array|FileList} archivosImagenes - Nuevas fotos a agregar (opcional).
   * @param {number|string|null} agenteId - ID opcional del agente.
   * @returns {Promise<Object>} Propiedad actualizada.
   */
  async actualizarPropiedad(id, propiedadData, archivosImagenes = [], agenteId = null) {
    const formData = construirPropiedadFormData(propiedadData, archivosImagenes, agenteId);

    const response = await fetch(`${API_BASE_URL}/propiedades/${id}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders()
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Error al actualizar la propiedad con ID ${id}.`);
    }
    return await response.json();
  },

  /**
   * Asigna un agente o usuario responsable a una propiedad específica.
   * @param {number|string} propiedadId - Identificador de la propiedad.
   * @param {number|string} agenteId - Identificador del agente/usuario.
   * @returns {Promise<Object>} Propiedad actualizada.
   */
  async asignarAgenteAPropiedad(propiedadId, agenteId) {
    const response = await fetch(`${API_BASE_URL}/propiedades/${propiedadId}/agente/${agenteId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });
    if (!response.ok) throw new Error(`Error al asignar el agente ${agenteId} a la propiedad ${propiedadId}.`);
    return await response.json();
  },

  /**
   * Elimina una propiedad por ID de la base de datos.
   * @param {number|string} id - Identificador de la propiedad a eliminar.
   * @returns {Promise<boolean>} Devuelve true si la eliminación fue exitosa.
   */
  async eliminarPropiedad(id) {
    const response = await fetch(`${API_BASE_URL}/propiedades/${id}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders()
      }
    });
    if (!response.ok) throw new Error('Error al eliminar la propiedad.');
    return true;
  },

  /**
   * Elimina una foto específica de una propiedad en la base de datos y servidor.
   * @param {number|string} fotoId - ID de la foto a eliminar.
   * @returns {Promise<boolean>} Devuelve true si la eliminación fue exitosa.
   */
  async eliminarFoto(fotoId) {
    const response = await fetch(`${API_BASE_URL}/fotos/${fotoId}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders()
      }
    });
    if (!response.ok) throw new Error(`Error al eliminar la foto con ID ${fotoId}.`);
    return true;
  },

  // ==========================================
  // --- CONSULTAS CRM ---
  // ==========================================

  /**
   * Obtiene todas las consultas registradas en el CRM.
   * @returns {Promise<Array>} Lista de consultas CRM.
   */
  async getConsultas() {
    const response = await fetch(`${API_BASE_URL}/consultas`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });
    if (!response.ok) throw new Error('Error al listar las consultas del CRM.');
    return await response.json();
  },

  /**
   * Obtiene las consultas registradas en el CRM asignadas a un agente específico.
   * @param {number|string} agenteId - ID del agente.
   * @returns {Promise<Array>} Lista de consultas asignadas al agente.
   */
  async getConsultasPorAgente(agenteId) {
    const response = await fetch(`${API_BASE_URL}/consultas/agente/${agenteId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });
    if (!response.ok) throw new Error('Error al listar las consultas del agente.');
    return await response.json();
  },

  /**
   * Crea una nueva consulta enviada desde el portal público.
   * @param {Object} consultaData - Datos de contacto y mensaje.
   * @returns {Promise<Object>} Consulta creada.
   */
  async crearConsulta(consultaData) {
    const response = await fetch(`${API_BASE_URL}/consultas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(consultaData)
    });
    if (!response.ok) throw new Error('Error al enviar la consulta.');
    return await response.json();
  },

  /**
   * Modifica el estado de una consulta (PENDIENTE, ATENDIDA, CANCELADA).
   * @param {number|string} id - Identificador de la consulta.
   * @param {string} estado - Nuevo estado asignado.
   * @returns {Promise<Object>} Consulta actualizada.
   */
  async cambiarEstadoConsulta(id, estado) {
    const response = await fetch(`${API_BASE_URL}/consultas/${id}/estado?estado=${estado}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });
    if (!response.ok) throw new Error('Error al cambiar el estado de la consulta.');
    return await response.json();
  },

  /**
   * Elimina una consulta de la base de datos (Exclusivo Administrador).
   * @param {number|string} id - Identificador de la consulta a eliminar.
   * @returns {Promise<boolean>} Devuelve true si la eliminación fue exitosa.
   */
  async eliminarConsulta(id) {
    const response = await fetch(`${API_BASE_URL}/consultas/${id}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders()
      }
    });
    if (!response.ok) throw new Error('Error al eliminar la consulta.');
    return true;
  },

  // ==========================================
  // --- CONTRATOS ---
  // ==========================================

  /**
   * Obtiene el listado completo de contratos.
   * @returns {Promise<Array>} Lista de contratos.
   */
  async getContratos() {
    const response = await fetch(`${API_BASE_URL}/contratos`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });
    if (!response.ok) throw new Error('Error al obtener los contratos.');
    return await response.json();
  },

  /**
   * Registra un nuevo contrato de alquiler.
   * @param {Object} contratoData - Datos del contrato (propiedadId, inquilinoId, monto, etc.).
   * @returns {Promise<Object>} Contrato recién creado.
   */
  async crearContrato(contratoData) {
    const response = await fetch(`${API_BASE_URL}/contratos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(contratoData)
    });
    if (!response.ok) throw new Error('Error al registrar el contrato.');
    return await response.json();
  },

  // ==========================================
  // --- PAGOS / LIQUIDACIONES ---
  // ==========================================

  /**
   * Obtiene el historial global de pagos de cuotas.
   * @returns {Promise<Array>} Lista de pagos.
   */
  async getPagos() {
    const response = await fetch(`${API_BASE_URL}/pagos`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });
    if (!response.ok) throw new Error('Error al obtener el historial de pagos.');
    return await response.json();
  },

  /**
   * Obtiene los pagos pertenecientes a un contrato en particular.
   * @param {number|string} contratoId - ID del contrato.
   * @returns {Promise<Array>} Lista de pagos de dicho contrato.
   */
  async getPagosPorContrato(contratoId) {
    const response = await fetch(`${API_BASE_URL}/pagos/contrato/${contratoId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });
    if (!response.ok) throw new Error(`Error al consultar los pagos del contrato ${contratoId}.`);
    return await response.json();
  },

  /**
   * Registra la cuota o liquidación de un pago abonado.
   * @param {Object} pagoData - Información de la cuota (contratoId, periodo, monto).
   * @returns {Promise<Object>} Registro del pago.
   */
  async registrarPago(pagoData) {
    const response = await fetch(`${API_BASE_URL}/pagos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(pagoData)
    });
    if (!response.ok) throw new Error('Error al registrar la transacción de pago.');
    return await response.json();
  },

  // ==========================================
  // --- USUARIOS / AGENTES ---
  // ==========================================

  /**
   * Obtiene el listado completo de agentes / usuarios registrados.
   * @returns {Promise<Array>} Lista de usuarios/agentes.
   */
  async getUsuarios() {
    const response = await fetch(`${API_BASE_URL}/usuarios`, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        ...getAuthHeaders()
      },
      cache: 'no-store'
    });
    if (!response.ok) throw new Error('Error al listar los usuarios.');
    return await response.json();
  },

  /**
   * Obtiene un usuario o agente específico por su ID.
   * @param {number|string} id - Identificador del usuario.
   * @returns {Promise<Object>} Objeto del usuario/agente.
   */
  async getUsuarioPorId(id) {
    const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        ...getAuthHeaders()
      },
      cache: 'no-store'
    });
    if (!response.ok) throw new Error(`Error al obtener el usuario con ID ${id}.`);
    return await response.json();
  }
};