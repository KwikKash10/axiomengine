#!/bin/bash

# Script to restore Safari PNG icons with gold ring and dollar sign
# Uses the favicon-512x512.png as source to ensure consistency

# Set directories
FAVICONS_DIR="public/favicons"
SAFARI_PNG_DIR="$FAVICONS_DIR/safari-png"

# Source file
SOURCE_FILE="$FAVICONS_DIR/favicon-512x512.png"

if [ ! -f "$SOURCE_FILE" ]; then
  echo "Source file $SOURCE_FILE not found. Exiting."
  exit 1
fi

echo "Restoring Safari PNG icons with gold ring and dollar sign..."

# Restore the most important files - apple-touch-icon.png and apple-touch-icon-precomposed.png
convert "$SOURCE_FILE" -resize "180x180" "$SAFARI_PNG_DIR/apple-touch-icon.png"
echo "Restored apple-touch-icon.png with gold ring and dollar sign"

cp "$SAFARI_PNG_DIR/apple-touch-icon.png" "$SAFARI_PNG_DIR/apple-touch-icon-precomposed.png"
echo "Restored apple-touch-icon-precomposed.png with gold ring and dollar sign"

echo "Safari PNG icons have been restored with gold ring and dollar sign!" 