# 🚀 Guía de Deployment para Render

## 📋 Problema Identificado

El error que estás viendo es común en deployments de Node.js con SQLite:

```
Error: /opt/render/project/src/node_modules/sqlite3/build/Release/node_sqlite3.node: inválido ELF encabezado
```

**Causa**: Los binarios de SQLite compilados en Windows no son compatibles con los servidores Linux de Render.

## 🔧 Soluciones Implementadas

### Solución 1: Recompilación Automática (Rápida)

He agregado scripts que fuerzan la recompilación de SQLite en el servidor:

```json
"scripts": {
  "postinstall": "npm rebuild sqlite3",
  "build": "npm rebuild sqlite3"
}
```

### Solución 2: Servidor Híbrido (Recomendada)

Creé `server-production.js` que automáticamente:
- Usa PostgreSQL en producción (si `DATABASE_URL` está disponible)
- Usa SQLite en desarrollo local
- Incluye manejo de errores mejorado

## 🚀 Pasos para Re-deployar

### Opción A: Fix Rápido (Solo SQLite)

1. **Commit y push de los cambios**:
```bash
git add .
git commit -m "Fix: Agregar rebuild de SQLite para deployment"
git push origin master
```

2. **En Render Dashboard**:
   - Ve a tu servicio
   - Click en "Manual Deploy" → "Deploy latest commit"
   - Render ejecutará automáticamente `npm rebuild sqlite3`

### Opción B: Solución Robusta (PostgreSQL)

1. **Crear base de datos PostgreSQL en Render**:
   - En tu dashboard de Render
   - Click "New +" → "PostgreSQL"
   - Name: `papeleria-db`
   - Plan: Free
   - Click "Create Database"

2. **Configurar variables de entorno**:
   - Ve a tu Web Service
   - Tab "Environment"
   - Agregar:
     ```
     NODE_ENV=production
     DATABASE_URL=[URL que Render generó para tu PostgreSQL]
     ```

3. **Actualizar el comando de start**:
   - En "Settings" → "Build & Deploy"
   - Start Command: `npm run start:production`

4. **Deploy**:
```bash
git add .
git commit -m "Add: Soporte para PostgreSQL en producción"
git push origin master
```

## 🔧 Configuración Render (render.yaml)

También creé un archivo `render.yaml` que puedes usar:

```yaml
services:
  - type: web
    name: papeleria-sistema
    runtime: node
    buildCommand: npm install && npm rebuild sqlite3
    startCommand: npm start
```

## 🐛 Si Aún Tienes Problemas

### 1. Verificar logs en Render:
- Ve a tu servicio → "Logs"
- Busca errores específicos

### 2. Alternativamente, usar only dependencies compilation:
```bash
# En tu local
npm install --only=production
npm rebuild sqlite3
git add node_modules
git commit -m "Add: Compiled node_modules"
git push
```

### 3. Variables de entorno necesarias:
```
NODE_ENV=production
PORT=10000
```

## ✅ Verificación del Deployment

Una vez deployado exitosamente, deberías ver:

```
✅ Conexión a [SQLite/PostgreSQL] verificada
🚀 Servidor corriendo en puerto 10000
🌐 Entorno: production
💾 Base de datos: [SQLite/PostgreSQL]
```

## 🆘 Troubleshooting Adicional

### Si SQLite sigue fallando:
1. Forzar reinstalación completa:
```json
"scripts": {
  "postinstall": "npm cache clean --force && npm rebuild sqlite3"
}
```

### Si PostgreSQL no conecta:
1. Verificar que `DATABASE_URL` esté configurada
2. Verificar que la base de datos esté en la misma región
3. Revisar logs de conexión

## 📞 Próximos Pasos

1. **Inmediato**: Prueba la Opción A (rebuild automático)
2. **Recomendado**: Migra a PostgreSQL con la Opción B
3. **Futuro**: Considera usar servicios como PlanetScale o Supabase para bases de datos

¿Cuál opción prefieres probar primero?
