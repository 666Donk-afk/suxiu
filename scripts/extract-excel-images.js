/**
 * 从 Excel 提取嵌入图片到 images/heritage/
 * 用法: node scripts/extract-excel-images.js [xlsx路径]
 */
const { execSync } = require('child_process');
const path = require('path');

const xlsxPath = process.argv[2] || path.join(
  'd:',
  '电脑管家迁移文件',
  'xwechat_files',
  'wxid_nmn9our534th22_ed27',
  'msg',
  'file',
  '2026-06',
  '湖北省(副本) (1)(1).xlsx'
);

const outDir = path.join(__dirname, '..', 'images', 'heritage');

const py = `
import zipfile, os
xlsx = r"${xlsxPath.replace(/\\/g, '/')}"
out = r"${outDir.replace(/\\/g, '/')}"
os.makedirs(out, exist_ok=True)
mapping = [('hanju','image1.jpeg'),('baishou','image2.jpeg'),('huangmei','image3.jpeg'),('xilan','image4.jpeg'),('wudang','image5.jpeg')]
with zipfile.ZipFile(xlsx) as z:
    for slug, src in mapping:
        with open(os.path.join(out, slug + '.jpg'), 'wb') as f:
            f.write(z.read('xl/media/' + src))
        print('extracted:', slug)
`;

execSync(`python -c "${py.replace(/"/g, '\\"')}"`, { stdio: 'inherit' });
