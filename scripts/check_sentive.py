c = open(r'F:\openclaw文件\与你\yu-ni-app\backend\src\middleware\sensitive.js', 'r', encoding='utf-8').read()
for kw in ['我想自杀','我要自杀','我想死','我要死','想死','自杀','我什么都做不好']:
    print(f'{kw}: {"✅" if kw in c else "❌"}')
