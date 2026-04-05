const { pool } = require('../config/database');

exports.getAll = async (req, res) => {
  const { estado, search, page = 1, limit = 12 } = req.query;
  const offset = (page - 1) * limit;
  let where = '1=1';
  const params = [];
  if (estado) { where += ' AND e.estado = ?'; params.push(estado); }
  else { where += " AND e.estado = 'publicado'"; }
  if (search) { where += ' AND (e.titulo LIKE ? OR e.descripcion LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  const [events] = await pool.query(
    `SELECT e.*, u.nombre AS admin_nombre, u.apellido AS admin_apellido,
            COUNT(DISTINCT pe.id) AS total_participantes,
            COUNT(DISTINCT c.id) AS total_charlas,
            COUNT(DISTINCT t.id) AS total_tickets
     FROM eventos e
     LEFT JOIN usuarios u ON u.id = e.admin_evento_id
     LEFT JOIN participacion_eventos pe ON pe.evento_id = e.id
     LEFT JOIN charlas c ON c.evento_id = e.id
     LEFT JOIN tickets t ON t.evento_id = e.id
     WHERE ${where}
     GROUP BY e.id ORDER BY e.fecha_inicio ASC
     LIMIT ? OFFSET ?`,
    [...params, parseInt(limit), parseInt(offset)]
  );
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM eventos e WHERE ${where}`, params
  );
  res.json({ events, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
};

exports.getById = async (req, res) => {
  const { id } = req.params;
  const [rows] = await pool.query(
    `SELECT e.*, u.nombre AS admin_nombre, u.apellido AS admin_apellido, u.email AS admin_email
     FROM eventos e
     LEFT JOIN usuarios u ON u.id = e.admin_evento_id
     WHERE e.id = ?`,
    [id]
  );
  if (!rows.length) return res.status(404).json({ message: 'Evento no encontrado' });
  const evento = rows[0];
  const [charlas] = await pool.query(
    'SELECT c.*, COUNT(ic.id) AS inscritos FROM charlas c LEFT JOIN inscripciones_charlas ic ON ic.charla_id = c.id WHERE c.evento_id = ? GROUP BY c.id ORDER BY c.fecha_hora ASC',
    [id]
  );
  const [tickets] = await pool.query(
    'SELECT * FROM tickets WHERE evento_id = ? AND activo = 1 ORDER BY precio ASC', [id]
  );
  const [reuniones] = await pool.query(
    'SELECT r.*, COUNT(rr.id) AS reservados FROM reuniones r LEFT JOIN reservas_reuniones rr ON rr.reunion_id = r.id WHERE r.evento_id = ? GROUP BY r.id ORDER BY r.fecha_hora ASC',
    [id]
  );
  res.json({ ...evento, charlas, tickets, reuniones });
};

exports.create = async (req, res) => {
  const { titulo, descripcion, imagen_banner, fecha_inicio, fecha_fin, ubicacion, modalidad, estado, admin_evento_id, max_participantes } = req.body;
  const [result] = await pool.query(
    'INSERT INTO eventos (titulo,descripcion,imagen_banner,fecha_inicio,fecha_fin,ubicacion,modalidad,estado,creado_por,admin_evento_id,max_participantes) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
    [titulo, descripcion, imagen_banner || null, fecha_inicio, fecha_fin, ubicacion || null, modalidad || 'virtual', estado || 'borrador', req.user.id, admin_evento_id || null, max_participantes || null]
  );
  if (admin_evento_id) {
    await pool.query('UPDATE usuarios SET rol="admin_evento" WHERE id=? AND rol="participante"', [admin_evento_id]);
  }
  res.status(201).json({ id: result.insertId, message: 'Evento creado correctamente' });
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, imagen_banner, fecha_inicio, fecha_fin, ubicacion, modalidad, estado, admin_evento_id, max_participantes } = req.body;
  const [prev] = await pool.query('SELECT admin_evento_id FROM eventos WHERE id=?', [id]);
  await pool.query(
    'UPDATE eventos SET titulo=?,descripcion=?,imagen_banner=?,fecha_inicio=?,fecha_fin=?,ubicacion=?,modalidad=?,estado=?,admin_evento_id=?,max_participantes=? WHERE id=?',
    [titulo, descripcion, imagen_banner || null, fecha_inicio, fecha_fin, ubicacion || null, modalidad, estado, admin_evento_id || null, max_participantes || null, id]
  );
  if (admin_evento_id && admin_evento_id !== prev[0]?.admin_evento_id) {
    await pool.query('UPDATE usuarios SET rol="admin_evento" WHERE id=? AND rol="participante"', [admin_evento_id]);
  }
  res.json({ message: 'Evento actualizado' });
};

exports.delete = async (req, res) => {
  await pool.query('DELETE FROM eventos WHERE id=?', [req.params.id]);
  res.json({ message: 'Evento eliminado' });
};

exports.myEvents = async (req, res) => {
  const { id: userId, rol } = req.user;
  let query, params;
  if (rol === 'admin') {
    query = 'SELECT * FROM eventos ORDER BY created_at DESC';
    params = [];
  } else if (rol === 'admin_evento') {
    query = 'SELECT * FROM eventos WHERE admin_evento_id = ? ORDER BY created_at DESC';
    params = [userId];
  } else {
    query = `SELECT e.* FROM eventos e
             JOIN participacion_eventos pe ON pe.evento_id = e.id
             WHERE pe.usuario_id = ? ORDER BY e.fecha_inicio ASC`;
    params = [userId];
  }
  const [events] = await pool.query(query, params);
  res.json(events);
};

exports.registerToEvent = async (req, res) => {
  const { id: eventoId } = req.params;
  const userId = req.user.id;
  try {
    await pool.query(
      'INSERT INTO participacion_eventos (evento_id, usuario_id, tipo) VALUES (?,?,?)',
      [eventoId, userId, req.user.rol === 'empresa' ? 'empresa' : 'participante']
    );
    res.status(201).json({ message: 'Inscrito al evento correctamente' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Ya estás inscrito' });
    throw err;
  }
};

exports.getAdminEventos = async (req, res) => {
  const [users] = await pool.query(
    "SELECT id, nombre, apellido, email FROM usuarios WHERE rol IN ('admin_evento','participante') ORDER BY nombre"
  );
  res.json(users);
};

exports.getStats = async (req, res) => {
  const { id } = req.params;
  const [[stats]] = await pool.query(
    `SELECT
       (SELECT COUNT(*) FROM participacion_eventos WHERE evento_id=?) AS participantes,
       (SELECT COUNT(*) FROM charlas WHERE evento_id=?) AS charlas,
       (SELECT COUNT(*) FROM reuniones WHERE evento_id=?) AS reuniones,
       (SELECT COALESCE(SUM(ct.total_pagado),0) FROM compras_tickets ct JOIN tickets t ON t.id=ct.ticket_id WHERE t.evento_id=?) AS ingresos`,
    [id, id, id, id]
  );
  res.json(stats);
};
