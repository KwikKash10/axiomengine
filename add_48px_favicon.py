#!/usr/bin/env python3
import os
from PIL import Image

# Paths to PNG images
favicon_dir = "public/favicons"
sizes = [16, 32, 48]
png_files = [os.path.join(favicon_dir, f"favicon-{size}x{size}.png") for size in sizes]
output_ico = os.path.join(favicon_dir, "favicon.ico")

# Open all images
images = []
for png_file in png_files:
    if os.path.exists(png_file):
        img = Image.open(png_file).convert("RGBA")
        images.append(img)
    else:
        print(f"Warning: {png_file} does not exist")

if images:
    # Save as ICO with all sizes
    images[0].save(
        output_ico,
        format="ICO",
        sizes=[(img.width, img.height) for img in images],
        append_images=images[1:]
    )
    print(f"Created favicon.ico with {len(images)} sizes: {', '.join([f'{img.width}x{img.height}' for img in images])}")
else:
    print("No valid PNG files found") 