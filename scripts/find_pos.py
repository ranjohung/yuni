c = open(r'F:\openclaw文件\与你\yu-ni-app\backend\src\routes\chat.js', 'r', encoding='utf-8').read()
target = "router.post('/send'"
idx = c.find(target)
print(f'Position: {idx}')
print(c[idx:idx+150])
