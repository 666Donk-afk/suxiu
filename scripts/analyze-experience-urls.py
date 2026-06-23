# -*- coding: utf-8 -*-
import subprocess, json, os, re
from collections import Counter

ROOT = os.path.join(os.path.dirname(__file__), '..')
ITEMS = os.path.join(ROOT, 'data', 'experience-items.js').replace('\\', '/')
out = subprocess.check_output(['node', '-e', f"console.log(JSON.stringify(require('{ITEMS}')))"])
items = json.loads(out)
domains = Counter()
weak = []
good = []
for i in items:
    u = i.get('qrTargetUrl', '')
    m = re.match(r'https?://([^/]+)', u)
    d = m.group(1) if m else u
    domains[d] += 1
    title = i['title']['zh-CN'] if isinstance(i['title'], dict) else i['title']
    row = (i['id'], title, u, i.get('officialMiniProgram', ''))
    if '.gov.cn' in u or u.endswith('ihchina.cn/') or 'ihchina.cn/project' in u or 'henan.gov.cn' in u:
        weak.append(row)
    elif 'mp.weixin.qq.com' in u or 'dahepiao' in u or 'gmfyg.org.cn' in u:
        good.append(row)
    else:
        weak.append(row)

print('=== domains ===')
for d, c in domains.most_common(20):
    print(c, d)
print('\n=== good (%d) ===' % len(good))
for r in good:
    print(r)
print('\n=== weak (%d) ===' % len(weak))
for r in weak[:30]:
    print(r)
print('...')
