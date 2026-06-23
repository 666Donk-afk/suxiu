# -*- coding: utf-8 -*-
"""迁移图片到分包并生成轮播缩略图"""
import io
import json
import os
import re
import shutil

from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), '..')
SRC_DIR = os.path.join(ROOT, 'images', 'heritage')
DEST_DIR = os.path.join(ROOT, 'package-media', 'images', 'heritage')
BANNER_DIR = os.path.join(ROOT, 'package-media', 'images', 'banners')
MEDIA_PREFIX = '/package-media/images/heritage/'
OLD_PREFIX = '/images/heritage/'


def compress_copy(src, dest, max_side=480, quality=68):
    img = Image.open(src)
    if img.mode not in ('RGB', 'L'):
        img = img.convert('RGB')
    w, h = img.size
    if max(w, h) > max_side:
        ratio = max_side / max(w, h)
        img = img.resize((int(w * ratio), int(h * ratio)), Image.Resampling.LANCZOS)
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    img.save(dest, 'JPEG', quality=quality, optimize=True)


def rewrite_paths_in_file(path):
    if not os.path.isfile(path):
        return
    text = open(path, encoding='utf-8').read()
    if OLD_PREFIX not in text:
        return
    open(path, 'w', encoding='utf-8').write(text.replace(OLD_PREFIX, MEDIA_PREFIX))


def main():
    os.makedirs(DEST_DIR, exist_ok=True)
    os.makedirs(BANNER_DIR, exist_ok=True)

    if os.path.isdir(SRC_DIR):
        for name in os.listdir(SRC_DIR):
            if not name.lower().endswith(('.jpg', '.jpeg', '.png')):
                continue
            compress_copy(os.path.join(SRC_DIR, name), os.path.join(DEST_DIR, name))

    # 轮播专用小图（宽 750 逻辑像素对应约 400px 足够）
    banner_sources = ['hanju.jpg', 'baishou.jpg', 'huangmei.jpg']
    for i, name in enumerate(banner_sources, start=1):
        src = os.path.join(DEST_DIR, name)
        if os.path.isfile(src):
            compress_copy(src, os.path.join(BANNER_DIR, f'banner-{i}.jpg'), max_side=400, quality=72)

    for rel in [
        'data/cities-data.js',
        'data/experience.js',
        'data/category-covers.js',
        'data/city-covers.js',
    ]:
        rewrite_paths_in_file(os.path.join(ROOT, rel))

    print('media images:', len(os.listdir(DEST_DIR)))
    print('banners:', len(os.listdir(BANNER_DIR)))


if __name__ == '__main__':
    main()
