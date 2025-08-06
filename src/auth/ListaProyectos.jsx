import React, { useState, useEffect } from 'react';
import { proyectoService } from '../services/proyectoService';
import { clienteService } from '../services/clienteService';
import { authService } from '../services/authService';
import { showNotification } from '../components/NotificationSystem';
import '../CSS/ListaProyectos.css';

const ListaProyectos = ({ onNavigate, onLogout }) => {
  const [proyectos, setProyectos] = useState([]);
  const [filteredProyectos, setFilteredProyectos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [selectedProject, setSelectedProject] = useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showParcialidadesModal, setShowParcialidadesModal] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  // Filtrar proyectos por búsqueda
  useEffect(() => {
    const filtered = proyectos.filter(proyecto =>
      proyecto.nombreCliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proyecto.idCliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proyecto.idCotizacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (proyecto.ordenCompra && proyecto.ordenCompra.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredProyectos(filtered);
  }, [searchTerm, proyectos]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [proyectosData, clientesData] = await Promise.all([
        proyectoService.obtenerTodos(),
        clienteService.obtenerTodos()
      ]);
      setProyectos(proyectosData);
      setFilteredProyectos(proyectosData);
      setClientes(clientesData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      showNotification('error', 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = () => {
    setModalType('add');
    setSelectedProject(null);
    setModalVisible(true);
  };

  const handleEditProject = (project) => {
    setModalType('edit');
    setSelectedProject(project);
    setModalVisible(true);
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este proyecto?')) {
      try {
        await proyectoService.eliminar(projectId);
        await cargarDatos();
        showNotification('success', 'Proyecto eliminado exitosamente');
      } catch (error) {
        console.error('Error al eliminar proyecto:', error);
        showNotification('error', 'Error al eliminar el proyecto');
      }
    }
  };

  const handleEditParcialidades = (project) => {
    setSelectedProject(project);
    setShowParcialidadesModal(true);
  };

  const handleLogout = () => {
    authService.logout();
    showNotification('info', 'Sesión cerrada correctamente');
    onLogout();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-MX');
  };

  const getFormaDePagoText = (formaDePago) => {
    const formas = {
      'PUE': 'PUE',
      'PARCIALIDADES': 'Parcial',
      'DIFERIDO': 'Diferido'
    };
    return formas[formaDePago] || formaDePago;
  };

  const ChangePasswordModal = () => {
    const [formData, setFormData] = useState({
      contrasenaActual: '',
      contrasenaNueva: '',
      confirmarContrasena: ''
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setSaving(true);

      if (formData.contrasenaNueva !== formData.confirmarContrasena) {
        showNotification('error', 'Las contraseñas nuevas no coinciden');
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
        const errorMessage = typeof error === 'string' ? error : 'Error al cambiar contraseña';
        showNotification('error', errorMessage);
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
        <div className="loading-spinner">Cargando proyectos...</div>
      </div>
    );
  }

  return (
    <div className="contenedor-principal">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-container">
            <img src="src\assets\Logo_ESIES.png" alt="Logo ESIES" className="sidebar-logo" />
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <button className="nav-item" onClick={() => onNavigate('dashboard')}>
            <span className="nav-icon">📊</span>
            Dashboard
          </button>
          <button className="nav-item" onClick={() => onNavigate('clientes')}>
            <span className="nav-icon">👥</span>
            Clientes
          </button>
          <button className="nav-item active">
            <span className="nav-icon">📁</span>
            Proyectos
          </button>
        </nav>
        
        <div className="sidebar-footer">
          <button className="change-password-btn" onClick={() => setShowChangePassword(true)}>
            <span className="nav-icon">🔑</span>
            Cambiar Contraseña
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            <span className="nav-icon">⬅️</span>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="contenido">
        <div className="content-header">
          <div className="user-info">
            <span>{authService.getCurrentUser()?.nombre || 'Administrador'}</span>
            <span className="user-role">Admin</span>
          </div>
        </div>

        <div className="page-header">
          <h2>Todos los Proyectos ({filteredProyectos.length})</h2>
          <div className="header-actions">
            <button className="btn-agregar" onClick={handleAddProject}>
              Agregar Proyecto
            </button>
            <div className="search-container">
              <input
                type="text"
                placeholder="Buscar Proyectos"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>
          </div>
        </div>

        <div className="tabla-proyectos">
          <table>
            <thead>
              <tr>
                <th>ID Cliente</th>
                <th>Nombre del Cliente</th>
                <th>Cotización (ID)</th>
                <th>Monto</th>
                <th>Levantamiento Técnico</th>
                <th>Realizado</th>
                <th>Fincado</th>
                <th>Fecha Inicio</th>
                <th>Fecha Término</th>
                <th>Facturado</th>
                <th>Tipo de Pago</th>
                <th>PO</th>
                <th>Factura Cerrada</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProyectos.map((proyecto) => (
                <tr key={proyecto.id}>
                  <td>{proyecto.idCliente}</td>
                  <td>{proyecto.nombreCliente}</td>
                  <td>{proyecto.idCotizacion}</td>
                  <td>{formatCurrency(proyecto.montoTotal)}</td>
                  <td>{proyecto.requiereLevantamientoTecnico ? 'Sí' : 'No'}</td>
                  <td>{proyecto.realizado ? 'Sí' : 'No'}</td>
                  <td>{proyecto.fincado ? 'Sí' : 'No'}</td>
                  <td>{formatDate(proyecto.fechaInicio)}</td>
                  <td>{formatDate(proyecto.fechaTermino)}</td>
                  <td>{proyecto.facturado ? 'Sí' : 'No'}</td>
                  <td>{getFormaDePagoText(proyecto.formaDePago)}</td>
                  <td>{proyecto.ordenCompra || 'N/A'}</td>
                  <td>{proyecto.facturaCerrada ? 'Sí' : 'No'}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-actualizar"
                        onClick={() => handleEditProject(proyecto)}
                      >
                        Editar
                      </button>
                      {(proyecto.formaDePago === 'PARCIALIDADES' || proyecto.formaDePago === 'DIFERIDO') && (
                        <button 
                          className="btn-parcialidades"
                          onClick={() => handleEditParcialidades(proyecto)}
                        >
                          Editar Parcialidades
                        </button>
                      )}
                      <button 
                        className="btn-eliminar"
                        onClick={() => handleDeleteProject(proyecto.id)}
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

        {modalVisible && (
          <ProjectModal
            modalType={modalType}
            selectedProject={selectedProject}
            clientes={clientes}
            onClose={() => setModalVisible(false)}
            onSave={cargarDatos}
          />
        )}

        {showParcialidadesModal && (
          <ParcialidadesModal
            proyecto={selectedProject}
            onClose={() => setShowParcialidadesModal(false)}
            onSave={cargarDatos}
          />
        )}

        {showChangePassword && <ChangePasswordModal />}
      </main>
    </div>
  );
};

// Componente Modal para Proyectos OPTIMIZADO
const ProjectModal = ({ modalType, selectedProject, clientes, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    idCotizacion: selectedProject?.idCotizacion || '',
    idCliente: selectedProject?.idCliente || '',
    montoTotal: selectedProject?.montoTotal || '',
    requiereLevantamientoTecnico: selectedProject?.requiereLevantamientoTecnico || false,
    realizado: selectedProject?.realizado || false,
    fincado: selectedProject?.fincado || false,
    fechaInicio: selectedProject?.fechaInicio || '',
    fechaTermino: selectedProject?.fechaTermino || '',
    ordenCompra: selectedProject?.ordenCompra || '',
    facturado: selectedProject?.facturado || false,
    formaDePago: selectedProject?.formaDePago || 'PUE',
    folioControl: selectedProject?.folioControl || '',
    folioFiscal: selectedProject?.folioFiscal || '',
    facturasParcialidades: selectedProject?.facturasParcialidades || [],
    facturaCerrada: selectedProject?.facturaCerrada || false
  });
  const [saving, setSaving] = useState(false);
  const [warnings, setWarnings] = useState([]);

  // Actualizar warnings cuando cambian los campos
  useEffect(() => {
    updateWarnings();
  }, [formData]);

  const updateWarnings = () => {
    const newWarnings = [];

    if (!formData.requiereLevantamientoTecnico && !formData.realizado) {
      newWarnings.push('Campo "Realizado" deshabilitado: No requiere levantamiento técnico');
    }

    if (formData.requiereLevantamientoTecnico && !formData.realizado) {
      newWarnings.push('Complete el levantamiento técnico para continuar');
    }

    if (!formData.idCotizacion || !formData.montoTotal) {
      newWarnings.push('Complete la cotización (ID y monto) para continuar');
    }

    if (!formData.fincado) {
      newWarnings.push('Fechas deshabilitadas: El proyecto no está fincado');
    }

    if (formData.fincado && (!formData.fechaInicio || !formData.fechaTermino)) {
      newWarnings.push('Defina fechas de inicio y término para continuar');
    }

    if (!formData.facturado) {
      newWarnings.push('Folios deshabilitados: El proyecto no está facturado');
    }

    setWarnings(newWarnings);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const dataToSend = {
        ...formData,
        montoTotal: parseFloat(formData.montoTotal),
        // NO crear parcialidades automáticamente - dejar vacío para gestionar después
        facturasParcialidades: []
      };

      if (modalType === 'add') {
        await proyectoService.crear(dataToSend);
        showNotification('success', 'Proyecto agregado exitosamente');
      } else {
        await proyectoService.actualizar(selectedProject.id, dataToSend);
        showNotification('success', 'Proyecto actualizado exitosamente');
      }
      
      await onSave();
      onClose();
    } catch (error) {
      console.error('Error al guardar proyecto:', error);
      const errorMessage = typeof error === 'string' ? error : 'Error al guardar el proyecto';
      showNotification('error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Lógica de habilitación de campos
  const isRealizadoEnabled = formData.requiereLevantamientoTecnico;
  const isCotizacionEnabled = !formData.requiereLevantamientoTecnico || formData.realizado;
  const isFincadoEnabled = formData.idCotizacion && formData.montoTotal;
  const isFechasEnabled = formData.fincado;
  const isFormaPagoEnabled = isFechasEnabled && formData.fechaInicio && formData.fechaTermino;
  const isFoliosEnabled = formData.facturado;

  return (
    <div className="modal-overlay">
      <div className="modal-optimized">
        <div className="modal-header">
          <h2>{modalType === 'add' ? 'Agregar Proyecto' : 'Editar Proyecto'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        {/* Mostrar warnings */}
        {warnings.length > 0 && (
          <div className="warnings-section">
            {warnings.map((warning, index) => (
              <div key={index} className="warning-message">
                ⚠️ {warning}
              </div>
            ))}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="form-proyecto-optimized">
          {/* Grid de 3 columnas para aprovechar el espacio */}
          <div className="form-grid-3">
            {/* Columna 1: Cliente y Levantamiento */}
            <div className="form-column">
              <div className="form-section-compact">
                <h3>1. Cliente</h3>
                <div className="form-group">
                  <label>Cliente:</label>
                  <select
                    name="idCliente"
                    value={formData.idCliente}
                    onChange={handleChange}
                    required
                    disabled={saving}
                  >
                    <option value="">Seleccionar cliente</option>
                    {clientes.map(cliente => (
                      <option key={cliente.id} value={cliente.idCliente}>
                        {cliente.idCliente} - {cliente.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-section-compact">
                <h3>2. Levantamiento Técnico</h3>
                <div className="checkbox-group-compact">
                  <label>
                    <input
                      type="checkbox"
                      name="requiereLevantamientoTecnico"
                      checked={formData.requiereLevantamientoTecnico}
                      onChange={handleChange}
                      disabled={saving}
                    />
                    Requiere Levantamiento Técnico
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="realizado"
                      checked={formData.realizado}
                      onChange={handleChange}
                      disabled={saving || !isRealizadoEnabled}
                    />
                    Realizado
                  </label>
                </div>
              </div>

              <div className="form-section-compact">
                <h3>3. Cotización</h3>
                <div className="form-group">
                  <label>ID Cotización:</label>
                  <input
                    type="text"
                    name="idCotizacion"
                    value={formData.idCotizacion}
                    onChange={handleChange}
                    required
                    disabled={saving || !isCotizacionEnabled}
                  />
                </div>
                <div className="form-group">
                  <label>Monto Total:</label>
                  <input
                    type="number"
                    name="montoTotal"
                    value={formData.montoTotal}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    required
                    disabled={saving || !isCotizacionEnabled}
                  />
                </div>
              </div>
            </div>

            {/* Columna 2: Fincado y Fechas */}
            <div className="form-column">
              <div className="form-section-compact">
                <h3>4. Fincado</h3>
                <div className="checkbox-group-compact">
                  <label>
                    <input
                      type="checkbox"
                      name="fincado"
                      checked={formData.fincado}
                      onChange={handleChange}
                      disabled={saving || !isFincadoEnabled}
                    />
                    Fincado
                  </label>
                </div>
              </div>

              <div className="form-section-compact">
                <h3>5. Fechas del Proyecto</h3>
                <div className="form-group">
                  <label>Fecha Inicio:</label>
                  <input
                    type="date"
                    name="fechaInicio"
                    value={formData.fechaInicio}
                    onChange={handleChange}
                    disabled={saving || !isFechasEnabled}
                  />
                </div>
                <div className="form-group">
                  <label>Fecha Término:</label>
                  <input
                    type="date"
                    name="fechaTermino"
                    value={formData.fechaTermino}
                    onChange={handleChange}
                    disabled={saving || !isFechasEnabled}
                  />
                </div>
              </div>

              <div className="form-section-compact">
                <h3>6. Orden de Compra</h3>
                <div className="form-group">
                  <label>Orden de Compra:</label>
                  <input
                    type="text"
                    name="ordenCompra"
                    value={formData.ordenCompra}
                    onChange={handleChange}
                    disabled={saving || !isFormaPagoEnabled}
                  />
                </div>
                <div className="form-group">
                  <label>Forma de Pago:</label>
                  <select
                    name="formaDePago"
                    value={formData.formaDePago}
                    onChange={handleChange}
                    required
                    disabled={saving || !isFormaPagoEnabled}
                  >
                    <option value="PUE">PUE</option>
                    <option value="PARCIALIDADES">Parcialidades</option>
                    <option value="DIFERIDO">Diferido</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Columna 3: Facturación */}
            <div className="form-column">
              <div className="form-section-compact">
                <h3>7. Facturación</h3>
                <div className="checkbox-group-compact">
                  <label>
                    <input
                      type="checkbox"
                      name="facturado"
                      checked={formData.facturado}
                      onChange={handleChange}
                      disabled={saving || !isFormaPagoEnabled}
                    />
                    Facturado
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="facturaCerrada"
                      checked={formData.facturaCerrada}
                      onChange={handleChange}
                      disabled={saving || !isFoliosEnabled}
                    />
                    Factura Cerrada
                  </label>
                </div>
                
                <div className="form-group">
                  <label>Folio Control:</label>
                  <input
                    type="text"
                    name="folioControl"
                    value={formData.folioControl}
                    onChange={handleChange}
                    disabled={saving || !isFoliosEnabled}
                  />
                </div>
                <div className="form-group">
                  <label>Folio Fiscal:</label>
                  <input
                    type="text"
                    name="folioFiscal"
                    value={formData.folioFiscal}
                    onChange={handleChange}
                    disabled={saving || !isFoliosEnabled}
                  />
                </div>
              </div>

              {/* Información sobre parcialidades */}
              {formData.formaDePago === 'PARCIALIDADES' && (
                <div className="info-section">
                  <h4>📝 Información sobre Parcialidades</h4>
                  <p>Las parcialidades permiten dividir el pago en múltiples pagos hasta completar el monto total. Se pueden gestionar después de crear el proyecto usando el botón "Editar Parcialidades".</p>
                </div>
              )}

              {formData.formaDePago === 'DIFERIDO' && (
                <div className="info-section">
                  <h4>📅 Información sobre Pago Diferido</h4>
                  <p>El pago diferido es un solo pago por el monto total, pero programado para una fecha posterior. Se puede definir la fecha después de crear el proyecto.</p>
                </div>
              )}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={saving}>
              Cancelar
            </button>
            <button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : (modalType === 'add' ? 'Crear Proyecto' : 'Actualizar Proyecto')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Componente Modal para Parcialidades CON VALIDACIONES MEJORADAS
const ParcialidadesModal = ({ proyecto, onClose, onSave }) => {
  const [parcialidades, setParcialidades] = useState(proyecto.facturasParcialidades || []);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState([]);

  const calcularTotalPagado = () => {
    return parcialidades.reduce((sum, p) => sum + (parseFloat(p.monto) || 0), 0);
  };

  const calcularPorcentajePagado = () => {
    const totalPagado = calcularTotalPagado();
    return proyecto.montoTotal > 0 ? (totalPagado / proyecto.montoTotal) * 100 : 0;
  };

  const validarParcialidades = () => {
    const newErrors = [];
    const totalPagado = calcularTotalPagado();
    const montoTotal = parseFloat(proyecto.montoTotal);

    // Validación específica para DIFERIDO
    if (proyecto.formaDePago === 'DIFERIDO') {
      if (parcialidades.length === 0) {
        newErrors.push('Los proyectos DIFERIDOS requieren exactamente una parcialidad');
      } else if (parcialidades.length > 1) {
        newErrors.push('Los proyectos DIFERIDOS solo pueden tener una parcialidad');
      } else {
        const parcialidad = parcialidades[0];
        const montoParcialidad = parseFloat(parcialidad.monto) || 0;
        
        if (montoParcialidad !== montoTotal) {
          newErrors.push(`En proyectos DIFERIDOS, la parcialidad debe ser exactamente ${formatCurrency(montoTotal)}`);
        }
        
        if (!parcialidad.fechaPago) {
          newErrors.push('Los proyectos DIFERIDOS requieren fecha de pago');
        }
      }
    }

    // Validación específica para PARCIALIDADES
    if (proyecto.formaDePago === 'PARCIALIDADES') {
      if (parcialidades.length === 0) {
        newErrors.push('Los proyectos con PARCIALIDADES requieren al menos una parcialidad');
      } else if (parcialidades.length === 1) {
        newErrors.push('Los proyectos con PARCIALIDADES requieren al menos 2 parcialidades');
      } else {
        // Validar que no exceda el monto total
        if (totalPagado > montoTotal) {
          newErrors.push(`El total de parcialidades (${formatCurrency(totalPagado)}) no puede exceder el monto del proyecto (${formatCurrency(montoTotal)})`);
        }
        
        // Validar que cada parcialidad tenga monto
        parcialidades.forEach((parcialidad, index) => {
          const monto = parseFloat(parcialidad.monto) || 0;
          if (monto <= 0) {
            newErrors.push(`La parcialidad ${index + 1} debe tener un monto válido mayor a 0`);
          }
          if (monto > montoTotal) {
            newErrors.push(`La parcialidad ${index + 1} (${formatCurrency(monto)}) no puede ser mayor al monto total`);
          }
        });
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const addParcialidad = () => {
    if (proyecto.formaDePago === 'DIFERIDO' && parcialidades.length >= 1) {
      showNotification('warning', 'Los proyectos DIFERIDOS solo pueden tener una parcialidad');
      return;
    }

    const nuevaParcialidad = {
      monto: proyecto.formaDePago === 'DIFERIDO' ? proyecto.montoTotal : '',
      complementoN: '',
      fechaPago: '',
      descripcion: proyecto.formaDePago === 'DIFERIDO' ? 'Pago diferido' : ''
    };

    setParcialidades([...parcialidades, nuevaParcialidad]);
  };

  const removeParcialidad = (index) => {
    setParcialidades(parcialidades.filter((_, i) => i !== index));
  };

  const updateParcialidad = (index, field, value) => {
    setParcialidades(parcialidades.map((parcialidad, i) => {
      if (i === index) {
        const updated = { ...parcialidad, [field]: value };
        
        // Para proyectos DIFERIDO, mantener el monto igual al total
        if (proyecto.formaDePago === 'DIFERIDO' && field === 'monto') {
          const monto = parseFloat(value) || 0;
          if (monto !== proyecto.montoTotal) {
            showNotification('warning', `En proyectos DIFERIDOS, el monto debe ser exactamente ${formatCurrency(proyecto.montoTotal)}`);
            updated.monto = proyecto.montoTotal;
          }
        }
        
        return updated;
      }
      return parcialidad;
    }));
  };

  const handleSave = async () => {
    if (!validarParcialidades()) {
      showNotification('error', 'Por favor corrija los errores antes de guardar');
      return;
    }

    setSaving(true);
    try {
      const updatedProject = {
        ...proyecto,
        facturasParcialidades: parcialidades
      };
      
      await proyectoService.actualizar(proyecto.id, updatedProject);
      showNotification('success', 'Parcialidades actualizadas exitosamente');
      await onSave();
      onClose();
    } catch (error) {
      console.error('Error al actualizar parcialidades:', error);
      const errorMessage = typeof error === 'string' ? error : 'Error al actualizar las parcialidades';
      showNotification('error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  // Validar en tiempo real
  useEffect(() => {
    validarParcialidades();
  }, [parcialidades]);

  return (
    <div className="modal-overlay">
      <div className="modal large">
        <div className="modal-header">
          <h2>Editar Parcialidades - {proyecto.idCotizacion} ({proyecto.formaDePago})</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="parcialidades-info">
          <div className="info-card">
            <h3>Información del Proyecto</h3>
            <p><strong>Cliente:</strong> {proyecto.nombreCliente}</p>
            <p><strong>Monto Total:</strong> {formatCurrency(proyecto.montoTotal)}</p>
            <p><strong>Forma de Pago:</strong> {proyecto.formaDePago}</p>
            <p><strong>Total Asignado:</strong> {formatCurrency(calcularTotalPagado())}</p>
            <p><strong>Porcentaje Asignado:</strong> {calcularPorcentajePagado().toFixed(2)}%</p>
            <p><strong>Pendiente:</strong> {formatCurrency(proyecto.montoTotal - calcularTotalPagado())}</p>
            
            {proyecto.formaDePago === 'DIFERIDO' && (
              <div className="tipo-pago-info diferido">
                <p><strong>📅 DIFERIDO:</strong> Un solo pago por el monto total en fecha posterior</p>
              </div>
            )}
            
            {proyecto.formaDePago === 'PARCIALIDADES' && (
              <div className="tipo-pago-info parcialidades">
                <p><strong>📝 PARCIALIDADES:</strong> Múltiples pagos hasta completar el monto total</p>
              </div>
            )}
          </div>
        </div>

        {/* Mostrar errores de validación */}
        {errors.length > 0 && (
          <div className="errors-section">
            <h4>⚠️ Errores de Validación:</h4>
            {errors.map((error, index) => (
              <div key={index} className="error-message">
                {error}
              </div>
            ))}
          </div>
        )}

        <div className="parcialidades-section">
          <div className="parcialidades-header">
            <h3>
              {proyecto.formaDePago === 'DIFERIDO' ? 'Pago Diferido' : 'Parcialidades'} 
              ({parcialidades.length})
            </h3>
            <button 
              type="button" 
              onClick={addParcialidad} 
              disabled={saving || (proyecto.formaDePago === 'DIFERIDO' && parcialidades.length >= 1)}
            >
              {proyecto.formaDePago === 'DIFERIDO' ? 'Agregar Pago Diferido' : 'Agregar Parcialidad'}
            </button>
          </div>
          
          {parcialidades.length === 0 && (
            <div className="empty-state">
              <p>No hay {proyecto.formaDePago === 'DIFERIDO' ? 'pago diferido' : 'parcialidades'} configuradas</p>
              <p>Haga clic en el botón de arriba para agregar {proyecto.formaDePago === 'DIFERIDO' ? 'el pago' : 'una parcialidad'}</p>
            </div>
          )}
          
          {parcialidades.map((parcialidad, index) => (
            <div key={index} className="parcialidad-item">
              <div className="parcialidad-header">
                <h4>
                  {proyecto.formaDePago === 'DIFERIDO' ? 'Pago Diferido' : `Parcialidad ${index + 1}`}
                </h4>
                <button 
                  type="button" 
                  onClick={() => removeParcialidad(index)}
                  disabled={saving}
                  className="remove-btn"
                >
                  Eliminar
                </button>
              </div>
              <div className="parcialidad-fields">
                <input
                  type="number"
                  placeholder="Monto"
                  value={parcialidad.monto}
                  onChange={(e) => updateParcialidad(index, 'monto', e.target.value)}
                  step="0.01"
                  min="0"
                  max={proyecto.montoTotal}
                  required
                  disabled={saving}
                />
                <input
                  type="text"
                  placeholder="Complemento N"
                  value={parcialidad.complementoN}
                  onChange={(e) => updateParcialidad(index, 'complementoN', e.target.value)}
                  disabled={saving}
                />
                <input
                  type="date"
                  placeholder="Fecha de Pago"
                  value={parcialidad.fechaPago}
                  onChange={(e) => updateParcialidad(index, 'fechaPago', e.target.value)}
                  disabled={saving}
                  required={proyecto.formaDePago === 'DIFERIDO'}
                />
                <input
                  type="text"
                  placeholder="Descripción"
                  value={parcialidad.descripcion}
                  onChange={(e) => updateParcialidad(index, 'descripcion', e.target.value)}
                  disabled={saving}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="modal-actions">
          <button type="button" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button 
            type="button" 
            onClick={handleSave} 
            disabled={saving || errors.length > 0}
          >
            {saving ? 'Guardando...' : 'Guardar Parcialidades'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListaProyectos;