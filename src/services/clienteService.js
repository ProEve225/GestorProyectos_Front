import api from './api';

export const clienteService = {
  // Obtener todos los clientes
  async obtenerTodos() {
    try {
      const response = await api.get('/clientes');
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Error al obtener clientes';
    }
  },

  // Obtener cliente por ID
  async obtenerPorId(id) {
    try {
      const response = await api.get(`/clientes/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Error al obtener cliente';
    }
  },

  // Crear cliente
  async crear(clienteData) {
    try {
      const response = await api.post('/clientes', clienteData);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Error al crear cliente';
    }
  },

  // Actualizar cliente
  async actualizar(id, clienteData) {
    try {
      const response = await api.put(`/clientes/${id}`, clienteData);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Error al actualizar cliente';
    }
  },

  // Eliminar cliente
  async eliminar(id) {
    try {
      const response = await api.delete(`/clientes/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Error al eliminar cliente';
    }
  }
};