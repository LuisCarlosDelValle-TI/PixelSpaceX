// Fixed config.js - Configuración limpia y simple

(function() {
    'use strict';
    
    console.log('🔧 Cargando configuración...');
    
    // Detectar entorno
    function getApiBaseUrl() {
        const hostname = window.location.hostname;
        
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:3001/api';
        }
        
        return window.location.protocol + '//' + window.location.host + '/api';
    }
    
    // Configuración global
    const CONFIG = {
        apiBaseUrl: getApiBaseUrl(),
        environment: (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'development' : 'production',
        debug: (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    };
    
    console.log('✅ Configuración cargada:', CONFIG);
    
    // Hacer disponible globalmente
    window.CONFIG = CONFIG;
    window.API_BASE_URL = CONFIG.apiBaseUrl;
    
})();
