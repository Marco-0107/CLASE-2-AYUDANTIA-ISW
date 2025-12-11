import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@context/AuthContext';
import { io } from 'socket.io-client';
import { getMensajes, marcarMensajesLeidos } from '@services/chat.service';
import { getPilotos } from '@services/pilots.service';

export default function Chat() {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [conectado, setConectado] = useState(false);
  const [pilotos, setPilotos] = useState([]);
  const [pilotoSeleccionado, setPilotoSeleccionado] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [escribiendo, setEscribiendo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const mensajesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  // Conectar Socket.IO
  useEffect(() => {
    console.log('[Socket.IO] Iniciando conexion...');
    
    const newSocket = io('http://localhost:3000', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });    newSocket.on('connect', () => {
      console.log('[Socket.IO] Conectado con ID:', newSocket.id);
      setConectado(true);
      // Admin se une a su sala
      newSocket.emit('join-room', {
        userId: user.id,
        userType: 'admin',
      });
    });

    newSocket.on('disconnect', (reason) => {
      console.log('[Socket.IO] Desconectado. Razon:', reason);
      setConectado(false);
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('[Socket.IO] Reconectado despues de', attemptNumber, 'intentos');
      setConectado(true);
      // Re-unirse a la sala después de reconectar
      newSocket.emit('join-room', {
        userId: user.id,
        userType: 'admin',
      });
    });newSocket.on('receive-message', (mensaje) => {
      console.log('[Socket.IO] Mensaje recibido:', mensaje);
      // Agregar mensaje solo si no existe ya (evitar duplicados)
      setMensajes((prev) => {
        const existe = prev.some(m => 
          m.id_mensaje === mensaje.id_mensaje || 
          (m.contenido === mensaje.contenido && m.fecha_envio === mensaje.fecha_envio)
        );
        if (existe) {
          console.log('[Socket.IO] Mensaje duplicado, ignorando');
          return prev;
        }
        console.log('[Socket.IO] Agregando nuevo mensaje');
        return [...prev, mensaje];
      });
    });

    newSocket.on('user-typing', (data) => {
      if (data.tipo_usuario === 'piloto') {
        setEscribiendo(true);
        setTimeout(() => setEscribiendo(false), 3000);
      }
    });

    newSocket.on('error', (data) => {
      console.error('[Socket.IO] Error:', data.message);
      setError(data.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  // Cargar lista de pilotos
  useEffect(() => {
    cargarPilotos();
  }, []);

  // Cargar mensajes cuando se selecciona un piloto
  useEffect(() => {
    if (pilotoSeleccionado) {
      cargarMensajes(pilotoSeleccionado.id_piloto);
    }
  }, [pilotoSeleccionado]);

  // Auto-scroll a último mensaje
  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);
  const cargarPilotos = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getPilotos();
      if (result.success && Array.isArray(result.data)) {
        setPilotos(result.data);
      } else {
        setPilotos([]);
        setError(result.message || 'Error al cargar pilotos');
      }
    } catch (err) {
      console.error('Error cargando pilotos:', err);
      setPilotos([]);
      setError('Error al cargar pilotos');
    }
    setLoading(false);
  };
  const cargarMensajes = async (idPiloto) => {
    setLoading(true);
    setError('');
    try {
      const result = await getMensajes(idPiloto);
      if (result.success && Array.isArray(result.data)) {
        setMensajes(result.data);
        // Marcar mensajes como leídos
        await marcarMensajesLeidos(idPiloto);
      } else {
        setMensajes([]);
        setError(result.message || 'Error al cargar mensajes');
      }
    } catch (err) {
      console.error('Error cargando mensajes:', err);
      setMensajes([]);
      setError('Error al cargar mensajes');
    }
    setLoading(false);
  };
  const handleEnviarMensaje = (e) => {
    e.preventDefault();
    
    if (!nuevoMensaje.trim() || !pilotoSeleccionado || !socket) {
      console.warn('No se puede enviar mensaje: validación fallida');
      return;
    }

    const mensajeData = {
      contenido: nuevoMensaje.trim(),
      tipo_usuario: 'admin',
      id_usuario: user.id,
      id_piloto: pilotoSeleccionado.id_piloto,
    };

    console.log('Enviando mensaje vía Socket.IO:', mensajeData);
    socket.emit('send-message', mensajeData);
    
    // Limpiar input inmediatamente para mejor UX
    setNuevoMensaje('');
  };

  const handleTyping = () => {
    if (!socket || !pilotoSeleccionado) return;

    socket.emit('typing', {
      tipo_usuario: 'admin',
      id_piloto: pilotoSeleccionado.id_piloto,
    });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    const hoy = new Date();
    const esHoy = date.toDateString() === hoy.toDateString();
    
    if (esHoy) {
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="container">      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '32px', marginBottom: '10px', color: '#333' }}>
              Chat con Pilotos
            </h1>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Admin: <strong>{user?.nombre} {user?.apellido}</strong>
            </p>
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            padding: '10px 15px',
            borderRadius: '20px',
            backgroundColor: conectado ? '#d4edda' : '#f8d7da',
            border: `2px solid ${conectado ? '#c3e6cb' : '#f5c6cb'}`
          }}>
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: conectado ? '#28a745' : '#dc3545',
              marginRight: '8px',
              animation: conectado ? 'pulse 2s infinite' : 'none'
            }}></div>
            <span style={{ 
              fontSize: '14px', 
              fontWeight: 'bold',
              color: conectado ? '#155724' : '#721c24'
            }}>
              {conectado ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '300px 1fr', 
        gap: '20px',
        height: '600px'
      }}>
        {/* Lista de Pilotos */}
        <div className="card" style={{ overflowY: 'auto' }}>
          <h2 style={{ marginBottom: '20px', color: '#333' }}>Pilotos</h2>
            {loading && (!pilotos || pilotos.length === 0) && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div className="spinner" style={{ width: '30px', height: '30px', margin: '0 auto' }}></div>
              <p style={{ color: '#888', marginTop: '10px' }}>Cargando...</p>
            </div>
          )}

          {pilotos && pilotos.length === 0 && !loading && (
            <p style={{ color: '#888', textAlign: 'center' }}>No hay pilotos registrados</p>
          )}

          {pilotos && pilotos.map((piloto) => (
            <div
              key={piloto.id_piloto}
              onClick={() => setPilotoSeleccionado(piloto)}
              style={{
                padding: '15px',
                marginBottom: '10px',
                backgroundColor: pilotoSeleccionado?.id_piloto === piloto.id_piloto ? '#e7f3ff' : '#f8f9fa',
                borderRadius: '8px',
                cursor: 'pointer',
                border: pilotoSeleccionado?.id_piloto === piloto.id_piloto ? '2px solid #007bff' : '2px solid transparent',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ fontWeight: 'bold', color: '#333' }}>
                {piloto.nombre} {piloto.apellido}
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                {piloto.rut}
              </div>
            </div>
          ))}
        </div>

        {/* Área de Chat */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>
          {/* Header del Chat */}
          {pilotoSeleccionado ? (
            <>
              <div style={{ 
                padding: '20px', 
                borderBottom: '2px solid #dee2e6',
                backgroundColor: '#f8f9fa'
              }}>
                <h3 style={{ margin: 0, color: '#333' }}>
                  {pilotoSeleccionado.nombre} {pilotoSeleccionado.apellido}
                </h3>
                <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
                  RUT: {pilotoSeleccionado.rut} • Edad: {pilotoSeleccionado.edad} años
                </p>
              </div>

              {/* Mensajes */}
              <div style={{ 
                flex: 1, 
                padding: '20px', 
                overflowY: 'auto',
                backgroundColor: '#ffffff'
              }}>
                {(!mensajes || mensajes.length === 0) && !loading && (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '40px 20px',
                    color: '#888'
                  }}>
                    <p>No hay mensajes aún. ¡Inicia la conversación!</p>
                  </div>
                )}

                {mensajes && mensajes.map((mensaje, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      justifyContent: mensaje.tipo_usuario === 'admin' ? 'flex-end' : 'flex-start',
                      marginBottom: '15px'
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '70%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        backgroundColor: mensaje.tipo_usuario === 'admin' ? '#007bff' : '#e9ecef',
                        color: mensaje.tipo_usuario === 'admin' ? 'white' : '#333'
                      }}
                    >
                      <p style={{ margin: 0, wordBreak: 'break-word' }}>
                        {mensaje.contenido}
                      </p>
                      <p style={{ 
                        margin: '5px 0 0 0', 
                        fontSize: '11px',
                        opacity: 0.8,
                        textAlign: 'right'
                      }}>
                        {formatearFecha(mensaje.fecha_envio)}
                      </p>
                    </div>
                  </div>
                ))}

                {escribiendo && (
                  <div style={{ 
                    padding: '10px', 
                    color: '#888',
                    fontSize: '14px',
                    fontStyle: 'italic'
                  }}>
                    {pilotoSeleccionado.nombre} está escribiendo...
                  </div>
                )}

                <div ref={mensajesEndRef} />
              </div>

              {/* Input de Mensaje */}
              <form 
                onSubmit={handleEnviarMensaje}
                style={{ 
                  padding: '20px', 
                  borderTop: '2px solid #dee2e6',
                  backgroundColor: '#f8f9fa'
                }}
              >
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    value={nuevoMensaje}
                    onChange={(e) => setNuevoMensaje(e.target.value)}
                    onKeyDown={handleTyping}
                    placeholder="Escribe un mensaje..."
                    style={{
                      flex:1,
                      padding: '12px 16px',
                      border: '2px solid #dee2e6',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!nuevoMensaje.trim()}
                    style={{
                      padding: '12px 30px',
                      fontSize: '16px'
                    }}
                  >
                    Enviar
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#888'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>💬</div>
                <p style={{ fontSize: '18px' }}>
                  Selecciona un piloto para iniciar el chat
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
