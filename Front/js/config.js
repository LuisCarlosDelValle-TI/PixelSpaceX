// config.js - Configuración centralizada para el frontend

// Función para detectar el entorno y generar la URL del API
function getApiConfig() {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const port = window.location.port;
    
    // Configuración para desarrollo local
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return {
            apiBaseUrl: 'http://localhost:3001/api',
            environment: 'development',
            debug: true
        };
    }
    
    // Configuración para producción
    let productionUrl;
    if (port && port !== '80' && port !== '443') {
        productionUrl = `${protocol}//${hostname}:${port}/api`;
    } else {
        productionUrl = `${protocol}//${hostname}/api`;
    }
    
    return {
        apiBaseUrl: productionUrl,
        environment: 'production',
        debug: false
    };
}

// Exportar configuración
const CONFIG = getApiConfig();

// Función helper para hacer requests con manejo de errores
async function apiRequest(endpoint, options = {}) {
    const url = `${CONFIG.apiBaseUrl}${endpoint}`;
    
    if (CONFIG.debug) {
        console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
    }
    
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (CONFIG.debug) {
            console.log(`✅ API Response:`, data);
        }
        
        return data;
    } catch (error) {
        console.error(`❌ API Error [${endpoint}]:`, error);
        throw error;
    }
}

// Función para mostrar loading state
function showLoading(elementId, message = 'Cargando...') {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-spinner fa-spin text-2xl text-gray-400 mb-2"></i>
                <p class="text-gray-500">${message}</p>
            </div>
        `;
    }
}

// Función para mostrar errores
function showError(elementId, message = 'Error al cargar datos') {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div class="text-center py-8 text-red-500">
                <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
                <p>${message}</p>
                <button onclick="location.reload()" class="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                    Reintentar
                </button>
            </div>
        `;
    }
}

// Log de configuración
console.log('🔧 Configuración cargada:', CONFIG);

// Hacer disponible globalmente
window.CONFIG = CONFIG;
window.apiRequest = apiRequest;
window.showLoading = showLoading;
window.showError = showError;
