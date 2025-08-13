"use client"

import { useState, useEffect } from "react"
import { clienteService } from "../services/clienteService"
import { proyectoService } from "../services/proyectoService"
import { authService } from "../services/authService"
import { showNotification } from "./NotificationSystem"
import "../CSS/Dashboard.css"
import { Users, Folder, LayoutDashboard, CheckCircle, Clock, DollarSign, Lock, LogOut, Calendar } from "lucide-react"

const Dashboard = ({ onNavigate, onLogout }) => {
  const [stats, setStats] = useState({
    totalClientes: 0,
    totalProyectos: 0,
    proyectosRealizados: 0,
    proyectosPendientes: 0,
    montoTotal: 0,
  })
  const [loading, setLoading] = useState(true)
  const [showChangePassword, setShowChangePassword] = useState(false)

  const [dateFilter, setDateFilter] = useState({
    type: "all", // 'all', 'custom', 'thisMonth', 'lastMonth', 'thisYear', 'lastYear'
    startDate: "",
    endDate: "",
  })
  const [showDateFilter, setShowDateFilter] = useState(false)

  useEffect(() => {
    cargarEstadisticas()
  }, [dateFilter]) // Added dateFilter dependency

  const cargarEstadisticas = async () => {
    try {
      setLoading(true)
      const [clientes, proyectos] = await Promise.all([clienteService.obtenerTodos(), proyectoService.obtenerTodos()])

      const filteredProyectos = filterProjectsByDate(proyectos)

      // Cambiar lógica: proyectos realizados = facturados
      const proyectosRealizados = filteredProyectos.filter((p) => p.facturado).length
      const montoTotal = filteredProyectos.reduce((sum, p) => sum + (p.montoTotal || 0), 0)

      setStats({
        totalClientes: clientes.length,
        totalProyectos: filteredProyectos.length,
        proyectosRealizados,
        proyectosPendientes: filteredProyectos.length - proyectosRealizados,
        montoTotal,
      })
    } catch (error) {
      console.error("Error al cargar estadísticas:", error)
      showNotification("error", "Error al cargar las estadísticas")
    } finally {
      setLoading(false)
    }
  }

  const filterProjectsByDate = (proyectos) => {
    if (dateFilter.type === "all") return proyectos

    const now = new Date()
    let startDate, endDate

    switch (dateFilter.type) {
      case "thisMonth":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        break
      case "lastMonth":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        endDate = new Date(now.getFullYear(), now.getMonth(), 0)
        break
      case "thisYear":
        startDate = new Date(now.getFullYear(), 0, 1)
        endDate = new Date(now.getFullYear(), 11, 31)
        break
      case "lastYear":
        startDate = new Date(now.getFullYear() - 1, 0, 1)
        endDate = new Date(now.getFullYear() - 1, 11, 31)
        break
      case "custom":
        if (!dateFilter.startDate || !dateFilter.endDate) return proyectos
        startDate = new Date(dateFilter.startDate)
        endDate = new Date(dateFilter.endDate)
        break
      default:
        return proyectos
    }

    return proyectos.filter((proyecto) => {
      const fechaCreacion = new Date(proyecto.fechaCreacion || proyecto.fechaInicio)
      return fechaCreacion >= startDate && fechaCreacion <= endDate
    })
  }

  const handleDateFilterChange = (type) => {
    setDateFilter({ ...dateFilter, type })
    if (type !== "custom") {
      setDateFilter((prev) => ({ ...prev, startDate: "", endDate: "" }))
    }
  }

  const handleCustomDateChange = (field, value) => {
    setDateFilter((prev) => ({ ...prev, [field]: value }))
  }

  const getDateFilterLabel = () => {
    switch (dateFilter.type) {
      case "thisMonth":
        return "Este Mes"
      case "lastMonth":
        return "Mes Anterior"
      case "thisYear":
        return "Este Año"
      case "lastYear":
        return "Año Anterior"
      case "custom":
        return "Rango Personalizado"
      default:
        return "Todos los Tiempos"
    }
  }

  const handleLogout = () => {
    authService.logout()
    showNotification("info", "Sesión cerrada correctamente")
    onLogout()
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount)
  }

  const ChangePasswordModal = () => {
    const [formData, setFormData] = useState({
      contrasenaActual: "",
      contrasenaNueva: "",
      confirmarContrasena: "",
    })
    const [saving, setSaving] = useState(false)

    const handleSubmit = async (e) => {
      e.preventDefault()
      setSaving(true)

      if (formData.contrasenaNueva !== formData.confirmarContrasena) {
        showNotification("error", "Las contraseñas nuevas no coinciden")
        setSaving(false)
        return
      }

      try {
        await authService.cambiarContrasena(
          formData.contrasenaActual,
          formData.contrasenaNueva,
          formData.confirmarContrasena,
        )
        showNotification("success", "Contraseña cambiada exitosamente")
        setShowChangePassword(false)
      } catch (error) {
        const errorMessage = typeof error === "string" ? error : "Error al cambiar contraseña"
        showNotification("error", errorMessage)
      } finally {
        setSaving(false)
      }
    }

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h3>Cambiar Contraseña</h3>
            <button className="close-btn" onClick={() => setShowChangePassword(false)}>
              ×
            </button>
          </div>
          <form onSubmit={handleSubmit} className="client-form">
            <div className="form-group">
              <label>Contraseña Actual:</label>
              <input
                type="password"
                value={formData.contrasenaActual}
                onChange={(e) => setFormData({ ...formData, contrasenaActual: e.target.value })}
                required
                disabled={saving}
              />
            </div>
            <div className="form-group">
              <label>Nueva Contraseña:</label>
              <input
                type="password"
                value={formData.contrasenaNueva}
                onChange={(e) => setFormData({ ...formData, contrasenaNueva: e.target.value })}
                required
                disabled={saving}
              />
            </div>
            <div className="form-group">
              <label>Confirmar Nueva Contraseña:</label>
              <input
                type="password"
                value={formData.confirmarContrasena}
                onChange={(e) => setFormData({ ...formData, confirmarContrasena: e.target.value })}
                required
                disabled={saving}
              />
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setShowChangePassword(false)}
                disabled={saving}
              >
                Cancelar
              </button>
              <button type="submit" className="save-btn" disabled={saving}>
                {saving ? "Cambiando..." : "Cambiar Contraseña"}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Cargando dashboard...</div>
      </div>
    )
  }

  return (
    <div className="contenedor-principal">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-container">
            <img src="src\assets\Logo_ESIES.png" alt="Logo ESIES" className="sidebar-logo" />
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-item active">
            <span className="nav-icon">
              <LayoutDashboard size={16} />
            </span>
            Dashboard
          </div>
          <div className="nav-item" onClick={() => onNavigate("clientes")}>
            <span className="nav-icon">
              <Users size={16} />
            </span>
            Clientes
          </div>
          <div className="nav-item" onClick={() => onNavigate("proyectos")}>
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
      </aside>

      {/* Main Content */}
      <main className="contenido">
        {/* Header */}
        <div className="content-header">
          <div className="user-info">
            <span>{authService.getCurrentUser()?.nombre || "Administrador"}</span>
            <span className="user-role">Admin</span>
          </div>
        </div>

        {/* Content */}
        <div className="content-body">
          <div className="page-header">
            <div>
              <h1>Dashboard</h1>
              <p>Resumen general del sistema</p>
            </div>

            <div className="date-filter-section">
              <button className="date-filter-btn" onClick={() => setShowDateFilter(!showDateFilter)}>
                <Calendar size={16} />
                Filtrar por Fecha: {getDateFilterLabel()}
              </button>

              {showDateFilter && (
                <div className="date-filter-dropdown">
                  <div className="filter-options">
                    <button
                      className={dateFilter.type === "all" ? "active" : ""}
                      onClick={() => handleDateFilterChange("all")}
                    >
                      Todos los Tiempos
                    </button>
                    <button
                      className={dateFilter.type === "thisMonth" ? "active" : ""}
                      onClick={() => handleDateFilterChange("thisMonth")}
                    >
                      Este Mes
                    </button>
                    <button
                      className={dateFilter.type === "lastMonth" ? "active" : ""}
                      onClick={() => handleDateFilterChange("lastMonth")}
                    >
                      Mes Anterior
                    </button>
                    <button
                      className={dateFilter.type === "thisYear" ? "active" : ""}
                      onClick={() => handleDateFilterChange("thisYear")}
                    >
                      Este Año
                    </button>
                    <button
                      className={dateFilter.type === "lastYear" ? "active" : ""}
                      onClick={() => handleDateFilterChange("lastYear")}
                    >
                      Año Anterior
                    </button>
                    <button
                      className={dateFilter.type === "custom" ? "active" : ""}
                      onClick={() => handleDateFilterChange("custom")}
                    >
                      Rango Personalizado
                    </button>
                  </div>

                  {dateFilter.type === "custom" && (
                    <div className="custom-date-inputs">
                      <div className="date-input-group">
                        <label>Fecha Inicio:</label>
                        <input
                          type="date"
                          value={dateFilter.startDate}
                          onChange={(e) => handleCustomDateChange("startDate", e.target.value)}
                        />
                      </div>
                      <div className="date-input-group">
                        <label>Fecha Fin:</label>
                        <input
                          type="date"
                          value={dateFilter.endDate}
                          onChange={(e) => handleCustomDateChange("endDate", e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Stats Cards - Optimizado para usar todo el espacio */}
          <div className="stats-grid-optimized">
            <div className="stat-card">
              <div className="stat-icon">
                <span className="nav-icon">
                  <Users size={50} />
                </span>
              </div>
              <div className="stat-content">
                <h3>{stats.totalClientes}</h3>
                <p>Total de Clientes</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <span className="nav-icon">
                  <Folder size={50} />
                </span>
              </div>
              <div className="stat-content">
                <h3>{stats.totalProyectos}</h3>
                <p>Total de Proyectos</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <span className="nav-icon">
                  <CheckCircle size={50} />
                </span>
              </div>
              <div className="stat-content">
                <h3>{stats.proyectosRealizados}</h3>
                <p>Proyectos Facturados</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <span className="nav-icon">
                  <Clock size={50} />
                </span>
              </div>
              <div className="stat-content">
                <h3>{stats.proyectosPendientes}</h3>
                <p>Proyectos Pendientes</p>
              </div>
            </div>

            <div className="stat-card large">
              <div className="stat-icon">
                <span className="nav-icon">
                  <DollarSign size={50} />
                </span>
              </div>
              <div className="stat-content">
                <h3>{formatCurrency(stats.montoTotal)}</h3>
                <p>Monto Total de los Proyectos</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <h2>Acciones Rápidas</h2>
            <div className="actions-grid">
              <button className="action-btn" onClick={() => onNavigate("clientes")}>
                <span className="nav-icon">
                  <Users size={25} />
                </span>
                <span>Gestionar Clientes</span>
              </button>
              <button className="action-btn" onClick={() => onNavigate("proyectos")}>
                <span className="nav-icon">
                  <Folder size={25} />
                </span>
                <span>Gestionar Proyectos</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de cambiar contraseña */}
      {showChangePassword && <ChangePasswordModal />}
    </div>
  )
}

export default Dashboard