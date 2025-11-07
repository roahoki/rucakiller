# Íconos Necesarios para RUCAKILLER

Por favor, guarda la imagen del ícono de RUCAKILLER en los siguientes tamaños:

## Archivos Requeridos:

1. **icon.png** - Ícono general (512x512px recomendado)
2. **icon-192.png** - Para PWA Android (192x192px)
3. **icon-512.png** - Para PWA Android (512x512px)
4. **apple-icon.png** - Para iPhone/iPad (180x180px mínimo)
5. **apple-icon-180.png** - Para iPhone/iPad específico (180x180px)
6. **favicon.ico** - Formato ICO tradicional (opcional)

## Cómo Crear los Íconos:

### Opción 1: Usando ImageMagick (si está instalado)
```bash
# Desde la imagen original
convert icon-original.png -resize 192x192 icon-192.png
convert icon-original.png -resize 512x512 icon-512.png
convert icon-original.png -resize 180x180 apple-icon-180.png
cp icon-512.png icon.png
cp apple-icon-180.png apple-icon.png
```

### Opción 2: Online
Usa herramientas como:
- https://realfavicongenerator.net/
- https://www.favicon-generator.org/

### Opción 3: Manual
Abre la imagen en cualquier editor (GIMP, Photoshop, etc.) y exporta en los tamaños indicados.

## Verificación:

Una vez guardados los archivos, la app mostrará:
- ✅ Favicon en la pestaña del navegador
- ✅ Ícono al agregar a pantalla de inicio en iPhone
- ✅ Ícono al agregar a pantalla de inicio en Android
- ✅ Splash screen con el ícono en móviles
