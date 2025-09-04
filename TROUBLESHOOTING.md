# 🚀 Guía de Troubleshooting para Render - Contenido No se Carga

## 🔍 Problema Identificado

Tu app en Render muestra el menú pero no carga gráficos, tablas ni contenido dinámico.

**Causa Principal**: Las URLs del API estaban hardcodeadas para `localhost:3001`, pero en producción Render usa una URL diferente.

## ✅ Soluciones Implementadas

### 1. **URLs Dinámicas**
- ✅ Creado `config.js` que detecta automáticamente el entorno
- ✅ Corregidos todos los archivos JavaScript:
  - `dashboard.js` - Para estadísticas y gráficos
  - `inventario.js` - Para productos  
  - `ventas.js` - Para POS
  - `script.js` - Para navegación

### 2. **Configuración Automática**
```javascript
// Ahora detecta automáticamente:
// Desarrollo: http://localhost:3001/api
// Producción: https://tu-app.onrender.com/api
```

## 🔧 Pasos para Verificar en Render

### 1. **Ir a tu Dashboard de Render**
   - Abre https://dashboard.render.com
   - Busca tu servicio `papeleria-sistema` (o como lo hayas nombrado)

### 2. **Verificar el Deploy**
   - Click en tu servicio
   - Tab "Events" - deberías ver el último deploy exitoso
   - Si está fallando, ve a "Logs" para ver errores

### 3. **Revisar Logs en Tiempo Real**
   - Tab "Logs"
   - Busca mensajes como:
     ```
     ✅ Conexión a SQLite verificada
     🚀 Servidor corriendo en puerto 10000
     ```

### 4. **Probar la URL en Navegador**
   - Tu app debería estar en: `https://[tu-app-name].onrender.com`
   - Abre la consola del navegador (F12)
   - Busca mensajes como:
     ```
     🔧 Configuración cargada: {apiBaseUrl: "https://...", environment: "production"}
     🌐 [DASHBOARD] API Base URL: https://tu-app.onrender.com/api
     ```

## 🐛 Si Aún No Funciona

### **Opción 1: Re-deploy Manual**
1. En Render Dashboard → Tu servicio
2. Click "Manual Deploy" → "Deploy latest commit"
3. Espera a que termine (puede tomar 2-3 minutos)

### **Opción 2: Verificar Variables de Entorno**
En tu servicio de Render:
1. Tab "Environment"
2. Agregar si no existe:
   ```
   NODE_ENV=production
   PORT=10000
   ```

### **Opción 3: Force Clear Cache**
En tu navegador:
1. F12 → Network tab
2. Check "Disable cache"
3. Refrescar la página (Ctrl+F5)

## 🔍 Debug en Producción

### **Abrir Consola del Navegador**
```javascript
// Ejecutar en consola para ver configuración:
console.log('Config:', window.CONFIG);

// Probar API manualmente:
fetch(window.CONFIG.apiBaseUrl + '/productos')
  .then(r => r.json())
  .then(d => console.log('Productos:', d));
```

### **Verificar Red**
- F12 → Network tab
- Refrescar página
- Buscar requests fallidos (rojos)
- Verificar que las URLs sean correctas (no localhost)

## 📱 URLs que Deberías Ver

### ✅ **URLs Correctas en Producción:**
```
https://tu-app.onrender.com/api/dashboard/stats
https://tu-app.onrender.com/api/productos
https://tu-app.onrender.com/api/ventas
```

### ❌ **URLs Incorrectas (ya corregidas):**
```
http://localhost:3001/api/...
```

## 🚨 Errores Comunes y Soluciones

### **Error: "Failed to fetch"**
- **Causa**: API no responde
- **Solución**: Verificar logs de Render, reiniciar servicio

### **Error: "CORS policy"**
- **Causa**: Configuración CORS
- **Solución**: Ya corregido en el servidor

### **Error: "404 Not Found"**
- **Causa**: Ruta no existe
- **Solución**: Verificar que el servidor tenga todas las rutas

## 📞 Próximos Pasos

1. **Inmediato**: Ve a tu app en Render y abre la consola (F12)
2. **Verificar**: Busca los mensajes de configuración en consola
3. **Probar**: Navega entre secciones (Dashboard, Productos, Ventas)
4. **Reportar**: Si sigues teniendo problemas, dime qué ves en los logs de Render

## 💡 URL de tu App

Tu aplicación debería estar disponible en:
```
https://[nombre-de-tu-servicio].onrender.com
```

**¿Ya probaste estos pasos? ¿Qué ves en la consola del navegador?**
