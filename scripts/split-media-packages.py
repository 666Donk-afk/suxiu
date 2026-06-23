# -*- coding: utf-8 -*-
"""将非遗图片拆到两个分包（各 <2MB）"""
import json
import os
import re
import shutil

from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), '..')
SRC = os.path.join(ROOT, 'package-media', 'images', 'heritage')
PKG_A = os.path.join(ROOT, 'package-media-a', 'images', 'heritage')
PKG_B = os.path.join(ROOT, 'package-media-b', 'images', 'heritage')
BANNER_DIR = os.path.join(ROOT, 'package-media-a', 'images', 'banners')
LIST_JS = os.path.join(ROOT, 'data', 'heritage-list.js')
SPLIT_AT = 65


def load_list():
    text = open(LIST_JS, encoding='utf-8').read()
    return json.loads(re.search(r'module\.exports\s*=\s*(\[.*\])\s*;', text, re.S).group(1))


def save_list(items):
    with open(LIST_JS, 'w', encoding='utf-8') as f:
        f.write('/** 非遗列表（轻量），由 scripts/split-media-packages.py 更新路径 */\nmodule.exports = ')
        json.dump(items, f, ensure_ascii=False, indent=2)
        f.write(';\n')


def find_src(slug):
    for base in (SRC, PKG_A, PKG_B):
        path = os.path.join(base, slug + '.jpg')
        if os.path.isfile(path):
            return path
    return None


def save_compressed(src, dest, max_side=420, quality=62):
    img = Image.open(src)
    if img.mode not in ('RGB', 'L'):
        img = img.convert('RGB')
    w, h = img.size
    if max(w, h) > max_side:
        ratio = max_side / max(w, h)
        img = img.resize((int(w * ratio), int(h * ratio)), Image.Resampling.LANCZOS)
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    img.save(dest, 'JPEG', quality=quality, optimize=True)


def rewrite_file(path, replacements):
    if not os.path.isfile(path):
        return
    text = open(path, encoding='utf-8').read()
    for old, new in replacements:
        text = text.replace(old, new)
    open(path, 'w', encoding='utf-8').write(text)


def dir_size(path):
    total = 0
    for name in os.listdir(path):
        total += os.path.getsize(os.path.join(path, name))
    return total


def main():
    items = load_list()
    if os.path.isdir(PKG_A):
        shutil.rmtree(PKG_A)
    if os.path.isdir(PKG_B):
        shutil.rmtree(PKG_B)
    os.makedirs(PKG_A, exist_ok=True)
    os.makedirs(PKG_B, exist_ok=True)
    os.makedirs(BANNER_DIR, exist_ok=True)

    replacements = []

    for i, item in enumerate(items):
        slug = item['slug']
        src = find_src(slug)
        if not src:
            continue
        if i < SPLIT_AT:
            dest = os.path.join(PKG_A, slug + '.jpg')
            prefix = '/package-media-a/images/heritage/'
        else:
            dest = os.path.join(PKG_B, slug + '.jpg')
            prefix = '/package-media-b/images/heritage/'
        save_compressed(src, dest)
        old = item['cover']
        new = prefix + slug + '.jpg'
        item['cover'] = new
        if old != new:
            replacements.append((old, new))

    for name in ['banner-1.jpg', 'banner-2.jpg', 'banner-3.jpg']:
        src = os.path.join(ROOT, 'package-media', 'images', 'banners', name)
        if os.path.isfile(src):
            save_compressed(src, os.path.join(BANNER_DIR, name), max_side=360, quality=70)

    save_list(items)
    for rel in ['data/cities-data.js', 'data/experience.js', 'data/category-covers.js', 'data/city-covers.js']:
        rewrite_file(os.path.join(ROOT, rel), replacements)

    png_src = os.path.join(ROOT, 'images', 'heritage')
    if os.path.isdir(png_src):
        for name in os.listdir(png_src):
            if name.lower().endswith('.png'):
                shutil.copy2(os.path.join(png_src, name), os.path.join(PKG_A, name))

    print(f'package-media-a: {dir_size(PKG_A) // 1024} KB')
    print(f'package-media-b: {dir_size(PKG_B) // 1024} KB')


if __name__ == '__main__':
    main()
