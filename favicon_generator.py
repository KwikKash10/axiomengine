from PIL import Image
import os

# Define sizes for favicon
sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128)]

# Use the highest resolution source file
source_file = 'public/favicons/favicon-512x512.png'

# Check if source file exists
if not os.path.exists(source_file):
    print(f"Error: Source file {source_file} not found")
    exit(1)

# Load high-resolution image
source_img = Image.open(source_file)
print(f"Loaded source image: {source_file} with size {source_img.size}")

# Create resized versions
images = []
for size in sizes:
    img = source_img.resize(size, Image.Resampling.LANCZOS)
    images.append(img)
    print(f"Created {size[0]}x{size[0]} version")

# Save as ICO files
for path in ['public/favicon.ico', 'public/favicons/favicon.ico']:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    images[0].save(
        path, 
        format='ICO', 
        sizes=[(img.width, img.height) for img in images],
        append_images=images[1:]
    )
    print(f'Created {path} with sizes {[size for size in sizes]}') 