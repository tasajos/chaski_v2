const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

exports.getStats = async (req, res) => {
  const [[stats]] = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM usuarios)                            AS total_usuarios,
      (SELECT COUNT(*) FROM eventos WHERE estado='publicado')   AS eventos_activos,
      (SELECT COUNT(*) FROM eventos)                            AS total_eventos,
      (SELECT COUNT(*) FROM empresas)                           AS total_empresas,
      (SELECT COUNT(*) FROM tickets)                            AS total_tickets,
      (SELECT COALESCE(SUM(total_pagado),0) FROM compras_tickets WHERE estado='confirmado') AS ingresos_totales,
      (SELECT COUNT(*) FROM compras_tickets WHERE estado='confirmado') AS ventas_totales
  `);
  const [eventos_recientes] = await pool.query(
    "SELECT id, titulo, estado, fecha_inicio, created_at FROM eventos ORDER BY created_at DESC LIMIT 5"
  );
  res.json({ ...stats, eventos_recientes });
};

exports.getUsers = async (req, res) => {
  const { rol, search, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  let where = '1=1';
  const params = [];
  if (rol) { where += ' AND u.rol = ?'; params.push(rol); }
  if (search) { where += ' AND (u.nombre LIKE ? OR u.apellido LIKE ? OR u.email LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
  const [users] = await pool.query(
    `SELECT u.id, u.nombre, u.apellido, u.email, u.rol, u.activo, u.created_at,
            e.nombre_empresa
     FROM usuarios u LEFT JOIN empresas e ON e.usuario_id = u.id
     WHERE ${where} ORDER BY u.created_at DESC LIMIT ? OFFSET ?`,
    [...params, parseInt(limit), parseInt(offset)]
  );
  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM usuarios u WHERE ${where}`, params);
  res.json({ users, total, page: parseInt(page) });
};

exports.createUser = async (req, res) => {
  const { nombre, apellido, email, password, rol } = req.body;
  const [exists] = await pool.query('SELECT id FROM usuarios WHERE email=?', [email]);
  if (exists.length) return res.status(409).json({ message: 'Email ya registrado' });
  
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    
    const [r] = await conn.query(
      'INSERT INTO usuarios (nombre, apellido, email, password, rol) VALUES (?,?,?,?,?)',
      [nombre, apellido, email, password, rol]
    );
    
    // Si es empresa, crear registro automáticamente
    if (rol === 'empresa') {
      await conn.query(
        'INSERT INTO empresas (usuario_id, nombre_empresa) VALUES (?,?)',
        [r.insertId, `${nombre} ${apellido}`]
      );
    }
    
    await conn.commit();
    res.status(201).json({ id: r.insertId, message: 'Usuario creado' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: 'Error al crear usuario', error: err.message });
  } finally {
    conn.release();
  }
};
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, rol, activo } = req.body;
  await pool.query('UPDATE usuarios SET nombre=?,apellido=?,rol=?,activo=? WHERE id=?', [nombre, apellido, rol, activo, id]);
  res.json({ message: 'Usuario actualizado' });
};

exports.deleteUser = async (req, res) => {
  if (req.params.id == req.user.id) return res.status(400).json({ message: 'No puedes eliminarte a ti mismo' });
  await pool.query('DELETE FROM usuarios WHERE id=?', [req.params.id]);
  res.json({ message: 'Usuario eliminado' });
};

exports.getAdminEventosList = async (req, res) => {
  const [users] = await pool.query(
    "SELECT id, nombre, apellido, email, rol FROM usuarios WHERE rol IN ('admin_evento','participante') AND activo=1 ORDER BY nombre"
  );
  res.json(users);
};
