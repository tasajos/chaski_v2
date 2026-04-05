import { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { AdminSidebar } from '../../components/common/Sidebars';
import toast from 'react-hot-toast';

export default function AdminEmpresas() {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    adminService.getEmpresas().then(r => setEmpresas(r.data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const toggleVerify = async (emp) => {
    await adminService.verificarEmpresa(emp.id, { verificada: emp.verificada ? 0 : 1 });
    toast.success(emp.verificada ? 'Empresa desverificada' : '¡Empresa verificada!');
    load();
  };

  return (
    <div className="layout-with-sidebar">
      <AdminSidebar />
      <div className="main-content">
        <div className="page-header">
          <div><h1 className="page-title">Empresas</h1><p className="page-subtitle">Gestión y verificación de empresas</p></div>
        </div>

        {loading ? <div className="loading-center"><div className="spinner" /></div> : (
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead><tr><th>Empresa</th><th>Sector</th><th>Contacto</th><th>Verificada</th><th>Acciones</th></tr></thead>
                <tbody>
                  {empresas.length === 0
                    ? <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--c-gray-500)', padding: '2rem' }}>No hay empresas registradas</td></tr>
                    : empresas.map(e => (
                      <tr key={e.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                            {e.logo ? <img src={e.logo} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }} /> : <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--c-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>🏢</div>}
                            <div>
                              <div style={{ fontWeight: 600 }}>{e.nombre_empresa}</div>
                              <div style={{ fontSize: '.78rem', color: 'var(--c-gray-500)' }}>{e.email}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className="badge badge-gray">{e.sector || '—'}</span></td>
                        <td style={{ fontSize: '.85rem' }}>{e.nombre} {e.apellido}</td>
                        <td><span className={`badge ${e.verificada ? 'badge-success' : 'badge-warning'}`}>{e.verificada ? '✓ Verificada' : 'Pendiente'}</span></td>
                        <td>
                          <button className={`btn btn-sm ${e.verificada ? 'btn-outline' : 'btn-primary'}`} onClick={() => toggleVerify(e)}>
                            {e.verificada ? 'Quitar verificación' : 'Verificar'}
                          </button>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
