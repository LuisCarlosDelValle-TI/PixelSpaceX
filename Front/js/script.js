// Front/js/script.js

//

// Sistema de navegación simple
const SectionManager = {
    currentSection: null,
    
    // Disparar evento cuando se cambia de sección
    onSectionChange: function(newSection, oldSection) {
        console.log(`Cambio de sección: ${oldSection} → ${newSection}`);
        this.currentSection = newSection;
        
        // No hacer nada automáticamente, el usuario debe usar el botón refrescar o recargar la página
    }
};

async function loadSection(section) {
    try {
        const oldSection = SectionManager.currentSection;
        const mainContent = document.getElementById('mainContent');
        
        // Mostrar indicador de carga
        mainContent.innerHTML = `
            <div class="flex justify-center items-center h-64">
                <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>`;
        
        // Actualizar la clase activa en los enlaces
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('bg-gray-100', 'text-blue-600');
            if (link.dataset.section === section) {
                link.classList.add('bg-gray-100', 'text-blue-600');
            }
        });

        if (section === 'dashboard') {
            // Cargar el dashboard
            const response = await fetch('/Front/views/dashboard.html');
            const html = await response.text();
            mainContent.innerHTML = html;
            document.title = 'Panel de Control | Papelería Luis';
            
            // Cargar el script del dashboard si no está cargado
            if (!document.querySelector('script[src="/Front/js/dashboard.js"]')) {
                const script = document.createElement('script');
                script.src = '/Front/js/dashboard.js';
                script.onload = () => {
                    console.log('✅ Script de dashboard cargado');
                    // Intentar inicializar después de un breve delay
                    setTimeout(() => {
                        if (typeof initializeDashboard === 'function') {
                            console.log('🚀 Inicializando dashboard con datos reales...');
                            initializeDashboard();
                        } else {
                            console.error('❌ Función initializeDashboard no encontrada');
                        }
                    }, 100);
                };
                document.head.appendChild(script);
            } else {
                // El script ya está cargado, solo inicializar
                setTimeout(() => {
                    if (typeof initializeDashboard === 'function') {
                        console.log('🚀 Re-inicializando dashboard...');
                        initializeDashboard();
                    }
                }, 100);
            }
        } 
        else if (section === 'ventas') {
            // Cargar la sección de ventas
            const response = await fetch('/Front/views/ventas.html');
            const html = await response.text();
            mainContent.innerHTML = html;
            
            // Cargar el script de ventas y forzar ejecución inmediata
            const script = document.createElement('script');
            script.src = '/Front/js/ventas.js';
            
            script.onload = () => {
                console.log('Script de ventas cargado');
                
                // FORZAR ejecución múltiple con diferentes métodos
                setTimeout(() => {
                    console.log('=== FORZANDO CARGA DE VENTAS ===');
                    
                    // Método 1: initVentas
                    if (window.initVentas) {
                        console.log('Método 1: Ejecutando initVentas');
                        window.initVentas();
                    }
                    
                    // Método 2: loadProductsConReintentos
                    if (window.loadProductsConReintentos) {
                        console.log('Método 2: Ejecutando loadProductsConReintentos');
                        window.loadProductsConReintentos();
                    }
                    
                    // Método 3: loadProducts directo
                    if (window.loadProducts) {
                        console.log('Método 3: Ejecutando loadProducts');
                        window.loadProducts();
                    }
                    
                    // Método 4: Fetch directo como último recurso
                    console.log('Método 4: Fetch directo para ventas');
                    fetch('http://localhost:3001/api/productos')
                        .then(response => response.json())
                        .then(data => {
                            console.log('Datos para ventas obtenidos directamente:', data);
                            if (data.data && data.data.length > 0) {
                                console.log('✅ API funcionando para ventas');
                            }
                        })
                        .catch(error => {
                            console.error('❌ Error en fetch directo para ventas:', error);
                        });
                }, 100);
                
                // Intentar cada 500ms por 5 segundos
                let attempts = 0;
                const maxAttempts = 10;
                const interval = setInterval(() => {
                    attempts++;
                    console.log(`Intento ${attempts}: Verificando funciones de ventas...`);
                    
                    if (window.initVentas) {
                        console.log('✅ initVentas encontrada, ejecutando...');
                        window.initVentas();
                        
                        setTimeout(() => {
                            if (window.loadProductsConReintentos) {
                                window.loadProductsConReintentos();
                            }
                        }, 200);
                        
                        clearInterval(interval);
                    } else if (attempts >= maxAttempts) {
                        console.log('❌ Máximo de intentos alcanzado para ventas');
                        clearInterval(interval);
                    }
                }, 500);
            };
            
            document.body.appendChild(script);
            document.title = 'Ventas | Papelería Luis';
            
            // Disparar evento de cambio de sección
            SectionManager.onSectionChange(section, SectionManager.currentSection);
        }
        else if (section === 'productos') {
            // Cargar la sección de productos
            const response = await fetch('/Front/views/inventario.html');
            const html = await response.text();
            mainContent.innerHTML = html;
            document.title = 'Gestión de Productos | Papelería Luis';
            
            // Cargar el script de inventario primero
            const inventarioScript = document.createElement('script');
            inventarioScript.src = '/Front/js/inventario.js';
            inventarioScript.onload = () => {
                console.log('✅ Script de inventario cargado');
                
                // Ejecutar carga de productos después de cargar el script
                setTimeout(() => {
                    if (window.cargarProductos) {
                        console.log('🚀 Ejecutando cargarProductos desde inventario.js');
                        window.cargarProductos();
                    } else {
                        console.log('⚠️ Función cargarProductos no encontrada, usando carga directa');
                        // Fallback a carga directa
                        loadProductosDirecto();
                    }
                }, 100);
            };
            document.head.appendChild(inventarioScript);
            
            // FUNCIÓN DE FALLBACK para carga directa
            async function loadProductosDirecto() {
                console.log('🔵 [SCRIPT] Ejecutando carga forzada de productos...');
                
                try {
                    const tbody = document.querySelector('#tabla-productos tbody');
                    if (tbody) {
                        console.log('✅ [SCRIPT] Tabla encontrada, cargando productos...');
                        
                        // Mostrar loading
                        tbody.innerHTML = `
                            <tr>
                                <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                                    <i class="fas fa-spinner fa-spin mr-2"></i> Cargando productos...
                                </td>
                            </tr>
                        `;
                        
                        const response = await fetch('http://localhost:3001/api/productos');
                        const data = await response.json();
                        
                        console.log('✅ [SCRIPT] Productos recibidos:', data.data.length, 'productos');
                        
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
                            
                            console.log(`✅ [SCRIPT] ${data.data.length} productos renderizados exitosamente`);
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
                    } else {
                        console.error('❌ [SCRIPT] No se encontró la tabla tbody');
                    }
                } catch (error) {
                    console.error('❌ [SCRIPT] Error al cargar productos:', error);
                    
                    const tbody = document.querySelector('#tabla-productos tbody');
                    if (tbody) {
                        tbody.innerHTML = `
                            <tr>
                                <td colspan="5" class="px-6 py-4 text-center text-red-500">
                                    <i class="fas fa-exclamation-triangle mr-2"></i>
                                    Error: ${error.message}
                                </td>
                            </tr>
                        `;
                    }
                }
            }
            
            // Disparar evento de cambio de sección
            SectionManager.onSectionChange(section, SectionManager.currentSection);
        }
        else if (section === 'reportes') {
            // Cargar la sección de reportes
            const response = await fetch('/Front/views/reportes.html');
            const html = await response.text();
            mainContent.innerHTML = html;
            document.title = 'Reportes | Papelería Luis';
            
            // Disparar evento de cambio de sección para otras secciones
            SectionManager.onSectionChange(section, oldSection);
        }
        // Agregar más condiciones para otras secciones...
        
        // Para secciones que no requieren scripts específicos
        if (!['ventas', 'productos'].includes(section)) {
            SectionManager.onSectionChange(section, oldSection);
        }
        
    } catch (error) {
        console.error('Error al cargar la sección:', error);
        mainContent.innerHTML = `
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong>Error:</strong> No se pudo cargar la sección. Por favor, inténtalo de nuevo.
                <span class="block sm:inline">${error.message}</span>
            </div>`;
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    // Cargar la sección basada en la URL o el dashboard por defecto
    const urlParams = new URLSearchParams(window.location.search);
    const section = urlParams.get('section') || 'dashboard';
    loadSection(section);
    
    // Manejar clics en los enlaces de navegación
    document.addEventListener('click', function(e) {
        if (e.target.closest('.nav-link')) {
            e.preventDefault();
            const section = e.target.closest('.nav-link').dataset.section;
            console.log('Navegando a sección:', section);
            window.history.pushState({}, '', `?section=${section}`);
            loadSection(section);
        }
    });
    
    // Manejar el botón de navegación atrás/adelante
    window.addEventListener('popstate', function() {
        const urlParams = new URLSearchParams(window.location.search);
        const section = urlParams.get('section') || 'dashboard';
        console.log('Popstate detectado, navegando a:', section);
        loadSection(section);
    });
    
    // Listener adicional para detectar cambios de URL programáticos
    let lastUrl = location.href;
    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            console.log('Cambio de URL detectado:', url);
            const urlParams = new URLSearchParams(window.location.search);
            const section = urlParams.get('section') || 'dashboard';
            
            // Solo recargar si es diferente a la sección actual
            if (section !== SectionManager.currentSection) {
                console.log('Nueva sección detectada:', section);
                loadSection(section);
            }
        }
    }).observe(document, { subtree: true, childList: true });
});