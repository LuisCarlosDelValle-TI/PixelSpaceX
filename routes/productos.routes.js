const express = require('express');
const router = express.Router();
const { db, dbAll, dbRun, dbGet } = require('../database');
const { v4: uuidv4 } = require('uuid');

// Obtener todos los productos
router.get('/', async (req, res) => {
    try {
        const sql = `
            SELECT p.*, 
                   (SELECT COUNT(*) FROM Productos p2 WHERE p2.activo = 1) as total
            FROM Productos p 
            WHERE p.activo = 1 
            ORDER BY p.nombre
        `;
        
        const rows = await dbAll(sql);
        
        res.json({
            success: true,
            data: rows,
            total: rows.length
        });
    } catch (err) {
        console.error('Error al obtener productos:', err);
        res.status(500).json({ 
            success: false,
            error: 'Error al obtener los productos', 
            details: err.message 
        });
    }
});

// Buscar productos
router.get('/buscar', async (req, res) => {
    try {
        const searchTerm = `%${req.query.q || ''}%`;
        
        const sql = `
            SELECT * FROM Productos 
            WHERE (nombre LIKE ? OR descripcion LIKE ? OR codigo_barras LIKE ?)
            AND activo = 1 
            ORDER BY nombre
            LIMIT 50
        `;
        
        const rows = await dbAll(sql, [searchTerm, searchTerm, searchTerm]);
        res.json(rows);
    } catch (err) {
        console.error('Error al buscar productos:', err);
        res.status(500).json({ 
            error: 'Error al buscar productos',
            details: err.message 
        });
    }
});

// Obtener un producto por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const row = await dbGet('SELECT * FROM Productos WHERE id_producto = ?', [id]);
        
        if (!row) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        res.json(row);
    } catch (err) {
        console.error('Error al obtener el producto:', err);
        res.status(500).json({ 
            error: 'Error al obtener el producto',
            details: err.message 
        });
    }
});

// Crear un nuevo producto
router.post('/', async (req, res) => {
    try {
        const producto = req.body;
        
        // Validar campos requeridos
        if (!producto.nombre || !producto.precio_venta || !producto.costo_unitario) {
            return res.status(400).json({ 
                error: 'Los campos nombre, precio_venta y costo_unitario son obligatorios' 
            });
        }
        
        // Generar ID único si no se proporciona
        if (!producto.id_producto) {
            producto.id_producto = `PROD-${uuidv4().substr(0, 8).toUpperCase()}`;
        }
        
        // Insertar en la base de datos
        const sql = `
            INSERT INTO Productos (
                id_producto, codigo_barras, nombre, descripcion, categoria, 
                marca, modelo, costo_unitario, precio_venta, precio_mayoreo, 
                stock_actual, stock_minimo, unidad_medida, impuestos
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const params = [
            producto.id_producto,
            producto.codigo_barras || null,
            producto.nombre,
            producto.descripcion || null,
            producto.categoria || 'Otros',
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
        
        const result = await dbRun(sql, params);
        
        // Obtener el producto recién creado para devolverlo en la respuesta
        const nuevoProducto = await dbGet('SELECT * FROM Productos WHERE id_producto = ?', [producto.id_producto]);
        
        res.status(201).json({
            id: result.lastID,
            message: 'Producto creado exitosamente',
            producto: nuevoProducto
        });
    } catch (err) {
        console.error('Error al crear el producto:', err);
        res.status(500).json({ 
            error: 'Error al crear el producto',
            details: err.message 
        });
    }
});

// Actualizar un producto existente
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const producto = req.body;
        
        // Validar que el producto exista
        const existingProduct = await dbGet('SELECT * FROM Productos WHERE id_producto = ?', [id]);
        
        if (!existingProduct) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        // Actualizar el producto
        const sql = `
            UPDATE Productos SET 
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
            WHERE id_producto = ?
        `;
        
        const params = [
            producto.codigo_barras !== undefined ? producto.codigo_barras : existingProduct.codigo_barras,
            producto.nombre || existingProduct.nombre,
            producto.descripcion !== undefined ? producto.descripcion : existingProduct.descripcion,
            producto.categoria || existingProduct.categoria || 'Otros',
            producto.marca !== undefined ? producto.marca : existingProduct.marca,
            producto.modelo !== undefined ? producto.modelo : existingProduct.modelo,
            producto.costo_unitario || existingProduct.costo_unitario,
            producto.precio_venta || existingProduct.precio_venta,
            producto.precio_mayoreo !== undefined ? producto.precio_mayoreo : existingProduct.precio_mayoreo,
            producto.stock_actual !== undefined ? producto.stock_actual : existingProduct.stock_actual,
            producto.stock_minimo || existingProduct.stock_minimo || 5,
            producto.unidad_medida || existingProduct.unidad_medida || 'Pieza',
            producto.impuestos || existingProduct.impuestos || 0.16,
            id
        ];
        
        const result = await dbRun(sql, params);
        
        // Obtener el producto actualizado
        const updatedProduct = await dbGet('SELECT * FROM Productos WHERE id_producto = ?', [id]);
        
        res.json({
            id,
            message: 'Producto actualizado exitosamente',
            changes: result.changes,
            producto: updatedProduct
        });
    } catch (err) {
        console.error('Error al actualizar el producto:', err);
        res.status(500).json({ 
            error: 'Error al actualizar el producto',
            details: err.message 
        });
    }
});

// Eliminar un producto (eliminación lógica)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Verificar que el producto exista
        const producto = await dbGet('SELECT * FROM Productos WHERE id_producto = ?', [id]);
        
        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        // Actualizar el estado a inactivo (eliminación lógica)
        const result = await dbRun('UPDATE Productos SET activo = 0 WHERE id_producto = ?', [id]);
        
        res.json({
            id,
            message: 'Producto eliminado exitosamente',
            changes: result.changes
        });
    } catch (err) {
        console.error('Error al eliminar el producto:', err);
        res.status(500).json({ 
            error: 'Error al eliminar el producto',
            details: err.message 
        });
    }
});

// Obtener categorías existentes
router.get('/categorias', async (req, res) => {
    try {
        const sql = `
            SELECT DISTINCT categoria 
            FROM Productos 
            WHERE activo = 1 AND categoria IS NOT NULL AND categoria != ''
            ORDER BY categoria
        `;
        
        const rows = await dbAll(sql);
        const categorias = rows.map(row => row.categoria);
        
        res.json({
            success: true,
            data: categorias
        });
    } catch (err) {
        console.error('Error al obtener categorías:', err);
        res.status(500).json({ 
            success: false,
            error: 'Error al obtener las categorías', 
            details: err.message 
        });
    }
});

// Debug: Ver estructura de la tabla
router.get('/debug', async (req, res) => {
    try {
        // Obtener información de la tabla
        const tableInfo = await dbAll("PRAGMA table_info(Productos)");
        
        // Obtener algunos productos de ejemplo
        const sampleProducts = await dbAll("SELECT * FROM Productos LIMIT 5");
        
        // Contar total de productos
        const totalCount = await dbGet("SELECT COUNT(*) as count FROM Productos");
        
        res.json({
            success: true,
            tableStructure: tableInfo,
            sampleProducts: sampleProducts,
            totalProducts: totalCount.count
        });
    } catch (err) {
        console.error('Error en debug:', err);
        res.status(500).json({ 
            success: false,
            error: 'Error en debug', 
            details: err.message 
        });
    }
});

module.exports = router;
