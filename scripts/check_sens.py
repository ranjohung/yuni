import sys
sys.stdout.reconfigure(encoding='utf-8')
c = open(r'F:\openclaw文件\与你\yu-ni-app\backend\src\middleware\sensitive.js', 'r', encoding='utf-8').read()
for kw in ['我想自杀','我要自杀','想死','自杀','我什么都做不好']:
    ok = 'YES' if kw in c else 'NO'
    print(f'{ok}: {kw}')
