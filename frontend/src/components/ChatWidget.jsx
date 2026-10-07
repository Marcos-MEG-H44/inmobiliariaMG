import React, { useState, useEffect, useRef, useContext } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';

/**
 * Componente flotante de Chat de Soporte / Consultas en Tiempo Real con WebSockets.
 * Emite alertas sonoras y visuales cuando la ventana está cerrada.
 */
export const ChatWidget = () => {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [conectado, setConectado] = useState(false);
  const [noLeidos, setNoLeidos] = useState(0);

  const stompClientRef = useRef(null);
  const chatScrollRef = useRef(null);
  const abiertoRef = useRef(abierto);

  const { darkMode } = useContext(ThemeContext);
  const { usuario } = useContext(AuthContext);

  const nombreEmisor = usuario?.nombre || 'Visitante';

  // Sincronizar referencia de ventana abierta y resetear contador al abrir
  useEffect(() => {
    abiertoRef.current = abierto;
    if (abierto) {
      setNoLeidos(0);
    }
  }, [abierto]);

  // Autoscroll al recibir nuevos mensajes
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [mensajes, abierto]);

  // Conectar WebSocket al abrir la ventana por primera vez
  useEffect(() => {
    if (abierto && !conectado) {
      conectarWebSocket();
    }
  }, [abierto]);

  /**
   * Generador sintético de tono de notificación de audio utilizando Web Audio API
   */
  const reproducirSonidoNotificacion = () => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // Tono D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // Tono A5

      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch (err) {
      console.warn('Alerta sonora de chat no disponible:', err);
    }
  };

  const conectarWebSocket = () => {
    const socket = new SockJS('http://localhost:8080/ws-inmobiliaria');
    const client = Stomp.over(socket);

    // Desactivar logs de consola de STOMP
    client.debug = null;

    client.connect({}, () => {
      setConectado(true);
      stompClientRef.current = client;

      // Suscripción al canal público de consultas
      client.subscribe('/topic/public', (payload) => {
        const msg = JSON.parse(payload.body);
        setMensajes((prev) => [...prev, msg]);

        // Si la ventana está cerrada y el mensaje es del tipo CHAT, notificar
        if (!abiertoRef.current && msg.tipo === 'CHAT') {
          setNoLeidos((prev) => prev + 1);
          reproducirSonidoNotificacion();
        }
      });

      // Notificar ingreso al chat
      client.send(
        '/app/chat.addUser',
        {},
        JSON.stringify({
          emisor: nombreEmisor,
          tipo: 'JOIN'
        })
      );
    }, (error) => {
      console.error('Error al conectar con WebSocket:', error);
      setConectado(false);
    });
  };

  const handleVaciarChat = () => {
    setMensajes([]);
    setNoLeidos(0);
  };

  const handleEnviar = (e) => {
    e.preventDefault();
    if (!nuevoMensaje.trim() || !stompClientRef.current || !conectado) return;

    const chatMsg = {
      emisor: nombreEmisor,
      contenido: nuevoMensaje,
      tipo: 'CHAT'
    };

    stompClientRef.current.send('/app/chat.sendMessage', {}, JSON.stringify(chatMsg));
    setNuevoMensaje('');
  };

  return (
    <div className="position-fixed bottom-0 end-0 m-3" style={{ zIndex: 9999 }}>
      {/* Botón Flotante para abrir/cerrar con animación de alerta y badge de no leídos */}
      {!abierto && (
        <button
          onClick={() => setAbierto(true)}
          className={`btn ${noLeidos > 0 ? 'btn-success text-white shadow-lg animate-bounce' : 'btn-primary shadow-lg'} rounded-circle p-3 d-flex align-items-center justify-content-center position-relative`}
          style={{ width: '60px', height: '60px', transition: 'all 0.3s ease' }}
          title="Consultas en Vivo"
        >
          <i className={`fa-solid ${noLeidos > 0 ? 'fa-bell fa-shake' : 'fa-comments'} fa-xl`}></i>
          {noLeidos > 0 && (
            <span
              className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-light font-monospace shadow"
              style={{ fontSize: '0.75rem' }}
            >
              {noLeidos}
              <span className="visually-hidden">mensajes no leídos</span>
            </span>
          )}
        </button>
      )}

      {/* Ventana de Chat */}
      {abierto && (
        <div 
          className={`card shadow-lg border-0 rounded-4 overflow-hidden ${darkMode ? 'bg-dark text-white border-secondary' : 'bg-white'}`}
          style={{ width: '340px', height: '450px' }}
        >
          {/* Encabezado */}
          <div className="bg-primary text-white p-3 d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <i className="fa-solid fa-headset fa-lg"></i>
              <div>
                <h6 className="m-0 fw-bold">Consulta en Vivo</h6>
                <small className="opacity-75" style={{ fontSize: '0.75rem' }}>
                  {conectado ? '🟢 En línea' : '🟠 Conectando...'}
                </small>
              </div>
            </div>
            <div className="d-flex align-items-center gap-1">
              <button
                type="button"
                onClick={handleVaciarChat}
                className="btn btn-sm btn-outline-light border-0 py-0 px-2 d-flex align-items-center gap-1"
                title="Vaciar historial del chat"
                style={{ fontSize: '0.78rem' }}
              >
                <i className="fa-solid fa-trash-can"></i>
                <span>Vaciar</span>
              </button>
              <button 
                onClick={() => setAbierto(false)} 
                className="btn-close btn-close-white btn-sm ms-1" 
                aria-label="Cerrar"
              ></button>
            </div>
          </div>

          {/* Cuerpo del Chat / Mensajes */}
          <div 
            ref={chatScrollRef}
            className={`card-body overflow-auto p-3 ${darkMode ? 'bg-secondary bg-opacity-10' : 'bg-light'}`}
            style={{ height: '320px' }}
          >
            {mensajes.map((msg, index) => {
              if (msg.tipo === 'JOIN') {
                return (
                  <div key={index} className="text-center my-2">
                    <span className="badge bg-secondary bg-opacity-50 text-wrap small fw-normal">
                      {msg.contenido}
                    </span>
                  </div>
                );
              }

              const esMio = msg.emisor === nombreEmisor;

              return (
                <div 
                  key={index} 
                  className={`d-flex flex-column mb-2 ${esMio ? 'align-items-end' : 'align-items-start'}`}
                >
                  <span className="text-muted small px-1" style={{ fontSize: '0.7rem' }}>
                    {msg.emisor}
                  </span>
                  <div 
                    className={`p-2 px-3 rounded-3 shadow-sm ${
                      esMio 
                        ? 'bg-primary text-white rounded-bottom-end-0' 
                        : darkMode 
                          ? 'bg-dark text-white border border-secondary rounded-bottom-start-0' 
                          : 'bg-white text-dark rounded-bottom-start-0'
                    }`}
                    style={{ maxWidth: '80%', wordBreak: 'break-word' }}
                  >
                    {msg.contenido}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Formulario para escribir mensaje */}
          <form onSubmit={handleEnviar} className={`p-2 border-top d-flex gap-2 ${darkMode ? 'border-secondary bg-dark' : 'bg-white'}`}>
            <input
              type="text"
              className={`form-control form-control-sm rounded-pill ${darkMode ? 'bg-secondary bg-opacity-25 text-white border-secondary' : ''}`}
              placeholder="Escribe tu consulta..."
              value={nuevoMensaje}
              onChange={(e) => setNuevoMensaje(e.target.value)}
              disabled={!conectado}
            />
            <button 
              type="submit" 
              className="btn btn-primary btn-sm rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: '32px', height: '32px' }}
              disabled={!conectado || !nuevoMensaje.trim()}
            >
              <i className="fa-solid fa-paper-plane small"></i>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};