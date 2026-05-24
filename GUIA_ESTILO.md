Actúa como un diseñador de UI/UX senior. El objetivo es transformar la interfaz actual (verde oscuro y marrón) en una experiencia **Premium, moderna y visualmente atractiva**.

## 1. Paleta de Colores (Modo Oscuro Profundo)
Abandona los tonos verdes actuales. Utiliza una escala de grises azulados y negros:
* **Fondo Principal:** `#0F1216` (Casi negro, evita el verde).
* **Tarjetas/Celdas:** `#1A1F26` (Gris oscuro para generar contraste con el fondo).
* **Acentos:** Usar un color vibrante para destacar (ej. Violeta `#8B5CF6` o Azul Eléctrico `#3B82F6`).
* **Texto:** Blanco puro (`#FFFFFF`) para títulos y Gris suave (`#94A3B8`) para descripciones.

## 2. Estética y Componentes
* **Bordes Redondeados:** Aplica un `border-radius: 16px` a todas las celdas y botones.
* **Celdas de Comida:**
    * Sustituye la etiqueta de texto "CARNES" por un chip pequeño y elegante con degradado sutil.
    * **Imágenes/Iconos:** Cada celda debe incluir un **emoji descriptivo grande** o un placeholder para una imagen circular (avatar de plato).
* **Celdas Vacías:** No uses botones verdes sólidos. Usa un fondo muy sutil con un borde punteado (dashed) y un icono de `+` minimalista.

## 3. Tipografía y Jerarquía
* **Fuente:** Sans-serif moderna (Inter, Poppins o Montserrat).
* **Títulos:** Peso `600` (Semi-bold) con mayor tamaño.
* **Subtítulos (LUN, MAR, MIÉ):** Todo en mayúsculas, letra pequeña y espaciada (`letter-spacing: 0.1em`) en color gris.

## 4. Barra de Navegación (Bottom Nav)
* Aplica un efecto de **Glassmorphism**: Fondo translúcido con desenfoque (`backdrop-filter: blur(10px)`).
* Iconos con trazo fino (estilo lineal) y solo el icono activo con el color de acento.

## 5. Referencia Visual (Layout)
| Momento | Lunes | Martes | Miércoles |
| :--- | :--- | :--- | :--- |
| **Desayuno** | 🥩 Cordero | [+] | [+] |
| **Comida** | 🍗 Alitas | [+] | [+] |

---

**Instrucción Final:** Genera el código (React/Tailwind o HTML/CSS) aplicando estas reglas de diseño para que la app se sienta como una herramienta de salud moderna y no como una hoja de cálculo antigua.