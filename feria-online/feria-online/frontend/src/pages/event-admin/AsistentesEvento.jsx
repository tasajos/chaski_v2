import { useState, useEffect } from 'react';
import { EventAdminSidebar } from '../../components/common/Sidebars';
import { eventosService } from '../../services/api';
import api from '../../services/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AsistentesEvento() {
  const [evento, setEvento] = useState(null);
  const [asistentes, setAsistentes] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventosService.myEvents().then(r => {
      const ev = r.data[0];
      if (!ev) return;
      setEvento(ev);
      Promise.all([
        api.get(`/qr/asistentes/${ev.id}`),
        api.get(`/qr/resumen/${ev.id}`)
      ]).then(([a, res]) => {
        setAsistentes(a.data);
        setResumen(res.data);
      }).finally(() => setLoading(false));
    });
  }, []);

  const exportarCSV = () => {
    const headers = ['Nombre', 'Apellido', 'Email', 'Ticket', 'Estado', 'Hora entrada'];
    const rows = asistentes.map(a => [
      a.nombre, a.apellido, a.email, a.ticket_tipo, a.estado,
      a.fecha_entrada ? format(new Date(a.fecha_entrada), 'dd/MM/yyyy HH:mm', { locale: es }) : ''
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `asistentes_${evento?.titulo?.replace(/ /g, '_')}.csv`;
    a.click();
  };

  return (
    <div className="layout-with-sidebar">
      <EventAdminSidebar />
      <div className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Asistentes</h1>
            <p className="page-subtitle">{evento?.titulo}</p>
          </div>
          <button className="btn btn-primary" onClick={exportarCSV}>⬇️ Exportar CSV</button>
        </div>

        {resumen && (
          <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
            {[
              ['🎫', 'Total inscritos', resumen.total_tickets, 'var(--c-primary)'],
              ['✅', 'Asistieron', resumen.total_asistieron, 'var(--c-success)'],
              ['❌', 'No asistieron', resumen.total_ausentes, 'var(--c-gray-500)'],
            ].map(([icon, label, val, color]) => (
              <div key={label} className="stat-card">
                <div style={{ fontSize: '1.5rem' }}>{icon}</div>
                <div className="stat-label">{label}</div>
                <div className="stat-value" style={{ color }}>{val}</div>
              </div>
            ))}
          </div>
        )}

        {loading
          ? <div className="loading-center"><div className="spinner" /></div>
          : <div className="card">
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Ticket</th>
                      <th>Estado</th>
                      <th>Hora entrada</th>
                    </tr>
                  </thead>
                  <tbody>
                    {asistentes.length === 0
                      ? <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--c-gray-500)', padding: '2rem' }}>Sin registros aún</td></tr>
                      : asistentes.map((a, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 600 }}>{a.nombre} {a.apellido}</td>
                          <td style={{ fontSize: '.85rem', color: 'var(--c-gray-500)' }}>{a.email}</td>
                          <td><span className="badge badge-primary">{a.ticket_tipo}</span></td>
                          <td>
                            <span className={`badge ${a.estado === 'Asistió' ? 'badge-success' : 'badge-gray'}`}>
                              {a.estado}
                            </span>
                          </td>
                          <td style={{ fontSize: '.82rem', color: 'var(--c-gray-500)' }}>
                            {a.fecha_entrada
                              ? format(new Date(a.fecha_entrada), 'dd/MM HH:mm', { locale: es })
                              : '—'
                            }
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            </div>
        }
      </div>
    </div>
  );
}