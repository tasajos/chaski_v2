import { useState, useRef } from 'react';
import { EventAdminSidebar } from '../../components/common/Sidebars';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function EscanerQR() {
  const [codigo, setCodigo] = useState('');
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef();

  const validar = async () => {
    if (!codigo.trim()) return;
    setLoading(true);
    setResultado(null);
    try {
      const res = await api.post('/qr/validar', { codigo_qr: codigo.trim() });
      setResultado({ ok: true, ...res.data });
      toast.success('¡Entrada válida!');
    } catch (err) {
      const data = err.response?.data;
      setResultado({ ok: false, ...data });
      toast.error(data?.message || 'QR inválido');
    } finally {
      setLoading(false);
      setCodigo('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  return (
    <div className="layout-with-sidebar">
      <EventAdminSidebar />
      <div className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Escáner QR</h1>
            <p className="page-subtitle">Valida la entrada de asistentes al evento</p>
          </div>
        </div>

        {/* Instrucciones */}
        <div className="card" style={{ maxWidth: 500, marginBottom: '1.5rem', borderLeft: '4px solid var(--c-primary)', borderRadius: '0 12px 12px 0' }}>
          <div className="card-body" style={{ padding: '1rem 1.25rem' }}>
            <p style={{ fontSize: '.88rem', color: 'var(--c-gray-700)', fontWeight: 600, marginBottom: '.25rem' }}>
              ¿Cómo usar?
            </p>
            <ul style={{ fontSize: '.82rem', color: 'var(--c-gray-500)', paddingLeft: '1.2rem', lineHeight: 1.8 }}>
              <li>Conecta un lector QR USB — escaneará automáticamente</li>
              <li>O escribe el código manualmente y presiona Enter</li>
              <li>El sistema verificará si el ticket es válido</li>
            </ul>
          </div>
        </div>

        {/* Input escáner */}
        <div className="card" style={{ maxWidth: 500, marginBottom: '1.5rem' }}>
          <div className="card-body">
            <label className="form-label" style={{ fontWeight: 600, marginBottom: '.75rem', display: 'block' }}>
              Código QR
            </label>
            <div style={{ display: 'flex', gap: '.75rem' }}>
              <input
                ref={inputRef}
                className="form-control"
                placeholder="Escanea o escribe el código..."
                value={codigo}
                onChange={e => setCodigo(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && validar()}
                autoFocus
                style={{ fontFamily: 'monospace', letterSpacing: '.05em', fontSize: '.9rem' }}
              />
              <button
                className="btn btn-primary"
                onClick={validar}
                disabled={loading || !codigo.trim()}
                style={{ minWidth: 90 }}
              >
                {loading ? '⏳' : '✔ Validar'}
              </button>
            </div>
          </div>
        </div>

        {/* Resultado */}
        {resultado && (
          <div className="card" style={{
            maxWidth: 500,
            border: '2px solid',
            borderColor: resultado.ok ? 'var(--c-success)' : 'var(--c-danger)',
            animation: 'slideUp .2s ease'
          }}>
            <div className="card-body" style={{ textAlign: 'center', padding: '2rem' }}>

              {/* Icono grande */}
              <div style={{ fontSize: '5rem', marginBottom: '.75rem', lineHeight: 1 }}>
                {resultado.ok ? '✅' : '❌'}
              </div>

              {/* Mensaje principal */}
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.5rem',
                fontWeight: 800,
                color: resultado.ok ? 'var(--c-success)' : 'var(--c-danger)',
                marginBottom: '1.25rem'
              }}>
                {resultado.message}
              </h2>

              {/* Datos del asistente */}
              {resultado.asistente && (
                <div style={{
                  background: 'var(--c-gray-50)',
                  borderRadius: 12,
                  padding: '1.25rem',
                  textAlign: 'left',
                  border: '1px solid var(--c-gray-200)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '.75rem' }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%',
                      background: resultado.ok ? 'var(--c-success-light)' : 'var(--c-danger-light)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.3rem', flexShrink: 0
                    }}>
                      👤
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                        {resultado.asistente.nombre} {resultado.asistente.apellido}
                      </div>
                      {resultado.asistente.email && (
                        <div style={{ fontSize: '.82rem', color: 'var(--c-gray-500)' }}>
                          {resultado.asistente.email}
                        </div>
                      )}
                    </div>
                  </div>

                  {resultado.asistente.ticket && (
                    <div style={{ marginBottom: '.5rem' }}>
                      <span className="badge badge-primary">{resultado.asistente.ticket}</span>
                    </div>
                  )}

                  {resultado.asistente.evento && (
                    <div style={{ fontSize: '.82rem', color: 'var(--c-gray-500)' }}>
                      🎪 {resultado.asistente.evento}
                    </div>
                  )}

                  {/* Si ya entró antes */}
                  {resultado.fecha_entrada && (
                    <div style={{
                      marginTop: '.75rem',
                      padding: '.5rem .75rem',
                      background: 'var(--c-danger-light)',
                      borderRadius: 8,
                      fontSize: '.82rem',
                      color: 'var(--c-danger)',
                      fontWeight: 600
                    }}>
                      ⚠️ Ya registró entrada el: {new Date(resultado.fecha_entrada).toLocaleString('es-BO')}
                    </div>
                  )}
                </div>
              )}

              {/* Botón escanear otro */}
              <button
                className="btn btn-outline"
                style={{ marginTop: '1.25rem' }}
                onClick={() => { setResultado(null); setTimeout(() => inputRef.current?.focus(), 50); }}
              >
                Escanear otro →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}