import axios from 'axios';

const api = axios.create({ baseURL: '/api', timeout: 15000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// ─── Auth ─────────────────────────────────────
export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data),
};

// ─── Eventos ──────────────────────────────────
export const eventosService = {
  getAll: (params) => api.get('/eventos', { params }),
  getById: (id) => api.get(`/eventos/${id}`),
  create: (data) => api.post('/eventos', data),
  update: (id, data) => api.put(`/eventos/${id}`, data),
  delete: (id) => api.delete(`/eventos/${id}`),
  myEvents: () => api.get('/mis-eventos'),
  inscribirse: (id) => api.post(`/eventos/${id}/inscribirse`),
  getStats: (id) => api.get(`/eventos/${id}/stats`),
  getAdmins: () => api.get('/admin/potenciales-admins'),
};

// ─── Charlas ──────────────────────────────────
export const charlasService = {
  create: (data) => api.post('/charlas', data),
  update: (id, data) => api.put(`/charlas/${id}`, data),
  delete: (id) => api.delete(`/charlas/${id}`),
  inscribirse: (id) => api.post(`/charlas/${id}/inscribirse`),
  desinscribirse: (id) => api.delete(`/charlas/${id}/desinscribirse`),
};

// ─── Reuniones ────────────────────────────────
export const reunionesService = {
  create: (data) => api.post('/reuniones', data),
  update: (id, data) => api.put(`/reuniones/${id}`, data),
  delete: (id) => api.delete(`/reuniones/${id}`),
  reservar: (id) => api.post(`/reuniones/${id}/reservar`),
};

// ─── Tickets ──────────────────────────────────
export const ticketsService = {
  create: (data) => api.post('/tickets', data),
  update: (id, data) => api.put(`/tickets/${id}`, data),
  delete: (id) => api.delete(`/tickets/${id}`),
  comprar: (id, data) => api.post(`/tickets/${id}/comprar`, data),
  misCompras: () => api.get('/mis-compras'),
};

// ─── Empresas ─────────────────────────────────
export const empresasService = {
  getAll: (params) => api.get('/empresas', { params }),
  getById: (id) => api.get(`/empresas/${id}`),
  getSectores: () => api.get('/empresas/sectores'),
  updatePerfil: (data) => api.put('/empresas/perfil', data),
  getProductos: () => api.get('/empresas/mis-productos'),
  createProducto: (data) => api.post('/empresas/productos', data),
  updateProducto: (id, data) => api.put(`/empresas/productos/${id}`, data),
  deleteProducto: (id) => api.delete(`/empresas/productos/${id}`),
};

// ─── Admin ────────────────────────────────────
export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/usuarios', { params }),
  createUser: (data) => api.post('/admin/usuarios', data),
  updateUser: (id, data) => api.put(`/admin/usuarios/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/usuarios/${id}`),
  getEmpresas: () => api.get('/admin/empresas'),
  verificarEmpresa: (id, data) => api.put(`/admin/empresas/${id}/verificar`, data),
};
