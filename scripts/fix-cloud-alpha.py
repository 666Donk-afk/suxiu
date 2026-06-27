# -*- coding: utf-8 -*-
"""Ensure cloud-top.png is RGBA PNG (preserve RGB, use luminance as alpha)."""
from PIL import Image
import sys

path = sys.argv[1] if len(sys.argv) > 1 else 'images/decoration/cloud-top.png'
img = Image.open(path).convert('RGB')
pixels = list(img.getdata())
rgba = []
for r, g, b in pixels:
    alpha = max(r, g, b)
    rgba.append((r, g, b, alpha))
out = Image.new('RGBA', img.size)
out.putdata(rgba)
out.save(path, format='PNG')
print('OK', path, img.size)
