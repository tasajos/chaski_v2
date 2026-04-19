import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventosService } from '../../services/api';
import { AdminSidebar } from '../../components/common/Sidebars';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const empty = {
  titulo: '', slug: '', descripcion: '', imagen_banner: '',
  fecha_inicio: '', fecha_fin: '', ubicacion: '',
  modalidad: 'presencial', estado: 'borrador',
  admin_evento_id: '', max_participantes: '',
};

const estadoBadge = {
  publicado: 'badge-success', borrador: 'badge-gray',
  finalizado: 'badge-warning', cancelado: 'badge-danger',
};

// Genera slug URL-amigable desde un título
function toSlug(str) {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export default function AdminEventos() {
  const [eventos, setEventos] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [slugManual, setSlugManual] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([eventosService.getAll({ limit: 50, estado: '' }), eventosService.getAdmins()])
      .then(([r1, r2]) => { setEventos(r1.data.events || []); setAdmins(r2.data || []); })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openCreate = () => {
    setEditing(null);
    setForm(empty);
    setSlugManual(false);
    setShowModal(true);
  };

  const openEdit = (e) => {
    setEditing(e);
    setSlugManual(true);
    setForm({
      titulo: e.titulo,
      slug: e.slug || '',
      descripcion: e.descripcion || '',
      imagen_banner: e.imagen_banner || '',
      fecha_inicio: e.fecha_inicio?.slice(0, 16) || '',
      fecha_fin: e.fecha_fin?.slice(0, 16) || '',
      ubicacion: e.ubicacion || '',
      modalidad: e.modalidad,
      estado: e.estado,
      admin_evento_id: e.admin_evento_id || '',
      max_participantes: e.max_participantes || '',
    });
    setShowModal(true);
  };

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleTituloChange = (v) => {
    setForm(p => ({
      ...p,
      titulo: v,
      slug: slugManual ? p.slug : toSlug(v),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.slug.trim()) return toast.error('El slug es requerido');
    setSaving(true);
    try {
      if (editing) {
        await eventosService.update(editing.id, form);
        toast.success('Evento actualizado');
      } else {
        await eventosService.create(form);
        toast.success('Evento creado');
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este evento?')) return;
    await eventosService.delete(id);
    toast.success('Evento eliminado');
    load();
  };

  const landingUrl = (slug) => slug ? `/e/${slug}` : null;

  return (
    <div className="layout-with-sidebar">
      <AdminSidebar />
      <div className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Eventos</h1>
            <p className="page-subtitle">Gestiona todos los eventos de la plataforma</p>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>+ Nuevo evento</button>
        </div>

        {loading
          ? <div className="loading-center"><div className="spinner" /></div>
          : <div className="card">
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Evento</th>
                      <th>Modalidad</th>
                      <th>Estado</th>
                      <th>Fecha inicio</th>
                      <th>Organizador</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventos.length === 0
                      ? <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--c-gray-500)', padding: '2rem' }}>No hay eventos</td></tr>
                      : eventos.map(e => (
                        <tr key={e.id}>
                          <td>
                            <div style={{ fontWeight: 600 }}>{e.titulo}</div>
                            {e.slug && (
                              <div style={{ fontSize: '.75rem', color: 'var(--c-gray-500)', fontFamily: 'monospace', marginTop: '.15rem' }}>
                                /e/{e.slug}
                              </div>
                            )}
                          </td>
                          <td><span className="badge badge-primary">{e.modalidad}</span></td>
                          <td><span className={`badge ${estadoBadge[e.estado]}`}>{e.estado}</span></td>
                          <td style={{ fontSize: '.85rem', color: 'var(--c-gray-500)' }}>
                            {e.fecha_inicio ? format(new Date(e.fecha_inicio), 'dd/MM/yyyy') : '—'}
                          </td>
                          <td style={{ fontSize: '.85rem' }}>
                            {e.admin_nombre
                              ? `${e.admin_nombre} ${e.admin_apellido}`
                              : <span style={{ color: 'var(--c-gray-300)' }}>Sin asignar</span>}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
                              <button className="btn btn-outline btn-sm" onClick={() => openEdit(e)} title="Editar">✏️</button>
                              {e.slug && (
                                <Link to={`/e/${e.slug}`} target="_blank" className="btn btn-secondary btn-sm" title="Ver landing">🌐</Link>
                              )}
                              <Link to={`/admin/inscripciones/${e.id}`} className="btn btn-outline btn-sm" title="Ver inscripciones">📋</Link>
                              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(e.id)} title="Eliminar">🗑️</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            </div>
        }

        {showModal && (
          <Modal
            title={editing ? 'Editar evento' : 'Nuevo evento'}
            onClose={() => setShowModal(false)}
            size="lg"
            footer={
              <>
                <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
                <button form="event-form" type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </>
            }
          >
            <form id="event-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              <div className="form-group">
                <label className="form-label">Título *</label>
                <input className="form-control" value={form.titulo}
                  onChange={e => handleTituloChange(e.target.value)} required />
              </div>

              {/* Slug */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Slug (URL de la landing) *</span>
                  {!slugManual && (
                    <span style={{ fontSize: '.75rem', color: 'var(--c-gray-500)', fontWeight: 400 }}>
                      Auto-generado
                    </span>
                  )}
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                  <span style={{ fontSize: '.85rem', color: 'var(--c-gray-500)', whiteSpace: 'nowrap' }}>/e/</span>
                  <input className="form-control" value={form.slug} placeholder="mi-evento-2026"
                    style={{ fontFamily: 'monospace' }}
                    onChange={e => { setSlugManual(true); set('slug', toSlug(e.target.value)); }}
                    required />
                </div>
                {form.slug && (
                  <span style={{ fontSize: '.75rem', color: 'var(--c-gray-500)' }}>
                    URL pública: <strong>/e/{form.slug}</strong>
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Descripción</label>
                <textarea className="form-control" rows={3} value={form.descripcion}
                  onChange={e => set('descripcion', e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">URL imagen banner (hero del landing)</label>
                <input className="form-control" type="url" placeholder="https://..." value={form.imagen_banner}
                  onChange={e => set('imagen_banner', e.target.value)} />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Fecha inicio *</label>
                  <input className="form-control" type="datetime-local" value={form.fecha_inicio}
                    onChange={e => set('fecha_inicio', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Fecha fin *</label>
                  <input className="form-control" type="datetime-local" value={form.fecha_fin}
                    onChange={e => set('fecha_fin', e.target.value)} required />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Modalidad</label>
                  <select className="form-control" value={form.modalidad}
                    onChange={e => set('modalidad', e.target.value)}>
                    {['presencial', 'virtual', 'hibrido'].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Estado</label>
                  <select className="form-control" value={form.estado}
                    onChange={e => set('estado', e.target.value)}>
                    {['borrador', 'publicado', 'finalizado', 'cancelado'].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Ubicación</label>
                  <input className="form-control" placeholder="Lugar o enlace" value={form.ubicacion}
                    onChange={e => set('ubicacion', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Máx. participantes</label>
                  <input className="form-control" type="number" min={1} value={form.max_participantes}
                    onChange={e => set('max_participantes', e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Administrador del evento</label>
                <select className="form-control" value={form.admin_evento_id}
                  onChange={e => set('admin_evento_id', e.target.value)}>
                  <option value="">— Sin asignar —</option>
                  {admins.map(u => (
                    <option key={u.id} value={u.id}>{u.nombre} {u.apellido} ({u.email})</option>
                  ))}
                </select>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </div>
  );
}
