import api from './api';

export const proyectoService = {
  // Obtener todos los proyectos
  async obtenerTodos() {
    try {
      const response = await api.get('/proyectos');
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Error al obtener proyectos';
    }
  },

  // Obtener proyecto por ID
  async obtenerPorId(id) {
    try {
      const response = await api.get(`/proyectos/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Error al obtener proyecto';
    }
  },

  // Obtener proyectos por cliente
  async obtenerPorCliente(idCliente) {
    try {
      const response = await api.get(`/proyectos/cliente/${idCliente}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Error al obtener proyectos del cliente';
    }
  },

  // Crear proyecto
  async crear(proyectoData) {
    try {
      const response = await api.post('/proyectos', proyectoData);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Error al crear proyecto';
    }
  },

  // Actualizar proyecto
  async actualizar(id, proyectoData) {
    try {
      const response = await api.put(`/proyectos/${id}`, proyectoData);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Error al actualizar proyecto';
    }
  },

  // Eliminar proyecto
  async eliminar(id) {
    try {
      const response = await api.delete(`/proyectos/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Error al eliminar proyecto';
    }
  }
};