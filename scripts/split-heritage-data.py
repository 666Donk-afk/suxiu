# -*- coding: utf-8 -*-
"""将 excel_demo.js 拆分为轻量列表 + 详情（无需 Excel）"""
import json
import os
import re

ROOT = os.path.join(os.path.dirname(__file__), '..')
SRC = os.path.join(ROOT, 'data', 'excel_demo.js')
LIST_JS = os.path.join(ROOT, 'data', 'heritage-list.js')
DETAIL_JS = os.path.join(ROOT, 'data', 'heritage-details.js')
MEDIA_PREFIX = '/package-media/images/heritage/'


def load_items():
    text = open(SRC, encoding='utf-8').read()
    return json.loads(re.search(r'module\.exports\s*=\s*(\[.*\])\s*;', text, re.S).group(1))


def to_cover(path):
    if not path:
        return path
    name = path.rsplit('/', 1)[-1]
    return MEDIA_PREFIX + name


def main():
    items = load_items()
    list_rows = []
    details = {}

    for item in items:
        slug = item['slug']
        list_rows.append({
            'name': item['name'],
            'slug': slug,
            'province': item.get('province', ''),
            'provinceShort': item.get('provinceShort', ''),
            'location': item.get('location', ''),
            'cityShort': item.get('cityShort', ''),
            'categoryKey': item.get('categoryKey', 'folk'),
            'summary': item.get('summary', ''),
            'cover': to_cover(item.get('cover', '')),
        })
        details[slug] = {
            'origin': item.get('origin', ''),
            'story': item.get('story', ''),
            'meaning': item.get('meaning', ''),
            'materials': item.get('materials', ''),
        }

    with open(LIST_JS, 'w', encoding='utf-8') as f:
        f.write('/** 非遗列表（轻量），由 scripts/split-heritage-data.py 生成 */\nmodule.exports = ')
        json.dump(list_rows, f, ensure_ascii=False, indent=2)
        f.write(';\n')

    with open(DETAIL_JS, 'w', encoding='utf-8') as f:
        f.write('/** 非遗详情长文本，按需加载 */\nmodule.exports = ')
        json.dump(details, f, ensure_ascii=False, indent=2)
        f.write(';\n')

    print(f'list: {len(list_rows)} items -> {LIST_JS}')
    print(f'details: {len(details)} slugs -> {DETAIL_JS}')


if __name__ == '__main__':
    main()
