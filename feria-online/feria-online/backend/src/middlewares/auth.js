const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [rows] = await pool.query(
      'SELECT id, nombre, apellido, email, rol, activo FROM usuarios WHERE id = ?',
      [decoded.id]
    );
    if (!rows.length || !rows[0].activo) {
      return res.status(401).json({ message: 'Usuario no autorizado' });
    }
    req.user = rows[0];
    next();
  } catch {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.rol)) {
    return res.status(403).json({ message: 'Acceso denegado: rol insuficiente' });
  }
  next();
};

const requireEventAccess = async (req, res, next) => {
  const { id: userId, rol } = req.user;
  const eventoId = req.params.eventoId || req.params.id;
  if (rol === 'admin') return next();
  if (rol === 'admin_evento') {
    const [rows] = await pool.query(
      'SELECT id FROM eventos WHERE id = ? AND admin_evento_id = ?',
      [eventoId, userId]
    );
    if (!rows.length) return res.status(403).json({ message: 'No tienes acceso a este evento' });
    return next();
  }
  return res.status(403).json({ message: 'Acceso denegado' });
};

module.exports = { authMiddleware, requireRole, requireEventAccess };
