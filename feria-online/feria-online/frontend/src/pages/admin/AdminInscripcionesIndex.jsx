import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminSidebar } from '../../components/common/Sidebars';
import api from '../../services/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AdminInscripcionesIndex() {
  const [eventos, setEventos] = useState([]);
  const [resúmenes, setResúmenes] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/eventos', { params: { limit: 50, estado: '' } })
      .then(async r => {
        const evs = r.data.events || [];
        setEventos(evs);
        // Cargar resumen de inscripciones para cada evento en paralelo
        const resPromises = evs.map(e =>
          api.get(`/admin/inscripciones/${e.id}/resumen`)
            .then(res => ({ id: e.id, data: res.data }))
            .catch(() => ({ id: e.id, data: null }))
        );
        const results = await Promise.all(resPromises);
        const map = {};
        results.forEach(r => { map[r.id] = r.data; });
        setResúmenes(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const estadoBadge = {
    publicado: 'badge-success', borrador: 'badge-gray',
    finalizado: 'badge-warning', cancelado: 'badge-danger',
  };

  return (
    <div className="layout-with-sidebar">
      <AdminSidebar />
      <div className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Inscripciones por evento</h1>
            <p className="page-subtitle">Selecciona un evento para gestionar sus inscripciones y enviar QR</p>
          </div>
        </div>

        {loading
          ? <div className="loading-center"><div className="spinner" /></div>
          : <div className="card">
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Evento</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                      <th style={{ textAlign: 'center' }}>Inscritos</th>
                      <th style={{ textAlign: 'center' }}>Pagados</th>
                      <th style={{ textAlign: 'center' }}>Pendientes</th>
                      <th style={{ textAlign: 'center' }}>Asistieron</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventos.length === 0 && (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', color: 'var(--c-gray-500)', padding: '2.5rem' }}>
                          No hay eventos creados
                        </td>
                      </tr>
                    )}
                    {eventos.map(e => {
                      const r = resúmenes[e.id];
                      return (
                        <tr key={e.id}>
                          <td>
                            <div style={{ fontWeight: 600 }}>{e.titulo}</div>
                            {e.slug && (
                              <div style={{ fontSize: '.75rem', color: 'var(--c-gray-500)', fontFamily: 'monospace' }}>
                                /e/{e.slug}
                              </div>
                            )}
                          </td>
                          <td style={{ fontSize: '.85rem', color: 'var(--c-gray-500)' }}>
                            {e.fecha_inicio ? format(new Date(e.fecha_inicio), "d MMM yyyy", { locale: es }) : '—'}
                          </td>
                          <td>
                            <span className={`badge ${estadoBadge[e.estado] || 'badge-gray'}`}>{e.estado}</span>
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: 700, fontSize: '1rem' }}>
                            {r ? r.total_inscritos : '—'}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{ color: 'var(--c-success)', fontWeight: 600 }}>
                              {r ? r.total_pagados : '—'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{ color: 'var(--c-warning)', fontWeight: 600 }}>
                              {r ? r.total_pendientes : '—'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{ color: 'var(--c-accent)', fontWeight: 600 }}>
                              {r ? r.total_asistieron : '—'}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '.4rem' }}>
                              <Link to={`/admin/inscripciones/${e.id}`} className="btn btn-primary btn-sm">
                                📋 Gestionar
                              </Link>
                              {e.slug && (
                                <Link to={`/e/${e.slug}`} target="_blank" className="btn btn-outline btn-sm" title="Ver landing">
                                  🌐
                                </Link>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
        }
      </div>
    </div>
  );
}
