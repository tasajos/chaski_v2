import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventosService } from '../services/api';
import EventCard from '../components/common/EventCard';

export default function HomePage() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventosService.getAll({ limit: 6, estado: 'publicado' })
      .then(r => setEventos(r.data.events))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">
            El futuro de las<br />ferias es digital 🚀
          </h1>
          <p className="hero-subtitle">
            Descubre eventos, asiste a charlas, reúnete con empresas y compra entradas — todo en un solo lugar.
          </p>
          <div className="hero-cta">
            <Link to="/eventos" className="btn btn-lg" style={{ background: '#fff', color: 'var(--c-primary)' }}>
              Explorar eventos
            </Link>
            <Link to="/registro" className="btn btn-lg btn-accent">
              Comenzar gratis
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div style={{ background: 'var(--c-primary)', color: '#fff', padding: '1.25rem 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap' }}>
          {[['🎪', 'Ferias virtuales'], ['🎤', 'Charlas en vivo'], ['🤝', 'Reuniones privadas'], ['🏢', 'Empresas expositoras']].map(([icon, label]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.95rem', fontWeight: 500, opacity: .9 }}>
              <span>{icon}</span> {label}
            </div>
          ))}
        </div>
      </div>

      {/* Featured events */}
      <section style={{ padding: '3rem 0' }}>
        <div className="container">
          <div className="page-header">
            <div>
              <h2 className="page-title">Eventos destacados</h2>
              <p className="page-subtitle">Próximas ferias y eventos publicados</p>
            </div>
            <Link to="/eventos" className="btn btn-secondary">Ver todos →</Link>
          </div>

          {loading
            ? <div className="loading-center"><div className="spinner" /></div>
            : eventos.length === 0
              ? <div className="empty-state"><div className="empty-state-icon">🎪</div><h3>No hay eventos aún</h3><p>Vuelve pronto</p></div>
              : <div className="events-grid">{eventos.map(e => <EventCard key={e.id} evento={e} />)}</div>
          }
        </div>
      </section>

      {/* Features */}
      <section style={{ background: '#fff', padding: '3rem 0', borderTop: '1px solid var(--c-gray-200)' }}>
        <div className="container">
          <h2 className="page-title" style={{ textAlign: 'center', marginBottom: '2rem' }}>¿Por qué FeriaOnline?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {[
              ['🎪', 'Crea tu feria', 'Diseña tu evento con charlas, reuniones y venta de entradas fácilmente.'],
              ['🎤', 'Charlas en vivo', 'Organiza ponencias con ponentes y agenda detallada.'],
              ['🔒', 'Reuniones privadas', 'Espacios exclusivos para networking y negocios.'],
              ['🏢', 'Vitrina empresarial', 'Las empresas exhiben sus productos y servicios.'],
            ].map(([icon, title, desc]) => (
              <div key={title} style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{icon}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '.5rem' }}>{title}</h3>
                <p style={{ color: 'var(--c-gray-500)', fontSize: '.9rem' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
