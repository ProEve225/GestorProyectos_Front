import api from './api';

export const authService = {
  // Login
  async login(correo, contrasena) {
    try {
      const response = await api.post('/auth/login', {
        correo,
        contrasena
      });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify({
          correo: response.data.correo,
          nombre: response.data.nombre
        }));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Error de conexión';
    }
  },

  // Logout
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Verificar si está autenticado
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  // Obtener usuario actual
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Recuperar contraseña
  async recuperarContrasena(correo) {
    try {
      const response = await api.post('/auth/recuperar-contrasena', { correo });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Error de conexión';
    }
  },

  // Restablecer contraseña
  async restablecerContrasena(token, contrasenaNueva, confirmarContrasena) {
    try {
      const response = await api.post('/auth/restablecer-contrasena', {
        token,
        contrasenaNueva,
        confirmarContrasena
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Error de conexión';
    }
  },

  // Cambiar contraseña (usuario autenticado)
  async cambiarContrasena(contrasenaActual, contrasenaNueva, confirmarContrasena) {
    try {
      const response = await api.put('/usuario/cambiar-contrasena', {
        contrasenaActual,
        contrasenaNueva,
        confirmarContrasena
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Error de conexión';
    }
  }
};