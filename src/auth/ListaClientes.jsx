import React, { useState, useEffect } from 'react';
import '../CSS/ListaClientes.css'

const ListaClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' or 'edit'
  const [selectedClient, setSelectedClient] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const clientsPerPage = 8;

  // Datos de ejemplo iniciales
  useEffect(() => {
    const initialClients = [
      {
        id: 1,
        idCliente: 'CLT001',
        nombre: 'Juan Pérez García',
        correo: 'juan.perez@empresa.com',
        contacto: '5551234567'
      },
      {
        id: 2,
        idCliente: 'CLT002',
        nombre: 'María González López',
        correo: 'maria.gonzalez@utez.edu.mx',
        contacto: '5552345678'
      },
      {
        id: 3,
        idCliente: 'CLT003',
        nombre: 'Carlos Rodríguez Martín',
        correo: 'carlos.rodriguez@correo.com',
        contacto: '5553456789'
      },
      {
        id: 4,
        idCliente: 'CLT004',
        nombre: 'Ana Fernández Silva',
        correo: 'ana.fernandez@email.com',
        contacto: '5554567890'
      },
      {
        id: 5,
        idCliente: 'CLT005',
        nombre: 'Roberto Sánchez Torres',
        correo: 'roberto.sanchez@empresa.mx',
        contacto: '5555678901'
      },
      {
        id: 6,
        idCliente: 'CLT006',
        nombre: 'Laura Jiménez Ruiz',
        correo: 'laura.jimenez@correo.mx',
        contacto: '5556789012'
      },
      {
        id: 7,
        idCliente: 'CLT007',
        nombre: 'Miguel Herrera Castro',
        correo: 'miguel.herrera@utez.edu.mx',
        contacto: '5557890123'
      },
      {
        id: 8,
        idCliente: 'CLT008',
        nombre: 'Patricia Morales Vega',
        correo: 'patricia.morales@empresa.com',
        contacto: '5558901234'
      }
    ];
    setClientes(initialClients);
    setFilteredClientes(initialClients);
  }, []);

  // Filtrar clientes por búsqueda
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

  // Paginación
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
    alert(`Ver detalles de ${client.nombre}\nID: ${client.idCliente}\nCorreo: ${client.correo}\nContacto: ${client.contacto}`);
  };

  const handleSaveClient = (clientData) => {
    if (modalType === 'add') {
      const newClient = {
        ...clientData,
        id: clientes.length + 1,
        idCliente: `CLT${String(clientes.length + 1).padStart(3, '0')}`
      };
      setClientes([...clientes, newClient]);
    } else {
      setClientes(clientes.map(client => 
        client.id === selectedClient.id ? { ...client, ...clientData } : client
      ));
    }
    setShowModal(false);
  };

  const handleDeleteClient = (clientId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      setClientes(clientes.filter(client => client.id !== clientId));
    }
  };

  const ClientModal = () => {
    const [formData, setFormData] = useState({
      nombre: selectedClient?.nombre || '',
      correo: selectedClient?.correo || '',
      contacto: selectedClient?.contacto || ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      handleSaveClient(formData);
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
              <label>Nombre del Cliente:</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Correo del Cliente:</label>
              <input
                type="email"
                value={formData.correo}
                onChange={(e) => setFormData({...formData, correo: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Contacto:</label>
              <input
                type="tel"
                value={formData.contacto}
                onChange={(e) => setFormData({...formData, contacto: e.target.value})}
                required
              />
            </div>
            <div className="modal-actions">
              <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                Cancelar
              </button>
              <button type="submit" className="save-btn">
                {modalType === 'add' ? 'Agregar' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="lista-clientes-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo-container">
            <img src="/path/to/logo.png" alt="Logo" className="sidebar-logo" />
            <div className="logo-text">
              <span className="logo-title">Engineering Services</span>
              <span className="logo-subtitle">in Industrial Electrical Systems</span>
            </div>
          </div>
          <div className="gp-logo">GP</div>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-item">
            <span className="nav-icon">📊</span>
            Dashboard
          </div>
          <div className="nav-item active">
            <span className="nav-icon">👥</span>
            Clientes
          </div>
          <div className="nav-item">
            <span className="nav-icon">📁</span>
            Proyectos
          </div>
        </nav>
        
        <div className="sidebar-footer">
          <button className="logout-btn">
            <span className="nav-icon">⬅️</span>
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <div className="content-header">
          <div className="user-info">
            <span>Administrador</span>
            <span className="user-role">Admin</span>
          </div>
        </div>

        {/* Content */}
        <div className="content-body">
          <div className="page-header">
            <h1>Todos los Clientes</h1>
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
                <span className="search-icon">🔍</span>
              </div>
              <button 
                className="filter-btn"
                onClick={() => setShowFilter(!showFilter)}
              >
                🔽 Filter
              </button>
            </div>
          </div>

          {/* Tabla de Clientes */}
          <div className="clients-table-container">
            <table className="clients-table">
              <thead>
                <tr>
                  <th>ID Cliente</th>
                  <th>Nombre del Cliente</th>
                  <th>Correo del cliente</th>
                  <th>Contacto</th>
                  <th>Ver más</th>
                  <th>Actualizar</th>
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
                        👁️
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
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
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
        </div>
      </div>

      {/* Modal */}
      {showModal && <ClientModal />}
    </div>
  );
};

export default ListaClientes;