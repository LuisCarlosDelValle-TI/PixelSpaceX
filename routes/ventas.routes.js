const express = require('express');
const router = express.Router();
const { db, dbAll, dbRun, dbGet } = require('../database');
const { v4: uuidv4 } = require('uuid');

// Obtener todas las ventas
router.get('/', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * limit;
        
        const sql = `
            SELECT v.*, 
                   COUNT(*) OVER() as total
            FROM Ventas v 
            ORDER BY v.fecha_venta DESC
            LIMIT ? OFFSET ?
        `;
        
        const rows = await dbAll(sql, [limit, offset]);
        const total = rows.length > 0 ? rows[0].total : 0;
        const totalPages = Math.ceil(total / limit);
        
        res.json({
            data: rows,
            pagination: {
                total,
                totalPages,
                currentPage: page,
                perPage: limit
            }
        });
    } catch (err) {
        console.error('Error al obtener ventas:', err);
        res.status(500).json({ error: 'Error al obtener las ventas', details: err.message });
    }
});

// Obtener una venta por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const venta = await dbGet('SELECT * FROM Ventas WHERE id_venta = ?', [id]);
        
        if (!venta) {
            return res.status(404).json({ error: 'Venta no encontrada' });
        }
        
        // Obtener los productos de la venta
        const productos = await dbAll(`
            SELECT vp.*, p.nombre, p.categoria 
            FROM VentasProductos vp
            LEFT JOIN Productos p ON vp.id_producto = p.id_producto
            WHERE vp.id_venta = ?
        `, [id]);
        
        res.json({
            venta,
            productos
        });
    } catch (err) {
        console.error('Error al obtener la venta:', err);
        res.status(500).json({ 
            error: 'Error al obtener la venta',
            details: err.message 
        });
    }
});

// Crear una nueva venta
router.post('/', async (req, res) => {
    try {
        const { productos, servicios, subtotal, iva, total, metodo_pago = 'efectivo', notas } = req.body;
        
        // Validar que haya al menos un producto o servicio
        const tieneProductos = productos && Array.isArray(productos) && productos.length > 0;
        const tieneServicios = servicios && Array.isArray(servicios) && servicios.length > 0;
        
        if (!tieneProductos && !tieneServicios) {
            return res.status(400).json({ 
                error: 'Se requiere al menos un producto o servicio para realizar la venta' 
            });
        }
        
        if (!subtotal || !total) {
            return res.status(400).json({ 
                error: 'Se requieren los campos subtotal y total' 
            });
        }
        
        // Generar ID único para la venta
        const idVenta = `VENTA-${uuidv4().substr(0, 8).toUpperCase()}`;
        
        // Validar stock disponible solo para productos físicos
        if (tieneProductos) {
            for (const item of productos) {
                const producto = await dbGet('SELECT stock_actual FROM Productos WHERE id_producto = ?', [item.id]);
                
                if (!producto) {
                    return res.status(400).json({ 
                        error: `Producto ${item.id} no encontrado` 
                    });
                }
                
                if (producto.stock_actual < item.cantidad) {
                    return res.status(400).json({ 
                        error: `Stock insuficiente para el producto ${item.nombre}. Disponible: ${producto.stock_actual}, Solicitado: ${item.cantidad}` 
                    });
                }
            }
        }
        
        // Iniciar transacción
        await dbRun('BEGIN TRANSACTION');
        
        try {
            // Insertar la venta principal
            const ventaSql = `
                INSERT INTO Ventas (
                    id_venta, fecha_venta, subtotal, iva, total, 
                    metodo_pago, notas, estado
                ) VALUES (?, datetime('now'), ?, ?, ?, ?, ?, 'completada')
            `;
            
            await dbRun(ventaSql, [
                idVenta,
                subtotal,
                iva || (subtotal * 0.16),
                total,
                metodo_pago,
                notas || null
            ]);
            
            // Insertar productos físicos y actualizar stock
            if (tieneProductos) {
                for (const item of productos) {
                    // Insertar producto en la venta
                    const ventaProductoSql = `
                        INSERT INTO VentasProductos (
                            id_venta, id_producto, cantidad, precio_unitario, subtotal
                        ) VALUES (?, ?, ?, ?, ?)
                    `;
                    
                    await dbRun(ventaProductoSql, [
                        idVenta,
                        item.id,
                        item.cantidad,
                        item.precio,
                        item.precio * item.cantidad
                    ]);
                    
                    // Actualizar stock del producto
                    const updateStockSql = `
                        UPDATE Productos 
                        SET stock_actual = stock_actual - ?,
                            fecha_actualizacion = datetime('now')
                        WHERE id_producto = ?
                    `;
                    
                    await dbRun(updateStockSql, [item.cantidad, item.id]);
                }
            }
            
            // Registrar servicios (sin afectar inventario)
            if (tieneServicios) {
                for (const servicio of servicios) {
                    const ventaServicioSql = `
                        INSERT INTO VentasServicios (
                            id_venta, tipo_servicio, descripcion, cantidad, precio_unitario, subtotal, detalles
                        ) VALUES (?, ?, ?, ?, ?, ?, ?)
                    `;
                    
                    await dbRun(ventaServicioSql, [
                        idVenta,
                        servicio.tipo,
                        servicio.nombre,
                        servicio.cantidad,
                        servicio.precio,
                        servicio.precio * servicio.cantidad,
                        servicio.detalles ? JSON.stringify(servicio.detalles) : null
                    ]);
                }
            }
            
            // Confirmar transacción
            await dbRun('COMMIT');
            
            // Obtener la venta creada para devolverla
            const ventaCreada = await dbGet('SELECT * FROM Ventas WHERE id_venta = ?', [idVenta]);
            
            res.status(201).json({
                message: 'Venta procesada exitosamente',
                venta: ventaCreada,
                id_venta: idVenta
            });
            
        } catch (error) {
            // Revertir transacción en caso de error
            await dbRun('ROLLBACK');
            throw error;
        }
        
    } catch (err) {
        console.error('Error al procesar la venta:', err);
        res.status(500).json({ 
            error: 'Error al procesar la venta',
            details: err.message 
        });
    }
});

// Cancelar una venta (cambiar estado)
router.patch('/:id/cancelar', async (req, res) => {
    try {
        const { id } = req.params;
        const { motivo } = req.body;
        
        // Verificar que la venta exista
        const venta = await dbGet('SELECT * FROM Ventas WHERE id_venta = ?', [id]);
        
        if (!venta) {
            return res.status(404).json({ error: 'Venta no encontrada' });
        }
        
        if (venta.estado === 'cancelada') {
            return res.status(400).json({ error: 'La venta ya está cancelada' });
        }
        
        await dbRun('BEGIN TRANSACTION');
        
        try {
            // Actualizar estado de la venta
            await dbRun(`
                UPDATE Ventas 
                SET estado = 'cancelada', 
                    notas = COALESCE(notas || ' | ', '') || 'Cancelada: ' || ?
                WHERE id_venta = ?
            `, [motivo || 'Sin motivo especificado', id]);
            
            // Restaurar stock de los productos
            const productos = await dbAll(`
                SELECT id_producto, cantidad 
                FROM VentasProductos 
                WHERE id_venta = ?
            `, [id]);
            
            for (const producto of productos) {
                await dbRun(`
                    UPDATE Productos 
                    SET stock_actual = stock_actual + ?
                    WHERE id_producto = ?
                `, [producto.cantidad, producto.id_producto]);
            }
            
            await dbRun('COMMIT');
            
            res.json({
                message: 'Venta cancelada exitosamente',
                id_venta: id
            });
            
        } catch (error) {
            await dbRun('ROLLBACK');
            throw error;
        }
        
    } catch (err) {
        console.error('Error al cancelar la venta:', err);
        res.status(500).json({ 
            error: 'Error al cancelar la venta',
            details: err.message 
        });
    }
});

// Obtener resumen de ventas
router.get('/reportes/resumen', async (req, res) => {
    try {
        const { fecha_inicio, fecha_fin } = req.query;
        
        let whereClause = "WHERE estado = 'completada'";
        let params = [];
        
        if (fecha_inicio && fecha_fin) {
            whereClause += " AND DATE(fecha_venta) BETWEEN ? AND ?";
            params.push(fecha_inicio, fecha_fin);
        } else if (fecha_inicio) {
            whereClause += " AND DATE(fecha_venta) >= ?";
            params.push(fecha_inicio);
        } else if (fecha_fin) {
            whereClause += " AND DATE(fecha_venta) <= ?";
            params.push(fecha_fin);
        }
        
        const resumen = await dbGet(`
            SELECT 
                COUNT(*) as total_ventas,
                COALESCE(SUM(total), 0) as total_ingresos,
                COALESCE(AVG(total), 0) as ticket_promedio,
                COALESCE(SUM(subtotal), 0) as subtotal_total,
                COALESCE(SUM(iva), 0) as iva_total
            FROM Ventas 
            ${whereClause}
        `, params);
        
        // Obtener ventas por día (últimos 7 días si no se especifica rango)
        const ventasPorDia = await dbAll(`
            SELECT 
                DATE(fecha_venta) as fecha,
                COUNT(*) as ventas,
                SUM(total) as ingresos
            FROM Ventas 
            ${whereClause}
            GROUP BY DATE(fecha_venta)
            ORDER BY fecha DESC
            LIMIT 30
        `, params);
        
        res.json({
            resumen,
            ventas_por_dia: ventasPorDia
        });
        
    } catch (err) {
        console.error('Error al obtener resumen de ventas:', err);
        res.status(500).json({ 
            error: 'Error al obtener resumen de ventas',
            details: err.message 
        });
    }
});

module.exports = router;
