import os
from PIL import Image, ImageDraw

os.makedirs('scratch/test_images', exist_ok=True)

colors = [(40, 60, 90), (90, 40, 60), (40, 90, 60), (90, 80, 40), (80, 40, 90)]
for i in range(1, 6):
    img = Image.new('RGB', (1200, 800), color=colors[(i-1)%5])
    d = ImageDraw.Draw(img)
    d.text((50, 50), f"Sample Photo #{i}", fill=(255, 255, 255))
    img.save(f"scratch/test_images/photo_{i:02d}.jpg")

print("Created 5 sample images in scratch/test_images/")
