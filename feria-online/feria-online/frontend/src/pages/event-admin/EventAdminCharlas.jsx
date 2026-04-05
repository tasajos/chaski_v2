import { useState, useEffect } from 'react';
import { charlasService, eventosService } from '../../services/api';
import { EventAdminSidebar } from '../../components/common/Sidebars';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const emptyCharla = { titulo: '', descripcion: '', ponente: '', fecha_hora: '', duracion_min: 60, sala: '', enlace_stream: '', capacidad: '' };

export default function EventAdminCharlas() {
  const [evento, setEvento] = useState(null);
  const [charlas, setCharlas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyCharla);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const loadEvento = () => {
    eventosService.myEvents().then(r => {
      const ev = r.data[0];
      if (!ev) return;
      setEvento(ev);
      eventosService.getById(ev.id).then(r2 => setCharlas(r2.data.charlas || []));
    });
  };
  useEffect(loadEvento, []);

  const openCreate = () => { setEditing(null); setForm(emptyCharla); setShowModal(true); };
  const openEdit = (c) => {
    setEditing(c);
    setForm({ titulo: c.titulo, descripcion: c.descripcion || '', ponente: c.ponente || '', fecha_hora: c.fecha_hora?.slice(0, 16) || '', duracion_min: c.duracion_min, sala: c.sala || '', enlace_stream: c.enlace_stream || '', capacidad: c.capacidad || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form, evento_id: evento.id };
      if (editing) { await charlasService.update(editing.id, payload); toast.success('Charla actualizada'); }
      else { await charlasService.create(payload); toast.success('Charla creada'); }
      setShowModal(false); loadEvento();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar charla?')) return;
    await charlasService.delete(id); toast.success('Eliminada'); loadEvento();
  };

  return (
    <div className="layout-with-sidebar">
      <EventAdminSidebar />
      <div className="main-content">
        <div className="page-header">
          <div><h1 className="page-title">Charlas</h1><p className="page-subtitle">{evento?.titulo}</p></div>
          {evento && <button className="btn btn-primary" onClick={openCreate}>+ Nueva charla</button>}
        </div>

        {charlas.length === 0
          ? <div className="empty-state"><div className="empty-state-icon">🎤</div><h3>Sin charlas aún</h3><p>Crea la primera charla para tu evento.</p>{evento && <button className="btn btn-primary mt-2" onClick={openCreate}>+ Nueva charla</button>}</div>
          : <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {charlas.map(c => (
                <div key={c.id} className="card"><div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                      <h3 style={{ fontWeight: 700, marginBottom: '.3rem' }}>{c.titulo}</h3>
                      {c.ponente && <p style={{ fontSize: '.85rem', color: 'var(--c-primary)', fontWeight: 600, marginBottom: '.3rem' }}>🎙️ {c.ponente}</p>}
                      {c.descripcion && <p style={{ fontSize: '.85rem', color: 'var(--c-gray-500)', marginBottom: '.5rem' }}>{c.descripcion}</p>}
                      <div style={{ display: 'flex', gap: '1rem', fontSize: '.8rem', color: 'var(--c-gray-500)', flexWrap: 'wrap' }}>
                        <span>📅 {format(new Date(c.fecha_hora), "d MMM yyyy · HH:mm", { locale: es })}</span>
                        <span>⏱️ {c.duracion_min} min</span>
                        {c.sala && <span>🏛️ {c.sala}</span>}
                        <span>👥 {c.inscritos || 0} inscritos{c.capacidad ? ` / ${c.capacidad}` : ''}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '.5rem' }}>
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(c)}>✏️ Editar</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>🗑️</button>
                    </div>
                  </div>
                </div></div>
              ))}
            </div>
        }

        {showModal && (
          <Modal title={editing ? 'Editar charla' : 'Nueva charla'} onClose={() => setShowModal(false)}
            footer={<><button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button><button form="charla-form" type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button></>}>
            <form id="charla-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group"><label className="form-label">Título *</label><input className="form-control" value={form.titulo} onChange={e => set('titulo', e.target.value)} required /></div>
              <div className="form-group"><label className="form-label">Ponente</label><input className="form-control" placeholder="Nombre del ponente" value={form.ponente} onChange={e => set('ponente', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Descripción</label><textarea className="form-control" rows={2} value={form.descripcion} onChange={e => set('descripcion', e.target.value)} /></div>
              <div className="form-grid">
                <div className="form-group"><label className="form-label">Fecha y hora *</label><input className="form-control" type="datetime-local" value={form.fecha_hora} onChange={e => set('fecha_hora', e.target.value)} required /></div>
                <div className="form-group"><label className="form-label">Duración (min)</label><input className="form-control" type="number" min={10} value={form.duracion_min} onChange={e => set('duracion_min', e.target.value)} /></div>
              </div>
              <div className="form-grid">
                <div className="form-group"><label className="form-label">Sala</label><input className="form-control" placeholder="Sala A, Auditorio..." value={form.sala} onChange={e => set('sala', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Capacidad</label><input className="form-control" type="number" min={1} placeholder="Ilimitada" value={form.capacidad} onChange={e => set('capacidad', e.target.value)} /></div>
              </div>
              <div className="form-group"><label className="form-label">Enlace de streaming</label><input className="form-control" type="url" placeholder="https://youtube.com/..." value={form.enlace_stream} onChange={e => set('enlace_stream', e.target.value)} /></div>
            </form>
          </Modal>
        )}
      </div>
    </div>
  );
}
