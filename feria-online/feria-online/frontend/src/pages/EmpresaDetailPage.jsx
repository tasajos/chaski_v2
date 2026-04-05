import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { empresasService } from '../services/api';

export default function EmpresaDetailPage() {
  const { id } = useParams();
  const [empresa, setEmpresa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('sobre');

  useEffect(() => {
    empresasService.getById(id)
      .then(r => setEmpresa(r.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!empresa) return <div className="container page-content"><div className="empty-state"><h3>Empresa no encontrada</h3></div></div>;

  const Tab = ({ id: tid, label }) => (
    <button onClick={() => setTab(tid)} style={{
      padding: '.55rem 1.1rem', borderRadius: 8, border: 'none', cursor: 'pointer',
      fontFamily: 'inherit', fontWeight: 600, fontSize: '.88rem',
      background: tab === tid ? 'var(--c-primary)' : 'transparent',
      color: tab === tid ? '#fff' : 'var(--c-gray-500)',
    }}>{label}</button>
  );

  return (
    <div className="page-content">
      <div className="container">
        {/* Header */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ height: 160, background: 'linear-gradient(135deg, #1a0e4e, #5B4CFF)', borderRadius: '16px 16px 0 0' }} />
          <div className="card-body" style={{ position: 'relative' }}>
            <div style={{ width: 96, height: 96, borderRadius: 16, background: '#fff', border: '4px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,.15)', position: 'absolute', top: -48, left: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {empresa.logo
                ? <img src={empresa.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                : <span style={{ fontSize: '2.5rem' }}>🏢</span>
              }
            </div>
            <div style={{ marginLeft: 120 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', flexWrap: 'wrap', marginBottom: '.5rem' }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800 }}>{empresa.nombre_empresa}</h1>
                {empresa.verificada && <span className="badge badge-success">✓ Verificada</span>}
              </div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '.88rem', color: 'var(--c-gray-500)' }}>
                {empresa.sector && <span>🏷️ {empresa.sector}</span>}
                {empresa.ciudad && empresa.pais && <span>📍 {empresa.ciudad}, {empresa.pais}</span>}
                {empresa.sitio_web && <a href={empresa.sitio_web} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--c-primary)' }}>🌐 Sitio web</a>}
                {empresa.telefono && <span>📞 {empresa.telefono}</span>}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'start' }}>
          <div>
            <div style={{ display: 'flex', gap: '.25rem', background: 'var(--c-gray-100)', borderRadius: 10, padding: '.25rem', marginBottom: '1.5rem' }}>
              <Tab id="sobre" label="📋 Sobre nosotros" />
              <Tab id="productos" label={`🛍️ Productos (${empresa.productos?.length || 0})`} />
              <Tab id="eventos" label={`🎪 Eventos (${empresa.eventos?.length || 0})`} />
            </div>

            {tab === 'sobre' && (
              <div className="card"><div className="card-body">
                <h3 style={{ fontWeight: 700, marginBottom: '.75rem' }}>Descripción</h3>
                <p style={{ color: 'var(--c-gray-700)', lineHeight: 1.8 }}>{empresa.descripcion || 'Esta empresa aún no ha completado su descripción.'}</p>
              </div></div>
            )}

            {tab === 'productos' && (
              empresa.productos?.length === 0
                ? <div className="empty-state"><div className="empty-state-icon">🛍️</div><h3>Sin productos publicados</h3></div>
                : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                    {empresa.productos?.map(p => (
                      <div key={p.id} className="card">
                        {p.imagen && <img src={p.imagen} alt={p.nombre} style={{ width: '100%', height: 160, objectFit: 'cover' }} />}
                        <div className="card-body">
                          <h3 style={{ fontWeight: 700, marginBottom: '.25rem', fontSize: '.95rem' }}>{p.nombre}</h3>
                          {p.descripcion && <p style={{ fontSize: '.8rem', color: 'var(--c-gray-500)', marginBottom: '.5rem' }}>{p.descripcion}</p>}
                          {p.precio && <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 800, color: 'var(--c-primary)' }}>${Number(p.precio).toFixed(2)}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
            )}

            {tab === 'eventos' && (
              empresa.eventos?.length === 0
                ? <div className="empty-state"><div className="empty-state-icon">🎪</div><h3>Sin eventos activos</h3></div>
                : <div className="events-grid">
                    {empresa.eventos?.map(e => (
                      <Link key={e.id} to={`/eventos/${e.id}`} style={{ textDecoration: 'none' }}>
                        <div className="event-card">
                          <div className="event-card-img">{e.imagen_banner ? <img src={e.imagen_banner} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>🎪</span>}</div>
                          <div className="event-card-body">
                            <h3 className="event-card-title">{e.titulo}</h3>
                            <span style={{ color: 'var(--c-primary)', fontSize: '.85rem', fontWeight: 600 }}>Ver evento →</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
            )}
          </div>

          {/* Contact card */}
          <div className="card" style={{ position: 'sticky', top: 88 }}>
            <div className="card-header"><h3 className="card-title">Contacto</h3></div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
              <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center' }}>
                <span style={{ fontSize: '1.5rem' }}>👤</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '.9rem' }}>{empresa.nombre} {empresa.apellido}</div>
                  <div style={{ fontSize: '.8rem', color: 'var(--c-gray-500)' }}>Representante</div>
                </div>
              </div>
              {empresa.email && (
                <a href={`mailto:${empresa.email}`} style={{ display: 'flex', gap: '.75rem', alignItems: 'center', color: 'var(--c-primary)', textDecoration: 'none', fontSize: '.88rem' }}>
                  <span>✉️</span> {empresa.email}
                </a>
              )}
              {empresa.telefono && (
                <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center', fontSize: '.88rem', color: 'var(--c-gray-700)' }}>
                  <span>📞</span> {empresa.telefono}
                </div>
              )}
              {empresa.sitio_web && (
                <a href={empresa.sitio_web} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-full" style={{ marginTop: '.5rem' }}>
                  🌐 Visitar sitio web
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
