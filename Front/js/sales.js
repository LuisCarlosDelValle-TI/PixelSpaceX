// Front/js/sales.js

// Variables globales
let productCounter = 0;
let currentSaleProducts = [];

// Función para abrir el modal
function openSaleModal() {
    document.getElementById('saleModal').classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
    // Limpiar productos anteriores
    document.getElementById('productList').innerHTML = '';
    currentSaleProducts = [];
    productCounter = 0;
    // Agregar una fila de producto por defecto
    addProductRow();
    // Actualizar totales
    calculateTotal();
}

// Función para cerrar el modal
function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
}

// Función para agregar una nueva fila de producto
function addProductRow() {
    const productList = document.getElementById('productList');
    const rowId = `product-${productCounter++}`;
    
    const row = document.createElement('tr');
    row.id = rowId;
    row.className = 'product-row';
    row.innerHTML = `
        <td class="py-2">
            <select onchange="updateProductPrice(this, '${rowId}')" 
                    class="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Seleccionar producto...</option>
                <option value="1" data-price="150.00">Cuaderno profesional</option>
                <option value="2" data-price="25.50">Bolígrafo azul</option>
                <option value="3" data-price="12.75">Lápiz del número 2</option>
                <option value="4" data-price="85.00">Carpeta tamaño carta</option>
            </select>
        </td>
        <td class="px-2">
            <input type="number" min="1" value="1" 
                   onchange="calculateSubtotal('${rowId}')" 
                   class="w-20 px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
        </td>
        <td class="px-2">
            <span class="price">$0.00</span>
        </td>
        <td class="px-2">
            <span class="subtotal">$0.00</span>
        </td>
        <td class="px-2">
            <button type="button" onclick="removeProductRow('${rowId}')" 
                    class="text-red-500 hover:text-red-700">
                <i class="fas fa-times"></i>
            </button>
        </td>
    `;
    
    productList.appendChild(row);
    // Agregar a la lista de productos
    currentSaleProducts.push({
        id: rowId,
        productId: '',
        quantity: 1,
        price: 0,
        subtotal: 0
    });
}

// Función para eliminar una fila de producto
function removeProductRow(rowId) {
    const row = document.getElementById(rowId);
    if (row) {
        row.remove();
        // Eliminar de la lista de productos
        currentSaleProducts = currentSaleProducts.filter(p => p.id !== rowId);
        calculateTotal();
    }
}

// Función para actualizar el precio cuando se selecciona un producto
function updateProductPrice(selectElement, rowId) {
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    const price = selectedOption ? parseFloat(selectedOption.getAttribute('data-price') || 0) : 0;
    
    const row = document.getElementById(rowId);
    if (row) {
        const priceElement = row.querySelector('.price');
        if (priceElement) {
            priceElement.textContent = `$${price.toFixed(2)}`;
            
            // Actualizar en la lista de productos
            const product = currentSaleProducts.find(p => p.id === rowId);
            if (product) {
                product.productId = selectedOption.value;
                product.price = price;
                product.quantity = parseInt(row.querySelector('input[type="number"]').value) || 1;
                product.subtotal = product.price * product.quantity;
                
                // Actualizar subtotal
                const subtotalElement = row.querySelector('.subtotal');
                if (subtotalElement) {
                    subtotalElement.textContent = `$${product.subtotal.toFixed(2)}`;
                }
            }
        }
        calculateTotal();
    }
}

// Función para calcular el subtotal de una fila
function calculateSubtotal(rowId) {
    const row = document.getElementById(rowId);
    if (!row) return;

    const select = row.querySelector('select');
    const quantityInput = row.querySelector('input[type="number"]');
    const subtotalElement = row.querySelector('.subtotal');

    if (select && quantityInput && subtotalElement) {
        const selectedOption = select.options[select.selectedIndex];
        const price = selectedOption ? parseFloat(selectedOption.getAttribute('data-price') || 0) : 0;
        const quantity = parseInt(quantityInput.value) || 0;
        const subtotal = price * quantity;

        subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
        
        // Actualizar en la lista de productos
        const product = currentSaleProducts.find(p => p.id === rowId);
        if (product) {
            product.quantity = quantity;
            product.subtotal = subtotal;
        }
        
        calculateTotal();
    }
}

// Función para calcular el total general
function calculateTotal() {
    let subtotal = 0;
    
    // Calcular subtotal desde la lista de productos
    currentSaleProducts.forEach(product => {
        subtotal += product.subtotal || 0;
    });

    const iva = subtotal * 0.16; // 16% de IVA
    const total = subtotal + iva;

    // Actualizar la interfaz
    const subtotalElement = document.getElementById('subtotal');
    const ivaElement = document.getElementById('iva');
    const totalElement = document.getElementById('total');
    
    if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    if (ivaElement) ivaElement.textContent = `$${iva.toFixed(2)}`;
    if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
}

// Manejar el envío del formulario
document.addEventListener('DOMContentLoaded', function() {
    const saleForm = document.getElementById('saleForm');
    if (saleForm) {
        saleForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validar que haya al menos un producto
            if (currentSaleProducts.length === 0) {
                alert('Debe agregar al menos un producto a la venta');
                return;
            }

            // Aquí iría la lógica para guardar la venta
            const formData = new FormData(this);
            const saleData = {
                clientId: formData.get('clientId'),
                date: formData.get('date'),
                paymentMethod: formData.get('paymentMethod'),
                status: formData.get('status'),
                products: currentSaleProducts.map(p => ({
                    productId: p.productId,
                    quantity: p.quantity,
                    price: p.price,
                    subtotal: p.subtotal
                })),
                subtotal: parseFloat(document.getElementById('subtotal').textContent.replace('$', '')),
                iva: parseFloat(document.getElementById('iva').textContent.replace('$', '')),
                total: parseFloat(document.getElementById('total').textContent.replace('$', ''))
            };

            console.log('Datos de la venta:', saleData);
            
            // Mostrar mensaje de éxito
            alert('Venta registrada exitosamente');
            closeModal('saleModal');
            
            // Recargar la lista de ventas
            if (typeof loadSalesData === 'function') {
                loadSalesData();
            }
        });
    }

    // Inicializar el datepicker
    flatpickr("#dateRange", {
        mode: "range",
        locale: "es",
        dateFormat: "d/m/Y",
        defaultDate: [new Date().setDate(1), new Date()],
        onChange: function(selectedDates, dateStr) {
            if (selectedDates.length === 2) {
                loadSalesData(selectedDates[0], selectedDates[1]);
            }
        }
    });

    // Cargar datos iniciales
    if (typeof loadSalesData === 'function') {
        loadSalesData();
    }
});