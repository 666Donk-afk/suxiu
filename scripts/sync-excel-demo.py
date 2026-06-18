# -*- coding: utf-8 -*-
"""从 Excel 同步 Demo 数据：按名称正确匹配图片与文字"""
import json
import os
import re
import zipfile
import xml.etree.ElementTree as ET
import openpyxl

OLD_XLSX = r'd:\电脑管家迁移文件\xwechat_files\wxid_nmn9our534th22_ed27\msg\file\2026-06\湖北省(副本) (1)(1).xlsx'
NEW_XLSX = r'd:\电脑管家迁移文件\xwechat_files\wxid_nmn9our534th22_ed27\msg\file\2026-06\湖北省(副本) (2)(1).xlsx'
OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'images', 'heritage')
DATA_JS = os.path.join(os.path.dirname(__file__), '..', 'data', 'excel_demo.js')

SLUG = {
    '汉剧': 'hanju',
    '土家族摆手舞': 'baishou',
    '黄梅戏': 'huangmei',
    '西兰卡普': 'xilan',
    '武当武术': 'wudang',
}

XDR = '{http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing}'
A = '{http://schemas.openxmlformats.org/drawingml/2006/main}'
R_NS = '{http://schemas.openxmlformats.org/officeDocument/2006/relationships}'
ETC = '{http://www.wps.cn/officeDocument/2017/etCustomData}'


def parse_embed_images(xlsx_path):
    """解析嵌入图片：DISPIMG ID -> 二进制数据"""
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


def read_sheet_rows(xlsx_path):
    wb = openpyxl.load_workbook(xlsx_path, data_only=True)
    ws = wb['Sheet1']
    headers = None
    items = []
    for row in ws.iter_rows(values_only=True):
        if not row[0] or str(row[0]).strip() == '':
            continue
        if row[0] == '名称':
            headers = [str(c) if c else '' for c in row]
            continue
        data = {}
        for i, h in enumerate(headers or []):
            if h and i < len(row):
                data[h] = str(row[i]) if row[i] is not None else ''
        img_m = re.search(r'ID_[A-F0-9]+', data.get('图片', ''))
        data['img_id'] = img_m.group(0) if img_m else ''
        items.append(data)
    return items


def main():
    id_data = parse_embed_images(OLD_XLSX)
    old_rows = {r['名称']: r for r in read_sheet_rows(OLD_XLSX)}
    new_rows = read_sheet_rows(NEW_XLSX)

    os.makedirs(OUT_DIR, exist_ok=True)
    result = []

    for row in new_rows:
        name = row['名称']
        slug = SLUG.get(name)
        if not slug:
            continue

        # 按名称从旧文档取对应 DISPIMG ID，再取正确嵌入图
        old_row = old_rows.get(name, {})
        img_id = old_row.get('img_id') or row.get('img_id')
        img_data = id_data.get(img_id)

        if img_data:
            dest = os.path.join(OUT_DIR, slug + '.jpg')
            with open(dest, 'wb') as f:
                f.write(img_data)
            print(f'[OK] {name} -> {slug}.jpg ({len(img_data)} bytes)')
        else:
            print(f'[WARN] {name} 无嵌入图片, img_id={img_id}')

        summary = row.get('内容介绍', '').strip()
        if name == '西兰卡普' and '武当武术' in summary:
            summary = (
                '西兰卡普是土家族传统织锦技艺，意为"西兰的花铺盖"，'
                '2006年入选国家级非物质文化遗产。纹样色彩绚丽，被称为"土家的无字史书"。'
            )
        if name == '土家族摆手舞' and not summary:
            summary = (
                '土家族摆手舞是土家族最具代表性的民间舞蹈，2006年列入第一批国家级非物质文化遗产名录，'
                '被称作"东方迪斯科"，兼具文化传承与全民健身功能。'
            )

        result.append({
            'name': name,
            'slug': slug,
            'location': row.get('地点', ''),
            'summary': summary,
            'origin': row.get('文化起源', ''),
            'story': row.get('故事介绍', ''),
            'meaning': row.get('非遗寓意', ''),
            'materials': row.get('非遗材料', ''),
            'cover': f'/images/heritage/{slug}.jpg',
        })

    with open(DATA_JS, 'w', encoding='utf-8') as f:
        f.write('/** Excel 同步数据，由 scripts/sync-excel-demo.py 生成 */\nmodule.exports = ')
        json.dump(result, f, ensure_ascii=False, indent=2)
        f.write(';\n')

    print('Wrote', DATA_JS)


if __name__ == '__main__':
    main()
