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
    <div style={{
      minHeight: 'calc(100vh - 68px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'linear-gradient(135deg, #f0f4ff 0%, #fafafa 100%)'
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img
            src="/logo_chakuy_editado.png"
            alt="Chaski"
            style={{ height: '280px', objectFit: 'contain', marginBottom: '0.25rem' }}
          />
          <h1 style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: '2rem',
            fontWeight: 700,
            color: '#1a1a2e',
            letterSpacing: '0.02em',
            marginBottom: '.4rem'
          }}>
            Bienvenido a Chaski
          </h1>
          <p style={{
            color: 'var(--c-gray-500)',
            fontSize: '0.95rem',
            fontWeight: 400
          }}>
            Sistema de Gestión de Ferias
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ borderRadius: 16, boxShadow: '0 8px 32px rgba(91,76,255,0.10)' }}>
          <div className="card-body" style={{ padding: '2rem' }}>
            <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                  Correo electrónico
                </label>
                <input
                  className="form-control"
                  type="email"
                  placeholder="tu@correo.com"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  required
                  style={{ padding: '0.75rem 1rem', fontSize: '0.95rem' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                  Contraseña
                </label>
                <input
                  className="form-control"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  required
                  style={{ padding: '0.75rem 1rem', fontSize: '0.95rem' }}
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={loading}
                style={{
                  marginTop: '.5rem',
                  padding: '0.8rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderRadius: 10,
                  letterSpacing: '0.03em'
                }}
              >
                {loading ? 'Ingresando...' : 'Ingresar'}
              </button>
            </form>

            <div className="divider" />

            <p style={{ textAlign: 'center', fontSize: '.88rem', color: 'var(--c-gray-500)' }}>
              ¿No tienes cuenta?{' '}
              <Link to="/registro" style={{ color: 'var(--c-primary)', fontWeight: 600 }}>
                Regístrate
              </Link>
            </p>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: '.75rem', color: 'var(--c-gray-300)', marginTop: '1.25rem' }}>
          Admin demo: admin@feria.com / Admin1234!
        </p>
      </div>
    </div>
  );
}