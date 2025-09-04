// database-postgres.js - Configuración alternativa para PostgreSQL en producción

const { Pool } = require('pg');

// Configuración de base de datos
const isProduction = process.env.NODE_ENV === 'production';

let db;

if (isProduction && process.env.DATABASE_URL) {
    // Configuración para PostgreSQL en producción (Render, Heroku, etc.)
    db = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });
    console.log('🐘 Conectado a PostgreSQL en producción');
} else {
    // Fallback a SQLite para desarrollo local
    const sqlite3 = require('sqlite3').verbose();
    const path = require('path');
    
    const dbPath = path.join(__dirname, 'pos.db');
    db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('❌ Error al conectar con SQLite:', err.message);
        } else {
            console.log('✅ Conectado a la base de datos SQLite');
        }
    });
}

// Funciones auxiliares promisificadas
async function dbRun(sql, params = []) {
    return new Promise((resolve, reject) => {
        if (isProduction && process.env.DATABASE_URL) {
            // PostgreSQL
            db.query(sql, params, (err, result) => {
                if (err) {
                    console.error('❌ Error en dbRun (PostgreSQL):', err);
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        } else {
            // SQLite
            db.run(sql, params, function(err) {
                if (err) {
                    console.error('❌ Error en dbRun (SQLite):', err);
                    reject(err);
                } else {
                    resolve({ lastID: this.lastID, changes: this.changes });
                }
            });
        }
    });
}

async function dbGet(sql, params = []) {
    return new Promise((resolve, reject) => {
        if (isProduction && process.env.DATABASE_URL) {
            // PostgreSQL
            db.query(sql, params, (err, result) => {
                if (err) {
                    console.error('❌ Error en dbGet (PostgreSQL):', err);
                    reject(err);
                } else {
                    resolve(result.rows[0] || null);
                }
            });
        } else {
            // SQLite
            db.get(sql, params, (err, row) => {
                if (err) {
                    console.error('❌ Error en dbGet (SQLite):', err);
                    reject(err);
                } else {
                    resolve(row || null);
                }
            });
        }
    });
}

async function dbAll(sql, params = []) {
    return new Promise((resolve, reject) => {
        if (isProduction && process.env.DATABASE_URL) {
            // PostgreSQL
            db.query(sql, params, (err, result) => {
                if (err) {
                    console.error('❌ Error en dbAll (PostgreSQL):', err);
                    reject(err);
                } else {
                    resolve(result.rows || []);
                }
            });
        } else {
            // SQLite
            db.all(sql, params, (err, rows) => {
                if (err) {
                    console.error('❌ Error en dbAll (SQLite):', err);
                    reject(err);
                } else {
                    resolve(rows || []);
                }
            });
        }
    });
}

// Inicialización del esquema
async function initializeDatabase() {
    try {
        if (isProduction && process.env.DATABASE_URL) {
            // Esquemas para PostgreSQL
            await initializePostgreSQL();
        } else {
            // Esquemas para SQLite
            await initializeSQLite();
        }
        console.log('✅ Esquema de base de datos verificado y actualizado.');
    } catch (error) {
        console.error('❌ Error al inicializar la base de datos:', error);
    }
}

async function initializePostgreSQL() {
    // Crear tablas para PostgreSQL
    const createTables = [
        `CREATE TABLE IF NOT EXISTS productos (
            id_producto SERIAL PRIMARY KEY,
            codigo_barras VARCHAR(255) UNIQUE,
            categoria VARCHAR(100),
            nombre VARCHAR(255) NOT NULL,
            descripcion TEXT,
            precio_venta DECIMAL(10,2) NOT NULL,
            precio_mayoreo DECIMAL(10,2),
            costo_unitario DECIMAL(10,2) NOT NULL,
            stock_actual INTEGER DEFAULT 0,
            stock_minimo INTEGER DEFAULT 5,
            unidad_medida VARCHAR(50) DEFAULT 'Pieza',
            marca VARCHAR(100),
            modelo VARCHAR(100),
            activo BOOLEAN DEFAULT true,
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        
        `CREATE TABLE IF NOT EXISTS ventas (
            id_venta SERIAL PRIMARY KEY,
            fecha_venta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            total DECIMAL(10,2) NOT NULL,
            subtotal DECIMAL(10,2),
            impuestos DECIMAL(10,2) DEFAULT 0,
            descuento DECIMAL(10,2) DEFAULT 0,
            metodo_pago VARCHAR(50) DEFAULT 'efectivo',
            estado VARCHAR(20) DEFAULT 'completada',
            notas TEXT
        )`,
        
        `CREATE TABLE IF NOT EXISTS detalle_ventas (
            id_detalle SERIAL PRIMARY KEY,
            id_venta INTEGER REFERENCES ventas(id_venta),
            id_producto INTEGER REFERENCES productos(id_producto),
            cantidad INTEGER NOT NULL,
            precio_unitario DECIMAL(10,2) NOT NULL,
            subtotal DECIMAL(10,2) NOT NULL,
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
    ];

    for (const createTableSQL of createTables) {
        await dbRun(createTableSQL);
    }
}

async function initializeSQLite() {
    // Esquemas originales para SQLite
    const createTables = [
        `CREATE TABLE IF NOT EXISTS productos (
            id_producto INTEGER PRIMARY KEY AUTOINCREMENT,
            codigo_barras TEXT UNIQUE,
            categoria TEXT,
            nombre TEXT NOT NULL,
            descripcion TEXT,
            precio_venta REAL NOT NULL,
            precio_mayoreo REAL,
            costo_unitario REAL NOT NULL,
            stock_actual INTEGER DEFAULT 0,
            stock_minimo INTEGER DEFAULT 5,
            unidad_medida TEXT DEFAULT 'Pieza',
            marca TEXT,
            modelo TEXT,
            activo INTEGER DEFAULT 1,
            fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
            fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        
        `CREATE TABLE IF NOT EXISTS ventas (
            id_venta INTEGER PRIMARY KEY AUTOINCREMENT,
            fecha_venta DATETIME DEFAULT CURRENT_TIMESTAMP,
            total REAL NOT NULL,
            subtotal REAL,
            impuestos REAL DEFAULT 0,
            descuento REAL DEFAULT 0,
            metodo_pago TEXT DEFAULT 'efectivo',
            estado TEXT DEFAULT 'completada',
            notas TEXT
        )`,
        
        `CREATE TABLE IF NOT EXISTS detalle_ventas (
            id_detalle INTEGER PRIMARY KEY AUTOINCREMENT,
            id_venta INTEGER,
            id_producto INTEGER,
            cantidad INTEGER NOT NULL,
            precio_unitario REAL NOT NULL,
            subtotal REAL NOT NULL,
            fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (id_venta) REFERENCES ventas (id_venta),
            FOREIGN KEY (id_producto) REFERENCES productos (id_producto)
        )`
    ];

    for (const createTableSQL of createTables) {
        await dbRun(createTableSQL);
    }
}

// Inicializar al cargar el módulo
initializeDatabase();

module.exports = {
    db,
    dbRun,
    dbGet,
    dbAll,
    initializeDatabase
};
