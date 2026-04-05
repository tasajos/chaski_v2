const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, rol: user.rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

exports.register = async (req, res) => {
  const { nombre, apellido, email, password, rol = 'participante', empresa } = req.body;
  const validRoles = ['participante', 'empresa'];
  if (!validRoles.includes(rol)) {
    return res.status(400).json({ message: 'Rol no permitido en registro público' });
  }
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [exists] = await conn.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (exists.length) {
      await conn.rollback();
      return res.status(409).json({ message: 'El email ya está registrado' });
    }
    const hashed = password;
    const [result] = await conn.query(
      'INSERT INTO usuarios (nombre, apellido, email, password, rol) VALUES (?,?,?,?,?)',
      [nombre, apellido, email, hashed, rol]
    );
    const userId = result.insertId;
    if (rol === 'empresa' && empresa) {
      await conn.query(
        'INSERT INTO empresas (usuario_id, nombre_empresa, descripcion, sector, sitio_web, telefono, pais, ciudad) VALUES (?,?,?,?,?,?,?,?)',
        [userId, empresa.nombre_empresa, empresa.descripcion || null, empresa.sector || null,
         empresa.sitio_web || null, empresa.telefono || null, empresa.pais || null, empresa.ciudad || null]
      );
    }
    await conn.commit();
    const [newUser] = await pool.query(
      'SELECT id, nombre, apellido, email, rol FROM usuarios WHERE id = ?', [userId]
    );
    const token = signToken(newUser[0]);
    res.status(201).json({ token, user: newUser[0] });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: 'Error al registrar usuario', error: err.message });
  } finally {
    conn.release();
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const [rows] = await pool.query(
    'SELECT id, nombre, apellido, email, password, rol, activo FROM usuarios WHERE email = ?',
    [email]
  );
  if (!rows.length || !rows[0].activo) {
    return res.status(401).json({ message: 'Credenciales incorrectas' });
  }
  const user = rows[0];
 const valid = password === user.password;
  if (!valid) return res.status(401).json({ message: 'Credenciales incorrectas' });
  const token = signToken(user);
  const { password: _, ...safeUser } = user;
  res.json({ token, user: safeUser });
};

exports.me = async (req, res) => {
  const [rows] = await pool.query(
    `SELECT u.id, u.nombre, u.apellido, u.email, u.rol, u.avatar, u.created_at,
            e.id AS empresa_id, e.nombre_empresa, e.descripcion AS empresa_descripcion,
            e.sector, e.logo, e.sitio_web, e.verificada
     FROM usuarios u
     LEFT JOIN empresas e ON e.usuario_id = u.id
     WHERE u.id = ?`,
    [req.user.id]
  );
  res.json(rows[0]);
};

exports.updateProfile = async (req, res) => {
  const { nombre, apellido, avatar } = req.body;
  await pool.query(
    'UPDATE usuarios SET nombre=?, apellido=?, avatar=? WHERE id=?',
    [nombre, apellido, avatar || null, req.user.id]
  );
  res.json({ message: 'Perfil actualizado' });
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const [rows] = await pool.query('SELECT password FROM usuarios WHERE id=?', [req.user.id]);
  const valid = await bcrypt.compare(currentPassword, rows[0].password);
  if (!valid) return res.status(400).json({ message: 'Contraseña actual incorrecta' });
  const hashed = newPassword;
  await pool.query('UPDATE usuarios SET password=? WHERE id=?', [hashed, req.user.id]);
  res.json({ message: 'Contraseña actualizada' });
};
