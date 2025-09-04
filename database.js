const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'pos.db');

// Crear una promisificación de los métodos de la base de datos
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err.message);
  } else {
    console.log('Conectado a la base de datos SQLite en', dbPath);
    // Activar el uso de claves foráneas
    db.get('PRAGMA foreign_keys = ON');
  }
});

// Promisificar los métodos de la base de datos
const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

db.serialize(() => {
  // Crear la tabla de Productos con más campos
  db.run(`CREATE TABLE IF NOT EXISTS Productos (
    id_producto TEXT PRIMARY KEY,
    codigo_barras TEXT UNIQUE,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    categoria TEXT NOT NULL,
    marca TEXT,
    modelo TEXT,
    costo_unitario REAL NOT NULL,
    precio_venta REAL NOT NULL,
    precio_mayoreo REAL,
    stock_actual INTEGER NOT NULL DEFAULT 0,
    stock_minimo INTEGER DEFAULT 5,
    unidad_medida TEXT DEFAULT 'Pieza',
    impuestos REAL DEFAULT 0.16,
    fecha_creacion TEXT DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TEXT DEFAULT CURRENT_TIMESTAMP,
    activo INTEGER DEFAULT 1
  )`);

  // Crear tabla de Categorías
  db.run(`CREATE TABLE IF NOT EXISTS Categorias (
    id_categoria INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE,
    descripcion TEXT
  )`);

  // Insertar categorías por defecto si no existen
  const categoriasDefault = [
    'Papelería',
    'Útiles escolares',
    'Oficina',
    'Arte y manualidades',
    'Electrónica',
    'Libros',
    'Impresiones',
    'Fotocopias',
    'Otros'
  ];

  const stmt = db.prepare('INSERT OR IGNORE INTO Categorias (nombre) VALUES (?)');
  categoriasDefault.forEach(categoria => {
    stmt.run(categoria);
  });
  stmt.finalize();

  // Crear la tabla de Ventas principal
  db.run(`CREATE TABLE IF NOT EXISTS Ventas (
    id_venta TEXT PRIMARY KEY,
    fecha_venta TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    subtotal REAL NOT NULL,
    iva REAL NOT NULL,
    total REAL NOT NULL,
    metodo_pago TEXT DEFAULT 'efectivo',
    notas TEXT,
    estado TEXT DEFAULT 'completada',
    fecha_creacion TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  // Crear la tabla de productos por venta
  db.run(`CREATE TABLE IF NOT EXISTS VentasProductos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_venta TEXT NOT NULL,
    id_producto TEXT NOT NULL,
    cantidad INTEGER NOT NULL,
    precio_unitario REAL NOT NULL,
    subtotal REAL NOT NULL,
    FOREIGN KEY (id_venta) REFERENCES Ventas(id_venta),
    FOREIGN KEY (id_producto) REFERENCES Productos(id_producto)
  )`);

  // Crear la tabla de servicios por venta (recargas, impresiones, etc.)
  db.run(`CREATE TABLE IF NOT EXISTS VentasServicios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_venta TEXT NOT NULL,
    tipo_servicio TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    cantidad INTEGER NOT NULL,
    precio_unitario REAL NOT NULL,
    subtotal REAL NOT NULL,
    detalles TEXT,
    fecha_creacion TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_venta) REFERENCES Ventas(id_venta)
  )`);

  // Crear la tabla de Servicios
  db.run(`CREATE TABLE IF NOT EXISTS Servicios (
    id_servicio TEXT PRIMARY KEY,
    descripcion TEXT NOT NULL,
    costo_material REAL NOT NULL,
    precio_venta REAL NOT NULL
  )`);

  console.log('Esquema de base de datos verificado y actualizado.');
});

// Función para obtener todos los productos
function obtenerProductos(callback) {
  dbAll('SELECT * FROM Productos WHERE activo = 1 ORDER BY nombre', []).then(rows => {
    callback(null, rows);
  }).catch(err => {
    console.error('Error al obtener productos:', err);
    callback(err, null);
  });
}

// Función para guardar un nuevo producto
function guardarProducto(producto, callback) {
  const sql = `INSERT INTO Productos (
    id_producto, codigo_barras, nombre, descripcion, categoria, marca, modelo,
    costo_unitario, precio_venta, precio_mayoreo, stock_actual, stock_minimo,
    unidad_medida, impuestos
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const params = [
    producto.id_producto,
    producto.codigo_barras || null,
    producto.nombre,
    producto.descripcion || null,
    producto.categoria,
    producto.marca || null,
    producto.modelo || null,
    producto.costo_unitario,
    producto.precio_venta,
    producto.precio_mayoreo || null,
    producto.stock_actual || 0,
    producto.stock_minimo || 5,
    producto.unidad_medida || 'Pieza',
    producto.impuestos || 0.16
  ];

  dbRun(sql, params).then(result => {
    callback(null, { id: result.id });
  }).catch(err => {
    console.error('Error al guardar producto:', err);
    callback(err);
  });
}

// Función para actualizar un producto existente
function actualizarProducto(id, producto, callback) {
  const sql = `UPDATE Productos SET 
    codigo_barras = ?,
    nombre = ?,
    descripcion = ?,
    categoria = ?,
    marca = ?,
    modelo = ?,
    costo_unitario = ?,
    precio_venta = ?,
    precio_mayoreo = ?,
    stock_actual = ?,
    stock_minimo = ?,
    unidad_medida = ?,
    impuestos = ?,
    fecha_actualizacion = CURRENT_TIMESTAMP
    WHERE id_producto = ?`;

  const params = [
    producto.codigo_barras || null,
    producto.nombre,
    producto.descripcion || null,
    producto.categoria,
    producto.marca || null,
    producto.modelo || null,
    producto.costo_unitario,
    producto.precio_venta,
    producto.precio_mayoreo || null,
    producto.stock_actual || 0,
    producto.stock_minimo || 5,
    producto.unidad_medida || 'Pieza',
    producto.impuestos || 0.16,
    id
  ];

  dbRun(sql, params).then(result => {
    callback(null, { changes: result.changes });
  }).catch(err => {
    console.error('Error al actualizar producto:', err);
    callback(err);
  });
}

// Función para desactivar un producto (eliminación lógica)
function desactivarProducto(id, callback) {
  const sql = 'UPDATE Productos SET activo = 0 WHERE id_producto = ?';
  
  dbRun(sql, [id]).then(result => {
    callback(null, { changes: result.changes });
  }).catch(err => {
    console.error('Error al desactivar producto:', err);
    callback(err);
  });
}

// Función para buscar productos por término
function buscarProductos(termino, callback) {
  const searchTerm = `%${termino}%`;
  const sql = `
    SELECT * FROM Productos 
    WHERE (nombre LIKE ? OR descripcion LIKE ? OR codigo_barras LIKE ?)
    AND activo = 1 
    ORDER BY nombre
  `;

  dbAll(sql, [searchTerm, searchTerm, searchTerm]).then(rows => {
    callback(null, rows);
  }).catch(err => {
    console.error('Error al buscar productos:', err);
    callback(err, null);
  });
}

// Exportar la conexión y las funciones
module.exports = {
  // Conexión a la base de datos
  db,
  
  // Métodos promisificados
  dbAll,
  dbRun,
  dbGet,
  
  // Funciones de negocio
  obtenerProductos,
  guardarProducto,
  actualizarProducto,
  desactivarProducto,
  buscarProductos
};

// Manejar errores no capturados
db.on('error', (err) => {
  console.error('Error en la base de datos:', err);
});