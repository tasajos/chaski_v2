import { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { AdminSidebar } from '../../components/common/Sidebars';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const rolBadge = { admin: 'badge-danger', admin_evento: 'badge-accent', empresa: 'badge-success', participante: 'badge-gray' };
const rolLabel = { admin: 'Admin', admin_evento: 'Org. Evento', empresa: 'Empresa', participante: 'Participante' };

export function AdminUsuarios() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [rolFilter, setRolFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', password: '', rol: 'participante', activo: true });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    adminService.getUsers({ search, rol: rolFilter }).then(r => setUsers(r.data.users)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openCreate = () => { setEditing(null); setForm({ nombre: '', apellido: '', email: '', password: '', rol: 'participante', activo: true }); setShowModal(true); };
  const openEdit = (u) => { setEditing(u); setForm({ nombre: u.nombre, apellido: u.apellido, email: u.email, password: '', rol: u.rol, activo: !!u.activo }); setShowModal(true); };
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) { await adminService.updateUser(editing.id, form); toast.success('Usuario actualizado'); }
      else { await adminService.createUser(form); toast.success('Usuario creado'); }
      setShowModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar usuario?')) return;
    await adminService.deleteUser(id); toast.success('Eliminado'); load();
  };

  return (
    <div className="layout-with-sidebar">
      <AdminSidebar />
      <div className="main-content">
        <div className="page-header">
          <div><h1 className="page-title">Usuarios</h1><p className="page-subtitle">Gestión de todos los usuarios del sistema</p></div>
          <button className="btn btn-primary" onClick={openCreate}>+ Nuevo usuario</button>
        </div>

        <div style={{ display: 'flex', gap: '.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <input className="form-control" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 280 }} />
          <select className="form-control" value={rolFilter} onChange={e => setRolFilter(e.target.value)} style={{ maxWidth: 180 }}>
            <option value="">Todos los roles</option>
            {Object.entries(rolLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <button className="btn btn-primary" onClick={load}>Filtrar</button>
        </div>

        {loading ? <div className="loading-center"><div className="spinner" /></div> : (
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead><tr><th>Usuario</th><th>Email</th><th>Rol</th><th>Estado</th><th>Empresa</th><th>Acciones</th></tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 600 }}>{u.nombre} {u.apellido}</td>
                      <td style={{ fontSize: '.85rem', color: 'var(--c-gray-500)' }}>{u.email}</td>
                      <td><span className={`badge ${rolBadge[u.rol]}`}>{rolLabel[u.rol]}</span></td>
                      <td><span className={`badge ${u.activo ? 'badge-success' : 'badge-danger'}`}>{u.activo ? 'Activo' : 'Inactivo'}</span></td>
                      <td style={{ fontSize: '.85rem' }}>{u.nombre_empresa || '—'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '.5rem' }}>
                          <button className="btn btn-outline btn-sm" onClick={() => openEdit(u)}>✏️</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showModal && (
          <Modal title={editing ? 'Editar usuario' : 'Nuevo usuario'} onClose={() => setShowModal(false)}
            footer={<><button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button><button form="user-form" type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button></>}>
            <form id="user-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-grid">
                <div className="form-group"><label className="form-label">Nombre *</label><input className="form-control" value={form.nombre} onChange={e => set('nombre', e.target.value)} required /></div>
                <div className="form-group"><label className="form-label">Apellido *</label><input className="form-control" value={form.apellido} onChange={e => set('apellido', e.target.value)} required /></div>
              </div>
              <div className="form-group"><label className="form-label">Email *</label><input className="form-control" type="email" value={form.email} onChange={e => set('email', e.target.value)} required /></div>
              <div className="form-group"><label className="form-label">{editing ? 'Nueva contraseña (dejar vacío = no cambiar)' : 'Contraseña *'}</label><input className="form-control" type="password" value={form.password} onChange={e => set('password', e.target.value)} required={!editing} /></div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Rol</label>
                  <select className="form-control" value={form.rol} onChange={e => set('rol', e.target.value)}>
                    {Object.entries(rolLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Estado</label>
                  <select className="form-control" value={form.activo ? '1' : '0'} onChange={e => set('activo', e.target.value === '1')}>
                    <option value="1">Activo</option><option value="0">Inactivo</option>
                  </select>
                </div>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </div>
  );
}

export default AdminUsuarios;
