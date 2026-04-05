import { useState, useEffect } from 'react';
import { eventosService } from '../services/api';
import EventCard from '../components/common/EventCard';

export default function EventosPage() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = (p = 1, s = search) => {
    setLoading(true);
    eventosService.getAll({ page: p, search: s, estado: 'publicado', limit: 9 })
      .then(r => { setEventos(r.data.events); setTotalPages(r.data.totalPages); setPage(p); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    load(1, search);
  };

  return (
    <div className="page-content">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Eventos</h1>
            <p className="page-subtitle">Todas las ferias y eventos disponibles</p>
          </div>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '.75rem', marginBottom: '2rem', maxWidth: 480 }}>
          <div className="search-bar" style={{ flex: 1 }}>
            <span className="search-icon">🔍</span>
            <input className="form-control" placeholder="Buscar eventos..." value={search}
              onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2.5rem' }} />
          </div>
          <button className="btn btn-primary" type="submit">Buscar</button>
          {search && <button className="btn btn-outline" type="button" onClick={() => { setSearch(''); load(1, ''); }}>✕</button>}
        </form>

        {loading
          ? <div className="loading-center"><div className="spinner" /></div>
          : eventos.length === 0
            ? <div className="empty-state"><div className="empty-state-icon">🎪</div><h3>No se encontraron eventos</h3><p>Intenta con otro término de búsqueda</p></div>
            : <>
                <div className="events-grid">{eventos.map(e => <EventCard key={e.id} evento={e} />)}</div>
                {totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '.5rem', marginTop: '2rem' }}>
                    <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => load(page - 1)}>← Anterior</button>
                    <span style={{ padding: '.5rem 1rem', fontSize: '.88rem', color: 'var(--c-gray-500)' }}>Página {page} de {totalPages}</span>
                    <button className="btn btn-outline btn-sm" disabled={page >= totalPages} onClick={() => load(page + 1)}>Siguiente →</button>
                  </div>
                )}
              </>
        }
      </div>
    </div>
  );
}
