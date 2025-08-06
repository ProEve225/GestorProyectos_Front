import React, { useState } from 'react';
import { authService } from '../services/authService';
import { showNotification } from '../components/NotificationSystem';
import '../CSS/login.css';

const Login = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.login(formData.email, formData.password);
      console.log('Login exitoso:', response);
      showNotification('success', '¡Bienvenido! Has iniciado sesión correctamente');
      onLoginSuccess();
    } catch (error) {
      console.error('Error de login:', error);
      const errorMessage = typeof error === 'string' ? error : 'Credenciales incorrectas';
      showNotification('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRecovery = () => {
    setShowRecovery(true);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (showRecovery) {
    return <RecoveryPassword onBack={() => setShowRecovery(false)} />;
  }

  return (
    <div className="login-container">
      <div className="form-section">
        <div className="form-container">
          <div className="gp-logo">
            <span className="gp-text">GP</span>
          </div>
          <div>
            <p className="gp-subtitle">Gestor de proyectos</p>
          </div>
          <br/>

          <h1 className="form-title">Iniciar Sesión</h1>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">Correo Electrónico</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                placeholder="correo@dominio.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Contraseña</label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-input"
                placeholder="••••••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="forgot-password">
              <button 
                type="button" 
                className="forgot-link"
                onClick={handleRecovery}
                disabled={loading}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Iniciando...' : 'Iniciar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// Componente de recuperación de contraseña
const RecoveryPassword = ({ onBack }) => {
  const [step, setStep] = useState(1); // 1: email, 2: token
  const [formData, setFormData] = useState({
    email: '',
    token: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authService.recuperarContrasena(formData.email);
      showNotification('success', 'Se ha enviado un código a tu correo electrónico');
      setStep(2);
    } catch (error) {
      const errorMessage = typeof error === 'string' ? error : 'Error al enviar el código';
      showNotification('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.newPassword !== formData.confirmPassword) {
      showNotification('error', 'Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    try {
      await authService.restablecerContrasena(
        formData.token,
        formData.newPassword,
        formData.confirmPassword
      );
      showNotification('success', 'Contraseña restablecida exitosamente');
      setTimeout(() => onBack(), 2000);
    } catch (error) {
      const errorMessage = typeof error === 'string' ? error : 'Error al restablecer contraseña';
      showNotification('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="login-container">
      <div className="form-section">
        <div className="form-container">
          <div className="gp-logo">
            <span className="gp-text">GP</span>
          </div>
          <h1 className="form-title">
            {step === 1 ? 'Recuperar Contraseña' : 'Nueva Contraseña'}
          </h1>

          {step === 1 ? (
            <form onSubmit={handleEmailSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="email" className="form-label">Correo Electrónico</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-input"
                  placeholder="correo@dominio.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar Código'}
              </button>
            </form>
          ) : (
            <form onSubmit={handlePasswordReset} className="login-form">
              <div className="form-group">
                <label htmlFor="token" className="form-label">Código de Recuperación</label>
                <input
                  type="text"
                  id="token"
                  name="token"
                  className="form-input"
                  placeholder="A1B2C3"
                  value={formData.token}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword" className="form-label">Nueva Contraseña</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  className="form-input"
                  placeholder="••••••••••••"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">Confirmar Contraseña</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="form-input"
                  placeholder="••••••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
              </button>
            </form>
          )}

          <button className="back-button" onClick={onBack} disabled={loading}>
            ← Volver al Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;