#!/bin/bash

# Script para configurar los íconos de RUCAKILLER
# Uso: ./setup-icons.sh <ruta-imagen-original>

if [ -z "$1" ]; then
    echo "❌ Error: Debes proporcionar la ruta de la imagen original"
    echo "Uso: ./setup-icons.sh <ruta-imagen-original.png>"
    exit 1
fi

ORIGINAL=$1
PUBLIC_DIR="/root/projects/rucakiller/public"

if [ ! -f "$ORIGINAL" ]; then
    echo "❌ Error: No se encuentra el archivo $ORIGINAL"
    exit 1
fi

echo "📦 Procesando íconos de RUCAKILLER..."

# Verificar si tenemos ImageMagick
if command -v convert &> /dev/null; then
    echo "✅ ImageMagick encontrado, generando íconos..."
    
    convert "$ORIGINAL" -resize 192x192 "$PUBLIC_DIR/icon-192.png"
    convert "$ORIGINAL" -resize 512x512 "$PUBLIC_DIR/icon-512.png"
    convert "$ORIGINAL" -resize 180x180 "$PUBLIC_DIR/apple-icon-180.png"
    cp "$PUBLIC_DIR/icon-512.png" "$PUBLIC_DIR/icon.png"
    cp "$PUBLIC_DIR/apple-icon-180.png" "$PUBLIC_DIR/apple-icon.png"
    
    echo "✅ Íconos generados exitosamente!"
    
elif command -v magick &> /dev/null; then
    echo "✅ ImageMagick (magick) encontrado, generando íconos..."
    
    magick "$ORIGINAL" -resize 192x192 "$PUBLIC_DIR/icon-192.png"
    magick "$ORIGINAL" -resize 512x512 "$PUBLIC_DIR/icon-512.png"
    magick "$ORIGINAL" -resize 180x180 "$PUBLIC_DIR/apple-icon-180.png"
    cp "$PUBLIC_DIR/icon-512.png" "$PUBLIC_DIR/icon.png"
    cp "$PUBLIC_DIR/apple-icon-180.png" "$PUBLIC_DIR/apple-icon.png"
    
    echo "✅ Íconos generados exitosamente!"
    
else
    echo "⚠️  ImageMagick no está instalado"
    echo "📋 Copia manual necesaria:"
    echo ""
    echo "Por favor, crea las siguientes versiones de la imagen manualmente:"
    echo "  - icon-192.png (192x192px)"
    echo "  - icon-512.png (512x512px)"
    echo "  - apple-icon-180.png (180x180px)"
    echo "  - icon.png (512x512px)"
    echo "  - apple-icon.png (180x180px)"
    echo ""
    echo "Y guárdalas en: $PUBLIC_DIR"
fi

echo ""
echo "📱 Configuración completa:"
echo "  ✅ manifest.json creado"
echo "  ✅ metadata configurado en layout.tsx"
echo ""
echo "🧪 Para probar:"
echo "  1. npm run build"
echo "  2. npm start"
echo "  3. Abre en navegador y agrega a pantalla de inicio"
