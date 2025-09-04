// server-production.js - Servidor optimizado para producción

const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

// Detectar entorno y usar la base de datos apropiada
const isProduction = process.env.NODE_ENV === 'production';
const usePostgreSQL = isProduction && process.env.DATABASE_URL;

let database;
if (usePostgreSQL) {
    console.log('🚀 Modo producción: Usando configuración PostgreSQL');
    database = require('./database-postgres');
} else {
    console.log('🔧 Modo desarrollo: Usando configuración SQLite');
    database = require('./database');
}

const { db, dbAll, dbRun, dbGet } = database;

// Importar rutas
const productosRoutes = require('./routes/productos.routes');
const ventasRoutes = require('./routes/ventas.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

// Inicializar la aplicación Express
const app = express();
const PORT = process.env.PORT || 3001;

// Configuración de CORS para producción
const corsOptions = {
    origin: function (origin, callback) {
        // En producción, ser más estricto con los orígenes
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            'https://papeleria-sistema.onrender.com', // Tu dominio de Render
            'http://localhost:3001',
            'http://127.0.0.1:3001'
        ];
        
        if (isProduction) {
            // Solo permitir dominios específicos en producción
            if (allowedOrigins.some(allowed => origin.includes(allowed))) {
                return callback(null, true);
            } else {
                console.log('Origen no permitido en producción:', origin);
                return callback(new Error('No permitido por CORS'), false);
            }
        } else {
            // En desarrollo, ser más permisivo
            if (origin.startsWith('http://localhost:') || 
                origin.startsWith('http://127.0.0.1:') ||
                allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
        }
        
        return callback(new Error('No permitido por CORS'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use('/Front', express.static(path.join(__dirname, 'Front')));

// Ruta raíz - redireccionar al frontend
app.get('/', (req, res) => {
    res.redirect('/Front/html/index.html');
});

// Health check para Render
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        database: usePostgreSQL ? 'PostgreSQL' : 'SQLite',
        environment: process.env.NODE_ENV || 'development'
    });
});

// API Routes
app.use('/api/productos', productosRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error('❌ Error global:', err.stack);
    res.status(500).json({ 
        error: 'Error interno del servidor',
        message: isProduction ? 'Algo salió mal' : err.message
    });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Endpoint no encontrado' });
});

// Función para inicializar el servidor
async function startServer() {
    try {
        // Verificar conexión a la base de datos
        if (usePostgreSQL) {
            // Test PostgreSQL connection
            await dbAll('SELECT 1 as test');
            console.log('✅ Conexión a PostgreSQL verificada');
        } else {
            // Test SQLite connection
            await dbAll('SELECT 1 as test');
            console.log('✅ Conexión a SQLite verificada');
        }

        // Iniciar servidor
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
            console.log(`🌐 Entorno: ${process.env.NODE_ENV || 'development'}`);
            console.log(`💾 Base de datos: ${usePostgreSQL ? 'PostgreSQL' : 'SQLite'}`);
            
            if (!isProduction) {
                console.log(`🔗 URL local: http://localhost:${PORT}`);
                console.log(`📱 Frontend: http://localhost:${PORT}/Front/html/index.html`);
            }
        });

    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
        process.exit(1);
    }
}

// Manejo de cierre graceful
process.on('SIGTERM', () => {
    console.log('🛑 Recibida señal SIGTERM, cerrando servidor...');
    if (db && typeof db.close === 'function') {
        db.close((err) => {
            if (err) {
                console.error('❌ Error al cerrar la base de datos:', err);
            } else {
                console.log('✅ Base de datos cerrada correctamente');
            }
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
});

process.on('SIGINT', () => {
    console.log('🛑 Recibida señal SIGINT, cerrando servidor...');
    process.exit(0);
});

// Iniciar el servidor
startServer();

module.exports = app;
