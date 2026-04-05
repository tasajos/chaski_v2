const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole, requireEventAccess } = require('../middlewares/auth');

const auth = require('../controllers/authController');
const eventos = require('../controllers/eventosController');
const actividades = require('../controllers/actividadesController');
const empresas = require('../controllers/empresasController');
const admin = require('../controllers/adminController');

// ─── AUTH ─────────────────────────────────────────────────────────────────────
router.post('/auth/register', auth.register);
router.post('/auth/login', auth.login);
router.get('/auth/me', authMiddleware, auth.me);
router.put('/auth/profile', authMiddleware, auth.updateProfile);
router.put('/auth/password', authMiddleware, auth.changePassword);

// ─── EVENTOS PÚBLICOS ─────────────────────────────────────────────────────────
router.get('/eventos', eventos.getAll);
router.get('/eventos/:id', eventos.getById);

// ─── EVENTOS - AUTENTICADOS ───────────────────────────────────────────────────
router.get('/mis-eventos', authMiddleware, eventos.myEvents);
router.post('/eventos/:id/inscribirse', authMiddleware, eventos.registerToEvent);

// ─── EVENTOS - ADMIN ──────────────────────────────────────────────────────────
router.post('/eventos', authMiddleware, requireRole('admin'), eventos.create);
router.put('/eventos/:id', authMiddleware, requireRole('admin'), eventos.update);
router.delete('/eventos/:id', authMiddleware, requireRole('admin'), eventos.delete);
router.get('/eventos/:id/stats', authMiddleware, requireRole('admin', 'admin_evento'), eventos.getStats);
router.get('/admin/potenciales-admins', authMiddleware, requireRole('admin'), eventos.getAdminEventos);

// ─── CHARLAS ──────────────────────────────────────────────────────────────────
router.post('/charlas', authMiddleware, requireRole('admin', 'admin_evento'), actividades.createCharla);
router.put('/charlas/:id', authMiddleware, requireRole('admin', 'admin_evento'), actividades.updateCharla);
router.delete('/charlas/:id', authMiddleware, requireRole('admin', 'admin_evento'), actividades.deleteCharla);
router.post('/charlas/:charlaId/inscribirse', authMiddleware, actividades.inscribirCharla);
router.delete('/charlas/:charlaId/desinscribirse', authMiddleware, actividades.desinscribirCharla);

// ─── REUNIONES ────────────────────────────────────────────────────────────────
router.post('/reuniones', authMiddleware, requireRole('admin', 'admin_evento'), actividades.createReunion);
router.put('/reuniones/:id', authMiddleware, requireRole('admin', 'admin_evento'), actividades.updateReunion);
router.delete('/reuniones/:id', authMiddleware, requireRole('admin', 'admin_evento'), actividades.deleteReunion);
router.post('/reuniones/:reunionId/reservar', authMiddleware, actividades.reservarReunion);

// ─── TICKETS ──────────────────────────────────────────────────────────────────
router.post('/tickets', authMiddleware, requireRole('admin', 'admin_evento'), actividades.createTicket);
router.put('/tickets/:id', authMiddleware, requireRole('admin', 'admin_evento'), actividades.updateTicket);
router.delete('/tickets/:id', authMiddleware, requireRole('admin', 'admin_evento'), actividades.deleteTicket);
router.post('/tickets/:ticketId/comprar', authMiddleware, actividades.comprarTicket);
router.get('/mis-compras', authMiddleware, actividades.misCompras);

// ─── EMPRESAS — rutas específicas PRIMERO, /:id al final ─────────────────────
router.get('/empresas', empresas.getAll);
router.get('/empresas/sectores', empresas.getSectores);
router.put('/empresas/perfil', authMiddleware, requireRole('empresa'), empresas.updatePerfil);
router.get('/empresas/mis-productos', authMiddleware, requireRole('empresa'), empresas.getProductos);
router.post('/empresas/productos', authMiddleware, requireRole('empresa'), empresas.createProducto);
router.put('/empresas/productos/:id', authMiddleware, requireRole('empresa'), empresas.updateProducto);
router.delete('/empresas/productos/:id', authMiddleware, requireRole('empresa'), empresas.deleteProducto);
router.get('/empresas/:id', empresas.getById);

// ─── ADMIN ────────────────────────────────────────────────────────────────────
router.get('/admin/stats', authMiddleware, requireRole('admin'), admin.getStats);
router.get('/admin/usuarios', authMiddleware, requireRole('admin'), admin.getUsers);
router.post('/admin/usuarios', authMiddleware, requireRole('admin'), admin.createUser);
router.put('/admin/usuarios/:id', authMiddleware, requireRole('admin'), admin.updateUser);
router.delete('/admin/usuarios/:id', authMiddleware, requireRole('admin'), admin.deleteUser);
router.get('/admin/empresas', authMiddleware, requireRole('admin'), empresas.adminList);
router.put('/admin/empresas/:id/verificar', authMiddleware, requireRole('admin'), empresas.adminVerify);

module.exports = router;