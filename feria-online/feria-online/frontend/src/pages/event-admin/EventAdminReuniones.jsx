import { useState, useEffect } from 'react';
import { reunionesService, ticketsService, eventosService } from '../../services/api';
import { EventAdminSidebar } from '../../components/common/Sidebars';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// ─── REUNIONES ────────────────────────────────────────────────────────────────
const emptyR = { titulo: '', descripcion: '', fecha_hora: '', duracion_min: 30, max_asistentes: 10, precio: 0, enlace_meet: '' };

export function EventAdminReuniones() {
  const [evento, setEvento] = useState(null);
  const [reuniones, setReuniones] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyR);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const load = () => eventosService.myEvents().then(r => { const ev = r.data[0]; if (!ev) return; setEvento(ev); eventosService.getById(ev.id).then(r2 => setReuniones(r2.data.reuniones || [])); });
  useEffect(load, []);

  const openCreate = () => { setEditing(null); setForm(emptyR); setShowModal(true); };
  const openEdit = (r) => {
    setEditing(r);
    setForm({ titulo: r.titulo, descripcion: r.descripcion || '', fecha_hora: r.fecha_hora?.slice(0, 16) || '', duracion_min: r.duracion_min, max_asistentes: r.max_asistentes, precio: r.precio, enlace_meet: r.enlace_meet || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form, evento_id: evento.id };
      if (editing) { await reunionesService.update(editing.id, payload); toast.success('Reunión actualizada'); }
      else { await reunionesService.create(payload); toast.success('Reunión creada'); }
      setShowModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => { if (!confirm('¿Eliminar reunión?')) return; await reunionesService.delete(id); toast.success('Eliminada'); load(); };

  return (
    <div className="layout-with-sidebar">
      <EventAdminSidebar />
      <div className="main-content">
        <div className="page-header">
          <div><h1 className="page-title">Reuniones privadas</h1><p className="page-subtitle">{evento?.titulo}</p></div>
          {evento && <button className="btn btn-primary" onClick={openCreate}>+ Nueva reunión</button>}
        </div>
        {reuniones.length === 0
          ? <div className="empty-state"><div className="empty-state-icon">🤝</div><h3>Sin reuniones</h3><p>Crea reuniones privadas con cupo y precio.</p>{evento && <button className="btn btn-primary mt-2" onClick={openCreate}>+ Nueva reunión</button>}</div>
          : <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reuniones.map(r => (
                <div key={r.id} className="card"><div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                      <h3 style={{ fontWeight: 700, marginBottom: '.3rem' }}>{r.titulo}</h3>
                      {r.descripcion && <p style={{ fontSize: '.85rem', color: 'var(--c-gray-500)', marginBottom: '.5rem' }}>{r.descripcion}</p>}
                      <div style={{ display: 'flex', gap: '1rem', fontSize: '.8rem', color: 'var(--c-gray-500)', flexWrap: 'wrap' }}>
                        <span>📅 {format(new Date(r.fecha_hora), "d MMM yyyy · HH:mm", { locale: es })}</span>
                        <span>⏱️ {r.duracion_min} min</span>
                        <span>👥 {r.reservados || 0}/{r.max_asistentes} reservados</span>
                        <span style={{ color: 'var(--c-primary)', fontWeight: 700 }}>{r.precio > 0 ? `$${Number(r.precio).toFixed(2)}` : 'Gratis'}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '.5rem' }}>
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(r)}>✏️</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.id)}>🗑️</button>
                    </div>
                  </div>
                </div></div>
              ))}
            </div>
        }
        {showModal && (
          <Modal title={editing ? 'Editar reunión' : 'Nueva reunión'} onClose={() => setShowModal(false)}
            footer={<><button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button><button form="reunion-form" type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button></>}>
            <form id="reunion-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group"><label className="form-label">Título *</label><input className="form-control" value={form.titulo} onChange={e => set('titulo', e.target.value)} required /></div>
              <div className="form-group"><label className="form-label">Descripción</label><textarea className="form-control" rows={2} value={form.descripcion} onChange={e => set('descripcion', e.target.value)} /></div>
              <div className="form-grid">
                <div className="form-group"><label className="form-label">Fecha y hora *</label><input className="form-control" type="datetime-local" value={form.fecha_hora} onChange={e => set('fecha_hora', e.target.value)} required /></div>
                <div className="form-group"><label className="form-label">Duración (min)</label><input className="form-control" type="number" min={5} value={form.duracion_min} onChange={e => set('duracion_min', e.target.value)} /></div>
              </div>
              <div className="form-grid">
                <div className="form-group"><label className="form-label">Máx. asistentes</label><input className="form-control" type="number" min={1} value={form.max_asistentes} onChange={e => set('max_asistentes', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Precio ($)</label><input className="form-control" type="number" min={0} step="0.01" value={form.precio} onChange={e => set('precio', e.target.value)} /></div>
              </div>
              <div className="form-group"><label className="form-label">Enlace de reunión</label><input className="form-control" type="url" placeholder="https://meet.google.com/..." value={form.enlace_meet} onChange={e => set('enlace_meet', e.target.value)} /></div>
            </form>
          </Modal>
        )}
      </div>
    </div>
  );
}

// ─── TICKETS ─────────────────────────────────────────────────────────────────
const emptyT = { nombre: '', descripcion: '', precio: 0, cantidad_total: 100, fecha_limite: '', tipo: 'general' };

export function EventAdminTickets() {
  const [evento, setEvento] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyT);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const load = () => eventosService.myEvents().then(r => { const ev = r.data[0]; if (!ev) return; setEvento(ev); eventosService.getById(ev.id).then(r2 => setTickets(r2.data.tickets || [])); });
  useEffect(load, []);

  const openCreate = () => { setEditing(null); setForm(emptyT); setShowModal(true); };
  const openEdit = (t) => {
    setEditing(t);
    setForm({ nombre: t.nombre, descripcion: t.descripcion || '', precio: t.precio, cantidad_total: t.cantidad_total, fecha_limite: t.fecha_limite?.slice(0, 16) || '', tipo: t.tipo });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form, evento_id: evento.id };
      if (editing) { await ticketsService.update(editing.id, payload); toast.success('Ticket actualizado'); }
      else { await ticketsService.create(payload); toast.success('Ticket creado'); }
      setShowModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => { if (!confirm('¿Eliminar ticket?')) return; await ticketsService.delete(id); toast.success('Eliminado'); load(); };

  return (
    <div className="layout-with-sidebar">
      <EventAdminSidebar />
      <div className="main-content">
        <div className="page-header">
          <div><h1 className="page-title">Tickets</h1><p className="page-subtitle">{evento?.titulo}</p></div>
          {evento && <button className="btn btn-primary" onClick={openCreate}>+ Nuevo ticket</button>}
        </div>
        {tickets.length === 0
          ? <div className="empty-state"><div className="empty-state-icon">🎫</div><h3>Sin tickets</h3><p>Crea diferentes tipos de tickets para tu evento.</p>{evento && <button className="btn btn-primary mt-2" onClick={openCreate}>+ Nuevo ticket</button>}</div>
          : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {tickets.map(t => (
                <div key={t.id} className="card"><div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.75rem' }}>
                    <span className={`badge ${t.tipo === 'vip' ? 'badge-accent' : t.tipo === 'empresa' ? 'badge-success' : 'badge-primary'}`}>{t.tipo?.toUpperCase()}</span>
                    <span className={`badge ${t.activo ? 'badge-success' : 'badge-gray'}`}>{t.activo ? 'Activo' : 'Inactivo'}</span>
                  </div>
                  <h3 style={{ fontWeight: 700, marginBottom: '.25rem' }}>{t.nombre}</h3>
                  {t.descripcion && <p style={{ fontSize: '.82rem', color: 'var(--c-gray-500)', marginBottom: '.75rem' }}>{t.descripcion}</p>}
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--c-primary)', marginBottom: '.5rem' }}>
                    {t.precio > 0 ? `$${Number(t.precio).toFixed(2)}` : 'Gratis'}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.8rem', color: 'var(--c-gray-500)', marginBottom: '.75rem' }}>
                    <span>Vendidos: {t.cantidad_vendida}/{t.cantidad_total}</span>
                    <span>{t.cantidad_total - t.cantidad_vendida} disponibles</span>
                  </div>
                  <div style={{ height: 4, background: 'var(--c-gray-100)', borderRadius: 2, marginBottom: '1rem' }}>
                    <div style={{ height: '100%', background: 'var(--c-primary)', borderRadius: 2, width: `${Math.min((t.cantidad_vendida / t.cantidad_total) * 100, 100)}%` }} />
                  </div>
                  <div style={{ display: 'flex', gap: '.5rem' }}>
                    <button className="btn btn-outline btn-sm" onClick={() => openEdit(t)} style={{ flex: 1 }}>✏️ Editar</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t.id)}>🗑️</button>
                  </div>
                </div></div>
              ))}
            </div>
        }
        {showModal && (
          <Modal title={editing ? 'Editar ticket' : 'Nuevo ticket'} onClose={() => setShowModal(false)}
            footer={<><button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button><button form="ticket-form" type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button></>}>
            <form id="ticket-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group"><label className="form-label">Nombre del ticket *</label><input className="form-control" placeholder="ej. Entrada general" value={form.nombre} onChange={e => set('nombre', e.target.value)} required /></div>
              <div className="form-group"><label className="form-label">Descripción</label><textarea className="form-control" rows={2} value={form.descripcion} onChange={e => set('descripcion', e.target.value)} /></div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Tipo</label>
                  <select className="form-control" value={form.tipo} onChange={e => set('tipo', e.target.value)}>
                    <option value="general">General</option><option value="vip">VIP</option><option value="empresa">Empresa</option>
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Precio ($)</label><input className="form-control" type="number" min={0} step="0.01" value={form.precio} onChange={e => set('precio', e.target.value)} /></div>
              </div>
              <div className="form-grid">
                <div className="form-group"><label className="form-label">Cantidad total *</label><input className="form-control" type="number" min={1} value={form.cantidad_total} onChange={e => set('cantidad_total', e.target.value)} required /></div>
                <div className="form-group"><label className="form-label">Fecha límite venta</label><input className="form-control" type="datetime-local" value={form.fecha_limite} onChange={e => set('fecha_limite', e.target.value)} /></div>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </div>
  );
}

export default EventAdminReuniones;
