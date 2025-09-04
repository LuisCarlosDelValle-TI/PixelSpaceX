// verificar_productos.js
const { db, dbAll } = require('./database');

async function verificarProductos() {
    try {
        console.log('=== Verificando productos en la base de datos ===');
        
        // 1. Contar productos totales
        const totalProductos = await dbAll('SELECT COUNT(*) as total FROM Productos');
        console.log(`Total de productos: ${totalProductos[0].total}`);
        
        // 2. Verificar códigos de barras duplicados
        const duplicados = await dbAll(`
            SELECT codigo_barras, COUNT(*) as cantidad, 
                   GROUP_CONCAT(id_producto || ': ' || nombre, ' | ') as productos
            FROM Productos 
            WHERE codigo_barras IS NOT NULL AND codigo_barras != ''
            GROUP BY codigo_barras
            HAVING COUNT(*) > 1
        `);
        
        if (duplicados.length > 0) {
            console.log('\n=== Códigos de barras duplicados ===');
            duplicados.forEach((d, i) => {
                console.log(`\n${i + 1}. Código: '${d.codigo_barras}' (${d.cantidad} veces)`);
                console.log(`   Productos: ${d.productos}`);
            });
        } else {
            console.log('\nNo se encontraron códigos de barras duplicados.');
        }
        
        // 3. Mostrar algunos productos de ejemplo
        const productos = await dbAll(`
            SELECT id_producto, nombre, codigo_barras, stock_actual, activo 
            FROM Productos 
            ORDER BY RANDOM() 
            LIMIT 5
        `);
        
        console.log('\n=== Algunos productos de ejemplo ===');
        productos.forEach(p => {
            console.log(`- ID: ${p.id_producto} | Nombre: ${p.nombre} | Código: ${p.codigo_barras || 'N/A'} | Stock: ${p.stock_actual} | Activo: ${p.activo ? 'Sí' : 'No'}`);
        });
        
    } catch (error) {
        console.error('Error al verificar productos:', error);
    } finally {
        // Cerrar la conexión a la base de datos
        db.close();
    }
}

// Ejecutar la verificación
verificarProductos().catch(console.error);
