import { useState } from "react"
import { Download, X, BarChart3, DollarSign, Edit3, FileSpreadsheet } from "lucide-react"
import ExcelJS from "exceljs"

const ExcelExportModal = ({ isOpen, onClose, proyectos, onExport }) => {
  const [dateFilter, setDateFilter] = useState({
    type: "all",
    startDate: "",
    endDate: "",
  })

  const handleDateFilterChange = (type) => {
    setDateFilter({ type, startDate: "", endDate: "" })
  }

  const handleCustomDateChange = (field, value) => {
    setDateFilter((prev) => ({ ...prev, [field]: value }))
  }

  const filterProjectsByDate = (proyectos) => {
    if (dateFilter.type === "all") return proyectos

    const now = new Date()
    const dateRanges = {
      thisMonth: [new Date(now.getFullYear(), now.getMonth(), 1), new Date(now.getFullYear(), now.getMonth() + 1, 0)],
      lastMonth: [new Date(now.getFullYear(), now.getMonth() - 1, 1), new Date(now.getFullYear(), now.getMonth(), 0)],
      thisYear: [new Date(now.getFullYear(), 0, 1), new Date(now.getFullYear(), 11, 31)],
      lastYear: [new Date(now.getFullYear() - 1, 0, 1), new Date(now.getFullYear() - 1, 11, 31)],
      custom:
        dateFilter.startDate && dateFilter.endDate
          ? [new Date(dateFilter.startDate), new Date(dateFilter.endDate)]
          : null,
    }

    const [startDate, endDate] = dateRanges[dateFilter.type] || [null, null]
    if (!startDate || !endDate) return proyectos

    return proyectos.filter((proyecto) => {
      const fechaCreacion = new Date(proyecto.fechaCreacion || proyecto.fechaInicio)
      return fechaCreacion >= startDate && fechaCreacion <= endDate
    })
  }

  const getDateFilterLabel = () => {
    const labels = {
      thisMonth: "Este Mes",
      lastMonth: "Mes Anterior",
      thisYear: "Este Año",
      lastYear: "Año Anterior",
      custom: "Rango Personalizado",
    }
    return labels[dateFilter.type] || "Todos los Tiempos"
  }

  const calcularTotalPagado = (proyecto) => {
    if (!proyecto.facturasParcialidades?.length) return 0
    return proyecto.facturasParcialidades.reduce((sum, p) => sum + (Number.parseFloat(p.monto) || 0), 0)
  }

  const calcularDatosProyecto = (proyecto) => {
    const esPUE = proyecto.formaDePago === "PUE"
    const facturaCerrada = proyecto.facturaCerrada
    const totalPagadoBase = calcularTotalPagado(proyecto)

    return {
      totalPagado: esPUE && facturaCerrada ? proyecto.montoTotal : totalPagadoBase,
      saldoPendiente: esPUE && facturaCerrada ? 0 : proyecto.montoTotal - totalPagadoBase,
      porcentajePagado: esPUE
        ? facturaCerrada
          ? 100
          : 0
        : proyecto.montoTotal > 0
          ? (totalPagadoBase / proyecto.montoTotal) * 100
          : 0,
    }
  }

  const aplicarEstilosHeader = (row, color = "FF2563EB") => {
    row.eachCell((cell) => {
      Object.assign(cell, {
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: color } },
        font: { color: { argb: "FFFFFFFF" }, bold: true, size: 12 },
        alignment: { vertical: "middle", horizontal: "center" },
        border: {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        },
      })
    })
  }

  const aplicarEstilosFilas = (row, index, numericColumns = [], fillColor = "FFF9FAFB") => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FFD1D5DB" } },
        left: { style: "thin", color: { argb: "FFD1D5DB" } },
        bottom: { style: "thin", color: { argb: "FFD1D5DB" } },
        right: { style: "thin", color: { argb: "FFD1D5DB" } },
      }
      cell.alignment = { vertical: "middle", horizontal: "left" }

      if (index % 2 === 1) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: fillColor } }
      }
    })

    numericColumns.forEach((colKey) => {
      const cell = row.getCell(colKey)
      if (cell) cell.alignment = { vertical: "middle", horizontal: "center" }
    })
  }

  const formatearFechaProyecto = (fecha) => {
    if (!fecha) return "N/A"
    try {
      const fechaObj = new Date(fecha)
      return !isNaN(fechaObj.getTime()) ? fechaObj.toLocaleDateString("es-MX") : "N/A"
    } catch {
      return fecha.toString()
    }
  }

  const formatearFechaParcialidad = (fecha) => {
    if (!fecha) return "N/A"
    try {
      let fechaString = fecha.toString()
      if (fechaString.includes("-") && !fechaString.includes("T")) {
        fechaString += "T00:00:00"
      }
      const fechaObj = new Date(fechaString)
      return !isNaN(fechaObj.getTime()) ? fechaObj.toLocaleDateString("es-MX") : "N/A"
    } catch {
      return fecha.toString()
    }
  }

  const handleExport = async () => {
    const filteredProyectos = filterProjectsByDate(proyectos)
    const workbook = new ExcelJS.Workbook()

    workbook.creator = "Sistema de Gestión de Proyectos"
    workbook.created = new Date()

    const proyectosSheet = workbook.addWorksheet("Proyectos")
    const proyectosColumns = [
      { header: "ID Cliente", key: "idCliente", width: 12 },
      { header: "Nombre del Cliente", key: "nombreCliente", width: 25 },
      { header: "Cotización (ID)", key: "idCotizacion", width: 15 },
      { header: "Monto", key: "monto", width: 15 },
      { header: "Levantamiento Técnico", key: "levantamientoTecnico", width: 20 },
      { header: "Realizado", key: "realizado", width: 12 },
      { header: "Fincado", key: "fincado", width: 12 },
      { header: "Fecha Inicio", key: "fechaInicio", width: 15 },
      { header: "Fecha Término", key: "fechaTermino", width: 15 },
      { header: "Orden de compra", key: "ordenCompra", width: 18 },
      { header: "Forma de pago", key: "formaDePago", width: 15 },
      { header: "Facturado", key: "facturado", width: 12 },
      { header: "Parcialidades Pagadas", key: "parcialidadesPagadas", width: 20 },
      { header: "% Pagado", key: "porcentajePagado", width: 12 },
      { header: "PO", key: "po", width: 15 },
      { header: "Total pagado", key: "totalPagado", width: 15 },
      { header: "Saldo pendiente", key: "saldoPendiente", width: 15 },
      { header: "Factura Cerrada", key: "facturaCerrada", width: 15 },
    ]

    proyectosSheet.columns = proyectosColumns
    aplicarEstilosHeader(proyectosSheet.getRow(1))

    const numericColumnsProyectos = [
      "monto",
      "parcialidadesPagadas",
      "porcentajePagado",
      "totalPagado",
      "saldoPendiente",
    ]

    filteredProyectos.forEach((proyecto, index) => {
      const datos = calcularDatosProyecto(proyecto)
      const row = proyectosSheet.addRow({
        idCliente: proyecto.idCliente,
        nombreCliente: proyecto.nombreCliente,
        idCotizacion: proyecto.idCotizacion,
        monto: proyecto.montoTotal,
        levantamientoTecnico: proyecto.requiereLevantamientoTecnico ? "Sí" : "No",
        realizado: proyecto.realizado ? "Sí" : "No",
        fincado: proyecto.fincado ? "Sí" : "No",
        fechaInicio: formatearFechaProyecto(proyecto.fechaInicio),
        fechaTermino: formatearFechaProyecto(proyecto.fechaTermino),
        ordenCompra: proyecto.ordenCompra || "N/A",
        formaDePago: proyecto.formaDePago,
        facturado: proyecto.facturado ? "Sí" : "No",
        parcialidadesPagadas: proyecto.facturasParcialidades?.length || 0,
        porcentajePagado: datos.porcentajePagado.toFixed(2) + "%",
        po: proyecto.ordenCompra || "N/A",
        totalPagado: datos.totalPagado,
        saldoPendiente: datos.saldoPendiente,
        facturaCerrada: proyecto.facturaCerrada ? "Sí" : "No",
      })

      aplicarEstilosFilas(row, index, numericColumnsProyectos)
    })

    const parcialidadesData = filteredProyectos.flatMap(
      (proyecto) =>
        proyecto.facturasParcialidades?.map((parcialidad, index) => ({
          idCliente: proyecto.idCliente,
          nombreCliente: proyecto.nombreCliente,
          idCotizacion: proyecto.idCotizacion,
          parcialidadNum: index + 1,
          montoParcialidad: parcialidad.monto,
          fechaParcialidad: formatearFechaParcialidad(parcialidad.fechaPago),
          descripcion: parcialidad.descripcion || "N/A",
          montoTotalProyecto: proyecto.montoTotal,
          formaDePago: proyecto.formaDePago,
        })) || [],
    )

    if (parcialidadesData.length > 0) {
      const parcialidadesSheet = workbook.addWorksheet("Parcialidades")
      parcialidadesSheet.columns = [
        { header: "ID Cliente", key: "idCliente", width: 12 },
        { header: "Nombre del Cliente", key: "nombreCliente", width: 25 },
        { header: "Cotización (ID)", key: "idCotizacion", width: 15 },
        { header: "Parcialidad #", key: "parcialidadNum", width: 15 },
        { header: "Monto Parcialidad", key: "montoParcialidad", width: 18 },
        { header: "Fecha Parcialidad", key: "fechaParcialidad", width: 18 },
        { header: "Descripción", key: "descripcion", width: 30 },
        { header: "Monto Total Proyecto", key: "montoTotalProyecto", width: 20 },
        { header: "Forma de Pago", key: "formaDePago", width: 15 },
      ]

      aplicarEstilosHeader(parcialidadesSheet.getRow(1), "FF059669")

      const numericColumnsParcialidades = ["parcialidadNum", "montoParcialidad", "montoTotalProyecto"]
      parcialidadesData.forEach((parcialidad, index) => {
        const row = parcialidadesSheet.addRow(parcialidad)
        aplicarEstilosFilas(row, index, numericColumnsParcialidades, "FFF0FDF4")
      })
    }

    const now = new Date()
    const dateString = now.toISOString().split("T")[0]
    const filterLabel = getDateFilterLabel().replace(/\s+/g, "_")
    const fileName = `Proyectos_${filterLabel}_${dateString}.xlsx`

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = fileName
    link.click()
    window.URL.revokeObjectURL(url)

    onClose()
  }

  if (!isOpen) return null

  const filteredCount = filterProjectsByDate(proyectos).length

  return (
    <div className="modal-overlay">
      <div className="modal-content export-modal">
        <div className="modal-header export-header">
          <div className="header-content">
            <FileSpreadsheet size={24} className="header-icon" />
            <h3>Exportar Proyectos a Excel</h3>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="export-modal-body">
          <div className="export-info">
            <p className="export-description">Selecciona el rango de fechas para exportar los proyectos</p>
            <div className="export-stats">
              <BarChart3 size={18} className="stats-icon" />
              <span>
                Proyectos a exportar: <strong>{filteredCount}</strong>
              </span>
            </div>
          </div>

          <div className="date-filter-section">
            <h4>Filtro de Fechas</h4>
            <div className="filter-options">
              {[
                { key: "all", label: "Todos" },
                { key: "thisMonth", label: "Este Mes" },
                { key: "lastMonth", label: "Mes Anterior" },
                { key: "thisYear", label: "Este Año" },
                { key: "lastYear", label: "Año Anterior" },
                { key: "custom", label: "Personalizado" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  className={`filter-option ${dateFilter.type === key ? "active" : ""}`}
                  onClick={() => handleDateFilterChange(key)}
                >
                  {label}
                </button>
              ))}
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

          <div className="export-details">
            <h4>El archivo Excel incluirá:</h4>
            <ul>
              <li>
                <BarChart3 size={16} className="detail-icon" />
                <div>
                  <strong>Hoja "Proyectos":</strong> Todos los datos de la tabla principal
                </div>
              </li>
              <li>
                <DollarSign size={16} className="detail-icon" />
                <div>
                  <strong>Hoja "Parcialidades":</strong> Detalle de todas las parcialidades de pago
                </div>
              </li>
              <li>
                <Edit3 size={16} className="detail-icon" />
                <div>
                  <strong>Formato editable:</strong> Podrás modificar los datos en Excel
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="export-btn"
            onClick={handleExport}
            disabled={dateFilter.type === "custom" && (!dateFilter.startDate || !dateFilter.endDate)}
          >
            <Download size={16} />
            Exportar a Excel ({filteredCount} proyectos)
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExcelExportModal