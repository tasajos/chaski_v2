import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ nombre: user?.nombre || '', apellido: user?.apellido || '', avatar: user?.avatar || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const setPw = (k, v) => setPwForm(p => ({ ...p, [k]: v }));

  const handleProfile = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await authService.updateProfile(form);
      updateUser(form);
      toast.success('Perfil actualizado');
    } catch { toast.error('Error al actualizar'); }
    finally { setSaving(false); }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) return toast.error('Las contraseñas no coinciden');
    if (pwForm.newPassword.length < 6) return toast.error('Mínimo 6 caracteres');
    setSavingPw(true);
    try {
      await authService.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Contraseña actualizada');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSavingPw(false); }
  };

  const rolMap = { admin: 'Administrador', admin_evento: 'Administrador de evento', empresa: 'Empresa', participante: 'Participante' };

  return (
    <div className="page-content">
      <div className="container" style={{ maxWidth: 640 }}>
        <div className="page-header">
          <h1 className="page-title">Mi perfil</h1>
        </div>

        {/* Avatar & role */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-body" style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--c-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', overflow: 'hidden', flexShrink: 0 }}>
              {form.avatar ? <img src={form.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👤'}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem' }}>{user?.nombre} {user?.apellido}</div>
              <div style={{ color: 'var(--c-gray-500)', fontSize: '.88rem' }}>{user?.email}</div>
              <div style={{ marginTop: '.25rem' }}>
                <span className="badge badge-primary">{rolMap[user?.rol] || user?.rol}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit profile */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header"><h2 className="card-title">Información personal</h2></div>
          <div className="card-body">
            <form onSubmit={handleProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Nombre</label>
                  <input className="form-control" value={form.nombre} onChange={e => set('nombre', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Apellido</label>
                  <input className="form-control" value={form.apellido} onChange={e => set('apellido', e.target.value)} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">URL de avatar (opcional)</label>
                <input className="form-control" type="url" placeholder="https://..." value={form.avatar} onChange={e => set('avatar', e.target.value)} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar cambios'}</button>
              </div>
            </form>
          </div>
        </div>

        {/* Change password */}
        <div className="card">
          <div className="card-header"><h2 className="card-title">Cambiar contraseña</h2></div>
          <div className="card-body">
            <form onSubmit={handlePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Contraseña actual</label>
                <input className="form-control" type="password" value={pwForm.currentPassword} onChange={e => setPw('currentPassword', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Nueva contraseña</label>
                <input className="form-control" type="password" minLength={6} value={pwForm.newPassword} onChange={e => setPw('newPassword', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Confirmar nueva contraseña</label>
                <input className="form-control" type="password" value={pwForm.confirm} onChange={e => setPw('confirm', e.target.value)} required />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary" disabled={savingPw}>{savingPw ? 'Actualizando...' : 'Cambiar contraseña'}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
