import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@context/AuthContext';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { createPiloto } from '@services/pilots.service';

export default function EscanearQR() {
  const { user } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [pilotoData, setPilotoData] = useState(null);
  const [resultado, setResultado] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const qrScannerRef = useRef(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    return () => {
      // Limpiar el scanner cuando el componente se desmonte
      if (qrScannerRef.current) {
        qrScannerRef.current.clear().catch(err => {
          console.log('Error al limpiar scanner:', err);
        });
        qrScannerRef.current = null;
      }
    };
  }, []);

  const iniciarEscaneo = () => {
    // Prevenir múltiples inicializaciones
    if (qrScannerRef.current || hasInitialized.current) {
      console.log('Scanner ya está inicializado');
      return;
    }

    setScanning(true);
    setError('');
    setSuccess('');
    setPilotoData(null);
    setResultado('');
    hasInitialized.current = true;

    // Esperar un frame para asegurar que el DOM esté listo
    setTimeout(() => {
      try {
        // Verificar que el elemento existe
        const element = document.getElementById('qr-reader');
        if (!element) {
          console.error('Elemento qr-reader no encontrado');
          setError('Error al inicializar el escáner');
          setScanning(false);
          hasInitialized.current = false;
          return;
        }

        // Configurar el scanner
        const scanner = new Html5QrcodeScanner(
          'qr-reader',
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            showTorchButtonIfSupported: true,
            showZoomSliderIfSupported: true,
          },
          false
        );

        qrScannerRef.current = scanner;

        // Función de éxito al escanear
        const onScanSuccess = (decodedText) => {
          console.log('QR Escaneado:', decodedText);
          setResultado(decodedText);
          
          try {
            // Intentar parsear los datos del QR
            const data = JSON.parse(decodedText);
            
            // Validar que tenga la estructura correcta
            if (data.nombre && data.apellido && data.rut) {
              setPilotoData(data);
              setError('');
              // Detener el scanner
              if (qrScannerRef.current) {
                qrScannerRef.current.clear().catch(console.error);
                qrScannerRef.current = null;
              }
              setScanning(false);
              hasInitialized.current = false;
            } else {
              setError('El código QR no contiene datos válidos de piloto');
            }
          } catch (err) {
            console.error('Error parsing QR:', err);
            setError('Error al leer el código QR. Asegúrate de escanear un QR generado por el sistema');
          }
        };

        // Función de error (se llama constantemente mientras busca)
        const onScanFailure = (error) => {
          // No hacer nada, esto es normal mientras busca el QR
        };

        // Renderizar el scanner
        scanner.render(onScanSuccess, onScanFailure);
        
      } catch (err) {
        console.error('Error al iniciar scanner:', err);
        setError('Error al inicializar la cámara. Verifica los permisos del navegador.');
        setScanning(false);
        hasInitialized.current = false;
      }
    }, 100);
  };

  const detenerEscaneo = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.clear().catch(console.error);
      qrScannerRef.current = null;
    }
    setScanning(false);
    hasInitialized.current = false;
  };
  const handleCrearPiloto = async () => {
    if (!pilotoData) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('Enviando datos al backend:', pilotoData);
      const result = await createPiloto(pilotoData);
      console.log('Respuesta del backend:', result);      if (result.success) {
        setSuccess(`¡Piloto "${pilotoData.nombre} ${pilotoData.apellido}" creado exitosamente!`);
        setPilotoData(null);
        setResultado('');
      } else {
        console.error('Error del backend:', result.message);
        console.error('Detalles del error:', result.details);
        const errorMsg = result.details 
          ? `${result.message}: ${JSON.stringify(result.details)}`
          : result.message || 'Error al crear el piloto';
        setError(errorMsg);
      }
    } catch (err) {
      console.error('Error inesperado:', err);
      setError('Error inesperado al crear el piloto');
    } finally {
      setLoading(false);
    }
  };

  const handleNuevoEscaneo = () => {
    setPilotoData(null);
    setResultado('');
    setError('');
    setSuccess('');
  };

  return (
    <div className="container">
      <div className="card">
        <h1 style={{ fontSize: '32px', marginBottom: '10px', color: '#333' }}>
          Escanear QR para Crear Piloto
        </h1>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Usuario: <strong>{user?.nombre} {user?.apellido}</strong>
        </p>
        <p style={{ color: '#888', marginBottom: '30px' }}>
          Escanea un código QR generado desde el sistema para crear un nuevo piloto
        </p>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="alert alert-error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <strong>Éxito:</strong> {success}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Scanner */}
        <div className="card">
          <h2 style={{ marginBottom: '20px', color: '#333' }}>Cámara</h2>

          {!scanning && !pilotoData && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                padding: '60px 20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '2px dashed #dee2e6',
                marginBottom: '20px'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>📷</div>
                <p style={{ color: '#888', fontSize: '16px', marginBottom: '10px' }}>
                  Haz clic en el botón para activar la cámara
                </p>
                <p style={{ color: '#aaa', fontSize: '14px' }}>
                  Asegúrate de permitir el acceso a la cámara cuando el navegador lo solicite
                </p>
              </div>

              <button 
                onClick={iniciarEscaneo}
                className="btn btn-primary"
                style={{ width: '100%', fontSize: '18px', padding: '15px' }}
              >
                Iniciar Escaneo
              </button>
            </div>
          )}

          {scanning && (
            <div>
              <div 
                id="qr-reader" 
                style={{ 
                  width: '100%',
                  border: '2px solid #dee2e6',
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}
              ></div>

              <button 
                onClick={detenerEscaneo}
                className="btn"
                style={{ 
                  width: '100%',
                  marginTop: '20px',
                  backgroundColor: '#dc3545',
                  color: 'white'
                }}
              >
                Detener Escaneo
              </button>

              <div style={{ 
                marginTop: '20px',
                padding: '15px',
                backgroundColor: '#fff3cd',
                borderRadius: '8px',
                fontSize: '14px'
              }}>
                <strong>⚠️ Consejo:</strong> Mantén el código QR centrado en el recuadro verde
              </div>
            </div>
          )}

          {pilotoData && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                padding: '40px 20px',
                backgroundColor: '#d4edda',
                borderRadius: '8px',
                border: '2px solid #c3e6cb',
                marginBottom: '20px'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>✓</div>
                <p style={{ color: '#155724', fontSize: '18px', fontWeight: 'bold' }}>
                  QR Escaneado Correctamente
                </p>
              </div>

              <button 
                onClick={handleNuevoEscaneo}
                className="btn"
                style={{ 
                  width: '100%',
                  backgroundColor: '#6c757d',
                  color: 'white'
                }}
              >
                Escanear Otro QR
              </button>
            </div>
          )}
        </div>

        {/* Datos escaneados */}
        <div className="card">
          <h2 style={{ marginBottom: '20px', color: '#333' }}>Datos del Piloto</h2>

          {!pilotoData && !scanning && (
            <div style={{ 
              textAlign: 'center',
              padding: '60px 20px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '2px dashed #dee2e6'
            }}>
              <p style={{ color: '#888', fontSize: '16px' }}>
                Los datos del piloto aparecerán aquí después de escanear el QR
              </p>
            </div>
          )}

          {scanning && !pilotoData && (
            <div style={{ 
              textAlign: 'center',
              padding: '60px 20px',
              backgroundColor: '#e7f3ff',
              borderRadius: '8px',
              border: '2px dashed #b3d9ff'
            }}>
              <div className="spinner" style={{ 
                width: '40px', 
                height: '40px', 
                margin: '0 auto 20px'
              }}></div>
              <p style={{ color: '#0066cc', fontSize: '16px' }}>
                Buscando código QR...
              </p>
            </div>
          )}

          {pilotoData && (
            <div>
              <div style={{ 
                backgroundColor: '#f8f9fa',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <div className="pilot-info" style={{ marginBottom: '15px' }}>
                  <strong>Nombre Completo:</strong>
                  <div style={{ fontSize: '20px', color: '#333', marginTop: '5px' }}>
                    {pilotoData.nombre} {pilotoData.apellido}
                  </div>
                </div>

                <div className="pilot-info" style={{ marginBottom: '15px' }}>
                  <strong>RUT:</strong>
                  <div style={{ fontSize: '18px', color: '#333', marginTop: '5px' }}>
                    {pilotoData.rut}
                  </div>
                </div>

                <div className="pilot-info" style={{ marginBottom: '15px' }}>
                  <strong>Edad:</strong>
                  <div style={{ fontSize: '18px', color: '#333', marginTop: '5px' }}>
                    {pilotoData.edad} años
                  </div>
                </div>

                <div className="pilot-info" style={{ marginBottom: '15px' }}>
                  <strong>Nacionalidad:</strong>
                  <div style={{ fontSize: '18px', color: '#333', marginTop: '5px' }}>
                    {pilotoData.nacionalidad}
                  </div>
                </div>

                {pilotoData.licencia && (
                  <div className="pilot-info">
                    <strong>Licencia:</strong>
                    <div style={{ fontSize: '18px', color: '#333', marginTop: '5px' }}>
                      {pilotoData.licencia}
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={handleCrearPiloto}
                className="btn btn-primary"
                disabled={loading}
                style={{ 
                  width: '100%',
                  fontSize: '18px',
                  padding: '15px'
                }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="spinner" style={{ width: '20px', height: '20px', marginRight: '10px' }}></div>
                    Creando Piloto...
                  </span>
                ) : (
                  'Crear Piloto en Base de Datos'
                )}
              </button>

              {resultado && (
                <div style={{ 
                  marginTop: '20px',
                  padding: '15px',
                  backgroundColor: '#e7f3ff',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}>
                  <strong>Datos QR (JSON):</strong>
                  <pre style={{ 
                    marginTop: '10px',
                    padding: '10px',
                    backgroundColor: 'white',
                    borderRadius: '4px',
                    overflow: 'auto',
                    maxHeight: '150px'
                  }}>
                    {resultado}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Información */}
      <div className="card" style={{ backgroundColor: '#f8f9fa', border: '2px dashed #dee2e6' }}>
        <h3 style={{ color: '#666', marginBottom: '15px' }}>
          ℹ️ Instrucciones
        </h3>
        <ul style={{ color: '#666', lineHeight: '1.8' }}>
          <li>Haz clic en "Iniciar Escaneo" para activar la cámara</li>
          <li>Permite el acceso a la cámara cuando el navegador lo solicite</li>
          <li>Apunta la cámara al código QR generado desde la sección "Generar QR"</li>
          <li>Los datos se mostrarán automáticamente al detectar el código</li>
          <li>Verifica los datos y haz clic en "Crear Piloto" para agregarlo a la base de datos</li>
          <li>Puedes escanear múltiples códigos QR sin necesidad de recargar la página</li>
        </ul>
      </div>
    </div>
  );
}
