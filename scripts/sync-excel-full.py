# -*- coding: utf-8 -*-
"""从完整 Excel 同步全国非遗数据：142 项 + 嵌入图片"""
import hashlib
import json
import os
import re
import zipfile
import xml.etree.ElementTree as ET

import io

import openpyxl
from PIL import Image

XLSX = r'd:\电脑管家迁移文件\xwechat_files\wxid_nmn9our534th22_ed27\msg\file\2026-06\湖北省(副本) (4).xlsx'
OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'package-media', 'images', 'heritage')
BANNER_DIR = os.path.join(os.path.dirname(__file__), '..', 'package-media', 'images', 'banners')
DATA_JS = os.path.join(os.path.dirname(__file__), '..', 'data', 'excel_demo.js')
CITIES_JS = os.path.join(os.path.dirname(__file__), '..', 'data', 'cities-data.js')
LIST_JS = os.path.join(os.path.dirname(__file__), '..', 'data', 'heritage-list.js')
DETAIL_JS = os.path.join(os.path.dirname(__file__), '..', 'data', 'heritage-details.js')
MEDIA_PREFIX = '/package-media/images/heritage/'

KNOWN_SLUG = {
    '汉剧': 'hanju',
    '土家族摆手舞': 'baishou',
    '黄梅戏': 'huangmei',
    '西兰卡普': 'xilan',
    '武当武术': 'wudang',
}

CATEGORY_BY_NAME = {
    '西兰卡普': 'craft',
    '汉剧': 'opera',
    '黄梅戏': 'opera',
    '土家族摆手舞': 'folk',
    '武当武术': 'sports',
}

XDR = '{http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing}'
A = '{http://schemas.openxmlformats.org/drawingml/2006/main}'
R_NS = '{http://schemas.openxmlformats.org/officeDocument/2006/relationships}'
ETC = '{http://www.wps.cn/officeDocument/2017/etCustomData}'

CATEGORY_RULES = [
    ('opera', ['戏', '剧', '曲', '腔', '调']),
    ('craft', ['织', '绣', '瓷', '漆', '雕', '制', '艺', '纸', '染', '陶', '银', '铜', '木', '竹', '布', '锦', '器', '画', '刻', '坊']),
    ('medicine', ['医', '药', '灸', '脉']),
    ('sports', ['武术', '拳', '跤', '射', '箭']),
    ('quyi', ['鼓', '说唱', '曲艺', '琴书', '快板', '评书']),
    ('art', ['书法', '绘画', '剪纸', '灯', '面塑']),
    ('folk', ['舞', '歌', '节', '俗', '族', '祭', '谣']),
]


def parse_embed_images(xlsx_path):
    id_data = {}
    with zipfile.ZipFile(xlsx_path) as z:
        rels_root = ET.fromstring(z.read('xl/_rels/cellimages.xml.rels'))
        rid_map = {}
        for rel in rels_root:
            target = rel.get('Target', '')
            if 'media/' in target:
                rid_map[rel.get('Id')] = 'xl/media/' + target.split('media/')[-1]

        ci_root = ET.fromstring(z.read('xl/cellimages.xml'))
        for ci in ci_root.findall(ETC + 'cellImage'):
            cnv = ci.find('.//' + XDR + 'cNvPr')
            blip = ci.find('.//' + A + 'blip')
            if cnv is None or blip is None:
                continue
            img_id = cnv.get('name')
            rid = blip.get(R_NS + 'embed') or blip.get(R_NS + 'link')
            media_path = rid_map.get(rid)
            if media_path:
                id_data[img_id] = z.read(media_path)
    return id_data


def make_slug(name, used):
    if name in KNOWN_SLUG:
        slug = KNOWN_SLUG[name]
    else:
        slug = 'h-' + hashlib.md5(name.encode('utf-8')).hexdigest()[:10]
    base = slug
    n = 2
    while slug in used:
        slug = f'{base}-{n}'
        n += 1
    used.add(slug)
    return slug


def infer_category(name):
    if name in CATEGORY_BY_NAME:
        return CATEGORY_BY_NAME[name]
    for key, keywords in CATEGORY_RULES:
        for kw in keywords:
            if kw in name:
                return key
    return 'folk'


def normalize_province(raw):
    if not raw:
        return ''
    p = raw.strip()
    for suffix in ('维吾尔自治区', '壮族自治区', '回族自治区', '自治区', '特别行政区', '省', '市'):
        if p.endswith(suffix):
            return p[: -len(suffix)]
    return p


def extract_city_short(location, province):
    loc = (location or '').strip()
    if not loc:
        return '未知'

    if '恩施' in loc:
        return '恩施'
    if '黄冈' in loc and '黄梅' in loc:
        return '黄冈'
    if loc in ('十堰市', '十堰'):
        return '十堰'
    if loc.endswith('市') and len(loc) <= 5:
        return loc[:-1]
    if loc in ('台湾', '香港', '澳门'):
        return loc

    prov = normalize_province(province)
    for prefix in (province, prov, prov + '省', prov + '市', prov + '自治区'):
        if prefix and loc.startswith(prefix):
            loc = loc[len(prefix):]
            break

    loc = loc.lstrip('省市区县 ')
    m = re.match(r'([^、，,；;\s]+?(?:市|州|盟|县|区))', loc)
    if m:
        name = m.group(1)
        if name.endswith('市') and len(name) <= 5:
            return name[:-1]
        if '自治州' in name:
            return name.split('自治州')[0]
        return name
    m = re.match(r'([^、，,；;\s]{2,8})', loc)
    if m:
        return m.group(1)
    return loc[:8] if loc else '未知'


def city_pinyin(city_name):
    return 'city-' + hashlib.md5(city_name.encode('utf-8')).hexdigest()[:8]


def city_initial(city_name):
    if not city_name:
        return '#'
    c = city_name[0]
    if '\u4e00' <= c <= '\u9fff':
        return city_name[:1]
    return c.upper()


def read_items(xlsx_path):
    wb = openpyxl.load_workbook(xlsx_path, data_only=True)
    ws = wb['Sheet1']
    headers = None
    province = ''
    items = []

    for row in ws.iter_rows(values_only=True):
        if not row[0] or str(row[0]).strip() == '':
            continue
        val = str(row[0]).strip()
        if val == '名称':
            headers = [str(c) if c else '' for c in row]
            continue

        rest = [row[i] for i in range(1, len(row)) if row[i]]
        if headers and not rest:
            province = val
            continue

        if not headers:
            continue

        data = {}
        for i, h in enumerate(headers):
            if h and i < len(row):
                data[h] = str(row[i]) if row[i] is not None else ''

        img_m = re.search(r'ID_[A-F0-9]+', data.get('图片', ''))
        name = data.get('名称', val)
        location = data.get('地点', '')
        city_short = extract_city_short(location, province)

        items.append({
            'name': name,
            'province': province,
            'provinceShort': normalize_province(province),
            'location': location,
            'cityShort': city_short,
            'summary': data.get('内容介绍', '').strip(),
            'origin': data.get('文化起源', '').strip(),
            'story': data.get('故事介绍', '').strip(),
            'meaning': data.get('非遗寓意', '').strip(),
            'materials': data.get('非遗材料', '').strip(),
            'img_id': img_m.group(0) if img_m else '',
            'categoryKey': infer_category(name),
        })

    return items


def fix_known_data_issues(item):
    name = item['name']
    summary = item['summary']
    if name == '西兰卡普' and '武当武术' in summary:
        item['summary'] = (
            '西兰卡普是土家族传统织锦技艺，意为"西兰的花铺盖"，'
            '2006年入选国家级非物质文化遗产。纹样色彩绚丽，被称为"土家的无字史书"。'
        )
    if name == '土家族摆手舞' and not summary:
        item['summary'] = (
            '土家族摆手舞是土家族最具代表性的民间舞蹈，2006年列入第一批国家级非物质文化遗产名录，'
            '被称作"东方迪斯科"，兼具文化传承与全民健身功能。'
        )
    return item


def save_cover_image(img_data, dest):
    img = Image.open(io.BytesIO(img_data))
    if img.mode not in ('RGB', 'L'):
        img = img.convert('RGB')
    max_side = 480
    w, h = img.size
    if max(w, h) > max_side:
        ratio = max_side / max(w, h)
        img = img.resize((int(w * ratio), int(h * ratio)), Image.Resampling.LANCZOS)
    img.save(dest, 'JPEG', quality=68, optimize=True)


def save_banner_images(heritage_items):
    os.makedirs(BANNER_DIR, exist_ok=True)
    banner_slugs = ['hanju', 'baishou', 'huangmei']
    for i, slug in enumerate(banner_slugs, start=1):
        src = os.path.join(OUT_DIR, slug + '.jpg')
        dest = os.path.join(BANNER_DIR, f'banner-{i}.jpg')
        if os.path.isfile(src):
            img = Image.open(src)
            if img.mode not in ('RGB', 'L'):
                img = img.convert('RGB')
            w, h = img.size
            max_side = 400
            if max(w, h) > max_side:
                ratio = max_side / max(w, h)
                img = img.resize((int(w * ratio), int(h * ratio)), Image.Resampling.LANCZOS)
            img.save(dest, 'JPEG', quality=72, optimize=True)


def write_split_data(heritage_items):
    list_rows = []
    details = {}
    for item in heritage_items:
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
            'cover': item['cover'],
        })
        details[slug] = {
            'origin': item.get('origin', ''),
            'story': item.get('story', ''),
            'meaning': item.get('meaning', ''),
            'materials': item.get('materials', ''),
        }

    with open(LIST_JS, 'w', encoding='utf-8') as f:
        f.write('/** 非遗列表（轻量），由 scripts/sync-excel-full.py 生成 */\nmodule.exports = ')
        json.dump(list_rows, f, ensure_ascii=False, indent=2)
        f.write(';\n')

    with open(DETAIL_JS, 'w', encoding='utf-8') as f:
        f.write('/** 非遗详情长文本，按需加载 */\nmodule.exports = ')
        json.dump(details, f, ensure_ascii=False, indent=2)
        f.write(';\n')


def build_cities(heritage_items):
    city_map = {}
    for item in heritage_items:
        key = (item['provinceShort'], item['cityShort'])
        if key not in city_map:
            city_map[key] = {
                'province': item['province'],
                'provinceShort': item['provinceShort'],
                'cityShort': item['cityShort'],
                'cover': item['cover'],
                'heritageCount': 0,
                'sampleSummary': item['summary'] or item['name'],
            }
        city_map[key]['heritageCount'] += 1
        if not city_map[key]['cover']:
            city_map[key]['cover'] = item['cover']

    sorted_keys = sorted(city_map.keys(), key=lambda k: (-city_map[k]['heritageCount'], k[1]))
    cities = []
    for idx, key in enumerate(sorted_keys, start=1):
        c = city_map[key]
        city_name = c['cityShort']
        prov = c['provinceShort']
        desc_zh = c['sampleSummary'][:80] + ('…' if len(c['sampleSummary']) > 80 else '')
        if not desc_zh:
            desc_zh = f'{prov}{city_name}非遗文化荟萃之地。'
        cities.append({
            'id': idx,
            'name': {'zh-CN': city_name, 'en-US': city_name},
            'pinyin': city_pinyin(city_name),
            'initial': city_initial(city_name),
            'province': {'zh-CN': prov, 'en-US': prov},
            'description': {
                'zh-CN': desc_zh,
                'en-US': f'Heritage hub in {city_name}, {prov}.',
            },
            'heritageCount': c['heritageCount'],
            'cover': c['cover'] or MEDIA_PREFIX + 'hanju.jpg',
        })
    return cities


def main():
    if not os.path.isfile(XLSX):
        raise SystemExit(f'Excel not found: {XLSX}')

    id_data = parse_embed_images(XLSX)
    raw_items = read_items(XLSX)
    used_slugs = set()
    heritage_items = []

    os.makedirs(OUT_DIR, exist_ok=True)

    for item in raw_items:
        item = fix_known_data_issues(item)
        slug = make_slug(item['name'], used_slugs)
        img_data = id_data.get(item['img_id'])

        if img_data:
            dest = os.path.join(OUT_DIR, slug + '.jpg')
            save_cover_image(img_data, dest)
        else:
            print(f'[WARN] {item["name"]} no image, img_id={item["img_id"]}')

        heritage_items.append({
            'name': item['name'],
            'slug': slug,
            'province': item['province'],
            'provinceShort': item['provinceShort'],
            'location': item['location'],
            'cityShort': item['cityShort'],
            'categoryKey': item['categoryKey'],
            'summary': item['summary'],
            'origin': item['origin'],
            'story': item['story'],
            'meaning': item['meaning'],
            'materials': item['materials'],
            'cover': f'{MEDIA_PREFIX}{slug}.jpg',
        })

    cities = build_cities(heritage_items)

    with open(DATA_JS, 'w', encoding='utf-8') as f:
        f.write('/** 全国非遗 Excel 数据（完整备份），由 scripts/sync-excel-full.py 生成 */\nmodule.exports = ')
        json.dump(heritage_items, f, ensure_ascii=False, indent=2)
        f.write(';\n')

    with open(CITIES_JS, 'w', encoding='utf-8') as f:
        f.write('/** 城市列表，由 scripts/sync-excel-full.py 生成 */\nmodule.exports = ')
        json.dump(cities, f, ensure_ascii=False, indent=2)
        f.write(';\n')

    write_split_data(heritage_items)
    save_banner_images(heritage_items)

    split_script = os.path.join(os.path.dirname(__file__), 'split-media-packages.py')
    if os.path.isfile(split_script):
        import subprocess
        import sys
        subprocess.run([sys.executable, split_script], check=True)

    print(f'Heritage items: {len(heritage_items)}')
    print(f'Cities: {len(cities)}')
    print(f'Images dir: {OUT_DIR}')
    print(f'Wrote {DATA_JS}')
    print(f'Wrote {CITIES_JS}')
    print(f'Wrote {LIST_JS}')
    print(f'Wrote {DETAIL_JS}')


if __name__ == '__main__':
    main()
