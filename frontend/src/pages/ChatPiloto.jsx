import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@context/AuthContext';
import { io } from 'socket.io-client';
import { getMensajes, marcarMensajesLeidos } from '@services/chat.service';

export default function ChatPiloto() {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [conectado, setConectado] = useState(false);
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [escribiendo, setEscribiendo] = useState(false);
  const [loading, setLoading] = useState(false);
  const mensajesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Conectar Socket.IO
  useEffect(() => {
    console.log('Iniciando conexión Socket.IO como piloto...');
    
    const newSocket = io('http://localhost:3000', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('Conectado a Socket.IO con ID:', newSocket.id);
      setConectado(true);
      // Piloto se une a su sala
      newSocket.emit('join-room', {
        userId: user.id,
        userType: 'piloto',
        pilotoId: user.id_piloto,
      });
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Desconectado de Socket.IO. Razón:', reason);
      setConectado(false);
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('Reconectado después de', attemptNumber, 'intentos');
      setConectado(true);
      // Re-unirse a la sala después de reconectar
      newSocket.emit('join-room', {
        userId: user.id,
        userType: 'piloto',
        pilotoId: user.id_piloto,
      });
    });

    newSocket.on('receive-message', (mensaje) => {
      console.log('Mensaje recibido vía Socket.IO:', mensaje);
      // Agregar mensaje solo si no existe ya (evitar duplicados)
      setMensajes((prev) => {
        const existe = prev.some(m => 
          m.id_mensaje === mensaje.id_mensaje || 
          (m.contenido === mensaje.contenido && m.fecha_envio === mensaje.fecha_envio)
        );
        if (existe) {
          console.log('Mensaje duplicado, ignorando');
          return prev;
        }
        console.log('Agregando nuevo mensaje a la lista');
        return [...prev, mensaje];
      });
    });

    newSocket.on('user-typing', (data) => {
      if (data.tipo_usuario === 'admin') {
        setEscribiendo(true);
        setTimeout(() => setEscribiendo(false), 3000);
      }
    });

    newSocket.on('error', (data) => {
      console.error('Error de Socket.IO:', data.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  // Cargar mensajes al iniciar
  useEffect(() => {
    cargarMensajes();
  }, []);

  // Auto-scroll a último mensaje
  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const cargarMensajes = async () => {
    if (!user.id_piloto) return;
    
    setLoading(true);
    try {
      const result = await getMensajes(user.id_piloto);
      if (result.success && Array.isArray(result.data)) {
        setMensajes(result.data);
        // Marcar mensajes como leídos
        await marcarMensajesLeidos(user.id_piloto);
      } else {
        setMensajes([]);
      }
    } catch (err) {
      console.error('Error cargando mensajes:', err);
      setMensajes([]);
    }
    setLoading(false);
  };

  const handleEnviarMensaje = (e) => {
    e.preventDefault();
    
    if (!nuevoMensaje.trim() || !socket) {
      console.warn('No se puede enviar mensaje: validación fallida');
      return;
    }

    const mensajeData = {
      contenido: nuevoMensaje.trim(),
      tipo_usuario: 'piloto',
      id_usuario: user.id,
      id_piloto: user.id_piloto,
    };

    console.log('Enviando mensaje vía Socket.IO:', mensajeData);
    socket.emit('send-message', mensajeData);
    
    // Limpiar input inmediatamente para mejor UX
    setNuevoMensaje('');
  };

  const handleTyping = () => {
    if (!socket) return;

    socket.emit('typing', {
      tipo_usuario: 'piloto',
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
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '32px', marginBottom: '10px', color: '#333' }}>
              Chat con Administración
            </h1>
            <p style={{ color: '#666', marginBottom: '0' }}>
              Piloto: <strong>{user?.nombre} {user?.apellido}</strong>
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

      <div className="card" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        padding: 0,
        height: '600px'
      }}>
        {/* Header del Chat */}
        <div style={{ 
          padding: '20px', 
          borderBottom: '2px solid #dee2e6',
          backgroundColor: '#f8f9fa'
        }}>
          <h2 style={{ margin: 0, color: '#333', fontSize: '20px' }}>
            Conversación con Administración
          </h2>
          <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
            Comunícate directamente con el equipo administrativo
          </p>
        </div>

        {/* Mensajes */}
        <div style={{ 
          flex: 1, 
          padding: '20px', 
          overflowY: 'auto',
          backgroundColor: '#ffffff'
        }}>
          {loading && (!mensajes || mensajes.length === 0) && (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px 20px',
              color: '#888'
            }}>
              <div className="spinner" style={{ width: '40px', height: '40px', margin: '0 auto 20px' }}></div>
              <p>Cargando mensajes...</p>
            </div>
          )}

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
                justifyContent: mensaje.tipo_usuario === 'piloto' ? 'flex-end' : 'flex-start',
                marginBottom: '15px'
              }}
            >
              <div
                style={{
                  maxWidth: '70%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  backgroundColor: mensaje.tipo_usuario === 'piloto' ? '#28a745' : '#007bff',
                  color: 'white'
                }}
              >
                <div style={{ fontWeight: '500', marginBottom: '5px', fontSize: '14px', opacity: 0.9 }}>
                  {mensaje.tipo_usuario === 'admin' ? 'Administrador' : 'Tú'}
                </div>
                <div style={{ fontSize: '16px', marginBottom: '5px' }}>
                  {mensaje.contenido}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.8, textAlign: 'right' }}>
                  {formatearFecha(mensaje.fecha_envio)}
                </div>
              </div>
            </div>
          ))}

          {escribiendo && (
            <div style={{ 
              padding: '10px', 
              backgroundColor: '#f0f0f0', 
              borderRadius: '8px',
              marginBottom: '10px',
              maxWidth: '150px'
            }}>
              <span style={{ color: '#666', fontSize: '14px' }}>
                Administrador está escribiendo...
              </span>
            </div>
          )}

          <div ref={mensajesEndRef} />
        </div>

        {/* Input de mensaje */}
        <form onSubmit={handleEnviarMensaje} style={{ 
          padding: '20px', 
          borderTop: '2px solid #dee2e6',
          backgroundColor: '#f8f9fa'
        }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={nuevoMensaje}
              onChange={(e) => setNuevoMensaje(e.target.value)}
              onKeyDown={handleTyping}
              placeholder="Escribe un mensaje..."
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '25px',
                border: '2px solid #dee2e6',
                fontSize: '14px',
                outline: 'none'
              }}
              disabled={!conectado}
            />
            <button 
              type="submit"
              className="btn btn-primary"
              disabled={!nuevoMensaje.trim() || !conectado}
              style={{
                padding: '12px 30px',
                borderRadius: '25px',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              Enviar
            </button>
          </div>
        </form>
      </div>

      {/* Información */}
      <div className="card" style={{ backgroundColor: '#e7f3ff', border: '2px dashed #b3d9ff' }}>
        <h3 style={{ color: '#0066cc', marginBottom: '15px' }}>
          Información
        </h3>
        <ul style={{ color: '#0066cc', lineHeight: '1.8' }}>
          <li>Los mensajes se envían en tiempo real</li>
          <li>Puedes comunicarte directamente con el equipo administrativo</li>
          <li>Todos los mensajes quedan guardados en el historial</li>
          <li>Mantén una comunicación respetuosa y profesional</li>
        </ul>
      </div>
    </div>
  );
}
