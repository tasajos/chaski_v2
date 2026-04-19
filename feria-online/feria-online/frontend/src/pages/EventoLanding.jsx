import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const CIUDADES_BO = ['La Paz', 'Cochabamba', 'Santa Cruz', 'Oruro', 'Potosí', 'Sucre', 'Tarija', 'Trinidad', 'Cobija', 'El Alto', 'Otra'];

function InfoItem({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
      <div style={{ fontSize: '1.75rem', lineHeight: 1, flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '.2rem' }}>{label}</div>
        <div style={{ fontSize: '.95rem', fontWeight: 600, color: '#111827' }}>{value}</div>
      </div>
    </div>
  );
}

export default function EventoLanding() {
  const { slug } = useParams();
  const [evento, setEvento] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [loadingEvento, setLoadingEvento] = useState(true);
  const [form, setForm] = useState({ nombre: '', apellido: '', celular: '', ciudad: '', email: '', genero: '' });
  const [submitting, setSubmitting] = useState(false);
  const [exitoso, setExitoso] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setLoadingEvento(true);
    api.get(`/eventos/slug/${slug}`)
      .then(r => setEvento(r.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoadingEvento(false));
  }, [slug]);

  if (notFound) return <Navigate to="/" replace />;

  // Colores del tema — el admin puede personalizarlos en el futuro (color_primario en DB)
  const accent = evento?.color_primario || '#FF6B35';
  const accentDark = evento?.color_secundario || '#E85A2A';

  const formatFecha = (f) => {
    if (!f) return '—';
    return new Date(f).toLocaleDateString('es-BO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatHora = (f) => {
    if (!f) return '';
    return new Date(f).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });
  };

  const validate = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = 'Requerido';
    if (!form.apellido.trim()) e.apellido = 'Requerido';
    if (!form.celular.trim()) e.celular = 'Requerido';
    if (!form.ciudad) e.ciudad = 'Requerido';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email inválido';
    if (!form.genero) e.genero = 'Requerido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await api.post('/inscripciones', { ...form, evento_id: evento.id });
      setExitoso(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al inscribirse');
    } finally {
      setSubmitting(false);
    }
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const inputStyle = (key) => ({
    padding: '.75rem 1rem',
    border: `1.5px solid ${errors[key] ? '#EF4444' : '#D1D5DB'}`,
    borderRadius: 10, fontFamily: 'inherit', fontSize: '.95rem',
    background: '#fff', color: '#111827', width: '100%',
    transition: 'border-color .15s', outline: 'none',
  });

  // ── Pantalla de éxito ────────────────────────────────────────────────────
  if (exitoso) {
    return (
      <div style={{ minHeight: '100vh', background: '#FFFBF8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ maxWidth: 520, textAlign: 'center', padding: '3rem 2.5rem', background: '#fff', borderRadius: 24, boxShadow: '0 8px 40px rgba(0,0,0,.10)', border: `1px solid ${accent}44` }}>
          <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🎉</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: '#111827', marginBottom: '.75rem' }}>
            ¡Te has inscrito!
          </h2>
          <p style={{ color: '#6B7280', fontSize: '1rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            Tu inscripción fue recibida. Recibirás el <strong>QR de acceso en tu correo electrónico</strong> una vez que confirmemos tu participación.
          </p>
          <div style={{ background: '#FFF7F3', borderRadius: 12, padding: '1rem 1.5rem', border: `1px solid ${accent}66`, fontSize: '.9rem', color: accentDark, fontWeight: 600 }}>
            📧 Revisa tu bandeja de entrada y la carpeta de spam.
          </div>
        </div>
      </div>
    );
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loadingEvento) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFFBF8' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'var(--font-body)', background: '#FFFBF8', '--accent': accent }}>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section style={{
        background: evento?.imagen_banner
          ? `linear-gradient(rgba(0,0,0,.55),rgba(0,0,0,.7)), url(${evento.imagen_banner}) center/cover no-repeat`
          : `linear-gradient(135deg,#1A0A00,#3D1500 45%,#7C2D00)`,
        color: '#fff', padding: '5rem 1.5rem 4rem', textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: `${accent}22` }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,200,100,.08)' }} />

        <div style={{ position: 'relative', maxWidth: 720, margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, lineHeight: 1.15, margin: '0 0 1.25rem', letterSpacing: '-.03em' }}>
            {evento?.titulo}
          </h1>
          {evento?.descripcion && (
            <p style={{ fontSize: 'clamp(.95rem, 2.2vw, 1.15rem)', color: 'rgba(255,255,255,.82)', lineHeight: 1.7, maxWidth: 580, margin: '0 auto 2.5rem' }}>
              {evento.descripcion}
            </p>
          )}

          {/* Pills de info */}
          <div style={{ display: 'inline-flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center', background: 'rgba(255,255,255,.1)', backdropFilter: 'blur(8px)', borderRadius: 16, padding: '1.25rem 2rem', border: '1px solid rgba(255,255,255,.18)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '.65rem', color: 'rgba(255,255,255,.6)', textTransform: 'uppercase', letterSpacing: '.1em' }}>Fecha</div>
              <div style={{ fontWeight: 700, fontSize: '.9rem', marginTop: '.3rem' }}>{formatFecha(evento?.fecha_inicio)}</div>
            </div>
            {evento?.ubicacion && (
              <>
                <div style={{ width: 1, background: 'rgba(255,255,255,.2)' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '.65rem', color: 'rgba(255,255,255,.6)', textTransform: 'uppercase', letterSpacing: '.1em' }}>Lugar</div>
                  <div style={{ fontWeight: 700, fontSize: '.9rem', marginTop: '.3rem' }}>{evento.ubicacion}</div>
                </div>
              </>
            )}
            <div style={{ width: 1, background: 'rgba(255,255,255,.2)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '.65rem', color: 'rgba(255,255,255,.6)', textTransform: 'uppercase', letterSpacing: '.1em' }}>Horario</div>
              <div style={{ fontWeight: 700, fontSize: '.9rem', marginTop: '.3rem' }}>
                {formatHora(evento?.fecha_inicio)} — {formatHora(evento?.fecha_fin)}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <a href="#formulario"
              style={{ display: 'inline-block', background: accent, color: '#fff', padding: '1rem 2.5rem', borderRadius: 50, fontSize: '1.05rem', fontWeight: 700, textDecoration: 'none', boxShadow: `0 8px 24px ${accent}55` }}>
              Inscríbete ahora ↓
            </a>
          </div>
        </div>
      </section>

      {/* ── DATOS DEL EVENTO ─────────────────────────────────────────────── */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '4rem 1.5rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: '#111827', marginBottom: '2rem', textAlign: 'center' }}>
          Información del evento
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.25rem' }}>
          {[
            { icon: '📅', label: 'Fecha', value: formatFecha(evento?.fecha_inicio) },
            { icon: '⏰', label: 'Horario', value: `${formatHora(evento?.fecha_inicio)} — ${formatHora(evento?.fecha_fin)}` },
            { icon: '📍', label: 'Lugar', value: evento?.ubicacion || 'Por confirmar' },
            { icon: '🎟️', label: 'Modalidad', value: evento?.modalidad === 'presencial' ? 'Presencial' : evento?.modalidad === 'virtual' ? 'Virtual' : 'Híbrido' },
          ].map(item => (
            <div key={item.label} style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,.06)', border: '1px solid #F3F4F6' }}>
              <InfoItem {...item} />
            </div>
          ))}
        </div>
      </section>

      {/* ── FORMULARIO ───────────────────────────────────────────────────── */}
      <section id="formulario" style={{ background: 'linear-gradient(180deg,#FFF0E8,#FFF8F4)', padding: '4rem 1.5rem 5rem' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ display: 'inline-block', background: accent, color: '#fff', fontSize: '.75rem', fontWeight: 700, padding: '.35rem .9rem', borderRadius: 50, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: '1rem' }}>
              Inscripción gratuita
            </span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.9rem', fontWeight: 800, color: '#111827', margin: '0 0 .75rem' }}>
              ¡Regístrate ahora!
            </h2>
            <p style={{ color: '#6B7280', fontSize: '.95rem', lineHeight: 1.6 }}>
              Completa el formulario y recibirás tu QR de acceso por correo electrónico.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate style={{ background: '#fff', borderRadius: 24, padding: '2.5rem', boxShadow: '0 8px 40px rgba(0,0,0,.08)', border: `1px solid ${accent}33` }}>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 600, color: '#374151', marginBottom: '.4rem' }}>Nombre *</label>
                <input style={inputStyle('nombre')} value={form.nombre} onChange={set('nombre')} placeholder="Tu nombre" />
                {errors.nombre && <span style={{ fontSize: '.75rem', color: '#EF4444' }}>{errors.nombre}</span>}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 600, color: '#374151', marginBottom: '.4rem' }}>Apellido *</label>
                <input style={inputStyle('apellido')} value={form.apellido} onChange={set('apellido')} placeholder="Tu apellido" />
                {errors.apellido && <span style={{ fontSize: '.75rem', color: '#EF4444' }}>{errors.apellido}</span>}
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 600, color: '#374151', marginBottom: '.4rem' }}>Celular *</label>
              <input style={inputStyle('celular')} value={form.celular} onChange={set('celular')} placeholder="Ej: 70012345" type="tel" />
              {errors.celular && <span style={{ fontSize: '.75rem', color: '#EF4444' }}>{errors.celular}</span>}
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 600, color: '#374151', marginBottom: '.4rem' }}>Ciudad *</label>
              <select style={{ ...inputStyle('ciudad'), cursor: 'pointer' }} value={form.ciudad} onChange={set('ciudad')}>
                <option value="">Selecciona tu ciudad</option>
                {CIUDADES_BO.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.ciudad && <span style={{ fontSize: '.75rem', color: '#EF4444' }}>{errors.ciudad}</span>}
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 600, color: '#374151', marginBottom: '.4rem' }}>Correo electrónico *</label>
              <input style={inputStyle('email')} value={form.email} onChange={set('email')} placeholder="tu@correo.com" type="email" />
              {errors.email && <span style={{ fontSize: '.75rem', color: '#EF4444' }}>{errors.email}</span>}
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 600, color: '#374151', marginBottom: '.4rem' }}>Género *</label>
              <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap' }}>
                {[
                  { val: 'masculino', label: 'Masculino' },
                  { val: 'femenino', label: 'Femenino' },
                  { val: 'otro', label: 'Otro' },
                  { val: 'prefiero_no_decir', label: 'Prefiero no decir' },
                ].map(({ val, label }) => (
                  <label key={val} style={{ display: 'flex', alignItems: 'center', gap: '.4rem', cursor: 'pointer', fontSize: '.88rem', color: '#374151', padding: '.45rem .9rem', borderRadius: 50, border: `1.5px solid ${form.genero === val ? accent : '#D1D5DB'}`, background: form.genero === val ? `${accent}15` : '#fff', transition: 'all .15s', fontWeight: form.genero === val ? 600 : 400 }}>
                    <input type="radio" name="genero" value={val} checked={form.genero === val} onChange={set('genero')} style={{ accentColor: accent }} />
                    {label}
                  </label>
                ))}
              </div>
              {errors.genero && <span style={{ fontSize: '.75rem', color: '#EF4444' }}>{errors.genero}</span>}
            </div>

            <button type="submit" disabled={submitting || loadingEvento}
              style={{ width: '100%', padding: '1rem', background: submitting ? '#9CA3AF' : accent, color: '#fff', border: 'none', borderRadius: 12, fontSize: '1.05rem', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'background .2s' }}>
              {submitting ? 'Enviando inscripción...' : `Inscribirme a ${evento?.titulo}`}
            </button>

            <p style={{ marginTop: '1rem', fontSize: '.78rem', color: '#9CA3AF', textAlign: 'center', lineHeight: 1.6 }}>
              Al inscribirte aceptas recibir comunicaciones sobre este evento. Tus datos no serán compartidos con terceros.
            </p>
          </form>
        </div>
      </section>

      <footer style={{ textAlign: 'center', padding: '1.5rem', background: '#111827', color: 'rgba(255,255,255,.35)', fontSize: '.78rem' }}>
        Powered by <span style={{ color: accent, fontWeight: 700 }}>Chakuy</span> — Plataforma de Eventos
      </footer>
    </div>
  );
}
