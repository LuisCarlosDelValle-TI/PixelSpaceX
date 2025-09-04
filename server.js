const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const productosRoutes = require('./routes/productos.routes');
const ventasRoutes = require('./routes/ventas.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const { db, dbAll } = require('./database');

// Inicializar la aplicación Express
const app = express();
const PORT = process.env.PORT || 3001;

// Configuración de CORS mejorada
const allowedOrigins = [
    'http://localhost:5501', 
    'http://127.0.0.1:5501',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
];

const corsOptions = {
    origin: function (origin, callback) {
        // Permitir solicitudes sin 'origin' (como aplicaciones móviles o curl)
        if (!origin) return callback(null, true);
        
        // Durante desarrollo, ser más permisivo
        if (origin && (
            origin.startsWith('http://localhost:') || 
            origin.startsWith('http://127.0.0.1:') ||
            origin.startsWith('file://') ||
            allowedOrigins.indexOf(origin) !== -1
        )) {
            return callback(null, true);
        }
        
        console.log('Origen no permitido:', origin);
        const msg = 'Origen no permitido por CORS';
        return callback(new Error(msg), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar']
};

// Aplicar CORS antes de otras rutas
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir archivos estáticos desde la carpeta Front
app.use(express.static(path.join(__dirname, 'Front')));

// Rutas de la API
app.use('/api/productos', productosRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Ruta para obtener categorías
app.get('/api/categorias', async (req, res) => {
    try {
        const rows = await dbAll('SELECT * FROM Categorias ORDER BY nombre');
        res.json(rows);
    } catch (err) {
        console.error('Error al obtener categorías:', err);
        res.status(500).json({ error: 'Error al obtener las categorías' });
    }
});

// Ruta para manejar todas las demás peticiones y devolver el index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'Front', 'html', 'index.html'));
});

// Manejador de errores global
app.use((err, req, res, next) => {
    console.error('Error no manejado:', err);
    res.status(500).json({
        error: 'Error interno del servidor',
        message: err.message
    });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// Manejar el cierre de la aplicación
process.on('SIGINT', () => {
    console.log('Cerrando la conexión a la base de datos...');
    db.close((err) => {
        if (err) {
            console.error('Error al cerrar la base de datos:', err);
            process.exit(1);
        }
        console.log('Conexión a la base de datos cerrada.');
        process.exit(0);
    });
});
