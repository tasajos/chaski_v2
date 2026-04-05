import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [rol, setRol] = useState('');
  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', password: '', empresa: { nombre_empresa: '', descripcion: '', sector: '', sitio_web: '', telefono: '' } });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const setEmp = (k, v) => setForm(p => ({ ...p, empresa: { ...p.empresa, [k]: v } }));

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { nombre: form.nombre, apellido: form.apellido, email: form.email, password: form.password, rol };
      if (rol === 'empresa') payload.empresa = form.empresa;
      const user = await register(payload);
      toast.success('¡Cuenta creada exitosamente!');
      navigate(rol === 'empresa' ? '/empresa/dashboard' : '/eventos');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 68px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 520 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '.5rem' }}>🎪</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800 }}>Crear cuenta</h1>
          <p style={{ color: 'var(--c-gray-500)', marginTop: '.5rem' }}>Únete a FeriaOnline</p>
        </div>

        {step === 1 && (
          <div className="card">
            <div className="card-header"><h2 className="card-title">¿Cómo quieres participar?</h2></div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {[
                  { val: 'participante', icon: '🙋', title: 'Participante', desc: 'Asiste a eventos, charlas y compra tickets' },
                  { val: 'empresa', icon: '🏢', title: 'Empresa', desc: 'Exhibe tus productos y participa en ferias' },
                ].map(o => (
                  <button key={o.val} type="button"
                    onClick={() => { setRol(o.val); setStep(2); }}
                    style={{
                      padding: '1.5rem 1rem', borderRadius: 12, border: '2px solid',
                      borderColor: rol === o.val ? 'var(--c-primary)' : 'var(--c-gray-200)',
                      background: rol === o.val ? 'var(--c-primary-light)' : '#fff',
                      cursor: 'pointer', textAlign: 'center', transition: 'all .15s'
                    }}>
                    <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>{o.icon}</div>
                    <div style={{ fontWeight: 700, marginBottom: '.25rem' }}>{o.title}</div>
                    <div style={{ fontSize: '.78rem', color: 'var(--c-gray-500)' }}>{o.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Datos personales</h2>
              <button className="btn btn-outline btn-sm" onClick={() => setStep(1)}>← Atrás</button>
            </div>
            <div className="card-body">
              <form onSubmit={rol === 'empresa' ? (e) => { e.preventDefault(); setStep(3); } : handle}
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                  <label className="form-label">Correo electrónico</label>
                  <input className="form-control" type="email" value={form.email} onChange={e => set('email', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Contraseña</label>
                  <input className="form-control" type="password" minLength={6} value={form.password} onChange={e => set('password', e.target.value)} required />
                </div>
                <button className="btn btn-primary btn-full" disabled={loading}>
                  {rol === 'empresa' ? 'Siguiente →' : (loading ? 'Creando...' : 'Crear cuenta')}
                </button>
              </form>
            </div>
          </div>
        )}

        {step === 3 && rol === 'empresa' && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Datos de tu empresa</h2>
              <button className="btn btn-outline btn-sm" onClick={() => setStep(2)}>← Atrás</button>
            </div>
            <div className="card-body">
              <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Nombre de la empresa *</label>
                  <input className="form-control" value={form.empresa.nombre_empresa} onChange={e => setEmp('nombre_empresa', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Sector</label>
                  <input className="form-control" placeholder="ej. Tecnología, Salud, Educación..." value={form.empresa.sector} onChange={e => setEmp('sector', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Descripción</label>
                  <textarea className="form-control" rows={3} value={form.empresa.descripcion} onChange={e => setEmp('descripcion', e.target.value)} />
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Sitio web</label>
                    <input className="form-control" type="url" placeholder="https://..." value={form.empresa.sitio_web} onChange={e => setEmp('sitio_web', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Teléfono</label>
                    <input className="form-control" value={form.empresa.telefono} onChange={e => setEmp('telefono', e.target.value)} />
                  </div>
                </div>
                <button className="btn btn-primary btn-full" disabled={loading}>
                  {loading ? 'Creando cuenta...' : 'Finalizar registro'}
                </button>
              </form>
            </div>
          </div>
        )}

        <p style={{ textAlign: 'center', fontSize: '.88rem', color: 'var(--c-gray-500)', marginTop: '1rem' }}>
          ¿Ya tienes cuenta? <Link to="/login" style={{ color: 'var(--c-primary)', fontWeight: 600 }}>Ingresar</Link>
        </p>
      </div>
    </div>
  );
}
