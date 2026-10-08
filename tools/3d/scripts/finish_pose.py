"""Composite a raw RGBA render onto #09090b and write the 4K PNG + 720x1280 WebP (q85).
usage: python3 finish_pose.py raw.png out_4k.png out.webp"""
import sys, json
import numpy as np
from PIL import Image

src, dst, webp = sys.argv[1:4]
meta = json.load(open(src + ".json"))
im = np.asarray(Image.open(src).convert("RGBA")).astype(np.float32) / 255.0
h, w = im.shape[:2]
bg = np.zeros((h, w, 3), np.float32) + np.array([9, 9, 11], np.float32) / 255.0
cx, cy = meta["floor_center"][0] * w, meta["floor_center"][1] * h
rx = max(meta["floor_span_x"], 0.35) * w * 0.85
ry = max(meta["floor_span_y"], 0.06) * h * 1.1
yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
g = np.exp(-(((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2) * 1.6)
bg = bg + g[..., None] * (np.array([13, 13, 16], np.float32) / 255.0)
a = im[..., 3:4]
out = im[..., :3] * a + bg * (1 - a)
out += (np.random.default_rng(0).random(out.shape, np.float32) - 0.5) / 255.0
img = Image.fromarray(np.clip(out * 255 + 0.5, 0, 255).astype(np.uint8), "RGB")
img.save(dst, optimize=True)
img.resize((720, 1280), Image.LANCZOS).save(webp, "WEBP", quality=85, method=6)
print("wrote", dst, webp)
