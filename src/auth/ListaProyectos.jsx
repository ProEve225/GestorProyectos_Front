import { useState, useEffect } from "react"
import { proyectoService } from "../services/proyectoService"
import { clienteService } from "../services/clienteService"
import { authService } from "../services/authService"
import { showNotification } from "../components/NotificationSystem"
import "../CSS/ListaProyectos.css"
import { Users, Folder, LayoutDashboard, Lock, LogOut, Search, Calendar } from "lucide-react"
import ExcelExportModal from "../components/ExcelExportModal.jsx"
import "../components/ExcelExportModal.css"
import logo from "../assets/Logo_ESIES.png"

const ListaProyectos = ({ onNavigate, onLogout }) => {
  const [proyectos, setProyectos] = useState([])
  const [filteredProyectos, setFilteredProyectos] = useState([])
  const [clientes, setClientes] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [modalType, setModalType] = useState("add")
  const [selectedProject, setSelectedProject] = useState(null)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showParcialidadesModal, setShowParcialidadesModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)

  const [dateFilter, setDateFilter] = useState({
    type: "all", // 'all', 'custom', 'thisMonth', 'lastMonth', 'thisYear', 'lastYear'
    startDate: "",
    endDate: "",
  })
  const [showDateFilter, setShowDateFilter] = useState(false)

  useEffect(() => {
    cargarDatos()
  }, [])

  // Filtrar proyectos por búsqueda y fecha
  useEffect(() => {
    const searchFiltered = proyectos.filter(
      (proyecto) =>
        proyecto.nombreCliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proyecto.idCliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proyecto.idCotizacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (proyecto.ordenCompra && proyecto.ordenCompra.toLowerCase().includes(searchTerm.toLowerCase())),
    )

    // Apply date filter after search filter
    const dateFiltered = filterProjectsByDate(searchFiltered)
    setFilteredProyectos(dateFiltered)
  }, [searchTerm, proyectos, dateFilter])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const [proyectosData, clientesData] = await Promise.all([
        proyectoService.obtenerTodos(),
        clienteService.obtenerTodos(),
      ])
      setProyectos(proyectosData)
      setFilteredProyectos(proyectosData)
      setClientes(clientesData)
    } catch (error) {
      console.error("Error al cargar datos:", error)
      showNotification("error", "Error al cargar los datos")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (project) => {
    setModalType("edit")
    setSelectedProject(project)
    setModalVisible(true)
  }

  const handleEditParcialidades = (project) => {
    setSelectedProject(project)
    setShowParcialidadesModal(true)
  }

  const handleDeleteProject = async (projectId) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este proyecto?")) {
      try {
        await proyectoService.eliminar(projectId)
        await cargarDatos()
        showNotification("success", "Proyecto eliminado exitosamente")
      } catch (error) {
        console.error("Error al eliminar proyecto:", error)
        showNotification("error", "Error al eliminar el proyecto")
      }
    }
  }

  const handleLogout = () => {
    authService.logout()
    showNotification("info", "Sesión cerrada correctamente")
    onLogout()
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const [year, month, day] = dateString.split("-")
    const date = new Date(year, month - 1, day)
    return date.toLocaleDateString("es-MX")
  }

  const getFormaDePagoText = (formaDePago) => {
    const formas = {
      PUE: "PUE",
      PARCIALIDADES: "PARCIALIDADES",
      DIFERIDO: "Diferido",
    }
    return formas[formaDePago] || formaDePago
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
        const [startYear, startMonth, startDay] = dateFilter.startDate.split("-")
        const [endYear, endMonth, endDay] = dateFilter.endDate.split("-")
        startDate = new Date(startYear, startMonth - 1, startDay)
        endDate = new Date(endYear, endMonth - 1, endDay, 23, 59, 59) // Incluir todo el día final
        break
      default:
        return proyectos
    }

    return proyectos.filter((proyecto) => {
      const fechaCreacionString = proyecto.fechaCreacion || proyecto.fechaInicio
      if (!fechaCreacionString) return false

      const [year, month, day] = fechaCreacionString.split("-")
      const fechaCreacion = new Date(year, month - 1, day)

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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Cargando proyectos...</div>
      </div>
    )
  }

  const calcularParcialidadesPagadas = (proyecto) => {
    if (proyecto.formaDePago === "PUE") {
      return "N/A"
    }

    if (!proyecto.facturasParcialidades || proyecto.facturasParcialidades.length === 0) {
      return 0
    }

    // For DIFERIDO and PARCIALIDADES, return total count of registered parcialidades
    return proyecto.facturasParcialidades.length
  }

  const calcularTotalPagado = (proyecto) => {
    if (!proyecto.facturasParcialidades || proyecto.facturasParcialidades.length === 0) {
      return 0
    }
    return proyecto.facturasParcialidades.reduce((sum, p) => sum + (Number.parseFloat(p.monto) || 0), 0)
  }

  const calcularPorcentajePagado = (proyecto) => {
    if (proyecto.formaDePago === "PUE") {
      // For PUE projects: 0% if not closed, 100% if closed
      return proyecto.facturaCerrada ? 100 : 0
    }

    // For PARCIALIDADES and DIFERIDO, calculate based on actual payments
    const totalPagado = calcularTotalPagado(proyecto)
    return proyecto.montoTotal > 0 ? (totalPagado / proyecto.montoTotal) * 100 : 0
  }

  return (
    <div className="contenedor-principal">
      <aside className="sidebar">
        <div className="sidebar-header"></div>

        <nav className="sidebar-nav">
          <button className="nav-item" onClick={() => onNavigate("dashboard")}>
            <span className="nav-icon">
              <LayoutDashboard size={16} />
            </span>
            Dashboard
          </button>
          <button className="nav-item" onClick={() => onNavigate("clientes")}>
            <span className="nav-icon">
              <Users size={16} />
            </span>
            Clientes
          </button>
          <button className="nav-item active">
            <span className="nav-icon">
              <Folder size={16} />
            </span>
            Proyectos
          </button>
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

      <main className="contenido">
        <div className="logo-container">
          <img src={logo || "/placeholder.svg"} alt="Logo ESIES" className="sidebar-logo" />
          <div className="content-header">
            <div className="user-info">
              <span>{authService.getCurrentUser()?.nombre || "Administrador"}</span>
              <span className="user-role">Admin</span>
            </div>
          </div>
        </div>

        <div className="page-header">
          <h2>Todos los Proyectos ({filteredProyectos.length})</h2>
          <div className="header-actions">
            <button className="btn-agregar" onClick={() => handleEdit(null)}>
              Agregar Proyecto
            </button>

            <button
              className="btn-primary export-btn"
              onClick={() => setShowExportModal(true)}
              style={{
                background: "#28a745",
                marginLeft: "10px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              Exportar a Excel
            </button>

            <div className="filters-container">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Buscar Proyectos"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <span className="search-icon">
                  <span className="nav-icon">
                    <Search size={16} />
                  </span>
                </span>
              </div>
              <div className="date-filter-container">
                <button className="date-filter-btn-compact" onClick={() => setShowDateFilter(!showDateFilter)}>
                  <Calendar size={16} />
                  {getDateFilterLabel()}
                </button>
                {showDateFilter && (
                  <div className="date-filter-dropdown-compact">
                    <div className="filter-options-compact">
                      <button
                        className={dateFilter.type === "all" ? "active" : ""}
                        onClick={() => handleDateFilterChange("all")}
                      >
                        Todos
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
                        Personalizado
                      </button>
                    </div>
                    {dateFilter.type === "custom" && (
                      <div className="custom-date-inputs-compact">
                        <input
                          type="date"
                          value={dateFilter.startDate}
                          onChange={(e) => handleCustomDateChange("startDate", e.target.value)}
                          placeholder="Fecha inicio"
                        />
                        <input
                          type="date"
                          value={dateFilter.endDate}
                          onChange={(e) => handleCustomDateChange("endDate", e.target.value)}
                          placeholder="Fecha fin"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="clients-table-container">
          <table className="clients-table">
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
                <th>Forma de pago</th>
                <th>Parcialidades Pagadas</th>
                <th>% Pagado</th>
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
                  <td>
                    {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(proyecto.montoTotal)}
                  </td>
                  <td>{proyecto.requiereLevantamientoTecnico ? "Sí" : "No"}</td>
                  <td>{proyecto.realizado ? "Sí" : "No"}</td>
                  <td>{proyecto.fincado ? "Sí" : "No"}</td>
                  <td>{formatDate(proyecto.fechaInicio)}</td>
                  <td>{formatDate(proyecto.fechaTermino)}</td>
                  <td>{proyecto.facturado ? "Sí" : "No"}</td>
                  <td>
                    <span className={`payment-type ${proyecto.formaDePago.toLowerCase()}`}>
                      {getFormaDePagoText(proyecto.formaDePago)}
                    </span>
                  </td>
                  <td>{proyecto.formaDePago === "PUE" ? "N/A" : calcularParcialidadesPagadas(proyecto)}</td>
                  <td>
                    <span
                      className={`percentage ${calcularPorcentajePagado(proyecto) === 100 ? "complete" : "incomplete"}`}
                    >
                      {calcularPorcentajePagado(proyecto).toFixed(1)}%
                    </span>
                  </td>
                  <td>{proyecto.ordenCompra || "N/A"}</td>
                  <td>{proyecto.facturaCerrada ? "Sí" : "No"}</td>
                  <td>
                    <div className="actions-container">
                      <button className="btn-actualizar" onClick={() => handleEdit(proyecto)} title="Actualizar">
                        Actualizar
                      </button>
                      {(proyecto.formaDePago === "PARCIALIDADES" || proyecto.formaDePago === "DIFERIDO") && (
                        <button
                          className={`btn-parcialidades ${!proyecto.facturado ? "disabled" : ""}`}
                          onClick={() => handleEditParcialidades(proyecto)}
                          title="Editar parcialidades"
                          disabled={!proyecto.facturado}
                        >
                          Editar parcialidades
                        </button>
                      )}
                      <button
                        className="btn-eliminar"
                        onClick={() => handleDeleteProject(proyecto.id)}
                        title="Eliminar proyecto"
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
        <ExcelExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          proyectos={filteredProyectos}
          onExport={() => {}}
        />
      </main>
    </div>
  )
}

// Componente Modal para Proyectos OPTIMIZADO
const ProjectModal = ({ modalType, selectedProject, clientes, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    idCotizacion: selectedProject?.idCotizacion || "",
    idCliente: selectedProject?.idCliente || "",
    montoTotal: selectedProject?.montoTotal || "",
    requiereLevantamientoTecnico: selectedProject?.requiereLevantamientoTecnico || false,
    realizado: selectedProject?.realizado || false,
    fincado: selectedProject?.fincado || false,
    fechaInicio: selectedProject?.fechaInicio || "",
    fechaTermino: selectedProject?.fechaTermino || "",
    ordenCompra: selectedProject?.ordenCompra || "",
    facturado: selectedProject?.facturado || false,
    formaDePago: selectedProject?.formaDePago || "PUE",
    folioControl: selectedProject?.folioControl || "",
    folioFiscal: selectedProject?.folioFiscal || "",
    facturasParcialidades: selectedProject?.facturasParcialidades || [],
    facturaCerrada: selectedProject?.facturaCerrada || false,
    montoPagoPUE: "",
    fechaPagoPUE: "",
  })
  const [saving, setSaving] = useState(false)
  const [warnings, setWarnings] = useState([])

  useEffect(() => {
    if (selectedProject && selectedProject.formaDePago === "PUE") {
      const puePaymentKey = `pue_payment_${selectedProject.id}`
      const storedPueData = localStorage.getItem(puePaymentKey)
      if (storedPueData) {
        const pueData = JSON.parse(storedPueData)
        setFormData((prev) => ({
          ...prev,
          montoPagoPUE: pueData.monto || "",
          fechaPagoPUE: pueData.fecha || "",
        }))
      }
    }
  }, [selectedProject])

  // Actualizar warnings cuando cambian los campos
  useEffect(() => {
    validateForm()
  }, [formData])

  const validateForm = () => {
    const newWarnings = []

    // PUE projects can be facturado without payment initially
    if (formData.formaDePago === "PUE" && formData.facturado && formData.montoPagoPUE) {
      if (Number.parseFloat(formData.montoPagoPUE) !== Number.parseFloat(formData.montoTotal)) {
        newWarnings.push("El monto de pago debe ser igual al monto total del proyecto")
      }
    }

    setWarnings(newWarnings)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setWarnings([])

    try {
      // Basic form validation
      if (!formData.idCotizacion || !formData.idCliente || !formData.montoTotal) {
        showNotification("error", "Complete todos los campos obligatorios")
        setSaving(false)
        return
      }

      // PUE payment validation only if payment fields are provided
      if (formData.formaDePago === "PUE" && formData.montoPagoPUE) {
        const montoPago = Number.parseFloat(formData.montoPagoPUE)
        const montoTotal = Number.parseFloat(formData.montoTotal)

        if (montoPago !== montoTotal) {
          showNotification("error", "El monto de pago debe ser igual al monto total del proyecto")
          setSaving(false)
          return
        }
      }

      const projectData = {
        idCotizacion: formData.idCotizacion,
        idCliente: formData.idCliente,
        montoTotal: Number.parseFloat(formData.montoTotal),
        requiereLevantamientoTecnico: formData.requiereLevantamientoTecnico,
        realizado: formData.realizado,
        fincado: formData.fincado,
        fechaInicio: formData.fechaInicio || null,
        fechaTermino: formData.fechaTermino || null,
        ordenCompra: formData.ordenCompra,
        facturado: formData.facturado,
        formaDePago: formData.formaDePago,
        folioControl: formData.folioControl || null,
        folioFiscal: formData.folioFiscal || null,
        cliente: { id: formData.idCliente },
      }

      // Handle PUE payments - always send empty array to avoid backend conflicts
      if (formData.formaDePago === "PUE") {
        const isPagadoCompleto =
          formData.montoPagoPUE && Number.parseFloat(formData.montoPagoPUE) >= Number.parseFloat(formData.montoTotal)
        projectData.facturaCerrada = isPagadoCompleto || false
        projectData.facturasParcialidades = [] // Always empty for PUE to avoid backend conflicts
      } else {
        projectData.facturasParcialidades = formData.facturasParcialidades || []
        projectData.facturaCerrada = false
      }

      const url = selectedProject
        ? `http://localhost:8080/api/proyectos/${selectedProject.id}`
        : "http://localhost:8080/api/proyectos"
      const method = selectedProject ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(projectData),
      })

      if (response.ok) {
        const savedProject = await response.json()

        // Store PUE payment data in localStorage after successful save
        if (formData.formaDePago === "PUE" && (formData.montoPagoPUE || formData.fechaPagoPUE)) {
          const projectId = savedProject.id || selectedProject?.id
          if (projectId) {
            const puePaymentKey = `pue_payment_${projectId}`
            const puePaymentData = {
              monto: formData.montoPagoPUE || "",
              fecha: formData.fechaPagoPUE || "",
            }
            localStorage.setItem(puePaymentKey, JSON.stringify(puePaymentData))
          }
        }

        showNotification(
          "success",
          selectedProject ? "Proyecto actualizado exitosamente" : "Proyecto creado exitosamente",
        )
        onClose()
        onSave()
      } else {
        const errorData = await response.json()
        showNotification("error", errorData.message || "Error al guardar el proyecto")
      }
    } catch (error) {
      console.error("Error:", error)
      showNotification("error", "Error de conexión")
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  // Lógica de habilitación de campos
  const isRealizadoEnabled = formData.requiereLevantamientoTecnico
  const isCotizacionEnabled = !formData.requiereLevantamientoTecnico || formData.realizado
  const isFincadoEnabled = formData.idCotizacion && formData.montoTotal
  const isFechasEnabled = formData.fincado
  const isFormaPagoEnabled = isFechasEnabled && formData.fechaInicio && formData.fechaTermino
  const isFoliosEnabled = formData.facturado

  return (
    <div className="modal-overlay">
      <div className="modal-optimized">
        <div className="modal-header">
          <h2>{modalType === "add" ? "Agregar Proyecto" : "Editar Proyecto"}</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

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
                    {clientes.map((cliente) => (
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
                </div>
              </div>

              <div className="form-section-compact">
                <h3>8. Folios</h3>
                <div className="form-group">
                  <label>Folio de Control:</label>
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

              {formData.formaDePago === "PUE" && formData.facturado && (
                <div className="form-section-compact">
                  <h3>9. Pago PUE (Opcional)</h3>
                  <p className="info-text">Puede completar estos campos ahora o actualizarlos posteriormente</p>
                  <div className="form-group">
                    <label>Monto Pagado:</label>
                    <input
                      type="number"
                      name="montoPagoPUE"
                      value={formData.montoPagoPUE}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      disabled={saving}
                      placeholder={`Debe ser ${new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(formData.montoTotal)}`}
                    />
                  </div>
                  <div className="form-group">
                    <label>Fecha de Pago:</label>
                    <input
                      type="date"
                      name="fechaPagoPUE"
                      value={formData.fechaPagoPUE}
                      onChange={handleChange}
                      disabled={saving}
                    />
                  </div>
                </div>
              )}

              {/* Información sobre formas de pago */}
              <div className="form-section-compact">
                <h3>ℹ️ Información</h3>
                {formData.formaDePago === "PARCIALIDADES" && (
                  <div className="info-message parcialidades">
                    <p>
                      <strong>PARCIALIDADES:</strong>
                    </p>
                    <p>
                      Múltiples pagos hasta completar el monto total. Puede agregar las parcialidades después de crear
                      el proyecto.
                    </p>
                  </div>
                )}
                {formData.formaDePago === "DIFERIDO" && (
                  <div className="info-message diferido">
                    <p>
                      <strong>DIFERIDO:</strong>
                    </p>
                    <p>
                      Un solo pago por el monto total en fecha posterior. Puede configurar el pago después de crear el
                      proyecto.
                    </p>
                  </div>
                )}
                {formData.formaDePago === "PUE" && (
                  <div className="info-message pue">
                    <p>
                      <strong>PUE:</strong>
                    </p>
                    <p>
                      {formData.facturado
                        ? "Complete el monto y fecha de pago si desea registrar el pago ahora."
                        : "Pago único. Active 'Facturado' para registrar el pago."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={saving}>
              Cancelar
            </button>
            <button type="submit" disabled={saving}>
              {saving ? "Guardando..." : modalType === "add" ? "Agregar Proyecto" : "Actualizar Proyecto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Componente Modal para Parcialidades CON VALIDACIONES MEJORADAS
const ParcialidadesModal = ({ proyecto, onClose, onSave }) => {
  const [parcialidades, setParcialidades] = useState(proyecto.facturasParcialidades || [])
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState([])

  const calcularTotalPagado = () => {
    return parcialidades.reduce((sum, p) => sum + (Number.parseFloat(p.monto) || 0), 0)
  }

  const calcularPorcentajePagado = () => {
    const totalPagado = calcularTotalPagado()
    return proyecto.montoTotal > 0 ? (totalPagado / proyecto.montoTotal) * 100 : 0
  }

  const validarParcialidades = () => {
    const newErrors = []
    const totalPagado = calcularTotalPagado()
    const montoTotal = Number.parseFloat(proyecto.montoTotal)

    // Validación específica para DIFERIDO
    if (proyecto.formaDePago === "DIFERIDO") {
      if (parcialidades.length === 0) {
        newErrors.push("Los proyectos DIFERIDOS requieren exactamente una parcialidad")
      } else if (parcialidades.length > 1) {
        newErrors.push("Los proyectos DIFERIDOS solo pueden tener una parcialidad")
      } else {
        const parcialidad = parcialidades[0]
        const montoParcialidad = Number.parseFloat(parcialidad.monto) || 0

        if (montoParcialidad !== montoTotal) {
          newErrors.push(
            `En proyectos DIFERIDOS, la parcialidad debe ser exactamente ${new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(montoTotal)}`,
          )
        }

        if (!parcialidad.fechaPago) {
          newErrors.push("Los proyectos DIFERIDOS requieren fecha de pago")
        }
      }
    }

    if (proyecto.formaDePago === "PARCIALIDADES") {
      if (parcialidades.length > 0) {
        // Validar que no exceda el monto total
        if (totalPagado > montoTotal) {
          newErrors.push(
            `El total de parcialidades (${new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(totalPagado)}) no puede exceder el monto del proyecto (${new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(montoTotal)})`,
          )
        }

        // Validar que cada parcialidad tenga monto
        parcialidades.forEach((parcialidad, index) => {
          const monto = Number.parseFloat(parcialidad.monto) || 0
          if (monto <= 0) {
            newErrors.push(`La parcialidad ${index + 1} debe tener un monto válido mayor a 0`)
          }
          if (monto > montoTotal) {
            newErrors.push(
              `La parcialidad ${index + 1} (${new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(monto)}) no puede ser mayor al monto total`,
            )
          }
        })
      }
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const addParcialidad = () => {
    if (proyecto.formaDePago === "DIFERIDO" && parcialidades.length >= 1) {
      showNotification("warning", "Los proyectos DIFERIDOS solo pueden tener una parcialidad")
      return
    }

    const nuevaParcialidad = {
      monto: proyecto.formaDePago === "DIFERIDO" ? proyecto.montoTotal : "",
      complementoN: "",
      fechaPago: "",
      descripcion: proyecto.formaDePago === "DIFERIDO" ? "Pago diferido" : "",
    }

    setParcialidades([...parcialidades, nuevaParcialidad])
  }

  const removeParcialidad = (index) => {
    setParcialidades(parcialidades.filter((_, i) => i !== index))
  }

  const updateParcialidad = (index, field, value) => {
    setParcialidades(
      parcialidades.map((parcialidad, i) => {
        if (i === index) {
          const updated = { ...parcialidad, [field]: value }

          // Para proyectos DIFERIDOS, mantener el monto igual al total
          if (proyecto.formaDePago === "DIFERIDO" && field === "monto") {
            const monto = Number.parseFloat(value) || 0
            if (monto !== proyecto.montoTotal) {
              showNotification(
                "warning",
                `En proyectos DIFERIDOS, el monto debe ser exactamente ${new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(proyecto.montoTotal)}`,
              )
              updated.monto = proyecto.montoTotal
            }
          }

          return updated
        }
        return parcialidad
      }),
    )
  }

  const handleSave = async () => {
    if (!validarParcialidades()) {
      showNotification("error", "Por favor corrija los errores antes de guardar")
      return
    }

    setSaving(true)
    try {
      const totalPagado = calcularTotalPagado()
      const montoTotal = Number.parseFloat(proyecto.montoTotal)
      const isPagadoCompleto = totalPagado >= montoTotal

      const updatedProject = {
        ...proyecto,
        facturasParcialidades: parcialidades,
        facturaCerrada: isPagadoCompleto,
      }

      await proyectoService.actualizar(proyecto.id, updatedProject)

      if (isPagadoCompleto && !proyecto.facturaCerrada) {
        showNotification("success", "Parcialidades actualizadas y factura marcada como cerrada automáticamente")
      } else {
        showNotification("success", "Parcialidades actualizadas exitosamente")
      }

      await onSave()
      onClose()
    } catch (error) {
      console.error("Error al actualizar parcialidades:", error)
      const errorMessage = typeof error === "string" ? error : "Error al actualizar las parcialidades"
      showNotification("error", errorMessage)
    } finally {
      setSaving(false)
    }
  }

  // Validar en tiempo real
  useEffect(() => {
    validarParcialidades()
  }, [parcialidades])

  return (
    <div className="modal-overlay">
      <div className="modal large">
        <div className="modal-header">
          <h2>
            Editar Parcialidades - {proyecto.idCotizacion} ({proyecto.formaDePago})
          </h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="parcialidades-info">
          <div className="info-card">
            <h3>Información del Proyecto</h3>
            <p>
              <strong>Cliente:</strong> {proyecto.nombreCliente}
            </p>
            <p>
              <strong>Monto Total:</strong>{" "}
              {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(proyecto.montoTotal)}
            </p>
            <p>
              <strong>Forma de Pago:</strong> {proyecto.formaDePago}
            </p>
            <p>
              <strong>Total Asignado:</strong>{" "}
              {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(calcularTotalPagado())}
            </p>
            <p>
              <strong>Porcentaje Asignado:</strong> {calcularPorcentajePagado().toFixed(2)}%
            </p>
            <p>
              <strong>Pendiente:</strong>{" "}
              {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(
                proyecto.montoTotal - calcularTotalPagado(),
              )}
            </p>

            {proyecto.formaDePago === "DIFERIDO" && (
              <div className="tipo-pago-info diferido">
                <p>
                  <strong>📅 DIFERIDO:</strong> Un solo pago por el monto total en fecha posterior
                </p>
              </div>
            )}

            {proyecto.formaDePago === "PARCIALIDADES" && (
              <div className="tipo-pago-info parcialidades">
                <p>
                  <strong>📝 PARCIALIDADES:</strong> Múltiples pagos hasta completar el monto total
                </p>
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
              {proyecto.formaDePago === "DIFERIDO" ? "Pago Diferido" : "Parcialidades"}({parcialidades.length})
            </h3>
            <button
              type="button"
              onClick={addParcialidad}
              disabled={saving || (proyecto.formaDePago === "DIFERIDO" && parcialidades.length >= 1)}
            >
              {proyecto.formaDePago === "DIFERIDO" ? "Agregar Pago Diferido" : "Agregar Parcialidad"}
            </button>
          </div>

          {parcialidades.length === 0 && (
            <div className="empty-state">
              <p>No hay {proyecto.formaDePago === "DIFERIDO" ? "pago diferido" : "parcialidades"} configuradas</p>
              <p>
                Haga clic en el botón de arriba para agregar{" "}
                {proyecto.formaDePago === "DIFERIDO" ? "el pago" : "una parcialidad"}
              </p>
            </div>
          )}

          {parcialidades.map((parcialidad, index) => (
            <div key={index} className="parcialidad-item">
              <div className="parcialidad-header">
                <h4>{proyecto.formaDePago === "DIFERIDO" ? "Pago Diferido" : `Parcialidad ${index + 1}`}</h4>
                <button type="button" onClick={() => removeParcialidad(index)} disabled={saving} className="remove-btn">
                  Eliminar
                </button>
              </div>
              <div className="parcialidad-fields">
                <input
                  type="number"
                  placeholder="Monto"
                  value={parcialidad.monto}
                  onChange={(e) => updateParcialidad(index, "monto", e.target.value)}
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
                  onChange={(e) => updateParcialidad(index, "complementoN", e.target.value)}
                  disabled={saving}
                />
                <input
                  type="date"
                  placeholder="Fecha de Pago"
                  value={parcialidad.fechaPago}
                  onChange={(e) => updateParcialidad(index, "fechaPago", e.target.value)}
                  disabled={saving}
                  required={proyecto.formaDePago === "DIFERIDO"}
                />
                <input
                  type="text"
                  placeholder="Descripción"
                  value={parcialidad.descripcion}
                  onChange={(e) => updateParcialidad(index, "descripcion", e.target.value)}
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
          <button type="button" onClick={handleSave} disabled={saving || errors.length > 0}>
            {saving ? "Guardando..." : "Guardar Parcialidades"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ListaProyectos