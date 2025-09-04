// Dashboard simplificado y funcional

console.log('=== Dashboard script cargado ===');

// Variables globales
let monthlySalesChart = null;
let servicesRevenueChart = null;

// Función para obtener URL base del API
function getApiUrl() {
    if (window.API_BASE_URL) {
        return window.API_BASE_URL;
    }
    
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3001/api';
    }
    return window.location.protocol + '//' + window.location.host + '/api';
}

// Función principal para inicializar dashboard
async function initializeDashboard() {
    console.log('🔵 Inicializando dashboard...');
    
    const apiUrl = getApiUrl();
    console.log('🌐 API URL:', apiUrl);
    
    try {
        await loadDashboardStats(apiUrl);
        await loadPopularProducts(apiUrl);
        await loadLowStockProducts(apiUrl);
        console.log('✅ Dashboard inicializado');
    } catch (error) {
        console.error('❌ Error en dashboard:', error);
        showFallbackData();
    }
}

// Cargar estadísticas principales
async function loadDashboardStats(apiUrl) {
    try {
        const response = await fetch(apiUrl + '/dashboard/stats');
        const data = await response.json();
        
        if (data.success) {
            updateElement('daily-sales', data.data.daily_sales || 0);
            updateElement('tickets-count', data.data.tickets_count || 0);
            updateElement('daily-profit', data.data.daily_profit || 0);
            updateElement('low-stock-count', data.data.low_stock_count || 0);
        } else {
            throw new Error('No se pudieron cargar las estadísticas');
        }
    } catch (error) {
        console.error('Error estadísticas:', error);
        updateElement('daily-sales', '0');
        updateElement('tickets-count', '0');
        updateElement('daily-profit', '0');
        updateElement('low-stock-count', '0');
    }
}

// Cargar productos populares
async function loadPopularProducts(apiUrl) {
    try {
        const response = await fetch(apiUrl + '/dashboard/popular-products');
        const data = await response.json();
        
        const container = document.getElementById('popular-products-list');
        if (!container) return;
        
        if (data.success && data.data.length > 0) {
            container.innerHTML = '';
            data.data.forEach((product, index) => {
                const div = document.createElement('div');
                div.className = 'flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2';
                div.innerHTML = `
                    <div class="flex items-center">
                        <div class="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                            ${index + 1}
                        </div>
                        <div>
                            <p class="font-medium text-gray-900">${product.nombre}</p>
                            <p class="text-sm text-gray-500">${product.categoria}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="font-bold text-gray-900">${product.total_vendido || 0} vendidos</p>
                        <p class="text-sm text-green-600">$${(product.ingresos_totales || 0).toLocaleString()}</p>
                    </div>
                `;
                container.appendChild(div);
            });
        } else {
            container.innerHTML = '<p class="text-gray-500 text-center py-4">No hay datos de productos populares</p>';
        }
    } catch (error) {
        console.error('Error productos populares:', error);
        const container = document.getElementById('popular-products-list');
        if (container) {
            container.innerHTML = '<p class="text-red-500 text-center py-4">Error al cargar productos populares</p>';
        }
    }
}

// Cargar productos con stock bajo
async function loadLowStockProducts(apiUrl) {
    try {
        const response = await fetch(apiUrl + '/dashboard/low-stock');
        const data = await response.json();
        
        const container = document.getElementById('low-stock-items');
        if (!container) return;
        
        if (data.success && data.data.length > 0) {
            container.innerHTML = '';
            data.data.forEach(product => {
                const div = document.createElement('div');
                const alertClass = product.stock_actual === 0 ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200';
                const iconClass = product.stock_actual === 0 ? 'text-red-500' : 'text-yellow-500';
                
                div.className = `flex items-center justify-between p-3 rounded-lg border ${alertClass} mb-2`;
                div.innerHTML = `
                    <div class="flex items-center">
                        <i class="fas fa-exclamation-triangle ${iconClass} mr-3"></i>
                        <div>
                            <p class="font-medium text-gray-900">${product.nombre}</p>
                            <p class="text-sm text-gray-500">${product.categoria}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="font-bold">${product.stock_actual} ${product.unidad_medida || 'unidades'}</p>
                        <p class="text-sm text-gray-500">Mínimo: ${product.stock_minimo}</p>
                    </div>
                `;
                container.appendChild(div);
            });
        } else {
            container.innerHTML = '<p class="text-green-500 text-center py-4"><i class="fas fa-check-circle mr-2"></i>Todos los productos tienen stock suficiente</p>';
        }
    } catch (error) {
        console.error('Error stock bajo:', error);
        const container = document.getElementById('low-stock-items');
        if (container) {
            container.innerHTML = '<p class="text-red-500 text-center py-4">Error al cargar productos con stock bajo</p>';
        }
    }
}

// Función auxiliar para actualizar elementos
function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        if (typeof value === 'number') {
            element.textContent = value.toLocaleString();
        } else {
            element.textContent = value;
        }
    }
}

// Mostrar datos de fallback
function showFallbackData() {
    updateElement('daily-sales', '0');
    updateElement('tickets-count', '0');
    updateElement('daily-profit', '0');
    updateElement('low-stock-count', '0');
    
    const popularContainer = document.getElementById('popular-products-list');
    if (popularContainer) {
        popularContainer.innerHTML = '<p class="text-gray-500 text-center py-4">Datos no disponibles</p>';
    }
    
    const stockContainer = document.getElementById('low-stock-items');
    if (stockContainer) {
        stockContainer.innerHTML = '<p class="text-gray-500 text-center py-4">Datos no disponibles</p>';
    }
}

// Hacer funciones disponibles globalmente
window.initializeDashboard = initializeDashboard;
window.refreshDashboard = initializeDashboard;

console.log('✅ Dashboard script configurado');
