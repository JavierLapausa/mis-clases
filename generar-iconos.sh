# Generador simple de iconos PNG desde SVG
# Para generar los iconos PNG, usa uno de estos métodos:

# Método 1: Online converter (más fácil)
# 1. Ve a https://cloudconvert.com/svg-to-png
# 2. Sube icon.svg
# 3. Establece el tamaño: 192x192 para empezar
# 4. Descarga como icon-192.png

# Método 2: ImageMagick (si tienes instalado)
convert icon.svg -resize 72x72 icon-72.png
convert icon.svg -resize 96x96 icon-96.png  
convert icon.svg -resize 128x128 icon-128.png
convert icon.svg -resize 144x144 icon-144.png
convert icon.svg -resize 152x152 icon-152.png
convert icon.svg -resize 192x192 icon-192.png
convert icon.svg -resize 384x384 icon-384.png
convert icon.svg -resize 512x512 icon-512.png

# Método 3: Usando Inkscape (gratis)
# 1. Abre icon.svg en Inkscape
# 2. File → Export PNG Image
# 3. Set width/height para cada tamaño
# 4. Export como icon-[SIZE].png

echo "Usa uno de los métodos arriba para generar los iconos PNG desde el SVG"
