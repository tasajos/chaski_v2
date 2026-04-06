
const { pool } = require('../config/database');

// Validar QR al escanear
exports.validarQR = async (req, res) => {
  const { codigo_qr } = req.body;
  const escaneado_por = req.user.id;

  const [compras] = await pool.query(
    `SELECT ct.*, t.evento_id, t.nombre AS ticket_nombre,
            u.nombre, u.apellido, u.email,
            e.titulo AS evento_titulo, e.fecha_inicio, e.modalidad
     FROM compras_tickets ct
     JOIN tickets t ON t.id = ct.ticket_id
     JOIN usuarios u ON u.id = ct.usuario_id
     JOIN eventos e ON e.id = t.evento_id
     WHERE ct.codigo_qr = ? AND ct.estado = 'confirmado'`,
    [codigo_qr]
  );

  if (!compras.length) {
    return res.status(404).json({ valido: false, message: 'QR no válido o ticket no confirmado' });
  }

  const compra = compras[0];

  // Verificar si ya entró
  const [yaEntro] = await pool.query(
    'SELECT id, fecha_entrada FROM asistencias_evento WHERE compra_id = ?',
    [compra.id]
  );

  if (yaEntro.length) {
    return res.status(409).json({
      valido: false,
      message: 'Este ticket ya fue usado',
      fecha_entrada: yaEntro[0].fecha_entrada,
      asistente: { nombre: compra.nombre, apellido: compra.apellido }
    });
  }

  // Registrar entrada
  await pool.query(
    'INSERT INTO asistencias_evento (compra_id, evento_id, usuario_id, escaneado_por) VALUES (?,?,?,?)',
    [compra.id, compra.evento_id, compra.usuario_id, escaneado_por]
  );

  res.json({
    valido: true,
    message: '✅ Entrada válida',
    asistente: {
      nombre: compra.nombre,
      apellido: compra.apellido,
      email: compra.email,
      ticket: compra.ticket_nombre,
      evento: compra.evento_titulo
    }
  });
};

// Lista de asistentes de un evento
exports.getAsistentes = async (req, res) => {
  const { eventoId } = req.params;
  const [rows] = await pool.query(
    `SELECT u.nombre, u.apellido, u.email,
            t.nombre AS ticket_tipo,
            ct.codigo_qr,
            a.fecha_entrada,
            CASE WHEN a.id IS NOT NULL THEN 'Asistió' ELSE 'No asistió' END AS estado
     FROM compras_tickets ct
     JOIN tickets t ON t.id = ct.ticket_id
     JOIN usuarios u ON u.id = ct.usuario_id
     LEFT JOIN asistencias_evento a ON a.compra_id = ct.id
     WHERE t.evento_id = ? AND ct.estado = 'confirmado'
     ORDER BY a.fecha_entrada DESC, u.apellido ASC`,
    [eventoId]
  );
  res.json(rows);
};

// Resumen de asistencia
exports.getResumen = async (req, res) => {
  const { eventoId } = req.params;
  const [[stats]] = await pool.query(
    `SELECT
       COUNT(DISTINCT ct.id) AS total_tickets,
       COUNT(DISTINCT a.id) AS total_asistieron,
       COUNT(DISTINCT ct.id) - COUNT(DISTINCT a.id) AS total_ausentes
     FROM compras_tickets ct
     JOIN tickets t ON t.id = ct.ticket_id
     LEFT JOIN asistencias_evento a ON a.compra_id = ct.id
     WHERE t.evento_id = ? AND ct.estado = 'confirmado'`,
    [eventoId]
  );
  res.json(stats);
};