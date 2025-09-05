// Front/js/dashboard.js

console.log('=== Dashboard script cargado ===');

// Variables globales para los gráficos
let monthlySalesChart = null;
let servicesRevenueChart = null;

// Función fallback para obtener la URL del API
function getApiBaseUrl() {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:3001/api';
    }
    return `${window.location.protocol}//${window.location.host}/api`;
}

// Usar configuración global o fallback
const API_BASE_URL = (window.CONFIG && window.CONFIG.apiBaseUrl) ? window.CONFIG.apiBaseUrl : getApiBaseUrl();

// Función para inicializar el dashboard
async function initializeDashboard() {
    console.log('🔵 [DASHBOARD] Inicializando dashboard...');
    console.log('🌐 [DASHBOARD] API Base URL:', API_BASE_URL);
    
    try {
        // Cargar todas las estadísticas
        await Promise.all([
            loadDashboardStats(),
            loadPopularProducts(),
            loadLowStockProducts(),
            loadServicesStats(),
            loadMonthlySalesChart(),
            initializeServicesChart()
        ]);
        
        console.log('✅ [DASHBOARD] Dashboard inicializado correctamente');
        
    } catch (error) {
        console.error('❌ [DASHBOARD] Error al inicializar dashboard:', error);
        showDashboardError('Error al cargar el dashboard');
    }
}

// Cargar estadísticas principales del dashboard
async function loadDashboardStats() {
    try {
        console.log('📊 Cargando estadísticas principales...');
        
        const response = await fetch(`${API_BASE_URL}/dashboard/stats`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        
        if (data.success) {
            const stats = data.data;
            
            // Actualizar ventas del día
            document.getElementById('daily-sales').textContent = 
                new Intl.NumberFormat('es-MX').format(stats.daily_sales);
            
            // Actualizar tickets emitidos
            document.getElementById('tickets-count').textContent = stats.tickets_count;
            
            // Actualizar ganancias del día
            document.getElementById('daily-profit').textContent = 
                new Intl.NumberFormat('es-MX').format(stats.daily_profit);
            
            // Actualizar productos por agotarse
            document.getElementById('low-stock-count').textContent = stats.low_stock_count;
            document.getElementById('critical-items').textContent = 
                `${stats.critical_count} críticos`;
            
            console.log('✅ Estadísticas principales cargadas');
        }
        
    } catch (error) {
        console.error('❌ Error al cargar estadísticas:', error);
        // Mostrar valores por defecto
        document.getElementById('daily-sales').textContent = '0';
        document.getElementById('tickets-count').textContent = '0';
        document.getElementById('daily-profit').textContent = '0';
        document.getElementById('low-stock-count').textContent = '0';
    }
}

// Cargar productos populares
async function loadPopularProducts(period = 'month') {
    try {
        console.log('🏆 Cargando productos populares...');
        
        const response = await fetch(`${API_BASE_URL}/dashboard/popular-products?period=${period}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        const container = document.getElementById('popular-products-list');
        
        if (data.success && data.data.length > 0) {
            container.innerHTML = '';
            
            data.data.forEach((product, index) => {
                const productElement = document.createElement('div');
                productElement.className = 'flex items-center justify-between p-3 bg-gray-50 rounded-lg';
                
                productElement.innerHTML = `
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
                        <p class="font-bold text-gray-900">${product.total_vendido} vendidos</p>
                        <p class="text-sm text-green-600">$${new Intl.NumberFormat('es-MX').format(product.ingresos_totales)}</p>
                    </div>
                `;
                
                container.appendChild(productElement);
            });
            
        } else {
            container.innerHTML = `
                <div class="text-center py-4 text-gray-400">
                    <i class="fas fa-chart-bar text-2xl mb-2"></i>
                    <p>No hay datos de productos populares</p>
                </div>
            `;
        }
        
        console.log('✅ Productos populares cargados');
        
    } catch (error) {
        console.error('❌ Error al cargar productos populares:', error);
        document.getElementById('popular-products-list').innerHTML = `
            <div class="text-center py-4 text-red-400">
                <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
                <p>Error al cargar productos populares</p>
            </div>
        `;
    }
}
// Cargar productos con stock bajo
async function loadLowStockProducts() {
    try {
        console.log('⚠️ Cargando productos con stock bajo...');
        
        const response = await fetch(`${API_BASE_URL}/dashboard/low-stock`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        const container = document.getElementById('low-stock-items');
        
        if (data.success && data.data.length > 0) {
            container.innerHTML = '';
            
            data.data.forEach(product => {
                const alertLevel = product.stock_actual === 0 ? 'critical' : 'warning';
                const bgColor = alertLevel === 'critical' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200';
                const iconColor = alertLevel === 'critical' ? 'text-red-500' : 'text-yellow-500';
                const textColor = alertLevel === 'critical' ? 'text-red-700' : 'text-yellow-700';
                
                const productElement = document.createElement('div');
                productElement.className = `flex items-center justify-between p-4 rounded-lg border ${bgColor}`;
                
                productElement.innerHTML = `
                    <div class="flex items-center">
                        <i class="fas fa-exclamation-triangle ${iconColor} mr-3"></i>
                        <div>
                            <p class="font-medium text-gray-900">${product.nombre}</p>
                            <p class="text-sm text-gray-500">${product.categoria}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="font-bold ${textColor}">
                            ${product.stock_actual} ${product.unidad_medida || 'unidades'}
                        </p>
                        <p class="text-sm text-gray-500">
                            Mínimo: ${product.stock_minimo}
                        </p>
                    </div>
                `;
                
                container.appendChild(productElement);
            });
            
        } else {
            container.innerHTML = `
                <div class="text-center py-4 text-green-500">
                    <i class="fas fa-check-circle text-2xl mb-2"></i>
                    <p>Todos los productos tienen stock suficiente</p>
                </div>
            `;
        }
        
        console.log('✅ Productos con stock bajo cargados');
        
    } catch (error) {
        console.error('❌ Error al cargar productos con stock bajo:', error);
        document.getElementById('low-stock-items').innerHTML = `
            <div class="text-center py-4 text-red-400">
                <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
                <p>Error al cargar productos con stock bajo</p>
            </div>
        `;
    }
}

// Cargar estadísticas de servicios (copias e impresiones)
async function loadServicesStats(period = 'week') {
    try {
        console.log('🖨️ Cargando estadísticas de servicios...');
        
        const response = await fetch(`${API_BASE_URL}/dashboard/services-stats?period=${period}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        
        if (data.success) {
            const { copies, prints } = data.data;
            
            // Actualizar estadísticas de copias
            document.getElementById('copies-count').textContent = copies.count;
            document.getElementById('copies-revenue').textContent = 
                `$${new Intl.NumberFormat('es-MX').format(copies.revenue)}`;
            document.getElementById('copies-avg').textContent = `$${copies.average}`;
            
            // Actualizar estadísticas de impresiones
            document.getElementById('prints-count').textContent = prints.count;
            document.getElementById('prints-revenue').textContent = 
                `$${new Intl.NumberFormat('es-MX').format(prints.revenue)}`;
            document.getElementById('prints-avg').textContent = `$${prints.average}`;
            
            console.log('✅ Estadísticas de servicios cargadas');
        }
        
    } catch (error) {
        console.error('❌ Error al cargar estadísticas de servicios:', error);
        // Valores por defecto en caso de error
        document.getElementById('copies-count').textContent = '0';
        document.getElementById('copies-revenue').textContent = '$0';
        document.getElementById('copies-avg').textContent = '$0.00';
        document.getElementById('prints-count').textContent = '0';
        document.getElementById('prints-revenue').textContent = '$0';
        document.getElementById('prints-avg').textContent = '$0.00';
    }
}

// Cargar gráfico de ventas mensuales
async function loadMonthlySalesChart() {
    try {
        console.log('📈 Cargando gráfico de ventas mensuales...');
        
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        
        const response = await fetch(`${API_BASE_URL}/dashboard/monthly-sales/${year}/${month}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        
        if (data.success) {
            createMonthlySalesChart(data.data);
        }
        
    } catch (error) {
        console.error('❌ Error al cargar gráfico de ventas mensuales:', error);
    }
}

// Crear gráfico de ventas mensuales
function createMonthlySalesChart(salesData) {
    const ctx = document.getElementById('monthlySalesChart');
    if (!ctx) return;
    
    // Destruir gráfico existente si existe
    if (monthlySalesChart) {
        monthlySalesChart.destroy();
    }
    
    const labels = salesData.map(item => {
        const date = new Date(item.fecha);
        return date.getDate().toString();
    });
    
    const values = salesData.map(item => item.ventas_total || 0);
    
    monthlySalesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Ventas Diarias',
                data: values,
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + new Intl.NumberFormat('es-MX').format(value);
                        }
                    }
                }
            }
        }
    });
}

// Inicializar gráfico de servicios
function initializeServicesChart() {
    const ctx = document.getElementById('servicesRevenueChart');
    if (!ctx) return;
    
    servicesRevenueChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Copias', 'Impresiones', 'Recargas'],
            datasets: [{
                data: [0, 0, 0], // Se actualizará con datos reales
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(168, 85, 247, 0.8)'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Función para mostrar errores del dashboard
function showDashboardError(message) {
    console.error('Dashboard Error:', message);
    
    // Mostrar mensaje de error en el dashboard
    const mainContent = document.getElementById('mainContent');
    if (mainContent) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4';
        errorDiv.innerHTML = `
            <strong>Error:</strong> ${message}
            <button onclick="this.parentElement.remove()" class="float-right text-red-700 hover:text-red-900">
                <i class="fas fa-times"></i>
            </button>
        `;
        mainContent.insertBefore(errorDiv, mainContent.firstChild);
    }
}

// Event listeners para filtros
document.addEventListener('DOMContentLoaded', function() {
    // Filtro de productos populares
    const popularProductsFilter = document.getElementById('popular-products-period');
    if (popularProductsFilter) {
        popularProductsFilter.addEventListener('change', function() {
            loadPopularProducts(this.value);
        });
    }
    
    // Filtro de servicios
    const servicesFilter = document.getElementById('services-period');
    if (servicesFilter) {
        servicesFilter.addEventListener('change', function() {
            loadServicesStats(this.value);
        });
    }
    
    // Actualizar timestamp
    const lastUpdated = document.getElementById('last-updated');
    if (lastUpdated) {
        const now = new Date();
        lastUpdated.textContent = now.toLocaleString('es-MX');
    }
});

// Función para refrescar todo el dashboard
function refreshDashboard() {
    console.log('🔄 Refrescando dashboard...');
    initializeDashboard();
}

// Hacer funciones disponibles globalmente
window.initializeDashboard = initializeDashboard;
window.initializeDashboardCharts = initializeDashboard; // Alias para compatibilidad
window.refreshDashboard = refreshDashboard;

console.log('✅ Dashboard script configurado correctamente');


