"""Composite a transparent render (with shadow-catcher alpha) over the app background #09090b
with a very subtle floor glow so the contact shadow reads. Usage: python3 composite.py in.png out.png"""
import sys, json
import numpy as np
from PIL import Image

src, dst = sys.argv[1], sys.argv[2]
meta = json.load(open(src + ".json"))
im = np.asarray(Image.open(src).convert("RGBA")).astype(np.float32) / 255.0
h, w = im.shape[:2]
bg = np.zeros((h, w, 3), np.float32) + np.array([9, 9, 11], np.float32) / 255.0
cx, cy = meta["floor_center"][0] * w, meta["floor_center"][1] * h
rx = max(meta["floor_span_x"], 0.35) * w * 0.85
ry = max(meta["floor_span_y"], 0.06) * h * 1.1
yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
g = np.exp(-(((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2) * 1.6)
glow = np.array([13, 13, 16], np.float32) / 255.0  # added at peak -> ~#16161b
bg = bg + g[..., None] * glow
a = im[..., 3:4]
outc = im[..., :3] * a + bg * (1 - a)
# fine grain to avoid banding in the dark gradient
outc += (np.random.default_rng(0).random(outc.shape, np.float32) - 0.5) / 255.0
Image.fromarray(np.clip(outc * 255 + 0.5, 0, 255).astype(np.uint8), "RGB").save(dst, optimize=True)
print("wrote", dst)
