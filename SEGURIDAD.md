# Seguridad — Argentina by Agustina

La seguridad está dividida en dos capas:

1. **Infraestructura:** Vercel/Sanity administran HTTPS, certificados y aislamiento de sus plataformas.
2. **Aplicación:** este proyecto agrega controles propios para formularios, contenido y navegador.

## Controles incluidos

- Token de escritura de Sanity guardado únicamente en una variable privada de Vercel.
- El navegador público nunca recibe ese token.
- Reseñas creadas siempre como `pending`; solo una persona autorizada puede publicarlas.
- Validación de origen, método HTTP, tipo de contenido, tamaño y campos obligatorios.
- Honeypot y control de tiempo contra envíos automáticos.
- Límite orientativo de tres reseñas por hora y dispositivo, sin guardar la IP en texto plano.
- Sanitización de textos y bloqueo de protocolos peligrosos en enlaces del CMS.
- Content Security Policy y encabezados de seguridad en Vercel.
- Protección contra iframes, MIME sniffing y permisos innecesarios de cámara, micrófono y ubicación.
- API de reseñas sin caché y excluida de indexación.

## Recomendaciones operativas

- No compartir nunca `SANITY_WRITE_TOKEN`.
- Agregar a Agustina como miembro con su propia cuenta; no compartir contraseñas.
- Activar verificación en dos pasos en Google, GitHub, Vercel y Sanity.
- Eliminar inmediatamente accesos de personas que ya no colaboren.
- Revisar las reseñas antes de aprobarlas y no publicar correos privados.
- Rotar el token si alguna vez se muestra accidentalmente.
- Mantener una copia del repositorio y actualizar dependencias de forma controlada.

Ningún sitio es invulnerable, pero estas medidas reducen los riesgos principales de esta aplicación sin complicar el uso diario de Agustina.
