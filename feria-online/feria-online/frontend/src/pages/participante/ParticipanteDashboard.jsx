import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ticketsService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { QRCodeSVG } from 'qrcode.react';

const tipoColor = { general: 'badge-primary', vip: 'badge-accent', empresa: 'badge-success' };

function TicketCard({ c }) {
  const [mostrarQR, setMostrarQR] = useState(false);

  const descargarQR = () => {
    const svg = document.getElementById(`qr-${c.id}`);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    canvas.width = 300; canvas.height = 300;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, 300, 300);
      ctx.drawImage(img, 0, 0, 300, 300);
      const a = document.createElement('a');
      a.download = `ticket-${c.codigo_qr?.slice(0, 8)}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="card">
      <div className="card-body" style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
        {/* Imagen evento */}
        <div style={{ width: 72, height: 72, borderRadius: 12, background: 'var(--c-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
          {c.imagen_banner
            ? <img src={c.imagen_banner} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ fontSize: '2rem' }}>🎪</span>
          }
        </div>

        {/* Info */}
        <div style={{ flex: 1 }}>
          <Link to={`/eventos/${c.evento_id || ''}`} style={{ textDecoration: 'none' }}>
            <h3 style={{ fontWeight: 700, color: 'var(--c-gray-900)', marginBottom: '.25rem', fontSize: '.95rem' }}>
              {c.evento_titulo}
            </h3>
          </Link>
          <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginBottom: '.5rem' }}>
            <span className={`badge ${tipoColor[c.tipo] || 'badge-gray'}`}>{c.ticket_nombre}</span>
            <span className={`badge ${c.estado === 'confirmado' ? 'badge-success' : 'badge-warning'}`}>{c.estado}</span>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '.82rem', color: 'var(--c-gray-500)', flexWrap: 'wrap' }}>
            <span>📅 {format(new Date(c.fecha_inicio), "d MMM yyyy", { locale: es })}</span>
            <span>🎟️ {c.cantidad} entrada{c.cantidad !== 1 ? 's' : ''}</span>
            <span>💰 ${Number(c.total_pagado).toFixed(2)}</span>
          </div>

          {/* Botón mostrar QR */}
          <button
            className="btn btn-secondary btn-sm"
            style={{ marginTop: '.75rem' }}
            onClick={() => setMostrarQR(!mostrarQR)}
          >
            {mostrarQR ? '🙈 Ocultar QR' : '🔍 Ver mi QR de entrada'}
          </button>
        </div>

        {/* Código corto */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontFamily: 'monospace', fontSize: '.75rem', background: 'var(--c-gray-100)', padding: '.35rem .65rem', borderRadius: 6, color: 'var(--c-gray-700)', letterSpacing: '.05em' }}>
            #{c.codigo_qr?.slice(0, 8).toUpperCase()}
          </div>
          <div style={{ fontSize: '.72rem', color: 'var(--c-gray-300)', marginTop: '.25rem' }}>
            {format(new Date(c.created_at), "dd/MM/yyyy", { locale: es })}
          </div>
        </div>
      </div>

      {/* QR expandido */}
      {mostrarQR && (
        <div style={{
          borderTop: '1px solid var(--c-gray-100)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          background: 'var(--c-gray-50)'
        }}>
          <p style={{ fontSize: '.85rem', color: 'var(--c-gray-500)', textAlign: 'center' }}>
            Muestra este QR en la entrada del evento
          </p>

          {/* QR Code */}
          <div style={{ background: '#fff', padding: '1rem', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,.08)' }}>
            <QRCodeSVG
              id={`qr-${c.id}`}
              value={c.codigo_qr}
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>

          {/* Info del ticket */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: '.95rem', marginBottom: '.25rem' }}>{c.evento_titulo}</div>
            <div style={{ fontSize: '.82rem', color: 'var(--c-gray-500)', marginBottom: '.5rem' }}>
              {c.ticket_nombre} · {format(new Date(c.fecha_inicio), "d MMM yyyy", { locale: es })}
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '.75rem', color: 'var(--c-gray-400)', letterSpacing: '.08em' }}>
              {c.codigo_qr}
            </div>
          </div>

          {/* Botón descargar */}
          <button className="btn btn-outline btn-sm" onClick={descargarQR}>
            ⬇️ Descargar QR
          </button>
        </div>
      )}
    </div>
  );
}

export default function ParticipanteDashboard() {
  const { user } = useAuth();
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ticketsService.misCompras().then(r => setCompras(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-content">
      <div className="container" style={{ maxWidth: 800 }}>
        <div className="page-header">
          <div>
            <h1 className="page-title">Mis tickets</h1>
            <p className="page-subtitle">Hola, {user?.nombre} 👋 — Tus entradas y registros</p>
          </div>
          <Link to="/eventos" className="btn btn-primary">Explorar eventos</Link>
        </div>

        {loading
          ? <div className="loading-center"><div className="spinner" /></div>
          : compras.length === 0
            ? <div className="empty-state">
                <div className="empty-state-icon">🎫</div>
                <h3>Aún no tienes tickets</h3>
                <p>Explora los eventos disponibles y compra tus entradas</p>
                <Link to="/eventos" className="btn btn-primary mt-2">Ver eventos</Link>
              </div>
            : <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {compras.map(c => <TicketCard key={c.id} c={c} />)}
              </div>
        }
      </div>
    </div>
  );
}