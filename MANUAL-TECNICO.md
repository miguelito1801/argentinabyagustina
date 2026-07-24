# Argentina by Agustina 1.1 — Manual técnico

## Tecnologías
HTML5, CSS3, JavaScript, Sanity CMS, Web3Forms, Vercel, Git y GitHub.

## Desarrollo local
### Sanity
```powershell
cd .\studio-argentina-by-agustina-cms\
npm install
npm run dev
```
Panel: http://localhost:3333

### Web
Desde la carpeta principal:
```powershell
npx live-server --port=5500
```
Web: http://127.0.0.1:5500

## Variables de entorno en Vercel
El formulario público de reseñas requiere:
- `SANITY_PROJECT_ID`
- `SANITY_DATASET`
- `SANITY_WRITE_TOKEN`

El token debe tener permiso mínimo para crear documentos de tipo `review`. Nunca debe incluirse en JavaScript público.

## CORS de Sanity
Orígenes autorizados:
- http://localhost:5500
- http://127.0.0.1:5500
- https://argentinabyagustina.com
- https://www.argentinabyagustina.com

No habilitar credenciales para estos orígenes públicos.

## Publicación
1. Probar localmente.
2. Ejecutar `git status`.
3. Crear commit.
4. Hacer push a GitHub.
5. Confirmar el deploy de Vercel.
6. Probar dominio con y sin `www`.
