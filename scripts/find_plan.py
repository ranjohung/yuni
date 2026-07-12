import os

# 找原始计划书
c = open(r'C:\Users\Administrator\.openclaw\workspace\MEMORY.md', 'r', encoding='utf-8').read()
for kw in ['计划书', 'v6.0', '社交模拟', '数字人']:
    idx = c.find(kw)
    if idx > -1:
        print(f'Found "{kw}" at {idx}')
        print(c[max(0,idx-50):idx+200])
        print('---')
