import React, { useState, useEffect } from 'react';
import '../CSS/NotificationSystem.css';

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Escuchar eventos de notificación
    const handleNotification = (event) => {
      const { type, message, duration = 5000 } = event.detail;
      const id = Date.now() + Math.random();
      
      const notification = {
        id,
        type,
        message,
        duration
      };

      setNotifications(prev => [...prev, notification]);

      // Auto-remover después del tiempo especificado
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    };

    window.addEventListener('showNotification', handleNotification);
    
    return () => {
      window.removeEventListener('showNotification', handleNotification);
    };
  }, []);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`notification notification-${notification.type}`}
        >
          <div className="notification-content">
            <div className="notification-icon">
              {notification.type === 'success' && '✅'}
              {notification.type === 'error' && '❌'}
              {notification.type === 'warning' && '⚠️'}
              {notification.type === 'info' && 'ℹ️'}
            </div>
            <div className="notification-message">
              {notification.message}
            </div>
            <button
              className="notification-close"
              onClick={() => removeNotification(notification.id)}
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// Función helper para mostrar notificaciones
export const showNotification = (type, message, duration = 5000) => {
  const event = new CustomEvent('showNotification', {
    detail: { type, message, duration }
  });
  window.dispatchEvent(event);
};

export default NotificationSystem;