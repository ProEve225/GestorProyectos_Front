import React, { useState, useEffect } from 'react';
import { clienteService } from '../services/clienteService';
import { proyectoService } from '../services/proyectoService';
import { authService } from '../services/authService';
import { showNotification } from './NotificationSystem';
import '../CSS/Dashboard.css';

const Dashboard = ({ onNavigate, onLogout }) => {
  const [stats, setStats] = useState({
    totalClientes: 0,
    totalProyectos: 0,
    proyectosRealizados: 0,
    proyectosPendientes: 0,
    montoTotal: 0
  });
  const [loading, setLoading] = useState(true);
  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      const [clientes, proyectos] = await Promise.all([
        clienteService.obtenerTodos(),
        proyectoService.obtenerTodos()
      ]);

      // Cambiar lógica: proyectos realizados = facturados
      const proyectosRealizados = proyectos.filter(p => p.facturado).length;
      const montoTotal = proyectos.reduce((sum, p) => sum + (p.montoTotal || 0), 0);

      setStats({
        totalClientes: clientes.length,
        totalProyectos: proyectos.length,
        proyectosRealizados,
        proyectosPendientes: proyectos.length - proyectosRealizados,
        montoTotal
      });
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      showNotification('error', 'Error al cargar las estadísticas');
    } finally {
      setLoading(false);
    }
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
        <div className="loading-spinner">Cargando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo-container">
            <img src="src\assets\Logo_ESIES.png" alt="Logo ESIES" className="sidebar-logo" />
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-item active">
            <span className="nav-icon">📊</span>
            Dashboard
          </div>
          <div className="nav-item" onClick={() => onNavigate('clientes')}>
            <span className="nav-icon">👥</span>
            Clientes
          </div>
          <div className="nav-item" onClick={() => onNavigate('proyectos')}>
            <span className="nav-icon">📁</span>
            Proyectos
          </div>
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
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <div className="content-header">
          <div className="user-info">
            <span>{authService.getCurrentUser()?.nombre || 'Administrador'}</span>
            <span className="user-role">Admin</span>
          </div>
        </div>

        {/* Content */}
        <div className="content-body">
          <div className="page-header">
            <h1>Dashboard</h1>
            <p>Resumen general del sistema</p>
          </div>

          {/* Stats Cards - Optimizado para usar todo el espacio */}
          <div className="stats-grid-optimized">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>{stats.totalClientes}</h3>
                <p>Total Clientes</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">📁</div>
              <div className="stat-content">
                <h3>{stats.totalProyectos}</h3>
                <p>Total Proyectos</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <h3>{stats.proyectosRealizados}</h3>
                <p>Proyectos Facturados</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">⏳</div>
              <div className="stat-content">
                <h3>{stats.proyectosPendientes}</h3>
                <p>Proyectos Pendientes</p>
              </div>
            </div>
            
            <div className="stat-card large">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <h3>{formatCurrency(stats.montoTotal)}</h3>
                <p>Monto Total de Proyectos</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <h2>Acciones Rápidas</h2>
            <div className="actions-grid">
              <button 
                className="action-btn"
                onClick={() => onNavigate('clientes')}
              >
                <span className="action-icon">👥</span>
                <span>Gestionar Clientes</span>
              </button>
              <button 
                className="action-btn"
                onClick={() => onNavigate('proyectos')}
              >
                <span className="action-icon">📁</span>
                <span>Gestionar Proyectos</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de cambiar contraseña */}
      {showChangePassword && <ChangePasswordModal />}
    </div>
  );
};

export default Dashboard;