#!/bin/bash

# Set directories
FAVICONS_DIR="public/favicons"

# Function to convert SVG to PNG using rsvg-convert
convert_svg_to_png() {
  local svg_file=$1
  local png_file=$2
  local size=$3
  
  rsvg-convert -w $size -h $size "$svg_file" -o "$png_file"
  echo "Generated: $png_file"
}

# Apple touch icon source
APPLE_TOUCH_ICON_SVG="$FAVICONS_DIR/apple-touch-icon.svg"
APPLE_TOUCH_SIZES=(57 60 72 76 114 120 144 152 167 180)

# Generate apple touch icons
for size in "${APPLE_TOUCH_SIZES[@]}"; do
  convert_svg_to_png "$APPLE_TOUCH_ICON_SVG" "$FAVICONS_DIR/apple-touch-icon-${size}x${size}.png" $size
done

# Generate main apple touch icon
convert_svg_to_png "$APPLE_TOUCH_ICON_SVG" "$FAVICONS_DIR/apple-touch-icon.png" 180
convert_svg_to_png "$APPLE_TOUCH_ICON_SVG" "$FAVICONS_DIR/apple-touch-icon-precomposed.png" 180

echo "All Apple touch icons have been updated!" 