# -*- coding: utf-8 -*-
"""生成全部非遗体验预约二维码（委托 build-experience-data.py）"""
import subprocess
import sys
import os

SCRIPT = os.path.join(os.path.dirname(__file__), 'build-experience-data.py')

if __name__ == '__main__':
    sys.exit(subprocess.call([sys.executable, SCRIPT]))
