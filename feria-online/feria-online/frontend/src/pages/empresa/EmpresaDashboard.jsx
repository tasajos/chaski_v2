import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { empresasService, eventosService } from '../../services/api';
import { EmpresaSidebar } from '../../components/common/Sidebars';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

export default function EmpresaDashboard() {
  const { user, updateUser } = useAuth();
  const [eventos, setEventos] = useState([]);
  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState({
    nombre_empresa: user?.nombre_empresa || '',
    descripcion: user?.empresa_descripcion || '',
    sector: user?.sector || '',
    sitio_web: user?.sitio_web || '',
    logo: user?.logo || '',
    telefono: user?.telefono || '',
    pais: user?.pais || '',
    ciudad: user?.ciudad || '',
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    eventosService.getAll({ estado: 'publicado', limit: 6 }).then(r => setEventos(r.data.events || []));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await empresasService.updatePerfil(form);
      toast.success('Perfil actualizado correctamente');
      updateUser(form);
      setShowEdit(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="layout-with-sidebar">
      <EmpresaSidebar />
      <div className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">{user?.nombre_empresa || 'Mi Empresa'}</h1>
            <p className="page-subtitle">Panel de gestión de tu empresa</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowEdit(true)}>✏️ Editar perfil</button>
        </div>

        {/* Profile card */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-body" style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div style={{ width: 80, height: 80, borderRadius: 16, background: 'var(--c-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
              {user?.logo
                ? <img src={user.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                : <span style={{ fontSize: '2.5rem' }}>🏢</span>
              }
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '.5rem' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>{user?.nombre_empresa || 'Completa tu perfil'}</h2>
                {user?.verificada
                  ? <span className="badge badge-success">✓ Verificada</span>
                  : <span className="badge badge-warning">Pendiente verificación</span>
                }
              </div>
              {user?.sector && <span className="badge badge-gray" style={{ marginBottom: '.5rem' }}>{user.sector}</span>}
              <p style={{ color: 'var(--c-gray-500)', fontSize: '.9rem', marginBottom: '.75rem' }}>
                {user?.empresa_descripcion || 'Sin descripción. Completa tu perfil para aparecer en el directorio.'}
              </p>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '.85rem', color: 'var(--c-gray-500)' }}>
                {user?.sitio_web && <a href={user.sitio_web} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--c-primary)' }}>🌐 {user.sitio_web}</a>}
                {user?.telefono && <span>📞 {user.telefono}</span>}
                {user?.ciudad && <span>📍 {user.ciudad}, {user?.pais}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <Link to="/empresa/productos" className="card" style={{ textDecoration: 'none' }}>
            <div className="card-body" style={{ textAlign: 'center', padding: '1.75rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '.75rem' }}>🛍️</div>
              <div style={{ fontWeight: 700, color: 'var(--c-gray-900)' }}>Mis productos</div>
              <div style={{ fontSize: '.82rem', color: 'var(--c-primary)', marginTop: '.25rem' }}>Gestionar catálogo →</div>
            </div>
          </Link>
          <Link to="/eventos" className="card" style={{ textDecoration: 'none' }}>
            <div className="card-body" style={{ textAlign: 'center', padding: '1.75rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '.75rem' }}>🎪</div>
              <div style={{ fontWeight: 700, color: 'var(--c-gray-900)' }}>Explorar ferias</div>
              <div style={{ fontSize: '.82rem', color: 'var(--c-primary)', marginTop: '.25rem' }}>Ver eventos →</div>
            </div>
          </Link>
        </div>

        {/* Available events */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Eventos disponibles</h2>
            <Link to="/eventos" className="btn btn-secondary btn-sm">Ver todos</Link>
          </div>
          <div className="card-body">
            {eventos.length === 0
              ? <p style={{ color: 'var(--c-gray-500)', textAlign: 'center', padding: '1rem' }}>No hay eventos disponibles</p>
              : <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                  {eventos.map(e => (
                    <Link key={e.id} to={`/eventos/${e.id}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1rem', padding: '.75rem', borderRadius: 8, border: '1px solid var(--c-gray-200)', background: 'var(--c-gray-50)' }}>
                      <div style={{ width: 56, height: 56, borderRadius: 8, background: 'var(--c-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                        {e.imagen_banner ? <img src={e.imagen_banner} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '1.5rem' }}>🎪</span>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '.9rem', color: 'var(--c-gray-900)' }}>{e.titulo}</div>
                        <div style={{ fontSize: '.8rem', color: 'var(--c-gray-500)' }}>{e.modalidad} · {e.ubicacion || 'Virtual'}</div>
                      </div>
                      <span style={{ color: 'var(--c-primary)', fontSize: '.85rem', fontWeight: 600 }}>Inscribirse →</span>
                    </Link>
                  ))}
                </div>
            }
          </div>
        </div>

        {showEdit && (
          <Modal title="Editar perfil de empresa" size="lg" onClose={() => setShowEdit(false)}
            footer={<><button className="btn btn-outline" onClick={() => setShowEdit(false)}>Cancelar</button><button form="empresa-form" type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar cambios'}</button></>}>
            <form id="empresa-form" onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group"><label className="form-label">Nombre de la empresa *</label><input className="form-control" value={form.nombre_empresa} onChange={e => set('nombre_empresa', e.target.value)} required /></div>
              <div className="form-group"><label className="form-label">Sector / industria</label><input className="form-control" placeholder="ej. Tecnología, Salud, Retail..." value={form.sector} onChange={e => set('sector', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Descripción</label><textarea className="form-control" rows={4} placeholder="Cuéntanos sobre tu empresa, qué hacen, su misión..." value={form.descripcion} onChange={e => set('descripcion', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">URL del logo</label><input className="form-control" type="url" placeholder="https://..." value={form.logo} onChange={e => set('logo', e.target.value)} /></div>
              <div className="form-grid">
                <div className="form-group"><label className="form-label">Sitio web</label><input className="form-control" type="url" placeholder="https://..." value={form.sitio_web} onChange={e => set('sitio_web', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Teléfono</label><input className="form-control" value={form.telefono} onChange={e => set('telefono', e.target.value)} /></div>
              </div>
              <div className="form-grid">
                <div className="form-group"><label className="form-label">País</label><input className="form-control" value={form.pais} onChange={e => set('pais', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Ciudad</label><input className="form-control" value={form.ciudad} onChange={e => set('ciudad', e.target.value)} /></div>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </div>
  );
}
