// Front/js/ventas.js

console.log('Script ventas.js cargado');

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
console.log('🌐 [VENTAS] API Base URL:', API_BASE_URL);

// Estado simple
const state = {
    cart: [],
    products: [],
    ticketNumber: 1
};

// Función simple para cargar productos
async function loadProducts() {
    console.log('Cargando productos para ventas...');
    
    try {
        const productsGrid = document.getElementById('products-grid');
        if (!productsGrid) {
            console.error('No se encontró products-grid');
            return;
        }
        
        // Mostrar loading
        productsGrid.innerHTML = `
            <div class="col-span-full text-center py-8">
                <i class="fas fa-spinner fa-spin text-2xl text-gray-400 mb-2"></i>
                <p class="text-gray-500">Cargando productos...</p>
            </div>
        `;
        
        const response = await fetch(`${API_BASE_URL}/productos`);
        const data = await response.json();
        
        console.log('Productos para ventas recibidos:', data);
        
        // Limpiar grid
        productsGrid.innerHTML = '';
        
        if (data && data.data && data.data.length > 0) {
            state.products = data.data;
            
            data.data.forEach((producto) => {
                const productCard = document.createElement('div');
                productCard.className = 'bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer';
                productCard.onclick = () => addToCart(producto);
                
                productCard.innerHTML = `
                    <div class="text-center">
                        <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <i class="fas fa-box text-blue-500 text-xl"></i>
                        </div>
                        <h3 class="font-medium text-gray-900 text-sm mb-1">${producto.nombre}</h3>
                        <p class="text-xs text-gray-500 mb-2">${producto.categoria}</p>
                        <div class="space-y-1">
                            <p class="text-lg font-bold text-green-600">$${parseFloat(producto.precio_venta).toFixed(2)}</p>
                            <p class="text-xs text-gray-400">Stock: ${producto.stock_actual}</p>
                        </div>
                    </div>
                `;
                
                productsGrid.appendChild(productCard);
            });
            
            console.log(`${data.data.length} productos cargados para ventas`);
        } else {
            productsGrid.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <i class="fas fa-inbox text-3xl text-gray-400 mb-2"></i>
                    <p class="text-gray-500">No hay productos disponibles</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error al cargar productos para ventas:', error);
        
        const productsGrid = document.getElementById('products-grid');
        if (productsGrid) {
            productsGrid.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <i class="fas fa-exclamation-triangle text-3xl text-red-400 mb-2"></i>
                    <p class="text-red-500">Error al cargar productos</p>
                    <button onclick="loadProducts()" class="mt-2 px-4 py-2 bg-blue-500 text-white rounded">
                        Reintentar
                    </button>
                </div>
            `;
        }
    }
}

// Función para agregar al carrito
function addToCart(producto) {
    const existingItem = state.cart.find(item => item.id_producto === producto.id_producto);
    
    if (existingItem) {
        if (existingItem.cantidad < producto.stock_actual) {
            existingItem.cantidad++;
            updateCartDisplay();
        } else {
            alert('No hay suficiente stock disponible');
        }
    } else {
        if (producto.stock_actual > 0) {
            state.cart.push({
                ...producto,
                cantidad: 1
            });
            updateCartDisplay();
        } else {
            alert('Producto sin stock');
        }
    }
}

// Función para actualizar la visualización del carrito
function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    const subtotalElement = document.getElementById('subtotal');
    const ivaElement = document.getElementById('iva');
    const totalElement = document.getElementById('total');
    
    if (!cartItems) return;
    
    // Limpiar carrito
    cartItems.innerHTML = '';
    
    if (state.cart.length === 0) {
        cartItems.innerHTML = `
            <div class="text-center text-gray-500 py-8">
                <i class="fas fa-shopping-cart text-3xl mb-2"></i>
                <p>El carrito está vacío</p>
            </div>
        `;
        if (subtotalElement) subtotalElement.textContent = '$0.00';
        if (ivaElement) ivaElement.textContent = '$0.00';
        if (totalElement) totalElement.textContent = '$0.00';
        return;
    }
    
    let subtotal = 0;
    
    state.cart.forEach((item, index) => {
        const itemTotal = item.cantidad * item.precio_venta;
        subtotal += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'flex items-center justify-between p-3 border-b';
        cartItem.innerHTML = `
            <div class="flex-1">
                <h4 class="font-medium text-sm">${item.nombre}</h4>
                <p class="text-xs text-gray-500">$${parseFloat(item.precio_venta).toFixed(2)} c/u</p>
            </div>
            <div class="flex items-center space-x-2">
                <button onclick="changeQuantity(${index}, -1)" class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">-</button>
                <span class="w-8 text-center text-sm">${item.cantidad}</span>
                <button onclick="changeQuantity(${index}, 1)" class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">+</button>
                <button onclick="removeFromCart(${index})" class="w-6 h-6 rounded-full bg-red-200 flex items-center justify-center text-xs text-red-600">×</button>
            </div>
            <div class="w-16 text-right text-sm font-medium">
                $${itemTotal.toFixed(2)}
            </div>
        `;
        cartItems.appendChild(cartItem);
    });
    
    const iva = subtotal * 0.16;
    const total = subtotal + iva;
    
    if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    if (ivaElement) ivaElement.textContent = `$${iva.toFixed(2)}`;
    if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
}

// Función para cambiar cantidad
function changeQuantity(index, change) {
    const item = state.cart[index];
    const newQuantity = item.cantidad + change;
    
    if (newQuantity <= 0) {
        removeFromCart(index);
    } else if (newQuantity <= item.stock_actual) {
        item.cantidad = newQuantity;
        updateCartDisplay();
    } else {
        alert('No hay suficiente stock disponible');
    }
}

// Función para remover del carrito
function removeFromCart(index) {
    state.cart.splice(index, 1);
    updateCartDisplay();
}

// Función para completar venta
async function completeSale() {
    if (state.cart.length === 0) {
        alert('El carrito está vacío');
        return;
    }
    
    try {
        const subtotal = state.cart.reduce((sum, item) => sum + (item.cantidad * item.precio_venta), 0);
        const iva = subtotal * 0.16;
        const total = subtotal + iva;
        
        const ventaData = {
            productos: state.cart.map(item => ({
                id_producto: item.id_producto,
                cantidad: item.cantidad,
                precio_unitario: item.precio_venta
            })),
            subtotal: subtotal,
            impuestos: iva,
            total: total,
            metodo_pago: 'efectivo'
        };
        
        const response = await fetch(`${API_BASE_URL}/ventas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(ventaData)
        });
        
        if (response.ok) {
            alert('Venta completada exitosamente');
            state.cart = [];
            updateCartDisplay();
        } else {
            alert('Error al procesar la venta');
        }
    } catch (error) {
        console.error('Error al completar venta:', error);
        alert('Error al procesar la venta');
    }
}

// Hacer funciones globales
window.loadProducts = loadProducts;
window.addToCart = addToCart;
window.changeQuantity = changeQuantity;
window.removeFromCart = removeFromCart;
window.completeSale = completeSale;
window.updateCartDisplay = updateCartDisplay;

// Ejecutar cuando cargue
setTimeout(() => {
    loadProducts();
}, 100);