import { useState, useEffect } from 'react';
import { getEventos, createEvento, updateEvento, deleteEvento } from '../services/eventos.service';
import { Calendar, MapPin, FileText, Plus, Edit2, Trash2, X, Clock } from 'lucide-react';

export default function Eventos() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingEvento, setEditingEvento] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    fecha_evento: '',
    lugar: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchEventos();
  }, []);

  const fetchEventos = async () => {
    try {
      setLoading(true);
      const data = await getEventos();
      setEventos(data || []);
    } catch (error) {
      console.error('Error al cargar eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.titulo || formData.titulo.length < 5) {
      newErrors.titulo = 'El título debe tener al menos 5 caracteres';
    }
    if (!formData.descripcion || formData.descripcion.length < 10) {
      newErrors.descripcion = 'La descripción debe tener al menos 10 caracteres';
    }
    if (!formData.fecha_evento) {
      newErrors.fecha_evento = 'La fecha del evento es requerida';
    }
    if (!formData.lugar || formData.lugar.length < 3) {
      newErrors.lugar = 'El lugar debe tener al menos 3 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      if (editingEvento) {
        await updateEvento(editingEvento.id, formData);
        alert('✅ Evento actualizado exitosamente');
      } else {
        await createEvento(formData);
        alert('✅ Evento creado exitosamente. Se han enviado notificaciones por correo a todos los usuarios.');
      }
      handleCloseModal();
      fetchEventos();
    } catch (error) {
      console.error('Error al guardar evento:', error);
      alert('❌ Error al guardar el evento');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (evento) => {
    setEditingEvento(evento);
    setFormData({
      titulo: evento.titulo,
      descripcion: evento.descripcion,
      fecha_evento: new Date(evento.fecha_evento).toISOString().slice(0, 16),
      lugar: evento.lugar,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este evento?')) return;

    try {
      setLoading(true);
      await deleteEvento(id);
      alert('✅ Evento eliminado exitosamente');
      fetchEventos();
    } catch (error) {
      console.error('Error al eliminar evento:', error);
      alert('❌ Error al eliminar el evento');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEvento(null);
    setFormData({
      titulo: '',
      descripcion: '',
      fecha_evento: '',
      lugar: '',
    });
    setErrors({});
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="eventos-container">
      <div className="eventos-header">
        <div className="eventos-icon-circle">
          <Calendar size={40} color="white" />
        </div>
        <h1 className="eventos-title">Gestión de Eventos</h1>
        <p className="eventos-subtitle">Crea y administra eventos de rally con notificaciones automáticas</p>
        
        <button onClick={() => setShowModal(true)} className="eventos-btn-create">
          <Plus size={20} />
          Crear Nuevo Evento
        </button>
      </div>

      {loading && eventos.length === 0 ? (
        <div className="eventos-loading">
          <div className="eventos-spinner"></div>
          <p className="eventos-loading-text">Cargando eventos...</p>
        </div>
      ) : eventos.length === 0 ? (
        <div className="eventos-empty">
          <Calendar className="eventos-empty-icon" size={96} />
          <p className="eventos-empty-title">No hay eventos registrados</p>
          <p className="eventos-empty-subtitle">Crea tu primer evento para comenzar a notificar a los usuarios</p>
        </div>
      ) : (
        <div className="eventos-grid">
          {eventos.map((evento) => (
            <div key={evento.id} className="evento-card">
              <div className="evento-card-header">
                <h3 className="evento-card-title">{evento.titulo}</h3>
              </div>
              
              <div className="evento-card-body">
                <div className="evento-info-item">
                  <MapPin className="evento-info-icon" size={20} />
                  <span>{evento.lugar}</span>
                </div>
                
                <div className="evento-info-item">
                  <Clock className="evento-info-icon" size={20} />
                  <span>{formatFecha(evento.fecha_evento)}</span>
                </div>
                
                <div className="evento-info-item">
                  <FileText className="evento-info-icon" size={20} />
                  <span>{evento.descripcion}</span>
                </div>
                
                <div className="evento-actions">
                  <button onClick={() => handleEdit(evento)} className="evento-btn evento-btn-edit">
                    <Edit2 size={16} />
                    Editar
                  </button>
                  <button onClick={() => handleDelete(evento.id)} className="evento-btn evento-btn-delete">
                    <Trash2 size={16} />
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="eventos-modal-overlay">
          <div className="eventos-modal">
            <div className="eventos-modal-header">
              <div className="eventos-modal-title-wrapper">
                <Calendar size={32} />
                <h2 className="eventos-modal-title">
                  {editingEvento ? 'Editar Evento' : 'Crear Nuevo Evento'}
                </h2>
              </div>
              <button onClick={handleCloseModal} className="eventos-modal-close">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="eventos-modal-body">
              <div className="eventos-form-group">
                <label className="eventos-form-label">
                  <Calendar size={16} />
                  Título del Evento *
                </label>
                <input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleInputChange}
                  className={`eventos-form-input ${errors.titulo ? 'error' : ''}`}
                  placeholder="Ej: Rally Nacional 2025"
                />
                {errors.titulo && <p className="eventos-form-error">⚠️ {errors.titulo}</p>}
              </div>

              <div className="eventos-form-group">
                <label className="eventos-form-label">
                  <FileText size={16} />
                  Descripción *
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  rows="4"
                  className={`eventos-form-textarea ${errors.descripcion ? 'error' : ''}`}
                  placeholder="Describe el evento en detalle..."
                />
                {errors.descripcion && <p className="eventos-form-error">⚠️ {errors.descripcion}</p>}
              </div>

              <div className="eventos-form-group">
                <label className="eventos-form-label">
                  <Clock size={16} />
                  Fecha y Hora del Evento *
                </label>
                <input
                  type="datetime-local"
                  name="fecha_evento"
                  value={formData.fecha_evento}
                  onChange={handleInputChange}
                  className={`eventos-form-input ${errors.fecha_evento ? 'error' : ''}`}
                />
                {errors.fecha_evento && <p className="eventos-form-error">⚠️ {errors.fecha_evento}</p>}
              </div>

              <div className="eventos-form-group">
                <label className="eventos-form-label">
                  <MapPin size={16} />
                  Lugar *
                </label>
                <input
                  type="text"
                  name="lugar"
                  value={formData.lugar}
                  onChange={handleInputChange}
                  className={`eventos-form-input ${errors.lugar ? 'error' : ''}`}
                  placeholder="Ej: Autódromo de Santiago"
                />
                {errors.lugar && <p className="eventos-form-error">⚠️ {errors.lugar}</p>}
              </div>

              <div className="eventos-modal-actions">
                <button type="button" onClick={handleCloseModal} className="eventos-modal-btn eventos-modal-btn-cancel">
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="eventos-modal-btn eventos-modal-btn-submit">
                  {loading ? (
                    <span className="eventos-btn-loading">
                      <div className="eventos-btn-spinner"></div>
                      Guardando...
                    </span>
                  ) : (
                    editingEvento ? 'Actualizar Evento' : 'Crear Evento'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
