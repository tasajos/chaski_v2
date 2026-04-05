import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`¡Bienvenido, ${user.nombre}!`);
      const redirects = {
        admin: '/admin',
        admin_evento: '/mi-evento',
        empresa: '/empresa/dashboard',
        participante: '/eventos'
      };
      navigate(redirects[user.rol] || '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 68px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '.5rem' }}>🎪</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800 }}>Ingresar</h1>
          <p style={{ color: 'var(--c-gray-500)', marginTop: '.5rem' }}>Accede a tu cuenta de FeriaOnline</p>
        </div>
        <div className="card">
          <div className="card-body">
            <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Correo electrónico</label>
                <input
                  className="form-control"
                  type="email"
                  placeholder="tu@correo.com"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Contraseña</label>
                <input
                  className="form-control"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={loading}
                style={{ marginTop: '.5rem' }}
              >
                {loading ? 'Ingresando...' : 'Ingresar'}
              </button>
            </form>
            <div className="divider" />
            <p style={{ textAlign: 'center', fontSize: '.88rem', color: 'var(--c-gray-500)' }}>
              ¿No tienes cuenta? <Link to="/registro" style={{ color: 'var(--c-primary)', fontWeight: 600 }}>Regístrate</Link>
            </p>
          </div>
        </div>
        <p style={{ textAlign: 'center', fontSize: '.78rem', color: 'var(--c-gray-300)', marginTop: '1rem' }}>
          Admin demo: admin@feria.com / Admin1234!
        </p>
      </div>
    </div>
  );
}