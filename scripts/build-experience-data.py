# -*- coding: utf-8 -*-
"""为 142 项非遗生成线下体验预约数据，并生成可扫描二维码"""
import json
import os
import re

try:
    import qrcode
    from qrcode.constants import ERROR_CORRECT_H
except ImportError:
    qrcode = None

ROOT = os.path.join(os.path.dirname(__file__), '..')
LIST_JS = os.path.join(ROOT, 'data', 'heritage-list.js')
PROVIDERS_JS = os.path.join(ROOT, 'data', 'experience-providers.js')
OVERRIDES_JS = os.path.join(ROOT, 'data', 'experience-overrides.js')
OUT_JS = os.path.join(ROOT, 'data', 'experience-items.js')
QR_DIR = os.path.join(ROOT, 'images', 'experience')

DEFAULT_NOTICE = {
    'zh-CN': '请提前预约，场次与名额以官方平台公告为准。',
    'en-US': 'Please book in advance. Sessions and availability are subject to official announcements.'
}

# 可扫码直达预约/购票的 URL 模式（政务门户、资讯站不在此列）
BOOKABLE_URL_RE = re.compile(
    r'(mp\.weixin\.qq\.com/s/|dahepiao\.com|m\.dahepiao\.com|wapticket\.)',
    re.I
)
# 不应生成二维码的链接（政务公开、非遗资讯等）
WEAK_URL_RE = re.compile(r'(\.gov\.cn|ihchina\.cn|syiptv\.com|henan\.gov)', re.I)


def is_bookable_url(url):
    if not url or not url.strip():
        return False
    if WEAK_URL_RE.search(url):
        return False
    return bool(BOOKABLE_URL_RE.search(url))


def load_js_module(path):
    """通过 Node 加载 module.exports（支持中文键名等 JS 语法）"""
    import subprocess
    abs_path = os.path.abspath(path).replace('\\', '/')
    script = f"console.log(JSON.stringify(require('{abs_path}')))"
    out = subprocess.check_output(['node', '-e', script], cwd=ROOT, text=True, encoding='utf-8')
    return json.loads(out)


def load_js_export(path):
    return load_js_module(path)


def load_js_array(path):
    return load_js_module(path)


def load_overrides():
    return load_js_export(OVERRIDES_JS)


def make_description(item, locale_key):
    city = item.get('cityShort') or item.get('location', '')
    name = item['name']
    if locale_key == 'zh-CN':
        summary = (item.get('summary') or '')[:60]
        return f'在{city}体验{name}，{summary}…' if summary else f'在{city}体验{name}，感受国家级非遗魅力。'
    return f'Experience {name} in {city} — a nationally recognized intangible cultural heritage.'


def build_item(heritage_id, item, providers, overrides):
    slug = item['slug']
    prov = item.get('provinceShort') or item.get('province', '')
    prov_key = prov.replace('省', '').replace('市', '').replace('自治区', '').strip()
    if prov_key.endswith('维吾尔'):
        prov_key = '新疆'
    provider = providers.get(prov_key) or providers.get(prov) or providers.get('北京')
    override = overrides.get(slug, {})

    title = override.get('title') or {
        'zh-CN': f'{item.get("cityShort") or prov} · {item["name"]}非遗体验',
        'en-US': f'{item.get("cityShort") or prov} · {item["name"]} ICH Experience'
    }
    description = override.get('description') or {
        'zh-CN': make_description(item, 'zh-CN'),
        'en-US': make_description(item, 'en-US')
    }

    mini_name = override.get('officialMiniProgram') or provider.get('officialMiniProgram', '')
    notice = override.get('notice') or provider.get('notice') or DEFAULT_NOTICE

    # 优先 override / 省级配置的预约链接
    candidate_url = override.get('qrTargetUrl') or provider.get('qrTargetUrl') or ''
    preferred_type = override.get('reservationType') or provider.get('reservationType', 'mini')

    if preferred_type == 'website' and override.get('officialWebsite'):
        reservation_type = 'website'
        qr_url = ''
    elif is_bookable_url(candidate_url):
        reservation_type = 'qr'
        qr_url = candidate_url
    elif preferred_type == 'qr' and is_bookable_url(candidate_url):
        reservation_type = 'qr'
        qr_url = candidate_url
    else:
        reservation_type = 'mini'
        qr_url = ''

    exp = {
        'id': heritage_id,
        'heritageId': heritage_id,
        'title': title,
        'city': {'zh-CN': item.get('cityShort') or prov, 'en-US': item.get('cityShort') or prov},
        'province': {'zh-CN': prov_key or prov, 'en-US': prov_key or prov},
        'cover': item['cover'],
        'description': description,
        'openTime': override.get('openTime') or provider.get('openTime', '09:00-17:00'),
        'reservationType': reservation_type,
        'qrCode': f'/images/experience/qr-{heritage_id}.png' if reservation_type == 'qr' else '',
        'qrTargetUrl': qr_url if reservation_type == 'qr' else '',
        'officialMiniProgram': mini_name,
        'officialWebsite': override.get('officialWebsite') or provider.get('officialWebsite') or '',
        'notice': notice,
        'hot': override.get('hot', heritage_id <= 8)
    }
    return exp, qr_url if reservation_type == 'qr' else None


def generate_qr(path, url):
    qr = qrcode.QRCode(version=None, error_correction=ERROR_CORRECT_H, box_size=8, border=4)
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color='black', back_color='white')
    img.save(path)


def main():
    items = load_js_array(LIST_JS)
    providers = load_js_export(PROVIDERS_JS)
    overrides = load_overrides()

    experiences = []
    qr_jobs = []
    qr_ids = set()

    for index, item in enumerate(items):
        heritage_id = index + 1
        exp, qr_url = build_item(heritage_id, item, providers, overrides)
        experiences.append(exp)
        if qr_url:
            qr_jobs.append((heritage_id, qr_url))
            qr_ids.add(heritage_id)

    os.makedirs(QR_DIR, exist_ok=True)
    if qrcode:
        for eid, url in qr_jobs:
            generate_qr(os.path.join(QR_DIR, f'qr-{eid}.png'), url)
        # 移除不再使用的旧二维码
        for name in os.listdir(QR_DIR):
            if not name.startswith('qr-') or not name.endswith('.png'):
                continue
            eid = int(name[3:-4])
            if eid not in qr_ids:
                os.remove(os.path.join(QR_DIR, name))
        print(f'Generated {len(qr_jobs)} QR codes in {QR_DIR}')
    else:
        print('WARN: qrcode not installed, skip QR generation. pip install qrcode[pil]')

    qr_count = sum(1 for e in experiences if e['reservationType'] == 'qr')
    mini_count = sum(1 for e in experiences if e['reservationType'] == 'mini')
    print(f'Booking modes: qr={qr_count}, mini={mini_count}')

    with open(OUT_JS, 'w', encoding='utf-8') as f:
        f.write('/** 非遗线下体验预约，由 scripts/build-experience-data.py 生成 */\nmodule.exports = ')
        json.dump(experiences, f, ensure_ascii=False, indent=2)
        f.write(';\n')

    print(f'Wrote {len(experiences)} experiences -> {OUT_JS}')


if __name__ == '__main__':
    main()
