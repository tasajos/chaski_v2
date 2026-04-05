import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/api';
import { AdminSidebar } from '../../components/common/Sidebars';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const StatCard = ({ icon, label, value, sub, color = 'var(--c-primary)' }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: color + '18' }}><span style={{ fontSize: '1.25rem' }}>{icon}</span></div>
    <div className="stat-label">{label}</div>
    <div className="stat-value" style={{ color }}>{value}</div>
    {sub && <div className="stat-sub">{sub}</div>}
  </div>
);

const estadoBadge = { publicado: 'badge-success', borrador: 'badge-gray', finalizado: 'badge-warning', cancelado: 'badge-danger' };

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getStats().then(r => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="layout-with-sidebar">
      <AdminSidebar />
      <div className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Vista general del sistema</p>
          </div>
          <Link to="/admin/eventos" className="btn btn-primary">+ Crear evento</Link>
        </div>

        {loading
          ? <div className="loading-center"><div className="spinner" /></div>
          : <>
              <div className="stats-grid">
                <StatCard icon="👥" label="Usuarios totales" value={stats.total_usuarios} color="var(--c-primary)" />
                <StatCard icon="🎪" label="Eventos activos" value={stats.eventos_activos} sub={`de ${stats.total_eventos} totales`} color="var(--c-accent)" />
                <StatCard icon="🏢" label="Empresas" value={stats.total_empresas} color="#22C55E" />
                <StatCard icon="💰" label="Ingresos totales" value={`$${Number(stats.ingresos_totales).toFixed(2)}`} sub={`${stats.ventas_totales} ventas`} color="var(--c-warning)" />
              </div>

              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Eventos recientes</h2>
                  <Link to="/admin/eventos" className="btn btn-secondary btn-sm">Ver todos</Link>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Evento</th><th>Estado</th><th>Fecha inicio</th><th>Acciones</th></tr></thead>
                    <tbody>
                      {stats.eventos_recientes?.map(e => (
                        <tr key={e.id}>
                          <td style={{ fontWeight: 600 }}>{e.titulo}</td>
                          <td><span className={`badge ${estadoBadge[e.estado]}`}>{e.estado}</span></td>
                          <td style={{ color: 'var(--c-gray-500)', fontSize: '.85rem' }}>{format(new Date(e.fecha_inicio), "d MMM yyyy", { locale: es })}</td>
                          <td><Link to={`/eventos/${e.id}`} className="btn btn-outline btn-sm">Ver</Link></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
        }
      </div>
    </div>
  );
}
