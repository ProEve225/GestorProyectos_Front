import React, { useState, useEffect } from 'react';
import { clienteService } from '../services/clienteService';
import { authService } from '../services/authService';
import '../CSS/ListaClientes.css';
import { showNotification } from '../components/NotificationSystem';
import { 
  Users,
  Folder,
  LayoutDashboard,
  Lock,
  LogOut,
  Search,
  Eye
} from 'lucide-react';

const ListaClientes = ({ onNavigate, onLogout }) => {
  const [clientes, setClientes] = useState([]);
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [selectedClient, setSelectedClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const clientsPerPage = 8;

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    try {
      setLoading(true);
      const data = await clienteService.obtenerTodos();
      setClientes(data);
      setFilteredClientes(data);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      setError('Error al cargar los clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = clientes.filter(cliente =>
      cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.idCliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.contacto.includes(searchTerm)
    );
    setFilteredClientes(filtered);
    setCurrentPage(1);
  }, [searchTerm, clientes]);

  const indexOfLastClient = currentPage * clientsPerPage;
  const indexOfFirstClient = indexOfLastClient - clientsPerPage;
  const currentClients = filteredClientes.slice(indexOfFirstClient, indexOfLastClient);
  const totalPages = Math.ceil(filteredClientes.length / clientsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleAddClient = () => {
    setModalType('add');
    setSelectedClient(null);
    setShowModal(true);
  };

  const handleEditClient = (client) => {
    setModalType('edit');
    setSelectedClient(client);
    setShowModal(true);
  };

  const handleViewClient = (client) => {
    setSelectedClient(client);
    setShowViewModal(true);
  };

  const handleSaveClient = async (clientData) => {
    try {
      if (modalType === 'add') {
        await clienteService.crear(clientData);
      } else {
        await clienteService.actualizar(selectedClient.id, clientData);
      }
      await cargarClientes();
      showNotification('success', modalType === 'add' ? 'Cliente agregado exitosamente' : 'Cliente actualizado exitosamente');
      setShowModal(false);
    } catch (error) {
      console.error('Error al guardar cliente:', error);
      showNotification('error', 'Error al guardar el cliente: ' + (typeof error === 'string' ? error : 'Error desconocido'));
    }
  };

  const handleDeleteClient = async (clientId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      try {
        await clienteService.eliminar(clientId);
        await cargarClientes();
        showNotification('success', 'Cliente eliminado exitosamente');
      } catch (error) {
        console.error('Error al eliminar cliente:', error);
        showNotification('error', 'Error al eliminar el cliente: ' + (typeof error === 'string' ? error : 'Error desconocido'));
      }
    }
  };

  const handleLogout = () => {
    authService.logout();
    onLogout();
  };

  const ViewClientModal = () => {
    if (!selectedClient) return null;

    return (
      <div className="modal-overlay">
        <div className="view-modal-content">
          <div className="view-modal-header">
            <h3>Detalles del Cliente</h3>
            <button className="close-btn" onClick={() => setShowViewModal(false)}>×</button>
          </div>
          <div className="view-modal-body">
            <div className="client-detail-card">
              <div className="detail-item">
                <div className="detail-content">
                  <label>ID del Cliente</label>
                  <span>{selectedClient.idCliente}</span>
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-content">
                  <label>Nombre del Cliente</label>
                  <span>{selectedClient.nombre}</span>
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-content">
                  <label>Correo Electrónico</label>
                  <span>{selectedClient.correo}</span>
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-content">
                  <label>Contacto</label>
                  <span>{selectedClient.contacto}</span>
                </div>
              </div>
            </div>
            <div className="view-modal-actions">
              <button
                className="edit-from-view-btn"
                onClick={() => {
                  setShowViewModal(false);
                  handleEditClient(selectedClient);
                }}
              >
                Actualizar Cliente
              </button>
              <button className="close-view-btn" onClick={() => setShowViewModal(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ClientModal = () => {
    const [formData, setFormData] = useState({
      idCliente: selectedClient?.idCliente || '',
      nombre: selectedClient?.nombre || '',
      correo: selectedClient?.correo || '',
      contacto: selectedClient?.contacto || ''
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setSaving(true);
      await handleSaveClient(formData);
      setSaving(false);
    };

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h3>{modalType === 'add' ? 'Agregar Cliente' : 'Editar Cliente'}</h3>
            <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
          </div>
          <form onSubmit={handleSubmit} className="client-form">
            <div className="form-group">
              <label>ID del Cliente:</label>
              <input
                type="text"
                value={formData.idCliente}
                onChange={(e) => setFormData({...formData, idCliente: e.target.value})}
                required
                disabled={saving}
              />
            </div>
            <div className="form-group">
              <label>Nombre del Cliente:</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                required
                disabled={saving}
              />
            </div>
            <div className="form-group">
              <label>Correo del Cliente:</label>
              <input
                type="email"
                value={formData.correo}
                onChange={(e) => setFormData({...formData, correo: e.target.value})}
                required
                disabled={saving}
              />
            </div>
            <div className="form-group">
              <label>Contacto:</label>
              <input
                type="tel"
                value={formData.contacto}
                onChange={(e) => setFormData({...formData, contacto: e.target.value})}
                required
                disabled={saving}
              />
            </div>
            <div className="modal-actions">
              <button type="button" className="cancel-btn" onClick={() => setShowModal(false)} disabled={saving}>
                Cancelar
              </button>
              <button type="submit" className="save-btn" disabled={saving}>
                {saving ? 'Guardando...' : (modalType === 'add' ? 'Agregar' : 'Guardar')}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const ChangePasswordModal = () => {
    const [formData, setFormData] = useState({
      contrasenaActual: '',
      contrasenaNueva: '',
      confirmarContrasena: ''
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
      e.preventDefault();
      setSaving(true);
      setError('');

      if (formData.contrasenaNueva !== formData.confirmarContrasena) {
        setError('Las contraseñas nuevas no coinciden');
        setSaving(false);
        return;
      }

      try {
        await authService.cambiarContrasena(
          formData.contrasenaActual,
          formData.contrasenaNueva,
          formData.confirmarContrasena
        );
        showNotification('success', 'Contraseña cambiada exitosamente');
        setShowChangePassword(false);
      } catch (error) {
        setError(typeof error === 'string' ? error : 'Error al cambiar contraseña');
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h3>Cambiar Contraseña</h3>
            <button className="close-btn" onClick={() => setShowChangePassword(false)}>×</button>
          </div>
          <form onSubmit={handleSubmit} className="client-form">
            {error && <div className="error-message">{error}</div>}
            <div className="form-group">
              <label>Contraseña Actual:</label>
              <input
                type="password"
                value={formData.contrasenaActual}
                onChange={(e) => setFormData({...formData, contrasenaActual: e.target.value})}
                required
                disabled={saving}
              />
            </div>
            <div className="form-group">
              <label>Nueva Contraseña:</label>
              <input
                type="password"
                value={formData.contrasenaNueva}
                onChange={(e) => setFormData({...formData, contrasenaNueva: e.target.value})}
                required
                disabled={saving}
              />
            </div>
            <div className="form-group">
              <label>Confirmar Nueva Contraseña:</label>
              <input
                type="password"
                value={formData.confirmarContrasena}
                onChange={(e) => setFormData({...formData, confirmarContrasena: e.target.value})}
                required
                disabled={saving}
              />
            </div>
            <div className="modal-actions">
              <button type="button" className="cancel-btn" onClick={() => setShowChangePassword(false)} disabled={saving}>
                Cancelar
              </button>
              <button type="submit" className="save-btn" disabled={saving}>
                {saving ? 'Cambiando...' : 'Cambiar Contraseña'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Cargando clientes...</div>
      </div>
    );
  }

  return (
    <div className="lista-clientes-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo-container">
            <img src="src/assets/Logo_ESIES.png" alt="Logo ESIES" className="sidebar-logo" />
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-item" onClick={() => onNavigate('dashboard')}>
            <span className="nav-icon">
              <LayoutDashboard size={16} />
            </span>
            Dashboard
          </div>
          <div className="nav-item active">
            <span className="nav-icon">
              <Users size={16} />
            </span>
            Clientes
          </div>
          <div className="nav-item" onClick={() => onNavigate('proyectos')}>
            <span className="nav-icon">
              <Folder size={16} />
            </span>
            Proyectos
          </div>
        </nav>
        
        <div className="sidebar-footer">
          <button className="change-password-btn" onClick={() => setShowChangePassword(true)}>
            <span className="nav-icon">
              <Lock size={16} />
            </span>
            Cambiar Contraseña
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            <span className="nav-icon">
              <LogOut size={16} />
            </span>
            Cerrar Sesión
          </button>
        </div>
      </div>

      <main className="contenido">
        <div className="content-header">
          <div className="user-info">
            <span>{authService.getCurrentUser()?.nombre || 'Administrador'}</span>
            <span className="user-role">Admin</span>
          </div>
        </div>

        <div className="content-body">
          {error && <div className="error-message">{error}</div>}
          
          <div className="page-header">
            <h1>Todos los Clientes ({filteredClientes.length})</h1>
            <div className="header-actions">
              <button className="add-client-btn" onClick={handleAddClient}>
                Agregar Cliente
              </button>
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Buscar Clientes"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <span className="search-icon">
                  <Search size={16} />
                </span>
              </div>
            </div>
          </div>

          <div className="clients-table-container">
            <table className="clients-table">
              <thead>
                <tr>
                  <th>ID Cliente</th>
                  <th>Nombre del Cliente</th>
                  <th>Correo del cliente</th>
                  <th>Contacto</th>
                  <th>Ver más</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentClients.map((cliente) => (
                  <tr key={cliente.id}>
                    <td>{cliente.idCliente}</td>
                    <td>{cliente.nombre}</td>
                    <td>{cliente.correo}</td>
                    <td>{cliente.contacto}</td>
                    <td>
                      <button 
                        className="view-btn"
                        onClick={() => handleViewClient(cliente)}
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="update-btn"
                          onClick={() => handleEditClient(cliente)}
                        >
                          Actualizar
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDeleteClient(cliente.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button 
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous page
              </button>
              
              <div className="page-numbers">
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    className={`page-number ${currentPage === index + 1 ? 'active' : ''}`}
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              
              <button 
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next page
              </button>
            </div>
          )}
        </div>
      </main>

      {showModal && <ClientModal />}
      {showChangePassword && <ChangePasswordModal />}
      {showViewModal && <ViewClientModal />}
    </div>
  );
};

export default ListaClientes;