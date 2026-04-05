const { pool } = require('../config/database');

exports.getAll = async (req, res) => {
  const { search, sector } = req.query;
  let where = 'e.verificada = 1';
  const params = [];
  if (search) { where += ' AND (e.nombre_empresa LIKE ? OR e.descripcion LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  if (sector) { where += ' AND e.sector = ?'; params.push(sector); }
  const [empresas] = await pool.query(
    `SELECT e.*, u.nombre, u.apellido, u.email
     FROM empresas e JOIN usuarios u ON u.id = e.usuario_id
     WHERE ${where} ORDER BY e.nombre_empresa ASC`,
    params
  );
  res.json(empresas);
};

exports.getById = async (req, res) => {
  const [rows] = await pool.query(
    `SELECT e.*, u.nombre, u.apellido, u.email
     FROM empresas e JOIN usuarios u ON u.id = e.usuario_id WHERE e.id = ?`,
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ message: 'Empresa no encontrada' });
  const empresa = rows[0];
  const [productos] = await pool.query('SELECT * FROM productos_empresa WHERE empresa_id=? AND activo=1', [empresa.id]);
  const [eventos] = await pool.query(
    `SELECT e.* FROM eventos e
     JOIN participacion_eventos pe ON pe.evento_id = e.id
     JOIN empresas emp ON emp.usuario_id = pe.usuario_id
     WHERE emp.id = ? AND e.estado = 'publicado'`,
    [empresa.id]
  );
  res.json({ ...empresa, productos, eventos });
};

exports.updatePerfil = async (req, res) => {
  const { nombre_empresa, descripcion, sector, sitio_web, logo, telefono, pais, ciudad } = req.body;
  const [emp] = await pool.query('SELECT id FROM empresas WHERE usuario_id=?', [req.user.id]);
  if (!emp.length) return res.status(404).json({ message: 'Perfil de empresa no encontrado' });
  await pool.query(
    'UPDATE empresas SET nombre_empresa=?,descripcion=?,sector=?,sitio_web=?,logo=?,telefono=?,pais=?,ciudad=? WHERE usuario_id=?',
    [nombre_empresa, descripcion, sector, sitio_web, logo || null, telefono, pais, ciudad, req.user.id]
  );
  res.json({ message: 'Perfil actualizado' });
};

exports.getProductos = async (req, res) => {
  const [emp] = await pool.query('SELECT id FROM empresas WHERE usuario_id=?', [req.user.id]);
  if (!emp.length) return res.status(404).json({ message: 'No tienes perfil empresa' });
  const [productos] = await pool.query('SELECT * FROM productos_empresa WHERE empresa_id=? ORDER BY created_at DESC', [emp[0].id]);
  res.json(productos);
};

exports.createProducto = async (req, res) => {
  const { nombre, descripcion, precio, imagen } = req.body;
  const [emp] = await pool.query('SELECT id FROM empresas WHERE usuario_id=?', [req.user.id]);
  if (!emp.length) return res.status(400).json({ message: 'Sin perfil empresa' });
  const [r] = await pool.query(
    'INSERT INTO productos_empresa (empresa_id, nombre, descripcion, precio, imagen) VALUES (?,?,?,?,?)',
    [emp[0].id, nombre, descripcion || null, precio || null, imagen || null]
  );
  res.status(201).json({ id: r.insertId, message: 'Producto creado' });
};

exports.updateProducto = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio, imagen, activo } = req.body;
  await pool.query(
    'UPDATE productos_empresa SET nombre=?,descripcion=?,precio=?,imagen=?,activo=? WHERE id=?',
    [nombre, descripcion, precio, imagen, activo, id]
  );
  res.json({ message: 'Producto actualizado' });
};

exports.deleteProducto = async (req, res) => {
  await pool.query('DELETE FROM productos_empresa WHERE id=?', [req.params.id]);
  res.json({ message: 'Producto eliminado' });
};

exports.getSectores = async (req, res) => {
  const [rows] = await pool.query('SELECT DISTINCT sector FROM empresas WHERE sector IS NOT NULL ORDER BY sector');
  res.json(rows.map(r => r.sector));
};

exports.adminList = async (req, res) => {
  const [empresas] = await pool.query(
    `SELECT e.*, u.nombre, u.apellido, u.email, u.activo AS usuario_activo
     FROM empresas e JOIN usuarios u ON u.id = e.usuario_id ORDER BY e.nombre_empresa`
  );
  res.json(empresas);
};

exports.adminVerify = async (req, res) => {
  const { verificada } = req.body;
  await pool.query('UPDATE empresas SET verificada=? WHERE id=?', [verificada, req.params.id]);
  res.json({ message: `Empresa ${verificada ? 'verificada' : 'desverificada'}` });
};
