// Front/js/inventario.js

console.log('Script inventario.js cargado');

// Configuración del API - Detectar automáticamente el entorno
function getApiBaseUrl() {
    // Si estamos en localhost, usar localhost:3001
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:3001/api';
    }
    // Si estamos en producción, usar la URL actual
    return `${window.location.protocol}//${window.location.host}/api`;
}

const API_BASE_URL = getApiBaseUrl();
console.log('🌐 [INVENTARIO] API Base URL:', API_BASE_URL);

// Función para eliminar producto
function eliminarProducto(idProducto) {
    console.log('Eliminando producto:', idProducto);
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) {
        return;
    }
    
    fetch(`${API_BASE_URL}/productos/${idProducto}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            alert('Producto eliminado exitosamente');
            cargarProductos(); // Recargar la lista
        } else {
            alert('Error al eliminar el producto');
        }
    })
    .catch(error => {
        console.error('Error al eliminar producto:', error);
        alert('Error al eliminar el producto');
    });
}

// Función para editar producto
function editarProducto(idProducto) {
    console.log('Editando producto:', idProducto);
    
    fetch(`${API_BASE_URL}/productos/${idProducto}`)
    .then(response => response.json())
    .then(producto => {
        // Llenar el formulario con los datos del producto
        document.getElementById('codigo_barras').value = producto.codigo_barras || '';
        document.getElementById('categoria').value = producto.categoria || '';
        document.getElementById('nombre').value = producto.nombre || '';
        document.getElementById('descripcion').value = producto.descripcion || '';
        document.getElementById('precio_venta').value = producto.precio_venta || '';
        document.getElementById('precio_mayoreo').value = producto.precio_mayoreo || '';
        document.getElementById('costo_unitario').value = producto.costo_unitario || '';
        document.getElementById('stock_actual').value = producto.stock_actual || '';
        document.getElementById('stock_minimo').value = producto.stock_minimo || '';
        document.getElementById('unidad_medida').value = producto.unidad_medida || 'Pieza';
        document.getElementById('marca').value = producto.marca || '';
        document.getElementById('modelo').value = producto.modelo || '';
        
        // Cambiar el título del modal
        const modalTitle = document.querySelector('#product-modal h3');
        if (modalTitle) {
            modalTitle.innerHTML = '<i class="fas fa-edit" style="color: #3b82f6; margin-right: 0.5rem;"></i>Editar Producto';
        }
        
        // Cambiar el botón a "Actualizar"
        const btnGuardar = document.getElementById('btn-guardar');
        if (btnGuardar) {
            btnGuardar.textContent = 'Actualizar Producto';
            btnGuardar.setAttribute('data-editing', producto.id_producto);
        }
        
        // Mostrar el modal
        document.getElementById('product-modal').style.display = 'flex';
    })
    .catch(error => {
        console.error('Error al cargar producto:', error);
        alert('Error al cargar los datos del producto');
    });
}

// Función para manejar el envío del formulario
function handleSubmit(event) {
    event.preventDefault();
    console.log('Enviando formulario...');
    
    const form = document.getElementById('product-form');
    const btnGuardar = document.getElementById('btn-guardar');
    const editingId = btnGuardar.getAttribute('data-editing');
    const isEditing = !!editingId;
    
    // Obtener datos del formulario
    const formData = new FormData(form);
    const producto = {};
    
    formData.forEach((value, key) => {
        if (['precio_venta', 'precio_mayoreo', 'costo_unitario', 'stock_actual', 'stock_minimo', 'impuestos'].includes(key)) {
            producto[key] = parseFloat(value) || 0;
        } else {
            producto[key] = value.trim();
        }
    });
    
    const url = isEditing ? `${API_BASE_URL}/productos/${editingId}` : `${API_BASE_URL}/productos`;
    const method = isEditing ? 'PUT' : 'POST';
    
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(producto)
    })
    .then(response => {
        if (response.ok) {
            alert(isEditing ? 'Producto actualizado exitosamente' : 'Producto guardado exitosamente');
            document.getElementById('product-modal').style.display = 'none';
            form.reset();
            btnGuardar.textContent = 'Guardar Producto';
            btnGuardar.removeAttribute('data-editing');
            cargarProductos(); // Recargar la lista
        } else {
            alert('Error al guardar el producto');
        }
    })
    .catch(error => {
        console.error('Error al guardar producto:', error);
        alert('Error al guardar el producto');
    });
}

// Función simple para cargar productos
function cargarProductos() {
    console.log('Cargando productos...');
    
    const tbody = document.querySelector('#tabla-productos tbody');
    if (!tbody) {
        console.error('No se encontró tbody');
        return;
    }
    
    // Mostrar loading
    tbody.innerHTML = `
        <tr>
            <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                <i class="fas fa-spinner fa-spin mr-2"></i> Cargando productos...
            </td>
        </tr>
    `;
    
    fetch(`${API_BASE_URL}/productos`)
    .then(response => response.json())
    .then(data => {
        console.log('Productos recibidos:', data);
        
        // Limpiar tabla
        tbody.innerHTML = '';
        
        if (data && data.data && data.data.length > 0) {
            data.data.forEach((producto) => {
                const row = document.createElement('tr');
                row.className = 'hover:bg-gray-50';
                
                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">${producto.nombre}</div>
                        <div class="text-sm text-gray-500">${producto.codigo_barras}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            ${producto.categoria}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${producto.stock_actual} ${producto.unidad_medida}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        $${parseFloat(producto.precio_venta).toFixed(2)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onclick="editarProducto('${producto.id_producto}')" class="text-indigo-600 hover:text-indigo-900 mr-3" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="eliminarProducto('${producto.id_producto}')" class="text-red-600 hover:text-red-900" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                
                tbody.appendChild(row);
            });
            
            console.log(`${data.data.length} productos cargados exitosamente`);
        } else {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                        <i class="fas fa-inbox mr-2"></i>
                        No hay productos registrados
                    </td>
                </tr>
            `;
        }
    })
    .catch(error => {
        console.error('Error al cargar productos:', error);
        
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="px-6 py-4 text-center text-red-500">
                    <i class="fas fa-exclamation-triangle mr-2"></i>
                    Error: ${error.message}
                </td>
            </tr>
        `;
    });
}

// Hacer funciones globales
window.cargarProductos = cargarProductos;
window.eliminarProducto = eliminarProducto;
window.editarProducto = editarProducto;
window.handleSubmit = handleSubmit;

// Ejecutar cuando cargue
setTimeout(() => {
    cargarProductos();
}, 100);