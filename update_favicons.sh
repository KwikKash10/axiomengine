#!/bin/bash

# Set directories
FAVICONS_DIR="public/favicons"
SAFARI_PNG_DIR="$FAVICONS_DIR/safari-png"

# Function to convert SVG to PNG using rsvg-convert
convert_svg_to_png() {
  local svg_file=$1
  local png_file=$2
  local size=$3
  
  rsvg-convert -w $size -h $size "$svg_file" -o "$png_file"
  echo "Generated: $png_file"
}

# Generate regular favicon PNG files from favicon.svg
FAVICON_SVG="$FAVICONS_DIR/favicon.svg"
SIZES=(16 32 48 64 128 192 256 384 512)

for size in "${SIZES[@]}"; do
  convert_svg_to_png "$FAVICON_SVG" "$FAVICONS_DIR/favicon-${size}x${size}.png" $size
done

# Generate icon PNG files (larger sizes)
ICON_SIZES=(192 384 512)
for size in "${ICON_SIZES[@]}"; do
  convert_svg_to_png "$FAVICON_SVG" "$FAVICONS_DIR/icon-${size}x${size}.png" $size
done

# Generate maskable icon (for PWA)
convert_svg_to_png "$FAVICON_SVG" "$FAVICONS_DIR/maskable-icon.png" 512

# Apple touch icon sizes
APPLE_TOUCH_ICON_SVG="$FAVICONS_DIR/apple-touch-icon.svg"
APPLE_TOUCH_SIZES=(57 60 72 76 114 120 144 152 167 180)

# Generate apple touch icons for both directories
for size in "${APPLE_TOUCH_SIZES[@]}"; do
  convert_svg_to_png "$APPLE_TOUCH_ICON_SVG" "$FAVICONS_DIR/apple-touch-icon-${size}x${size}.png" $size
  convert_svg_to_png "$APPLE_TOUCH_ICON_SVG" "$SAFARI_PNG_DIR/apple-touch-icon-${size}x${size}.png" $size
done

# Generate main apple touch icon
convert_svg_to_png "$APPLE_TOUCH_ICON_SVG" "$FAVICONS_DIR/apple-touch-icon.png" 180
convert_svg_to_png "$APPLE_TOUCH_ICON_SVG" "$SAFARI_PNG_DIR/apple-touch-icon.png" 180
convert_svg_to_png "$APPLE_TOUCH_ICON_SVG" "$FAVICONS_DIR/apple-touch-icon-precomposed.png" 180

# Generate favicon.ico (using ImageMagick's convert)
echo "Generating favicon.ico..."
convert "$FAVICONS_DIR/favicon-16x16.png" "$FAVICONS_DIR/favicon-32x32.png" "$FAVICONS_DIR/favicon-48x48.png" "$FAVICONS_DIR/favicon-64x64.png" "$FAVICONS_DIR/favicon.ico"

echo "All favicon files have been updated!" 