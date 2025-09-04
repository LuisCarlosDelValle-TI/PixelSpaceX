# 📚 Sistema de Gestión para Papelería

Un sistema completo de punto de venta (POS) y gestión de inventario diseñado específicamente para papelerías y negocios similares.

![Versión](https://img.shields.io/badge/versión-1.0.0-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-16%2B-green.svg)
![Express](https://img.shields.io/badge/Express-4.21.2-lightgrey.svg)
![SQLite](https://img.shields.io/badge/SQLite-3-orange.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.11-blue.svg)

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Uso](#-uso)
- [API Endpoints](#-api-endpoints)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Configuración](#-configuración)
- [Contribución](#-contribución)
- [Licencia](#-licencia)

## ✨ Características

### 🏪 Punto de Venta (POS)
- ✅ Interfaz intuitiva para ventas rápidas
- ✅ Búsqueda de productos por código de barras o nombre
- ✅ Carrito de compras en tiempo real
- ✅ Cálculo automático de totales e impuestos
- ✅ Historial de ventas detallado

### 📦 Gestión de Inventario
- ✅ Registro y edición de productos
- ✅ Control de stock en tiempo real
- ✅ Alertas de stock bajo
- ✅ Categorización de productos
- ✅ Gestión de precios (venta y mayoreo)

### 📊 Dashboard y Reportes
- ✅ Panel de control con métricas en tiempo real
- ✅ Gráficos de ventas por período
- ✅ Productos más vendidos
- ✅ Reportes de inventario
- ✅ Estadísticas de desempeño

### 🎨 Interfaz de Usuario
- ✅ Diseño responsive (móvil y desktop)
- ✅ Interfaz moderna con TailwindCSS
- ✅ Navegación SPA (Single Page Application)
- ✅ Componentes reutilizables
- ✅ Experiencia de usuario optimizada

## 🛠 Tecnologías

### Backend
- **Node.js** - Entorno de ejecución de JavaScript
- **Express.js** - Framework web minimalista
- **SQLite** - Base de datos ligera y eficiente
- **UUID** - Generación de identificadores únicos
- **CORS** - Manejo de solicitudes entre dominios

### Frontend
- **HTML5/CSS3** - Estructura y estilos base
- **JavaScript ES6+** - Lógica del cliente
- **TailwindCSS** - Framework CSS utilitario
- **Font Awesome** - Iconografía
- **Chart.js** - Gráficos y visualizaciones
- **SweetAlert2** - Alertas y modales elegantes

### Herramientas de Desarrollo
- **Nodemon** - Reinicio automático del servidor
- **PostCSS** - Procesamiento de CSS
- **Autoprefixer** - Prefijos CSS automáticos

## 📋 Requisitos Previos

Antes de instalar y ejecutar el proyecto, asegúrate de tener:

- **Node.js** (versión 16 o superior)
- **npm** (generalmente incluido con Node.js)
- **Git** (para clonar el repositorio)

## 🚀 Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/LuisCarlosDelValle-TI/PixelSpaceX.git
cd PixelSpaceX
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar la base de datos
El sistema creará automáticamente la base de datos SQLite al ejecutarse por primera vez.

### 4. Compilar estilos (opcional)
```bash
npm run build-css
```

### 5. Iniciar el servidor
```bash
# Modo desarrollo (con nodemon)
npm run dev

# Modo producción
npm start
```

El servidor se ejecutará en `http://localhost:3001`

## 🖥 Uso

### Acceso al Sistema
1. Abre tu navegador web
2. Ve a `http://localhost:3001/Front/html/index.html`
3. Serás dirigido al dashboard principal

### Navegación Principal

#### 🏠 Dashboard
- Visualiza métricas generales del negocio
- Gráficos de ventas y tendencias
- Productos con stock bajo
- Resumen de actividad reciente

#### 🛒 Punto de Venta
- Busca productos por código de barras o nombre
- Agrega productos al carrito
- Aplica descuentos si es necesario
- Procesa la venta y genera recibo

#### 📦 Gestión de Productos
- **Agregar**: Registra nuevos productos con toda su información
- **Editar**: Modifica datos existentes (precio, stock, categoría)
- **Eliminar**: Remueve productos del sistema
- **Buscar/Filtrar**: Encuentra productos rápidamente

#### 📊 Reportes
- Ventas por período
- Productos más vendidos
- Análisis de inventario
- Reportes financieros

### Flujo de Trabajo Típico

1. **Configuración inicial**: Registra tus productos en la sección de inventario
2. **Ventas diarias**: Usa el POS para procesar transacciones
3. **Monitoreo**: Revisa el dashboard para métricas en tiempo real
4. **Gestión**: Actualiza precios y stock según sea necesario
5. **Análisis**: Genera reportes para tomar decisiones informadas

## 🔌 API Endpoints

### Productos
```http
GET    /api/productos          # Obtener todos los productos
POST   /api/productos          # Crear nuevo producto
GET    /api/productos/:id      # Obtener producto específico
PUT    /api/productos/:id      # Actualizar producto
DELETE /api/productos/:id      # Eliminar producto
```

### Ventas
```http
GET    /api/ventas             # Obtener todas las ventas
POST   /api/ventas             # Registrar nueva venta
GET    /api/ventas/:id         # Obtener venta específica
GET    /api/ventas/fecha/:fecha # Ventas por fecha
```

### Dashboard
```http
GET    /api/dashboard/stats           # Estadísticas generales
GET    /api/dashboard/popular-products # Productos populares
GET    /api/dashboard/low-stock       # Productos con stock bajo
GET    /api/dashboard/services-stats  # Estadísticas de servicios
```

### Ejemplo de Uso de API

```javascript
// Crear un nuevo producto
fetch('http://localhost:3001/api/productos', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        codigo_barras: '123456789',
        nombre: 'Cuaderno Profesional',
        categoria: 'Escolar',
        precio_venta: 25.50,
        costo_unitario: 15.00,
        stock_actual: 100,
        stock_minimo: 10
    })
});
```

## 📁 Estructura del Proyecto

```
Papeleria/
├── 📁 Front/                    # Frontend de la aplicación
│   ├── 📁 css/                  # Estilos compilados
│   ├── 📁 html/                 # Páginas principales
│   │   └── index.html           # Página principal
│   ├── 📁 js/                   # Scripts del cliente
│   │   ├── dashboard.js         # Lógica del dashboard
│   │   ├── inventario.js        # Gestión de productos
│   │   ├── ventas.js            # Punto de venta
│   │   ├── script.js            # Navegación y utilidades
│   │   └── index.js             # Inicialización
│   └── 📁 views/                # Vistas parciales
│       ├── dashboard.html       # Vista del dashboard
│       ├── inventario.html      # Vista de productos
│       ├── ventas.html          # Vista de ventas
│       └── reportes.html        # Vista de reportes
├── 📁 routes/                   # Rutas del API
│   ├── productos.routes.js      # Endpoints de productos
│   ├── ventas.routes.js         # Endpoints de ventas
│   └── dashboard.routes.js      # Endpoints del dashboard
├── 📁 src/                      # Archivos fuente
│   └── input.css                # Estilos base de Tailwind
├── 📄 server.js                 # Servidor principal
├── 📄 database.js               # Configuración de base de datos
├── 📄 package.json              # Dependencias del proyecto
├── 📄 tailwind.config.js        # Configuración de Tailwind
├── 📄 pos.db                    # Base de datos SQLite
└── 📄 README.md                 # Este archivo
```

## ⚙️ Configuración

### Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto (opcional):

```env
PORT=3001
NODE_ENV=development
DB_PATH=./pos.db
```

### Configuración de Base de Datos
El sistema utiliza SQLite y crea automáticamente las siguientes tablas:

- **productos**: Información de productos
- **ventas**: Registro de transacciones
- **detalle_ventas**: Detalles de cada venta
- **usuarios**: Sistema de usuarios (futuro)

### Personalización de Estilos
Modifica `tailwind.config.js` para personalizar colores y temas:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#10B981',
        // Agrega tus colores personalizados
      }
    }
  }
}
```

## 🔧 Scripts Disponibles

```bash
# Iniciar servidor en modo desarrollo
npm run dev

# Iniciar servidor en modo producción
npm start

# Compilar CSS de Tailwind
npm run build-css

# Modo watch para CSS (desarrollo)
npm run watch-css

# Ejecutar tests (cuando estén disponibles)
npm test
```

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Por favor sigue estos pasos:

1. **Fork** el repositorio
2. Crea una **rama de feature** (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. Abre un **Pull Request**

### Guías de Contribución

- Mantén el código limpio y bien documentado
- Sigue las convenciones de nomenclatura existentes
- Agrega tests para nuevas funcionalidades
- Actualiza la documentación según sea necesario

## 🐛 Reporte de Bugs

Si encuentras un bug, por favor crea un issue incluyendo:

- Descripción clara del problema
- Pasos para reproducir el error
- Comportamiento esperado vs actual
- Screenshots si es aplicable
- Información del entorno (SO, navegador, versión de Node.js)

## 📈 Roadmap

### Versión 1.1 (Próxima)
- [ ] Sistema de usuarios y autenticación
- [ ] Backup automático de base de datos
- [ ] Exportación de reportes a PDF/Excel
- [ ] Notificaciones push
- [ ] Modo offline

### Versión 1.2 (Futuro)
- [ ] Integración con lectores de código de barras
- [ ] Sistema de proveedores
- [ ] Facturación electrónica
- [ ] App móvil companion
- [ ] Integración con sistemas de pago

## 📞 Soporte

Si necesitas ayuda o tienes preguntas:

- 📧 Email: [tu-email@ejemplo.com]
- 🐛 Issues: [GitHub Issues](https://github.com/LuisCarlosDelValle-TI/PixelSpaceX/issues)
- 📖 Wiki: [Documentación extendida](https://github.com/LuisCarlosDelValle-TI/PixelSpaceX/wiki)

## 📄 Licencia

Este proyecto está bajo la Licencia ISC. Ver el archivo `LICENSE` para más detalles.

---

## 🙏 Agradecimientos

- **TailwindCSS** - Por el excelente framework CSS
- **Express.js** - Por el robusto framework web
- **SQLite** - Por la base de datos confiable
- **Font Awesome** - Por los iconos increíbles
- **Chart.js** - Por las visualizaciones de datos

---

<div align="center">

**⭐ Si este proyecto te ha sido útil, considera darle una estrella en GitHub ⭐**

[⬆ Volver al inicio](#-sistema-de-gestión-para-papelería)

</div>
