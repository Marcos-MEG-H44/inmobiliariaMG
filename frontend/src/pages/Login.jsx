import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

/**
 * Componente Login (Autenticación y Registro).
 * Permite la alternancia fluida entre inicio de sesión y registro de nuevo perfil.
 * Soporta precarga de imagen de perfil en Base64, visibilidad de contraseña y compatibilidad con Modo Oscuro.
 */
export const Login = () => {
  // Estado para alternar entre la pestaña de Login (true) y Registro (false)
  const [esLogin, setEsLogin] = useState(true);

  // Estado para visibilidad de contraseña (mostrar/ocultar caracteres)
  const [mostrarPassword, setMostrarPassword] = useState(false);

  // Estado de indicador de carga durante peticiones asíncronas
  const [cargando, setCargando] = useState(false);

  // Formulario unificado para Login y Registro
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    telefono: '',
    rol: 'CLIENTE',
    fotoPerfil: '',
  });

  // Mensajes dinámicos de error y éxito para feedback visual del usuario
  const [errorMsg, setErrorMsg] = useState('');
  const [exitoMsg, setExitoMsg] = useState('');

  // Consumo de contextos globales y react-router
  const { login, registro } = useContext(AuthContext);
  const { darkMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  /**
   * Manejador estándar de cambios en inputs de texto y select.
   */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * Previsualización y conversión de la foto de perfil subida por el usuario a formato Base64.
   */
  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, fotoPerfil: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Envío del formulario. Diferencia la acción a realizar según el valor de 'esLogin'.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setExitoMsg('');
    setCargando(true);

    try {
      if (esLogin) {
        // Petición de Inicio de Sesión
        const res = await login(formData.email, formData.password);
        if (res.success) {
          navigate('/');
        } else {
          setErrorMsg(res.message || 'Error al iniciar sesión. Verificá tus datos.');
        }
      } else {
        // Petición de Registro de Usuario
        const res = await registro(formData);
        if (res.success) {
          setExitoMsg('¡Cuenta registrada con éxito! Ya podés iniciar sesión.');
          setEsLogin(true);
        } else {
          setErrorMsg(res.message || 'Error al registrar la cuenta.');
        }
      }
    } catch (err) {
      setErrorMsg('Ocurrió un fallo inesperado de conexión. Intentá nuevamente.');
    } finally {
      setCargando(false);
    }
  };

  /**
   * Restablece los mensajes al alternar de pestaña.
   */
  const cambiarModoAcceso = (modoLogin) => {
    setEsLogin(modoLogin);
    setErrorMsg('');
    setExitoMsg('');
  };

  return (
    <div className={`container py-5 d-flex justify-content-center align-items-center flex-grow-1 ${darkMode ? 'text-white' : ''}`}>
      <div
        className={`card shadow-lg border-0 rounded-4 overflow-hidden p-4 p-md-5 ${darkMode ? 'bg-dark text-white border-secondary' : 'bg-white'}`}
        style={{ maxWidth: '480px', width: '100%' }}
      >
        {/* Encabezado de Login */}
        <div className="text-center mb-4 border-bottom pb-3">
          <h4 className="fw-bold m-0 text-primary d-flex align-items-center justify-content-center gap-2">
            <i className="fa-solid fa-lock"></i>
            <span>Iniciar Sesión</span>
          </h4>
          <small className="text-muted">Acceso restringido para agentes y personal autorizado</small>
        </div>

        {/* Notificaciones de error o éxito */}
        {errorMsg && <div className="alert alert-danger py-2 fs-6 text-center">{errorMsg}</div>}
        {exitoMsg && <div className="alert alert-success py-2 fs-6 text-center">{exitoMsg}</div>}

        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
          {/* Email */}
          <input
            type="email"
            name="email"
            className={`form-control p-3 rounded-3 ${darkMode ? 'bg-secondary bg-opacity-25 text-white border-secondary' : ''}`}
            placeholder="Correo electrónico*"
            required
            value={formData.email}
            onChange={handleChange}
          />

          {/* Campo Contraseña con botón Ojo para Alternar Visibilidad */}
          <div className="position-relative">
            <input
              type={mostrarPassword ? 'text' : 'password'}
              name="password"
              className={`form-control p-3 pe-5 rounded-3 ${darkMode ? 'bg-secondary bg-opacity-25 text-white border-secondary' : ''}`}
              placeholder="Contraseña*"
              required
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type="button"
              className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-muted text-decoration-none pe-3"
              onClick={() => setMostrarPassword(!mostrarPassword)}
              tabIndex="-1"
            >
              <i className={`fa-solid ${mostrarPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </button>
          </div>

          {/* Botón Principal de Acción */}
          <button type="submit" className="btn btn-primary btn-lg rounded-3 fw-bold mt-2" disabled={cargando}>
            {cargando ? (
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            ) : 'Ingresar al Sistema'}
          </button>
        </form>

        {/* Nota informativa sobre registro */}
        <div className="text-center mt-4 pt-2 border-top">
          <small className="text-muted d-block">
            <i className="fa-solid fa-shield-halved text-warning me-1"></i>
            El alta de nuevas cuentas de Agentes y Administradores es realizada exclusivamente por el Administrador del sistema.
          </small>
        </div>
      </div>
    </div>
  );
};