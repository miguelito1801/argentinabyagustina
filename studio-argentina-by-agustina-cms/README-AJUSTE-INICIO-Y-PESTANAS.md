# Ajuste final del CMS

Esta entrega combina dos mejoras:

1. **Inicio aparece primero** en la barra superior.
2. Los accesos del panel de Inicio abren el contenido en **una pestaña nueva**, de modo que la guía y los contadores permanecen abiertos.

Los enlaces internos normales dentro de **Contenido** continúan funcionando en la misma pestaña para evitar abrir demasiadas ventanas.

## Instalación

Reemplazar la carpeta `studio-argentina-by-agustina-cms` del proyecto por esta carpeta y ejecutar:

```powershell
npx sanity deploy
```

No modifica ni elimina documentos guardados en Sanity.
