#!/bin/bash

# Script to restore original Safari PNG icons with gold ring and dollar sign
# Uses the favicon-512x512.png as the high-quality source

# Set directories
FAVICONS_DIR="public/favicons"
SAFARI_PNG_DIR="$FAVICONS_DIR/safari-png"

# Source file - high-res favicon with gold ring and dollar sign
SOURCE_FILE="$FAVICONS_DIR/favicon-512x512.png"
PINNED_TAB_SVG="$FAVICONS_DIR/safari-pinned-tab.svg"
APPLE_TOUCH_SVG="$FAVICONS_DIR/apple-touch-icon.svg"

if [ ! -f "$SOURCE_FILE" ]; then
  echo "Source file $SOURCE_FILE not found. Exiting."
  exit 1
fi

# Define Apple Touch icon sizes
APPLE_TOUCH_SIZES=(57 60 72 76 114 120 144 152 167 180)

echo "Restoring original Safari PNG icons with gold ring and dollar sign..."

# Resize the high-res favicon for all required sizes
for size in "${APPLE_TOUCH_SIZES[@]}"; do
  convert "$SOURCE_FILE" -resize "${size}x${size}" "$SAFARI_PNG_DIR/apple-touch-icon-${size}x${size}.png"
  echo "Restored apple-touch-icon-${size}x${size}.png"
done

# Create the default apple-touch-icon.png (180x180) from the apple-touch-icon.svg
if [ -f "$APPLE_TOUCH_SVG" ]; then
  convert "$APPLE_TOUCH_SVG" -resize "180x180" "$SAFARI_PNG_DIR/apple-touch-icon.png"
  echo "Created default apple-touch-icon.png from SVG"
else
  cp "$SAFARI_PNG_DIR/apple-touch-icon-180x180.png" "$SAFARI_PNG_DIR/apple-touch-icon.png"
  echo "Restored default apple-touch-icon.png from PNG"
fi

# Create precomposed version
cp "$SAFARI_PNG_DIR/apple-touch-icon.png" "$SAFARI_PNG_DIR/apple-touch-icon-precomposed.png"
echo "Restored apple-touch-icon-precomposed.png"

# Create safari-pinned-tab.png (monochrome version)
if [ -f "$PINNED_TAB_SVG" ]; then
  convert "$PINNED_TAB_SVG" -resize "192x192" "$SAFARI_PNG_DIR/safari-pinned-tab.png"
  echo "Created monochrome safari-pinned-tab.png"
else
  # Fallback to creating a black silhouette version
  convert "$SOURCE_FILE" -resize "192x192" -colorspace gray -threshold 50% "$SAFARI_PNG_DIR/safari-pinned-tab.png"
  echo "Created black silhouette safari-pinned-tab.png"
fi

echo "All Safari PNG icons have been restored with gold ring and dollar sign!" 