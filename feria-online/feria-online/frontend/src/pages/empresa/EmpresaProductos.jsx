import { useState, useEffect } from 'react';
import { empresasService } from '../../services/api';
import { EmpresaSidebar } from '../../components/common/Sidebars';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const emptyP = { nombre: '', descripcion: '', precio: '', imagen: '' };

export default function EmpresaProductos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyP);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const load = () => {
    setLoading(true);
    empresasService.getProductos().then(r => setProductos(r.data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openCreate = () => { setEditing(null); setForm(emptyP); setShowModal(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({ nombre: p.nombre, descripcion: p.descripcion || '', precio: p.precio || '', imagen: p.imagen || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) { await empresasService.updateProducto(editing.id, form); toast.success('Producto actualizado'); }
      else { await empresasService.createProducto(form); toast.success('Producto creado'); }
      setShowModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error al guardar'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return;
    await empresasService.deleteProducto(id); toast.success('Producto eliminado'); load();
  };

  const toggleActivo = async (p) => {
    await empresasService.updateProducto(p.id, { ...p, activo: p.activo ? 0 : 1 });
    toast.success(p.activo ? 'Producto ocultado' : 'Producto publicado');
    load();
  };

  return (
    <div className="layout-with-sidebar">
      <EmpresaSidebar />
      <div className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Catálogo de productos</h1>
            <p className="page-subtitle">Gestiona los productos y servicios de tu empresa</p>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>+ Agregar producto</button>
        </div>

        {loading
          ? <div className="loading-center"><div className="spinner" /></div>
          : productos.length === 0
            ? <div className="empty-state">
                <div className="empty-state-icon">🛍️</div>
                <h3>Sin productos aún</h3>
                <p>Agrega tus productos y servicios para que los visitantes los conozcan</p>
                <button className="btn btn-primary mt-2" onClick={openCreate}>+ Agregar primer producto</button>
              </div>
            : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {productos.map(p => (
                  <div key={p.id} className="card" style={{ opacity: p.activo ? 1 : .6 }}>
                    {p.imagen
                      ? <img src={p.imagen} alt={p.nombre} style={{ width: '100%', height: 180, objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: 120, background: 'linear-gradient(135deg, var(--c-primary-light), #e0e7ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>🛍️</div>
                    }
                    <div className="card-body">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.5rem' }}>
                        <h3 style={{ fontWeight: 700, fontSize: '.95rem' }}>{p.nombre}</h3>
                        <span className={`badge ${p.activo ? 'badge-success' : 'badge-gray'}`}>{p.activo ? 'Visible' : 'Oculto'}</span>
                      </div>
                      {p.descripcion && <p style={{ fontSize: '.82rem', color: 'var(--c-gray-500)', marginBottom: '.75rem' }}>{p.descripcion}</p>}
                      {p.precio && (
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--c-primary)', marginBottom: '.75rem' }}>
                          ${Number(p.precio).toFixed(2)}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '.5rem' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(p)} style={{ flex: 1 }}>✏️ Editar</button>
                        <button className="btn btn-outline btn-sm" onClick={() => toggleActivo(p)} title={p.activo ? 'Ocultar' : 'Publicar'}>
                          {p.activo ? '👁️' : '🚫'}
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>🗑️</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
        }

        {showModal && (
          <Modal title={editing ? 'Editar producto' : 'Nuevo producto'} onClose={() => setShowModal(false)}
            footer={<><button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button><button form="producto-form" type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button></>}>
            <form id="producto-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Nombre del producto / servicio *</label>
                <input className="form-control" placeholder="ej. Consultoría web, Software ERP..." value={form.nombre} onChange={e => set('nombre', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Descripción</label>
                <textarea className="form-control" rows={3} placeholder="Describe brevemente el producto o servicio..." value={form.descripcion} onChange={e => set('descripcion', e.target.value)} />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Precio (opcional)</label>
                  <input className="form-control" type="number" min={0} step="0.01" placeholder="0.00" value={form.precio} onChange={e => set('precio', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">URL de imagen</label>
                  <input className="form-control" type="url" placeholder="https://..." value={form.imagen} onChange={e => set('imagen', e.target.value)} />
                </div>
              </div>
              {form.imagen && (
                <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid var(--c-gray-200)' }}>
                  <img src={form.imagen} alt="Preview" style={{ width: '100%', height: 160, objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                </div>
              )}
            </form>
          </Modal>
        )}
      </div>
    </div>
  );
}
