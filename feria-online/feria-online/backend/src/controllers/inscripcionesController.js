const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const emailService = require('../services/emailService');

// POST /api/inscripciones  —  Registro público (sin autenticación)
exports.registrar = async (req, res) => {
  const { evento_id, nombre, apellido, celular, ciudad, email, genero } = req.body;

  if (!evento_id || !nombre || !apellido || !celular || !ciudad || !email || !genero) {
    return res.status(400).json({ message: 'Todos los campos son requeridos' });
  }

  const [[evento]] = await pool.query(
    "SELECT id, titulo FROM eventos WHERE id = ? AND estado = 'publicado'",
    [evento_id]
  );
  if (!evento) return res.status(404).json({ message: 'Evento no encontrado' });

  const [[existente]] = await pool.query(
    'SELECT id FROM inscripciones_feria WHERE evento_id = ? AND email = ?',
    [evento_id, email.toLowerCase().trim()]
  );
  if (existente) return res.status(409).json({ message: 'Ya estás registrado con este correo electrónico' });

  const [result] = await pool.query(
    `INSERT INTO inscripciones_feria (evento_id, nombre, apellido, celular, ciudad, email, genero)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [evento_id, nombre.trim(), apellido.trim(), celular.trim(), ciudad.trim(), email.toLowerCase().trim(), genero]
  );

  res.status(201).json({
    message: '¡Inscripción exitosa! Recibirás tu QR de acceso por correo una vez que confirmemos tu participación.',
    id: result.insertId,
  });
};

// GET /api/admin/inscripciones/:eventoId  —  Listar inscritos
exports.listar = async (req, res) => {
  const { eventoId } = req.params;
  const [rows] = await pool.query(
    `SELECT id, nombre, apellido, celular, ciudad, email, genero,
            estado_pago, qr_enviado, asistio, fecha_asistencia, codigo_qr, created_at
     FROM inscripciones_feria
     WHERE evento_id = ?
     ORDER BY created_at DESC`,
    [eventoId]
  );
  res.json(rows);
};

// GET /api/admin/inscripciones/:eventoId/resumen  —  Estadísticas rápidas
exports.getResumen = async (req, res) => {
  const { eventoId } = req.params;
  const [[stats]] = await pool.query(
    `SELECT
       COUNT(*)                                      AS total_inscritos,
       SUM(estado_pago = 'pagado')                   AS total_pagados,
       SUM(estado_pago = 'pendiente')                AS total_pendientes,
       SUM(asistio = 1)                              AS total_asistieron,
       SUM(estado_pago = 'pagado' AND asistio = 0)  AS total_ausentes
     FROM inscripciones_feria
     WHERE evento_id = ?`,
    [eventoId]
  );
  res.json(stats);
};

// PUT /api/admin/inscripciones/:id/pagar  —  Marcar pagado y enviar QR
exports.marcarPagado = async (req, res) => {
  const { id } = req.params;

  const [[inscripcion]] = await pool.query(
    `SELECT i.*, e.titulo AS evento_titulo, e.fecha_inicio, e.ubicacion
     FROM inscripciones_feria i
     JOIN eventos e ON e.id = i.evento_id
     WHERE i.id = ?`,
    [id]
  );
  if (!inscripcion) return res.status(404).json({ message: 'Inscripción no encontrada' });

  let codigo_qr = inscripcion.codigo_qr;
  if (!codigo_qr) {
    codigo_qr = uuidv4();
    await pool.query(
      'UPDATE inscripciones_feria SET codigo_qr = ?, estado_pago = "pagado" WHERE id = ?',
      [codigo_qr, id]
    );
  } else {
    await pool.query('UPDATE inscripciones_feria SET estado_pago = "pagado" WHERE id = ?', [id]);
  }

  let emailEnviado = false;
  try {
    await emailService.sendQREmail(inscripcion.email, inscripcion.nombre, codigo_qr, {
      titulo: inscripcion.evento_titulo,
      fecha: inscripcion.fecha_inicio,
      ubicacion: inscripcion.ubicacion,
    });
    await pool.query('UPDATE inscripciones_feria SET qr_enviado = 1 WHERE id = ?', [id]);
    emailEnviado = true;
  } catch (err) {
    console.error('[email] Error enviando QR:', err.message);
  }

  res.json({
    message: emailEnviado
      ? 'Marcado como pagado. QR enviado por correo.'
      : 'Marcado como pagado. El envío de correo falló — usa "Reenviar QR" manualmente.',
    codigo_qr,
    email_enviado: emailEnviado,
  });
};

// POST /api/admin/inscripciones/:id/reenviar-qr  —  Reenviar QR existente
exports.reenviarQR = async (req, res) => {
  const { id } = req.params;

  const [[inscripcion]] = await pool.query(
    `SELECT i.*, e.titulo AS evento_titulo, e.fecha_inicio, e.ubicacion
     FROM inscripciones_feria i
     JOIN eventos e ON e.id = i.evento_id
     WHERE i.id = ?`,
    [id]
  );
  if (!inscripcion) return res.status(404).json({ message: 'Inscripción no encontrada' });
  if (!inscripcion.codigo_qr) {
    return res.status(400).json({ message: 'Primero debes confirmar el pago para generar el QR' });
  }

  await emailService.sendQREmail(inscripcion.email, inscripcion.nombre, inscripcion.codigo_qr, {
    titulo: inscripcion.evento_titulo,
    fecha: inscripcion.fecha_inicio,
    ubicacion: inscripcion.ubicacion,
  });
  await pool.query('UPDATE inscripciones_feria SET qr_enviado = 1 WHERE id = ?', [id]);

  res.json({ message: 'QR reenviado correctamente a ' + inscripcion.email });
};

// GET /api/admin/inscripciones/:id/qr-imagen  —  Descargar imagen del QR
exports.obtenerQRImagen = async (req, res) => {
  const { id } = req.params;

  const [[inscripcion]] = await pool.query(
    'SELECT codigo_qr, nombre, apellido FROM inscripciones_feria WHERE id = ?',
    [id]
  );
  if (!inscripcion || !inscripcion.codigo_qr) {
    return res.status(404).json({ message: 'QR no disponible. Confirma el pago primero.' });
  }

  const qrBuffer = await QRCode.toBuffer(inscripcion.codigo_qr, { type: 'png', width: 400, margin: 2 });
  res.set('Content-Type', 'image/png');
  res.set('Content-Disposition', `attachment; filename="qr-${inscripcion.nombre}-${inscripcion.apellido}.png"`);
  res.send(qrBuffer);
};

// POST /api/inscripciones/validar-qr  —  Validar QR en entrada al evento
exports.validarQR = async (req, res) => {
  const { codigo_qr } = req.body;
  const escaneado_por = req.user.id;

  if (!codigo_qr) return res.status(400).json({ valido: false, message: 'Código QR requerido' });

  const [[inscripcion]] = await pool.query(
    `SELECT i.*, e.titulo AS evento_titulo
     FROM inscripciones_feria i
     JOIN eventos e ON e.id = i.evento_id
     WHERE i.codigo_qr = ?`,
    [codigo_qr.trim()]
  );

  if (!inscripcion) {
    return res.status(404).json({ valido: false, message: 'QR no válido o no encontrado' });
  }

  if (inscripcion.estado_pago !== 'pagado') {
    return res.status(403).json({
      valido: false,
      message: 'Pago no confirmado — el participante no puede ingresar',
      asistente: { nombre: inscripcion.nombre, apellido: inscripcion.apellido },
    });
  }

  if (inscripcion.asistio) {
    return res.status(409).json({
      valido: false,
      message: 'Este QR ya fue utilizado anteriormente',
      fecha_asistencia: inscripcion.fecha_asistencia,
      asistente: { nombre: inscripcion.nombre, apellido: inscripcion.apellido },
    });
  }

  await pool.query(
    'UPDATE inscripciones_feria SET asistio = 1, fecha_asistencia = NOW(), escaneado_por = ? WHERE id = ?',
    [escaneado_por, inscripcion.id]
  );

  res.json({
    valido: true,
    message: 'Entrada válida — ¡Bienvenido!',
    asistente: {
      nombre: inscripcion.nombre,
      apellido: inscripcion.apellido,
      email: inscripcion.email,
      ciudad: inscripcion.ciudad,
      genero: inscripcion.genero,
      evento: inscripcion.evento_titulo,
    },
  });
};
