# 📱 Mi Dieta — Instrucciones de instalación

## Lo que vas a montar
- Una PWA (app móvil) alojada gratis en GitHub Pages
- Una base de datos en Google Sheets sincronizada para ti y tu pareja
- Todo gratis, sin servidores propios

---

## PASO 1 — Subir los datos a Google Sheets

1. Ve a **drive.google.com**
2. Sube el archivo `Mi_App_de_Dieta_Completa.xlsx`
3. Ábrelo → Google te preguntará si quieres abrirlo como Google Sheets → **Sí, abrir con Sheets**
4. Guarda el Sheet ID de la URL (la parte entre `/d/` y `/edit`): `https://docs.google.com/spreadsheets/d/**ESTE_ES_EL_ID**/edit`

---

## PASO 2 — Configurar Google Apps Script

1. Ve a **script.google.com**
2. Crea un **Nuevo proyecto**
3. Borra el código que sale por defecto
4. Pega TODO el contenido del archivo `apps-script.js`
5. **Guarda** (Ctrl+S) y ponle nombre al proyecto (ej: "Mi Dieta Backend")

### Desplegar como Web App:
1. Arriba a la derecha → **Implementar** → **Nueva implementación**
2. Tipo: **Aplicación web**
3. Descripción: "v1"
4. Ejecutar como: **Yo**
5. Acceso: **Cualquier usuario** ← importante
6. Clic en **Implementar**
7. Autoriza los permisos cuando te los pida
8. **Copia la URL** que aparece (empieza por `https://script.google.com/macros/s/...`)

---

## PASO 3 — Publicar la app en GitHub Pages

1. Ve a **github.com** y crea un repositorio nuevo llamado `mi-dieta`
2. Sube todos los archivos de esta carpeta (index.html, manifest.json, sw.js, icon.svg)
3. Ve a **Settings** del repositorio → **Pages** → Source: **main branch / root**
4. GitHub te dará una URL tipo `https://tuusuario.github.io/mi-dieta`

---

## PASO 4 — Configurar la app

1. Abre la URL de GitHub Pages en el móvil (Chrome en Android, Safari en iPhone)
2. La app te pedirá la **URL del Apps Script** del Paso 2
3. Pégala y listo

### Instalar en el móvil:
- **Android**: Chrome → menú (⋮) → "Añadir a pantalla de inicio"
- **iPhone**: Safari → compartir (□↑) → "Añadir a pantalla de inicio"

---

## PASO 5 — Importar los datos del Excel

Como ya tienes los datos en Google Sheets (del Paso 1), necesitas hacer una pequeña configuración en Apps Script para que apunte a tu hoja existente.

En el archivo `apps-script.js`, la función `getOrCreateSpreadsheet()` crea una hoja nueva automáticamente. Para usar la tuya del Excel:

1. En Apps Script, ve a **Propiedades del script** (ícono ⚙️ → Propiedades del proyecto)
2. Añade una propiedad: Clave = `SPREADSHEET_ID`, Valor = el ID de tu Google Sheet del Paso 1
3. ¡Ya está! La app leerá tus datos existentes.

---

## Compartir con tu pareja

Solo pásale la URL de GitHub Pages. Al entrarla desde su móvil e introducir la misma URL del Apps Script, ambos veréis el mismo plan semanal en tiempo real.

---

## Dudas frecuentes

**¿Se actualiza en tiempo real?** Sí, cada cambio se guarda inmediatamente en Google Sheets.

**¿Funciona sin internet?** Los platos y recetas se cachean, pero el plan semanal necesita conexión para sincronizarse.

**¿Es gratis para siempre?** Sí. GitHub Pages es gratis, Google Apps Script tiene un límite generoso (20.000 lecturas/día) más que suficiente para uso personal.
