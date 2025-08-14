# 🌐 ESIES Frontend - Sistema de Gestión Empresarial

Sistema de gestión de proyectos desarrollado en React para E.S.I.E.S. Interfaz moderna y responsiva para la gestión completa de clientes y proyectos con diferentes modalidades de pago.

## 🚀 Características Principales

- ✅ **Autenticación JWT** con gestión de sesiones segura
- ✅ **Dashboard interactivo** con estadísticas en tiempo real
- ✅ **Gestión completa de clientes** con operaciones CRUD
- ✅ **Gestión avanzada de proyectos** con tres modalidades de pago
- ✅ **Filtros de fecha** para análisis temporal
- ✅ **Exportación a Excel** con filtros personalizados
- ✅ **Modales elegantes** para todas las operaciones
- ✅ **Validaciones en tiempo real** con feedback visual
- ✅ **Sidebar personalizado** con imagen de fondo

## 🛠️ Tecnologías Utilizadas

- **React** - Framework principal
- **JavaScript ES6+** - Lenguaje de programación
- **CSS3** - Estilos y diseño responsivo
- **Lucide React** - Iconografía moderna
- **ExcelJS** - Exportación de datos a Excel
- **Fetch API** - Comunicación con backend
- **JWT** - Autenticación y autorización

## 📋 Funcionalidades Detalladas

### 🔐 Sistema de Autenticación
- Login seguro con JWT
- Gestión automática de tokens
- Redirección inteligente según estado de autenticación
- Logout con limpieza de sesión
- Cambio de contraseña desde cualquier pantalla

### 📊 Dashboard Interactivo
- **Estadísticas en tiempo real:**
  - Total de proyectos
  - Proyectos facturados
  - Proyectos pendientes
  - Monto total de proyectos
- **Filtros de fecha:**
  - Todos los tiempos
  - Este mes
  - Mes anterior
  - Este año
  - Año anterior
  - Rango personalizado
- **Navegación rápida** a otras secciones

### 👥 Gestión de Clientes
- **CRUD completo:** Crear, leer, actualizar y eliminar
- **Campos completos:** ID, nombre, correo, contacto
- **Búsqueda en tiempo real** por cualquier campo
- **Paginación inteligente** para grandes volúmenes
- **Modal de detalles** elegante para visualización
- **Validaciones completas** en formularios

### 📈 Gestión Avanzada de Proyectos

#### Modalidades de Pago Soportadas:

**1. PUE (Pago en Una Exhibición)**
- Creación sin pago inicial
- Campos opcionales de monto y fecha de pago
- Validación automática de montos
- Cierre automático de factura al pagar

**2. PARCIALIDADES (Múltiples Pagos)**
- Creación flexible sin parcialidades iniciales
- Agregar parcialidades una por una
- Validación de montos no excedentes
- Conteo automático de parcialidades
- Cálculo de porcentajes en tiempo real

**3. DIFERIDO (Pago Diferido)**
- Un solo pago en fecha posterior
- Validación de monto igual al total
- Seguimiento de fecha de pago

#### Características de Proyectos:
- **Tabla completa** con todas las columnas relevantes
- **Filtros de fecha** integrados con búsqueda
- **Columnas dinámicas:**
  - Parcialidades pagadas (conteo)
  - Porcentaje pagado (visual)
- **Modales especializados** para cada operación
- **Validaciones inteligentes** por tipo de pago

### 📤 Exportación a Excel
- **Modal de filtros** para selección de datos
- **Dos hojas separadas:** PROYECTOS y PARCIALIDADES
- **Formato profesional** con colores y estilos
- **Filtros de fecha** aplicables a la exportación

### 🎨 Diseño y UX
- **Sidebar personalizado** con imagen de fondo
- **Colores consistentes** en tema azul corporativo
- **Iconografía moderna** con Lucide React
- **Animaciones suaves** en interacciones
- **Feedback visual** para todas las acciones
- **Diseño responsivo** para todos los dispositivos

## ⚙️ Instalación y Configuración

### Prerrequisitos
- Node.js 16+ 
- npm o yarn
- Backend Spring Boot ejecutándose en puerto 8080

### Pasos de Instalación

1. **Clonar el repositorio**
\`\`\`bash
git clone [URL_DEL_REPOSITORIO]
cd esies-frontend
\`\`\`

2. **Instalar dependencias**
\`\`\`bash
npm install
\`\`\`

3. **Configurar variables de entorno**
\`\`\`bash
# Crear archivo .env en la raíz
REACT_APP_API_URL=http://localhost:8080/api
\`\`\`

4. **Ejecutar la aplicación**
\`\`\`bash
npm start
\`\`\`

5. **La aplicación estará disponible en:** `http://localhost:3000`

## 🔧 Configuración del Backend

Asegúrate de que el backend Spring Boot esté ejecutándose con:
- **Puerto:** 8080
- **CORS habilitado** para `http://localhost:3000`
- **Base de datos MongoDB** configurada
- **Endpoints API** funcionando correctamente

## 📱 Pantallas Principales

### 1. Login
- Autenticación con correo y contraseña
- Validación de campos en tiempo real
- Redirección automática al dashboard
- Manejo de errores de autenticación

### 2. Dashboard
- Estadísticas principales del negocio
- Filtros de fecha interactivos
- Navegación rápida a otras secciones
- Información del usuario logueado

### 3. Lista de Clientes
- Tabla completa con todos los clientes
- Búsqueda instantánea
- Paginación automática
- Operaciones CRUD completas
- Modal de detalles elegante

### 4. Lista de Proyectos
- Tabla avanzada con múltiples columnas
- Filtros de fecha y búsqueda combinados
- Gestión de parcialidades por proyecto
- Exportación a Excel
- Validaciones específicas por tipo de pago

## 🔌 Integración con API

### Endpoints Utilizados

**Autenticación:**
- `POST /api/login` - Autenticación de usuario

**Clientes:**
- `GET /api/clientes` - Obtener todos los clientes
- `POST /api/clientes` - Crear nuevo cliente
- `PUT /api/clientes/{id}` - Actualizar cliente
- `DELETE /api/clientes/{id}` - Eliminar cliente

**Proyectos:**
- `GET /api/proyectos` - Obtener todos los proyectos
- `POST /api/proyectos` - Crear nuevo proyecto
- `PUT /api/proyectos/{id}` - Actualizar proyecto
- `DELETE /api/proyectos/{id}` - Eliminar proyecto

### Manejo de Errores
- Interceptores para errores HTTP
- Notificaciones visuales de errores
- Manejo de tokens expirados
- Validación de respuestas del servidor

## 🎯 Características Avanzadas

### Validaciones Inteligentes
- **Por tipo de pago:** Lógica específica para cada modalidad
- **En tiempo real:** Feedback inmediato al usuario
- **Montos:** Validación de no exceder totales
- **Campos requeridos:** Indicadores visuales claros

### Exportación Avanzada
- **Filtros aplicables:** Exportar solo datos filtrados
- **Formato profesional:** Estilos corporativos en Excel
- **Múltiples hojas:** Separación lógica de datos
- **Cálculos automáticos:** Totales y porcentajes

## 📊 Métricas y Análisis

### Dashboard Analytics
- **Proyectos totales:** Conteo con filtros de fecha
- **Facturación:** Seguimiento de proyectos facturados
- **Pendientes:** Control de proyectos sin cerrar
- **Montos:** Análisis financiero por períodos

## 🔒 Seguridad

### Autenticación
- **JWT tokens** con expiración automática
- **Interceptores** para renovación de tokens
- **Logout automático** en caso de inactividad
- **Validación** en cada petición al servidor

### Validación de Datos
- **Frontend:** Validación inmediata en formularios
- **Backend:** Validación adicional en servidor
- **Sanitización:** Limpieza de inputs del usuario
- **Tipos de datos:** Validación estricta de formatos

## 🚀 Optimizaciones

### Performance
- **Lazy loading** de componentes grandes
- **Paginación** para listas extensas
- **Debounce** en búsquedas en tiempo real
- **Caché local** para datos frecuentes

### UX/UI
- **Loading states** en todas las operaciones
- **Feedback visual** para acciones del usuario
- **Animaciones suaves** en transiciones
- **Diseño responsivo** para todos los dispositivos

## 📄 Licencia

Este proyecto está desarrollado para uso interno de E.S.I.E.S.

## 📞 Contacto

Para dudas o soporte:
- 📧 Email: [20233tn098@utez.edu.mx]
---

**Desarrollado para E.S.I.E.S.**