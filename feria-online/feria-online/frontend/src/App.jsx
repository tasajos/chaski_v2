import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/common/Navbar';
import HomePage from './pages/HomePage';
import EventosPage from './pages/EventosPage';
import EventoDetailPage from './pages/EventoDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEventos from './pages/admin/AdminEventos';
import AdminUsuarios from './pages/admin/AdminUsuarios';
import AdminEmpresas from './pages/admin/AdminEmpresas';
import EventAdminPanel from './pages/event-admin/EventAdminPanel';
import EventAdminCharlas from './pages/event-admin/EventAdminCharlas';
import EventAdminReuniones from './pages/event-admin/EventAdminReuniones';
import EventAdminTickets from './pages/event-admin/EventAdminTickets';
import ParticipanteDashboard from './pages/participante/ParticipanteDashboard';
import EmpresasPage from './pages/EmpresasPage';
import EmpresaDetailPage from './pages/EmpresaDetailPage';
import EmpresaDashboard from './pages/empresa/EmpresaDashboard';
import EmpresaProductos from './pages/empresa/EmpresaProductos';
import ProfilePage from './pages/ProfilePage';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.rol)) return <Navigate to="/" replace />;
  return children;
};

const AppRoutes = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/eventos" element={<EventosPage />} />
        <Route path="/eventos/:id" element={<EventoDetailPage />} />
        <Route path="/empresas" element={<EmpresasPage />} />
        <Route path="/empresas/:id" element={<EmpresaDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />

        <Route path="/perfil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/mis-compras" element={<ProtectedRoute><ParticipanteDashboard /></ProtectedRoute>} />

        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/eventos" element={<ProtectedRoute roles={['admin']}><AdminEventos /></ProtectedRoute>} />
        <Route path="/admin/usuarios" element={<ProtectedRoute roles={['admin']}><AdminUsuarios /></ProtectedRoute>} />
        <Route path="/admin/empresas" element={<ProtectedRoute roles={['admin']}><AdminEmpresas /></ProtectedRoute>} />

        <Route path="/mi-evento" element={<ProtectedRoute roles={['admin_evento']}><EventAdminPanel /></ProtectedRoute>} />
        <Route path="/mi-evento/charlas" element={<ProtectedRoute roles={['admin_evento']}><EventAdminCharlas /></ProtectedRoute>} />
        <Route path="/mi-evento/reuniones" element={<ProtectedRoute roles={['admin_evento']}><EventAdminReuniones /></ProtectedRoute>} />
        <Route path="/mi-evento/tickets" element={<ProtectedRoute roles={['admin_evento']}><EventAdminTickets /></ProtectedRoute>} />

        <Route path="/empresa/dashboard" element={<ProtectedRoute roles={['empresa']}><EmpresaDashboard /></ProtectedRoute>} />
        <Route path="/empresa/productos" element={<ProtectedRoute roles={['empresa']}><EmpresaProductos /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" toastOptions={{ duration: 3500, style: { fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem', borderRadius: '10px' } }} />
      </AuthProvider>
    </BrowserRouter>
  );
}