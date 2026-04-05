import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const modalidadIcon = { virtual: '💻', presencial: '📍', hibrido: '🌐' };
const estadoBadge = { publicado: 'badge-success', borrador: 'badge-gray', finalizado: 'badge-warning', cancelado: 'badge-danger' };

export default function EventCard({ evento }) {
  const { id, titulo, descripcion, imagen_banner, fecha_inicio, modalidad, estado, total_participantes, total_charlas } = evento;
  const fechaFmt = fecha_inicio ? format(new Date(fecha_inicio), "d MMM yyyy", { locale: es }) : '';

  return (
    <Link to={`/eventos/${id}`} style={{ textDecoration: 'none' }}>
      <div className="event-card">
        <div className="event-card-img" style={{ position: 'relative' }}>
          {imagen_banner
            ? <img src={imagen_banner} alt={titulo} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
            : <span style={{ fontSize: '3.5rem' }}>🎪</span>
          }
          <span className={`badge ${estadoBadge[estado] || 'badge-gray'}`} style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
            {estado?.charAt(0).toUpperCase() + estado?.slice(1)}
          </span>
        </div>
        <div className="event-card-body">
          <h3 className="event-card-title">{titulo}</h3>
          {descripcion && (
            <p style={{ fontSize: '.82rem', color: 'var(--c-gray-500)', marginBottom: '.75rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {descripcion}
            </p>
          )}
          <div className="event-card-meta">
            <span>📅 {fechaFmt}</span>
            <span>{modalidadIcon[modalidad]} {modalidad}</span>
            {total_participantes > 0 && <span>👥 {total_participantes}</span>}
            {total_charlas > 0 && <span>🎤 {total_charlas} charla{total_charlas !== 1 ? 's' : ''}</span>}
          </div>
          <span style={{ color: 'var(--c-primary)', fontSize: '.85rem', fontWeight: 600 }}>Ver evento →</span>
        </div>
      </div>
    </Link>
  );
}
