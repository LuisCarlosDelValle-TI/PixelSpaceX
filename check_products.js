const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Ruta a la base de datos
const dbPath = path.join(__dirname, 'pos.db');

// Conectar a la base de datos
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        return;
    }
    console.log('Conectado a la base de datos SQLite');
});

// Consulta para verificar códigos de barras duplicados
const checkDuplicatesQuery = `
    SELECT codigo_barras, COUNT(*) as count, GROUP_CONCAT(id_producto || ': ' || nombre, ' | ') as productos
    FROM Productos
    WHERE codigo_barras IS NOT NULL AND codigo_barras != ''
    GROUP BY codigo_barras
    HAVING count > 1
`;

// Consulta para ver todos los productos
const allProductsQuery = `
    SELECT id_producto, nombre, codigo_barras, activo 
    FROM Productos 
    ORDER BY codigo_barras, nombre
`;

console.log('=== Verificando códigos de barras duplicados ===');
db.all(checkDuplicatesQuery, [], (err, rows) => {
    if (err) {
        console.error('Error al verificar duplicados:', err);
        return;
    }

    if (rows.length === 0) {
        console.log('No se encontraron códigos de barras duplicados.');
    } else {
        console.log('Se encontraron los siguientes códigos de barras duplicados:');
        rows.forEach(row => {
            console.log(`\nCódigo de barras: ${row.codigo_barras} (${row.count} veces)`);
            console.log(`Productos: ${row.productos}`);
        });
    }

    console.log('\n=== Lista de productos ===');
    db.all(allProductsQuery, [], (err, products) => {
        if (err) {
            console.error('Error al obtener la lista de productos:', err);
            return;
        }

        console.log(`\nTotal de productos: ${products.length}`);
        console.log('\nPrimeros 10 productos:');
        products.slice(0, 10).forEach(p => {
            console.log(`ID: ${p.id_producto} | Nombre: ${p.nombre} | Código: ${p.codigo_barras || 'N/A'} | Activo: ${p.activo ? 'Sí' : 'No'}`);
        });

        if (products.length > 10) {
            console.log(`\n... y ${products.length - 10} productos más`);
        }

        // Cerrar la conexión
        db.close();
    });
});
