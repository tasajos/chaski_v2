const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// ─── CHARLAS ─────────────────────────────────────────────────────────────────

exports.createCharla = async (req, res) => {
  const { evento_id, titulo, descripcion, ponente, fecha_hora, duracion_min, sala, enlace_stream, capacidad } = req.body;
  const [r] = await pool.query(
    'INSERT INTO charlas (evento_id,titulo,descripcion,ponente,fecha_hora,duracion_min,sala,enlace_stream,capacidad) VALUES (?,?,?,?,?,?,?,?,?)',
    [evento_id, titulo, descripcion || null, ponente || null, fecha_hora, duracion_min || 60, sala || null, enlace_stream || null, capacidad || null]
  );
  res.status(201).json({ id: r.insertId, message: 'Charla creada' });
};

exports.updateCharla = async (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, ponente, fecha_hora, duracion_min, sala, enlace_stream, capacidad } = req.body;
  await pool.query(
    'UPDATE charlas SET titulo=?,descripcion=?,ponente=?,fecha_hora=?,duracion_min=?,sala=?,enlace_stream=?,capacidad=? WHERE id=?',
    [titulo, descripcion, ponente, fecha_hora, duracion_min, sala, enlace_stream, capacidad, id]
  );
  res.json({ message: 'Charla actualizada' });
};

exports.deleteCharla = async (req, res) => {
  await pool.query('DELETE FROM charlas WHERE id=?', [req.params.id]);
  res.json({ message: 'Charla eliminada' });
};

exports.inscribirCharla = async (req, res) => {
  const { charlaId } = req.params;
  const userId = req.user.id;
  const [charla] = await pool.query('SELECT * FROM charlas WHERE id=?', [charlaId]);
  if (!charla.length) return res.status(404).json({ message: 'Charla no encontrada' });
  if (charla[0].capacidad) {
    const [[{ inscritos }]] = await pool.query('SELECT COUNT(*) AS inscritos FROM inscripciones_charlas WHERE charla_id=?', [charlaId]);
    if (inscritos >= charla[0].capacidad) return res.status(400).json({ message: 'Charla sin cupo disponible' });
  }
  try {
    await pool.query('INSERT INTO inscripciones_charlas (charla_id, usuario_id) VALUES (?,?)', [charlaId, userId]);
    res.status(201).json({ message: 'Inscrito a la charla' });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Ya estás inscrito a esta charla' });
    throw e;
  }
};

exports.desinscribirCharla = async (req, res) => {
  await pool.query('DELETE FROM inscripciones_charlas WHERE charla_id=? AND usuario_id=?', [req.params.charlaId, req.user.id]);
  res.json({ message: 'Desinscrito de la charla' });
};

// ─── REUNIONES ───────────────────────────────────────────────────────────────

exports.createReunion = async (req, res) => {
  const { evento_id, titulo, descripcion, fecha_hora, duracion_min, max_asistentes, precio, enlace_meet } = req.body;
  const [r] = await pool.query(
    'INSERT INTO reuniones (evento_id,titulo,descripcion,fecha_hora,duracion_min,max_asistentes,precio,enlace_meet) VALUES (?,?,?,?,?,?,?,?)',
    [evento_id, titulo, descripcion || null, fecha_hora, duracion_min || 30, max_asistentes || 10, precio || 0, enlace_meet || null]
  );
  res.status(201).json({ id: r.insertId, message: 'Reunión creada' });
};

exports.updateReunion = async (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, fecha_hora, duracion_min, max_asistentes, precio, enlace_meet } = req.body;
  await pool.query(
    'UPDATE reuniones SET titulo=?,descripcion=?,fecha_hora=?,duracion_min=?,max_asistentes=?,precio=?,enlace_meet=? WHERE id=?',
    [titulo, descripcion, fecha_hora, duracion_min, max_asistentes, precio, enlace_meet, id]
  );
  res.json({ message: 'Reunión actualizada' });
};

exports.deleteReunion = async (req, res) => {
  await pool.query('DELETE FROM reuniones WHERE id=?', [req.params.id]);
  res.json({ message: 'Reunión eliminada' });
};

exports.reservarReunion = async (req, res) => {
  const { reunionId } = req.params;
  const userId = req.user.id;
  const [reunion] = await pool.query('SELECT * FROM reuniones WHERE id=?', [reunionId]);
  if (!reunion.length) return res.status(404).json({ message: 'Reunión no encontrada' });
  const [[{ reservados }]] = await pool.query('SELECT COUNT(*) AS reservados FROM reservas_reuniones WHERE reunion_id=? AND estado != "cancelada"', [reunionId]);
  if (reservados >= reunion[0].max_asistentes) return res.status(400).json({ message: 'Reunión sin cupo' });
  try {
    await pool.query('INSERT INTO reservas_reuniones (reunion_id, usuario_id, estado) VALUES (?,?,?)', [reunionId, userId, 'confirmada']);
    res.status(201).json({ message: 'Reserva confirmada' });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Ya tienes una reserva para esta reunión' });
    throw e;
  }
};

// ─── TICKETS ─────────────────────────────────────────────────────────────────

exports.createTicket = async (req, res) => {
  const { evento_id, nombre, descripcion, precio, cantidad_total, fecha_limite, tipo } = req.body;
  const [r] = await pool.query(
    'INSERT INTO tickets (evento_id,nombre,descripcion,precio,cantidad_total,fecha_limite,tipo) VALUES (?,?,?,?,?,?,?)',
    [evento_id, nombre, descripcion || null, precio, cantidad_total, fecha_limite || null, tipo || 'general']
  );
  res.status(201).json({ id: r.insertId, message: 'Ticket creado' });
};

exports.updateTicket = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio, cantidad_total, fecha_limite, tipo, activo } = req.body;
  await pool.query(
    'UPDATE tickets SET nombre=?,descripcion=?,precio=?,cantidad_total=?,fecha_limite=?,tipo=?,activo=? WHERE id=?',
    [nombre, descripcion, precio, cantidad_total, fecha_limite, tipo, activo, id]
  );
  res.json({ message: 'Ticket actualizado' });
};

exports.deleteTicket = async (req, res) => {
  await pool.query('DELETE FROM tickets WHERE id=?', [req.params.id]);
  res.json({ message: 'Ticket eliminado' });
};

exports.comprarTicket = async (req, res) => {
  const { ticketId } = req.params;
  const { cantidad = 1 } = req.body;
  const userId = req.user.id;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [ticket] = await conn.query('SELECT * FROM tickets WHERE id=? AND activo=1 FOR UPDATE', [ticketId]);
    if (!ticket.length) { await conn.rollback(); return res.status(404).json({ message: 'Ticket no disponible' }); }
    const t = ticket[0];
    if (t.cantidad_total - t.cantidad_vendida < cantidad) { await conn.rollback(); return res.status(400).json({ message: 'Sin stock suficiente' }); }
    const total = t.precio * cantidad;
    const codigoQr = uuidv4();
    await conn.query('INSERT INTO compras_tickets (ticket_id, usuario_id, cantidad, total_pagado, codigo_qr, estado) VALUES (?,?,?,?,?,?)', [ticketId, userId, cantidad, total, codigoQr, 'confirmado']);
    await conn.query('UPDATE tickets SET cantidad_vendida = cantidad_vendida + ? WHERE id=?', [cantidad, ticketId]);
    await conn.commit();
    res.status(201).json({ message: 'Compra exitosa', codigo_qr: codigoQr, total });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: 'Error al procesar compra', error: err.message });
  } finally {
    conn.release();
  }
};

exports.misCompras = async (req, res) => {
  const [compras] = await pool.query(
    `SELECT ct.*, t.nombre AS ticket_nombre, t.tipo, e.titulo AS evento_titulo, e.fecha_inicio, e.imagen_banner
     FROM compras_tickets ct
     JOIN tickets t ON t.id = ct.ticket_id
     JOIN eventos e ON e.id = t.evento_id
     WHERE ct.usuario_id = ? ORDER BY ct.created_at DESC`,
    [req.user.id]
  );
  res.json(compras);
};
