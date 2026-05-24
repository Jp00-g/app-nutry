# 🥗 Mi App de Dieta — Guía de instalación

App PWA para planificar la dieta semanal y generar la lista de la compra, conectada a Google Sheets.

---

## 📋 Qué necesitas antes de empezar

- Cuenta de Google (Gmail)
- Cuenta de GitHub
- Node.js instalado en tu ordenador (descárgalo en nodejs.org)
- El Excel `Mi_App_de_Dieta_Completa.xlsx` que ya tienes

---

## PASO 1 — Sube el Excel a Google Sheets

1. Ve a **drive.google.com**
2. Arrastra el archivo `Mi_App_de_Dieta_Completa.xlsx` a Drive
3. Haz clic derecho → **Abrir con → Google Sheets**
4. Google lo convierte automáticamente. Copia la **URL** del navegador, que tiene este formato:
   ```
   https://docs.google.com/spreadsheets/d/ESTE_ES_TU_ID/edit
   ```
   Guarda ese ID (la parte larga entre `/d/` y `/edit`).

---

## PASO 2 — Configura el Apps Script (backend gratuito)

1. Ve a **script.google.com** (con la misma cuenta Google)
2. Haz clic en **Nuevo proyecto**
3. Borra el código que viene por defecto
4. Pega el contenido del archivo `apps-script/Code.gs` de esta carpeta
5. En la línea 13, sustituye `PEGA_AQUI_EL_ID_DE_TU_GOOGLE_SHEET` por el ID que copiaste antes:
   ```javascript
   const SS_ID = 'abc123xyz...';
   ```
6. Haz clic en **Implementar → Nueva implementación**
7. En "Tipo", selecciona **Aplicación web**
8. Configura:
   - **Ejecutar como:** Yo (tu cuenta)
   - **Quién tiene acceso:** Cualquiera
9. Haz clic en **Implementar**
10. Google te pedirá que autorices permisos → Acepta
11. Copia la **URL de implementación** (algo como `https://script.google.com/macros/s/XXXX/exec`)

---

## PASO 3 — Configura la app con esa URL

1. En la carpeta de la app, copia el archivo `.env.example` y renómbralo `.env`
2. Pega la URL del Apps Script:
   ```
   REACT_APP_SCRIPT_URL=https://script.google.com/macros/s/XXXX/exec
   ```

---

## PASO 4 — Prueba en local (opcional pero recomendado)

```bash
# En la carpeta diet-app:
npm install
npm start
```

Abre el navegador en `http://localhost:3000` y comprueba que carga los datos.

---

## PASO 5 — Publica en GitHub Pages (para tenerlo siempre disponible)

### 5a. Crea el repositorio en GitHub
1. Ve a **github.com** → **New repository**
2. Nombre: `diet-app` (o el que quieras)
3. Visibilidad: **Private** (para que solo lo veas tú)
4. Haz clic en **Create repository**

### 5b. Sube el código
```bash
cd diet-app
git init
git add .
git commit -m "Mi app de dieta"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/diet-app.git
git push -u origin main
```

### 5c. Configura el deploy
En `package.json`, añade tu usuario de GitHub en la línea `homepage`:
```json
"homepage": "https://TU_USUARIO.github.io/diet-app"
```

Instala gh-pages y despliega:
```bash
npm install gh-pages --save-dev
npm run deploy
```

La app estará disponible en: `https://TU_USUARIO.github.io/diet-app`

---

## PASO 6 — Instálala en el móvil como app

### En Android:
1. Abre Chrome y ve a tu URL de GitHub Pages
2. Menú (⋮) → **Añadir a pantalla de inicio**
3. ¡Listo! Aparece como app con icono

### En iPhone:
1. Abre Safari (tiene que ser Safari) y ve a tu URL
2. Botón de compartir (cuadrado con flecha) → **Añadir a pantalla de inicio**
3. ¡Listo!

---

## 🔄 Cada vez que hagas cambios en el código

```bash
npm run deploy
```

Y en unos segundos se actualiza automáticamente en el móvil.

---

## ⚠️ Nota sobre el Apps Script

Cada vez que hagas cambios en el `Code.gs`, debes crear una **nueva implementación** (no editar la existente) y actualizar la URL en el `.env`. Luego vuelve a hacer `npm run deploy`.

---

## 💬 ¿Algo no funciona?

Díselo a Claude y te ayuda a depurarlo. Pega el error exacto que ves en pantalla.
