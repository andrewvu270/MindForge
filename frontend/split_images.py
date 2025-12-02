from PIL import Image
import os

source_path = "/Users/andrwvu/.gemini/antigravity/brain/39116533-a5ab-4814-b2c8-78b6707e67c7/uploaded_image_1764666189902.jpg"
output_dir = "/Users/andrwvu/Desktop/SWE/Projects/MindForge/frontend/src/assets/clay"

# Ensure output directory exists
os.makedirs(output_dir, exist_ok=True)

img = Image.open(source_path)
width, height = img.size

# Calculate midpoints
mid_x = width // 2
mid_y = height // 2

# Define boxes (left, top, right, bottom)
# Top-Left: Technology
box_tech = (0, 0, mid_x, mid_y)
# Top-Right: Finance & Economics
box_finance = (mid_x, 0, width, mid_y)
# Bottom-Left: Soft Skills & Culture
box_culture = (0, mid_y, mid_x, height)
# Bottom-Right: Global Event
box_global = (mid_x, mid_y, width, height)

# Crop and save
img.crop(box_tech).save(os.path.join(output_dir, "scene_tech.png"))
img.crop(box_finance).save(os.path.join(output_dir, "scene_finance.png"))
img.crop(box_culture).save(os.path.join(output_dir, "scene_culture.png"))
img.crop(box_global).save(os.path.join(output_dir, "scene_global.png"))

print("Images split and saved successfully.")
