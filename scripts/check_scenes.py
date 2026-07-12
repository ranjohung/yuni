c = open(r'F:\openclaw文件\与你\yu-ni-app\backend\src\scenarios\index.js','r',encoding='utf-8').read()
for kw in ['咖啡','社群','面试','汇报','NVC','安慰','coffee','social','interview','meeting','misunderstanding','comfort']:
    cnt = c.count(kw)
    if cnt > 0: print(f'{kw}: {cnt}次')
print(f'\n总对话轮次字段: {c.count("rounds")}')
print(f'选项字段: {c.count("options")}')
print(f'完整场景: {c.count("id:")}个')
s = c.find('咖啡')
if s > 0: print(f'\n场景数据位置: {s} / {len(c)} (占比例 {s*100//len(c)}%)')
