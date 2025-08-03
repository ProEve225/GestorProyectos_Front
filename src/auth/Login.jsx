import React, { useState } from 'react';
import '../CSS/login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempt:', { email, password });
  };

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
                className="form-input"
                placeholder="mail@abc.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Contraseña</label>
              <input
                type="password"
                id="password"
                className="form-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="submit-button">
              Iniciar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
