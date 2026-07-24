# CMS personalizado — Argentina by Agustina

Esta actualización mejora solamente el panel de Sanity. No modifica la página pública ni elimina contenido.

## Cambios

- Pantalla de Inicio con mensaje de Miguel para Agustina.
- Colores inspirados en la web: azul, crema, bordo y dorado.
- Contadores de artículos, lugares, eventos y reseñas pendientes.
- Acceso directo a la página pública.
- Menú reorganizado y en español.
- Reseñas pendientes colocadas en primer lugar.
- Íconos claros para cada sección.
- `Website settings` renombrado como `Información del sitio`.
- Se guardó el App ID del Studio para que los próximos deploys no vuelvan a pedirlo.

## Cómo instalar

Copiar y reemplazar únicamente la carpeta:

`studio-argentina-by-agustina-cms`

Luego, dentro de esa carpeta:

```powershell
npm install
npx sanity deploy
```

Cuando Sanity pregunte si querés volver a desplegar, confirmar.

## Resultado

Agustina seguirá entrando desde:

https://argentina-by-agustina-cms.sanity.studio/
