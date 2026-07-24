# Corrección de formularios — GOLD FIX 1

## Review
El formulario de reseñas usa una función segura de Vercel (`/api/reviews`).
Por eso no puede probarse con Live Server. En local ahora muestra un mensaje claro en lugar del error de JSON.

Para probarlo:
1. Subir esta versión a Vercel.
2. Crear la variable `SANITY_WRITE_TOKEN` en Vercel.
3. Hacer un nuevo deploy.
4. Probar la reseña desde `https://argentinabyagustina.com`.

## Botón Email Me
Ahora abre directamente el redactor web de Gmail en una pestaña nueva, evitando que Windows quede esperando una aplicación de correo predeterminada.
Los enlaces de texto con la dirección conservan el comportamiento `mailto:`.
