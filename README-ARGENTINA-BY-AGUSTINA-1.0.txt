ARGENTINA BY AGUSTINA 1.0
==========================

Esta entrega integra:
- Sanity CMS para artículos, lugares, eventos, reseñas y ajustes.
- Páginas individuales de artículos, lugares y eventos.
- Moderación de reseñas (Pending / Approved / Rejected).
- Buscador y filtros de contenido.
- Newsletter mediante Web3Forms.
- SEO, Open Graph, sitemap, robots y rutas para Vercel.
- Diseño responsive, accesibilidad y animaciones suaves.

PRUEBA LOCAL
1. Terminal CMS: cd studio-argentina-by-agustina-cms && npm run dev
2. Terminal web: npx live-server --port=5500

IMPORTANTE PARA RESEÑAS
El envío público usa /api/reviews y requiere SANITY_WRITE_TOKEN en Vercel.
No pongas ese token dentro de script.js.

ANTES DEL DEPLOY
- Borrar contenidos de prueba como “araña”.
- Cargar al menos 1 lugar, 1 evento, 1 artículo y 1 review aprobada.
- Verificar WhatsApp, email, Web3Forms y variables de Vercel.
