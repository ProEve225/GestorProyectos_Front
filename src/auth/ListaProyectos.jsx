import React from 'react';
import '../CSS/ListaProyectos.css'

const proyectos = new Array(7).fill({
  idCliente: 'ID Cliente',
  nombreCliente: 'Ejemplo cliente',
  cotizacionId: 'COT-001',
  monto: '$12,500',
  levantamiento: 'Sí / No',
  levantamientoRealizado: 'Sí / No',
  fincado: 'Sí / No',
  fechaInicio: '01/06/2025',
  fechaTermino: '15/06/2025',
  facturado: 'Sí / No',
  tipoPago: 'PUE / Parcial / Dif',
  po: 'PO-123',
  facturaCerrada: 'Sí / No'
});

function ListaProyectos() {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <div className="contenedor-principal">
      <aside className="sidebar">
        <div className="logo">
          <img src="/logo.png" alt="Logo" />
          <h3>GP</h3>
        </div>
        <nav>
          <button>Dashboard</button>
          <button>Clientes</button>
          <button className="activo">Proyectos</button>
        </nav>
        <button className="cerrar-sesion">Cerrar Sesión</button>
      </aside>

      <main className="contenido">
        <h2>Todos los Proyectos</h2>
        <button className="btn-agregar" onClick={() => setModalVisible(true)}>Agregar Proyecto</button>
        <div className="tabla-proyectos">
          <table>
            <thead>
              <tr>
                <th>ID Cliente</th>
                <th>Nombre del Cliente</th>
                <th>Cotización (ID)</th>
                <th>Monto</th>
                <th>Levantamiento Técnico</th>
                <th>Levan. Tec. Realizado?</th>
                <th>Fincado</th>
                <th>Fecha Inicio</th>
                <th>Fecha Término</th>
                <th>Facturado</th>
                <th>Tipo de Pago</th>
                <th>PO</th>
                <th>Factura Cerrada</th>
                <th>Actualizar</th>
              </tr>
            </thead>
            <tbody>
              {proyectos.map((p, i) => (
                <tr key={i}>
                  <td>{p.idCliente}</td>
                  <td>{p.nombreCliente}</td>
                  <td>{p.cotizacionId}</td>
                  <td>{p.monto}</td>
                  <td>{p.levantamiento}</td>
                  <td>{p.levantamientoRealizado}</td>
                  <td>{p.fincado}</td>
                  <td>{p.fechaInicio}</td>
                  <td>{p.fechaTermino}</td>
                  <td>{p.facturado}</td>
                  <td>{p.tipoPago}</td>
                  <td>{p.po}</td>
                  <td>{p.facturaCerrada}</td>
                  <td><button className="btn-actualizar">Actualizar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {modalVisible && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Registro de Proyecto</h2>
              <form className="form-proyecto">
                <input placeholder="ID Cotización" />
                <div className="row">
                  <input placeholder="ID Cliente" />
                  <input placeholder="Cliente" />
                </div>
                <div className="row">
                  <label>Levantamiento Técnico</label>
                  <label><input type="radio" name="levTec" /> Sí</label>
                  <label><input type="radio" name="levTec" /> No</label>
                </div>
                <div className="row">
                  <label>Realizado</label>
                  <label><input type="radio" name="realizado" /> Sí</label>
                  <label><input type="radio" name="realizado" /> No</label>
                </div>
                <div className="row">
                  <label>Fincado</label>
                  <label><input type="radio" name="fincado" /> Sí</label>
                  <label><input type="radio" name="fincado" /> No</label>
                </div>
                <div className="row">
                  <label>Facturado</label>
                  <label><input type="radio" name="facturado" /> Sí</label>
                  <label><input type="radio" name="facturado" /> No</label>
                </div>
                <input placeholder="Monto Total" />
                <input placeholder="Fecha Inicio" />
                <input placeholder="Fecha Término" />
                <input placeholder="PO" />
                <input placeholder="Folio" />
                <div className="row">
                  <label>Tipo de Pago</label>
                  <label><input type="radio" name="pago" /> PUE</label>
                  <label><input type="radio" name="pago" /> Parcialidades</label>
                  <label><input type="radio" name="pago" /> Diferido</label>
                </div>
                <div className="row">
                  <button type="submit">Registrar</button>
                  <button type="button" onClick={() => setModalVisible(false)}>Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ListaProyectos;
