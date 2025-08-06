import React, { useState, useEffect } from 'react';
import { authService } from './services/authService';
import Login from './auth/Login';
import ListaClientes from './auth/ListaClientes';
import ListaProyectos from './auth/ListaProyectos';
import Dashboard from './components/Dashboard';
import NotificationSystem from './components/NotificationSystem';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si el usuario está autenticado al cargar la app
    const checkAuth = () => {
      try {
        const isAuth = authService.isAuthenticated();
        setIsAuthenticated(isAuth);
      } catch (error) {
        console.error('Error verificando autenticación:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentView('dashboard');
  };

  const handleNavigate = (view) => {
    setCurrentView(view);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          Cargando aplicación...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Login onLoginSuccess={handleLoginSuccess} />
        <NotificationSystem />
      </>
    );
  }

  // Renderizar la vista actual
  const renderCurrentView = () => {
    switch (currentView) {
      case 'clientes':
        return (
          <ListaClientes 
            onNavigate={handleNavigate} 
            onLogout={handleLogout} 
          />
        );
      case 'proyectos':
        return (
          <ListaProyectos 
            onNavigate={handleNavigate} 
            onLogout={handleLogout} 
          />
        );
      case 'dashboard':
      default:
        return (
          <Dashboard 
            onNavigate={handleNavigate} 
            onLogout={handleLogout} 
          />
        );
    }
  };

  return (
    <div className="App">
      {renderCurrentView()}
      <NotificationSystem />
    </div>
  );
}

export default App;