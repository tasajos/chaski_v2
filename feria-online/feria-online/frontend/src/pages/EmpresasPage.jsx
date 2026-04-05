import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { empresasService } from '../services/api';

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState([]);
  const [sectores, setSectores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState('');

  const load = (s = search, sec = sector) => {
    setLoading(true);
    empresasService.getAll({ search: s, sector: sec })
      .then(r => setEmpresas(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    empresasService.getSectores().then(r => setSectores(r.data)).catch(() => {});
  }, []);

  const handleSearch = (e) => { e.preventDefault(); load(); };

  return (
    <div className="page-content">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Empresas expositoras</h1>
            <p className="page-subtitle">Conoce las empresas que participan en nuestras ferias</p>
          </div>
        </div>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
            <span className="search-icon">🔍</span>
            <input className="form-control" placeholder="Buscar empresa..." value={search}
              onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2.5rem' }} />
          </div>
          {sectores.length > 0 && (
            <select className="form-control" value={sector} onChange={e => { setSector(e.target.value); load(search, e.target.value); }} style={{ maxWidth: 200 }}>
              <option value="">Todos los sectores</option>
              {sectores.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
          <button className="btn btn-primary" type="submit">Buscar</button>
        </form>

        {loading
          ? <div className="loading-center"><div className="spinner" /></div>
          : empresas.length === 0
            ? <div className="empty-state"><div className="empty-state-icon">🏢</div><h3>No se encontraron empresas</h3></div>
            : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {empresas.map(e => (
                  <Link key={e.id} to={`/empresas/${e.id}`} style={{ textDecoration: 'none' }}>
                    <div className="card" style={{ transition: 'all .2s', cursor: 'pointer' }}
                      onMouseEnter={ev => { ev.currentTarget.style.transform = 'translateY(-3px)'; ev.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,.12)'; }}
                      onMouseLeave={ev => { ev.currentTarget.style.transform = ''; ev.currentTarget.style.boxShadow = ''; }}>
                      <div style={{ height: 120, background: 'linear-gradient(135deg, var(--c-primary-light), #e0e7ff)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {e.logo
                          ? <img src={e.logo} alt={e.nombre_empresa} style={{ height: 80, objectFit: 'contain' }} />
                          : <span style={{ fontSize: '3rem' }}>🏢</span>
                        }
                      </div>
                      <div className="card-body">
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '.5rem', marginBottom: '.5rem' }}>
                          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }}>{e.nombre_empresa}</h3>
                          {e.verificada ? <span className="badge badge-success" style={{ flexShrink: 0 }}>✓</span> : null}
                        </div>
                        {e.sector && <span className="badge badge-gray" style={{ marginBottom: '.75rem', display: 'inline-flex' }}>{e.sector}</span>}
                        {e.descripcion && (
                          <p style={{ fontSize: '.83rem', color: 'var(--c-gray-500)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {e.descripcion}
                          </p>
                        )}
                        <div style={{ marginTop: '.75rem', fontSize: '.82rem', color: 'var(--c-primary)', fontWeight: 600 }}>Ver perfil →</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
        }
      </div>
    </div>
  );
}
