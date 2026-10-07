import React, { useState, useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

/**
 * Componente de filtros de búsqueda avanzados
 * Permite filtrar por tipo de operación, tipo de inmueble, ciudad,
 * presupuesto min/máx, cantidad de ambientes y palabras clave.
 */
export const PropertyFilter = ({ onBuscar }) => {
  const { darkMode } = useContext(ThemeContext);

  // Estado inicial de todos los criterios de filtrado
  const estadoInicial = {
    keyword: '',
    tipoOperacion: '',
    tipoPropiedad: '',
    ciudad: '',
    precioMin: '',
    precioMax: '',
    ambientes: ''
  };

  const [filtros, setFiltros] = useState(estadoInicial);
  const [mostrarAvanzados, setMostrarAvanzados] = useState(false);

  /**
   * Maneja el cambio de valor en cada input/select del formulario
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Envía el objeto de filtros estructurado al componente padre (Home.jsx)
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    onBuscar(filtros);
  };

  /**
   * Restablece los filtros a su estado inicial y recarga la búsqueda completa
   */
  const handleLimpiar = () => {
    setFiltros(estadoInicial);
    onBuscar(estadoInicial);
  };

  return (
    <section className={`card shadow-sm p-4 mb-4 rounded-3 border-0 transition-all ${
      darkMode ? 'bg-dark text-white border border-secondary' : 'bg-white'
    }`}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="m-0 fw-bold fs-5">
          <i className="fa-solid fa-filter me-2 text-primary"></i>
          Filtrar Propiedades
        </h4>
        <button
          type="button"
          className="btn btn-sm btn-link text-decoration-none fw-semibold p-0"
          onClick={() => setMostrarAvanzados(!mostrarAvanzados)}
        >
          {mostrarAvanzados ? (
            <><i className="fa-solid fa-sliders me-1"></i> Ocultar avanzados</>
          ) : (
            <><i className="fa-solid fa-sliders me-1"></i> Más filtros</>
          )}
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Filtros Básicos */}
        <div className="row g-3">
          {/* Búsqueda por palabra clave */}
          <div className="col-12 col-md-4">
            <label className="form-label small fw-semibold">Búsqueda General</label>
            <div className="input-group">
              <span className={`input-group-text ${darkMode ? 'bg-secondary text-white border-secondary' : 'bg-light'}`}>
                <i className="fa-solid fa-magnifying-glass text-muted"></i>
              </span>
              <input
                type="text"
                name="keyword"
                value={filtros.keyword}
                onChange={handleChange}
                className={`form-control ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}
                placeholder="Ej. Centro, Jardín, Calle Mitre..."
              />
            </div>
          </div>

          {/* Tipo de Operación */}
          <div className="col-12 col-sm-6 col-md-2">
            <label className="form-label small fw-semibold">Operación</label>
            <select
              name="tipoOperacion"
              value={filtros.tipoOperacion}
              onChange={handleChange}
              className={`form-select ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}
            >
              <option value="">Todas</option>
              <option value="VENTA">Venta</option>
              <option value="ALQUILER">Alquiler</option>
              <option value="ALQUILER_TEMPORARIO">Alquiler Temporario</option>
            </select>
          </div>

          {/* Tipo de Propiedad */}
          <div className="col-12 col-sm-6 col-md-3">
            <label className="form-label small fw-semibold">Tipo de Propiedad</label>
            <select
              name="tipoPropiedad"
              value={filtros.tipoPropiedad}
              onChange={handleChange}
              className={`form-select ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}
            >
              <option value="">Todos los inmuebles</option>
              <option value="CASA">Casa</option>
              <option value="DEPARTAMENTO">Departamento</option>
              <option value="TERRENO">Terreno</option>
              <option value="LOCAL">Local / Comercial</option>
              <option value="CAMPO">Campo / Chacra</option>
            </select>
          </div>

          {/* Ciudad */}
          <div className="col-12 col-md-3">
            <label className="form-label small fw-semibold">Ciudad / Localidad</label>
            <input
              type="text"
              name="ciudad"
              value={filtros.ciudad}
              onChange={handleChange}
              className={`form-control ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}
              placeholder="Ej: Coronel Pringles"
            />
          </div>
        </div>

        {/* Filtros Avanzados (Desplegables) */}
        {mostrarAvanzados && (
          <div className="row g-3 mt-1 border-top pt-3">
            {/* Precio Mínimo */}
            <div className="col-12 col-sm-4">
              <label className="form-label small fw-semibold">Precio Mínimo</label>
              <input
                type="number"
                name="precioMin"
                value={filtros.precioMin}
                onChange={handleChange}
                className={`form-control ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}
                placeholder="Mínimo ($ / USD)"
                min="0"
              />
            </div>

            {/* Precio Máximo */}
            <div className="col-12 col-sm-4">
              <label className="form-label small fw-semibold">Precio Máximo</label>
              <input
                type="number"
                name="precioMax"
                value={filtros.precioMax}
                onChange={handleChange}
                className={`form-control ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}
                placeholder="Máximo ($ / USD)"
                min="0"
              />
            </div>

            {/* Mínimo de Ambientes */}
            <div className="col-12 col-sm-4">
              <label className="form-label small fw-semibold">Mínimo de Ambientes</label>
              <select
                name="ambientes"
                value={filtros.ambientes}
                onChange={handleChange}
                className={`form-select ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}
              >
                <option value="">Cualquier cantidad</option>
                <option value="1">1 o más ambientes</option>
                <option value="2">2 o más ambientes</option>
                <option value="3">3 o más ambientes</option>
                <option value="4">4 o más ambientes</option>
              </select>
            </div>
          </div>
        )}

        {/* Botones de Acción */}
        <div className="d-flex justify-content-end align-items-center gap-2 mt-4">
          <button
            type="button"
            onClick={handleLimpiar}
            className="btn btn-outline-secondary btn-sm px-3 rounded-pill"
            title="Restablecer filtros de búsqueda"
          >
            <i className="fa-solid fa-rotate-left me-1"></i> Limpiar
          </button>

          <button
            type="submit"
            className="btn btn-primary btn-sm px-4 fw-bold rounded-pill shadow-sm"
          >
            <i className="fa-solid fa-magnifying-glass me-1"></i> Aplicar Filtros
          </button>
        </div>
      </form>
    </section>
  );
};