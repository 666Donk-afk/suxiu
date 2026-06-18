# -*- coding: utf-8 -*-
"""生成体验预约二维码图片（编码真实可扫描的官方预约链接）"""
import os

try:
    import qrcode
    from qrcode.constants import ERROR_CORRECT_H
except ImportError:
    print('请先安装: pip install qrcode[pil]')
    raise

OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'images', 'experience')
os.makedirs(OUT_DIR, exist_ok=True)

# id 与 experience.js 中 reservationType=qr 的条目对应
# content 为微信扫码后可打开的官方预约/购票链接
ITEMS = [
    (
        1,
        'https://mp.weixin.qq.com/s/Vi866lupZTrWBF2izZr_pw',
        '武汉汉剧院官方微信公众号'
    ),
    (
        3,
        'https://www.dahepiao.com/jingqulvyou1/20220722286307.html',
        '恩施土司城官方票务（含摆手舞演出）'
    ),
    (
        4,
        'https://m.dahepiao.com/venue/venue_90438.html',
        '黄冈黄梅戏大剧院官方票务'
    ),
    (
        7,
        'http://syiptv.com/article/show/258974',
        '武当山智慧旅游双预约官方指南'
    ),
]

for eid, url, label in ITEMS:
    qr = qrcode.QRCode(
        version=None,
        error_correction=ERROR_CORRECT_H,
        box_size=12,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color='black', back_color='white')
    path = os.path.join(OUT_DIR, f'qr-{eid}.png')
    img.save(path)
    print(f'Wrote {path} ({label})')

print('Done.')
