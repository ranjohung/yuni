import os

be = r'F:\openclaw文件\与你\yu-ni-app\backend\src'

# 1. 检查scenarios
scenario_code = open(os.path.join(be, 'scenarios', 'index.js'), 'r', encoding='utf-8').read()
scenarios = ['coffee','social','mock_interview','meeting_report','nvc_misunderstanding','comfort_sad']
for s in scenarios:
    print(f'  {"✅" if s in scenario_code else "❌"}  场景: {s}')

# 2. 用户路由端点
user_code = open(os.path.join(be, 'routes', 'user.js'), 'r', encoding='utf-8').read()
for e in ['/register','/login','/trial','/realname','/profile','/update']:
    print(f'  {"✅" if e in user_code else "❌"}  用户端点: {e}')

# 3. 对话路由
chat_code = open(os.path.join(be, 'routes', 'chat.js'), 'r', encoding='utf-8').read()
for e in ['/send','/stream','/history']:
    print(f'  {"✅" if e in chat_code else "❌"}  对话端点: {e}')

# 4. 注册路由
app_code = open(os.path.join(be, 'app.js'), 'r', encoding='utf-8').read()
for r in ['user','partner','chat','scenario','training','growth','talent','membership','compliance']:
    print(f'  {"✅" if r in app_code else "❌"}  路由注册: {r}')

# 5. 检查dialogues/目录
dialogues_dir = os.path.join(be, 'dialogues')
if os.path.exists(dialogues_dir):
    print('\n  ✅ dialogues目录存在')
    for f in os.listdir(dialogues_dir):
        print(f'     {f}')
else:
    print('\n  ❌ dialogues目录不存在（场景对话数据在scenarios/index.js中）')
