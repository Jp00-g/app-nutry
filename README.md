# 🥗 Mi App de Dieta — Guía de instalación

App PWA para planificar la dieta semanal y generar la lista de la compra, conectada a Firebase (Firestore).

---

## 📋 Qué necesitas antes de empezar

- Cuenta de Google (Gmail)
- Cuenta de GitHub
- Node.js instalado en tu ordenador (descárgalo en nodejs.org)

---

## PASO 1 — Crea el proyecto en Firebase

1. Ve a **console.firebase.google.com**
2. Haz clic en **Añadir proyecto** y dale un nombre (p.ej. `app-nutry`)
3. Desactiva Google Analytics si no lo necesitas → **Crear proyecto**
4. En el menú lateral, ve a **Firestore Database** → **Crear base de datos**
   - Modo: **Producción** (luego ajustas las reglas)
   - Ubicación: `eur3 (europe-west)` o la más cercana
5. Ve a **Configuración del proyecto** (icono ⚙️ arriba a la izquierda) → **General**
6. En "Tus apps", haz clic en `</>` (Web) para registrar la app
7. Dale un nombre y copia el objeto `firebaseConfig` que aparece — lo necesitarás en el siguiente paso

---

## PASO 2 — Configura las variables de entorno

1. En la carpeta de la app, copia el archivo `.env.example` y renómbralo `.env`
2. Rellena con los valores de tu `firebaseConfig`:
   ```
   REACT_APP_FIREBASE_API_KEY=AIzaSy...
   REACT_APP_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=tu-proyecto
   REACT_APP_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
   REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123
   ```

---

## PASO 3 — Ajusta las reglas de Firestore

En **Firebase Console → Firestore → Reglas**, pega esto para acceso sin autenticación (solo para uso personal/privado):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

---

## PASO 4 — Prueba en local

```bash
# En la carpeta diet-app:
npm install
npm start
```

Abre el navegador en `http://localhost:3000` y comprueba que carga y guarda datos correctamente.

---

## PASO 5 — Publica en GitHub Pages

### 5a. Crea el repositorio en GitHub
1. Ve a **github.com** → **New repository**
2. Nombre: `app-nutry` (o el que quieras — debe coincidir con `homepage` en `package.json`)
3. Visibilidad: **Private**
4. Haz clic en **Create repository**

### 5b. Sube el código
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/app-nutry.git
git push -u origin main
```

### 5c. Despliega
```bash
npm run deploy
```

La app estará disponible en la URL definida en `homepage` dentro de `package.json`.

---

## 🔄 Desplegar cambios

Cada vez que hagas cambios en el código y quieras publicarlos:

```bash
# 1. Haz commit de tus cambios
git add .
git commit -m "Descripción del cambio"
git push

# 2. Despliega a GitHub Pages
npm run deploy
```

`npm run deploy` hace `build` y sube el resultado a la rama `gh-pages` automáticamente. En unos segundos se actualiza en el móvil.

---

## 📱 Instálala en el móvil como app

### En Android:
1. Abre Chrome y ve a tu URL de GitHub Pages
2. Menú (⋮) → **Añadir a pantalla de inicio**

### En iPhone:
1. Abre Safari y ve a tu URL
2. Botón de compartir → **Añadir a pantalla de inicio**

---

## 💬 ¿Algo no funciona?

Díselo a Claude y te ayuda a depurarlo. Pega el error exacto que ves en pantalla.
