"""Contact sheet: python3 sheet.py out.png cols tile_w img1.png [img2.png ...]
Raw RGBA renders (with .json sidecar) are composited over #09090b; RGB images are used as-is."""
import sys, os, json
import numpy as np
from PIL import Image, ImageDraw, ImageFont

def comp(path):
    im = Image.open(path)
    if im.mode != "RGBA":
        return im.convert("RGB")
    a = np.asarray(im).astype(np.float32) / 255
    bg = np.zeros(a.shape[:2] + (3,), np.float32) + np.array([9, 9, 11]) / 255
    al = a[..., 3:4]
    return Image.fromarray(np.clip((a[..., :3] * al + bg * (1 - al)) * 255, 0, 255).astype(np.uint8))

out, cols, tw = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
files = sys.argv[4:]
th = int(tw * 16 / 9)
rows = (len(files) + cols - 1) // cols
sheet = Image.new("RGB", (cols * tw, rows * (th + 22)), (24, 24, 27))
d = ImageDraw.Draw(sheet)
try:
    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 14)
except Exception:
    font = ImageFont.load_default()
for i, f in enumerate(files):
    im = comp(f).resize((tw, th), Image.LANCZOS)
    x, y = (i % cols) * tw, (i // cols) * (th + 22)
    sheet.paste(im, (x, y + 22))
    d.text((x + 4, y + 3), os.path.basename(f).rsplit(".", 1)[0], fill=(230, 230, 230), font=font)
sheet.save(out)
print("sheet", out, sheet.size)
