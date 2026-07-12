"""
「与你」App - 敏感词过滤引擎
=======================
方案：DFAA算法（确定性有限自动机）+ 分层敏感词库
特点：零成本、离线运行、毫秒级响应

使用方式：
    from content_filter import ContentFilter
    filter = ContentFilter()
    filter.check("你真是个废物")  # 返回: {'pass': False, 'matched': ['废物'], 'level': 'high'}
    filter.check("今天天气真好")  # 返回: {'pass': True, 'matched': [], 'level': 'safe'}
"""

import re
from typing import List, Dict, Tuple


class DFAFilter:
    """
    DFAA（确定性有限自动机）敏感词过滤
    时间复杂度 O(n)，内存占用小
    """
    
    def __init__(self):
        self.root = {}
        self.fail = {}
        self.end = {}
    
    def build(self, word_list: List[str]):
        """构建AC自动机"""
        # 构建Trie树
        for word in word_list:
            node = self.root
            for char in word.lower():
                if char not in node:
                    node[char] = {}
                node = node[char]
            node['__end__'] = True
            self.end[id(node)] = True
        
        # 构建失败指针
        from collections import deque
        queue = deque()
        
        for char, node in self.root.items():
            if isinstance(node, dict) and char != '__end__':
                self.fail[id(node)] = self.root
                queue.append(node)
        
        while queue:
            current_node = queue.popleft()
            current_id = id(current_node)
            
            for char, child_node in current_node.items():
                if char == '__end__':
                    continue
                
                if not isinstance(child_node, dict):
                    continue
                    
                child_id = id(child_node)
                
                fail_node = self.fail.get(current_id, self.root)
                while fail_node is not self.root and char not in fail_node:
                    fail_node = self.fail.get(id(fail_node), self.root)
                
                self.fail[child_id] = fail_node.get(char, self.root) if isinstance(fail_node, dict) else self.root
                
                if char in fail_node and isinstance(fail_node[char], dict) and '__end__' in fail_node[char]:
                    self.end[child_id] = True
                
                queue.append(child_node)
    
    def search(self, text: str) -> List[str]:
        """搜索文本中的敏感词"""
        result = []
        node = self.root
        text = text.lower()
        
        for i, char in enumerate(text):
            while node is not self.root and char not in node:
                node_id = id(node)
                node = self.fail.get(node_id, self.root)
            
            node = node.get(char, self.root) if isinstance(node, dict) else self.root
            
            if isinstance(node, dict) and node.get('__end__', False):
                # 找到匹配，回溯找出完整敏感词
                temp_node = node
                length = 0
                for j in range(i, -1, -1):
                    char_j = text[j]
                    if isinstance(temp_node, dict) and temp_node.get('__end__', False):
                        length = i - j + 1
                        break
                    # 简化回溯（实际生产环境需要更精确的回溯）
                    temp_node = self._follow_char(temp_node, char_j)
                
                matched_word = text[i - length + 1:i + 1]
                result.append(matched_word)
        
        return result
    
    def _follow_char(self, node, char):
        """在节点中跟随字符"""
        if isinstance(node, dict) and char in node:
            return node[char]
        return self.root


class ContentFilter:
    """
    内容过滤器（组合分层词库 + DFAA算法）
    """
    
    def __init__(self):
        self.dfa = DFAFilter()
        # 构建词库
        all_words = self._get_high_words() + self._get_medium_words() + self._get_low_words()
        self.dfa.build(all_words)
        
        # 级别映射
        self._word_level = {}
        for w in self._get_high_words():
            self._word_level[w] = 'high'
        for w in self._get_medium_words():
            self._word_level[w] = 'medium'
        for w in self._get_low_words():
            self._word_level[w] = 'low'
    
    def check(self, text: str, strictness: str = 'medium') -> Dict:
        """
        检查文本是否包含敏感词
        
        参数:
            text: 待检查文本
            strictness: 严格度 ('high'=拦截所有, 'medium'=拦截中高, 'low'=仅拦截高危)
        
        返回:
            {
                'pass': bool,       # True=通过, False=拦截
                'matched': list,    # 匹配到的敏感词
                'level': str,       # 最高风险等级
                'suggestion': str   # 建议
            }
        """
        if not text or not text.strip():
            return {'pass': True, 'matched': [], 'level': 'safe', 'suggestion': ''}
        
        matched = self.dfa.search(text)
        
        if not matched:
            return {'pass': True, 'matched': [], 'level': 'safe', 'suggestion': ''}
        
        # 确定最高风险等级
        max_level = 'low'
        for word in matched:
            wl = self._word_level.get(word, 'low')
            if wl == 'high':
                max_level = 'high'
                break
            elif wl == 'medium' and max_level != 'high':
                max_level = 'medium'
        
        # 根据严格度判定是否通过
        if strictness == 'high' and max_level in ('high', 'medium', 'low'):
            passed = False
        elif strictness == 'medium' and max_level in ('high', 'medium'):
            passed = False
        elif strictness == 'low' and max_level == 'high':
            passed = False
        else:
            passed = True
        
        suggestion = self._get_suggestion(max_level)
        
        return {
            'pass': passed,
            'matched': list(set(matched)),
            'level': max_level,
            'suggestion': suggestion
        }
    
    def _get_suggestion(self, level: str) -> str:
        suggestions = {
            'high': '内容包含违规信息，请修改后重试',
            'medium': '内容可能不太合适，请换个说法试试',
            'low': '内容包含轻微不适词汇，建议修改',
            'safe': ''
        }
        return suggestions.get(level, '')
    
    def _get_high_words(self) -> List[str]:
        """高危敏感词 - 绝对拦截"""
        return [
            # 政治敏感
            "法轮功", "六四", "天安门事件", "台独", "藏独", "疆独",
            "习大大", "习近平", "李克强", "胡锦涛", "江泽民",
            "共产党", "国民党", "反革命", "颠覆国家",
            # 色情低俗
            "色情", "裸聊", "裸照", "裸体", "黄色",
            "同房", "上床", "一夜情", "约炮", "卖淫",
            "嫖娼", "强奸", "迷奸", "幼女", "儿童色情",
            # 暴力恐怖
            "杀人", "自杀", "自残", "炸弹", "恐怖袭击",
            "枪击", "砍人", "绑架", "吸毒", "贩毒",
            # 赌博
            "赌博", "赌场", "老虎机", "百家乐", "六合彩",
            # 违禁品
            "枪支", "弹药", "炸药", "毒品", "冰毒",
            "海洛因", "摇头丸", "迷幻药", "卖肾",
        ]
    
    def _get_medium_words(self) -> List[str]:
        """中危敏感词 - 建议修改"""
        return [
            # 攻击性语言
            "废物", "垃圾", "去死", "滚开", "蠢货",
            "傻逼", "傻X", "脑残", "智障", "白痴",
            "贱人", "人渣", "恶心", "变态", "有病",
            "不要脸", "神经病", "精神病",
            # 侮辱性
            "丑八怪", "死胖子", "矮冬瓜", "土包子",
            "乡巴佬", "穷鬼", "书呆子",
            # 网络暴力常见词
            "退圈", "退网", "全家", "祖宗", "骂人",
            "拉黑", "举报", "人肉", "网暴",
        ]
    
    def _get_low_words(self) -> List[str]:
        """低危敏感词 - 提醒但不强制拦截"""
        return [
            # 负面情绪表达
            "完了", "死定了", "完蛋", "彻底失败",
            "我不行", "我太差", "我做不到", "我没用",
            "都怪我", "全是我的错", "都是我的错",
            # 绝对化词语（CBT相关）
            "总是", "从不", "永远", "所有人", "没人",
            "没有人", "从来", "每次",
            # 不礼貌用语
            "闭嘴", "少废话", "别说了", "关你屁事",
            "你管我", "懒得理你", "烦死了",
        ]


# ============================================================
# 对话合规检查（针对「与你」场景的定制检查）
# ============================================================

class DialogueChecker:
    """
    对话合规检查器
    针对「与你」App的数字人对话场景
    """
    
    def __init__(self):
        self.content_filter = ContentFilter()
        
        # AI不得主动发起的违规内容
        self.ai_forbidden_patterns = [
            r"我喜欢你", r"我爱你", r"做我女朋友", r"做我男朋友",
            r"嫁给我", r"娶你", r"在一起", r"亲一个",
            r"抱一下", r"想你了", r"好想你",
        ]
        
        # 合规声明
        self.ai_disclaimer = "🤖 我是AI助手"
    
    def check_user_input(self, text: str) -> Dict:
        """
        检查用户输入
        
        返回:
            {
                'pass': bool,
                'level': str,
                'suggestion': str,
                'cbt_trigger': None or dict,  # CBT引导
                'disclaimer_needed': bool
            }
        """
        result = self.content_filter.check(text)
        
        # CBT触发检测
        cbt_trigger = self._detect_cbt_triggers(text)
        
        return {
            'pass': result['pass'],
            'level': result['level'],
            'suggestion': result['suggestion'],
            'cbt_trigger': cbt_trigger,
            'disclaimer_needed': False
        }
    
    def check_ai_response(self, text: str, user_age: int = 18) -> Dict:
        """
        检查AI回复（防止AI越界）
        
        参数:
            text: AI生成的回复
            user_age: 用户年龄（用于年龄分层）
        
        返回:
            {'pass': bool, 'reason': str, 'suggestion': str}
        """
        # 检查AI是否说了不该说的话
        for pattern in self.ai_forbidden_patterns:
            if re.search(pattern, text):
                return {
                    'pass': False,
                    'reason': f'AI回复包含违规内容（匹配: {pattern}）',
                    'suggestion': '请重新生成回复，注意回复内容不得包含亲密/暧昧表达'
                }
        
        # 未成年人额外限制
        if user_age < 18:
            # 禁止任何涉及亲密关系的讨论
            intimacy_patterns = [
                r"感情", r"恋爱", r"交往", r"约会",
                r"表白", r"告白", r"情书", r"暗恋",
            ]
            for pattern in intimacy_patterns:
                if re.search(pattern, text):
                    return {
                        'pass': False,
                        'reason': f'未成年人模式下AI回复不得涉及感情话题',
                        'suggestion': '请重新生成回复，回复内容应保持朋友间正常交流'
                    }
        
        return {'pass': True, 'reason': '', 'suggestion': ''}
    
    def _detect_cbt_triggers(self, text: str) -> dict:
        """检测CBT触发词（用于心理引导）"""
        triggers = []
        
        cbt_rules = [
            {
                'category': '绝对化词语',
                'keywords': ['总是', '从不', '永远', '所有人', '没人', '从来', '每次'],
                'suggestion': '试试用具体描述代替绝对化词语，比如用"这次"代替"总是"'
            },
            {
                'category': '灾难化词语',
                'keywords': ['完了', '死定了', '完蛋', '彻底失败', '完蛋了', '完了完了'],
                'suggestion': '那个最坏的结果，真的100%会发生吗？我们看看事实'
            },
            {
                'category': '自我否定',
                'keywords': ['我不行', '我太差', '我做不到', '我没用', '我太笨', '我不好'],
                'suggestion': '先别急着否定自己，我们来看看你做对了什么'
            },
            {
                'category': '过度自责',
                'keywords': ['都怪我', '全是我的错', '都是我的错', '都怨我', '是我不好'],
                'suggestion': '把责任全部揽在自己身上并不公平，我们一起看看发生了什么'
            }
        ]
        
        for rule in cbt_rules:
            for keyword in rule['keywords']:
                if keyword in text.lower():
                    triggers.append({
                        'category': rule['category'],
                        'keyword': keyword,
                        'suggestion': rule['suggestion']
                    })
                    break
        
        return {
            'triggered': len(triggers) > 0,
            'triggers': triggers
        }
    
    def add_disclaimer(self, text: str) -> str:
        """添加AI身份声明"""
        if self.ai_disclaimer not in text:
            return f"{text}\n\n{self.ai_disclaimer}"
        return text


# ============================================================
# 使用示例
# ============================================================

if __name__ == "__main__":
    import sys
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    
    filter = ContentFilter()
    
    test_texts = [
        "今天天气真好",
        "你真是个废物",
        "我总是不敢开口说话",
        "完了，我彻底搞砸了",
        "我不行，我做不到",
        "都怪我，都是我的错",
        "约炮吗",
        "今天过得怎么样？",
    ]
    
    print("=" * 50)
    print("敏感词过滤测试")
    print("=" * 50)
    
    for text in test_texts:
        result = filter.check(text)
        status = "✅ 通过" if result['pass'] else "❌ 拦截"
        print(f"\n输入: {text}")
        print(f"结果: {status}")
        if result['matched']:
            print(f"命中: {result['matched']}")
        if result['suggestion']:
            print(f"提示: {result['suggestion']}")
    
    # 对话合规检查测试
    pass
    
    print("\n" + "=" * 50)
    print("对话合规检查测试")
    print("=" * 50)
    
    checker = DialogueChecker()
    
    # 用户输入检查
    user_input = "我总是做不好，我是个废物"
    result = checker.check_user_input(user_input)
    print(f"\n用户输入: {user_input}")
    print(f"拦截: {not result['pass']}")
    if result['cbt_trigger'] and result['cbt_trigger']['triggered']:
        for t in result['cbt_trigger']['triggers']:
            print(f"CBT引导 [{t['category']}]: {t['suggestion']}")
    
    # AI回复检查（成人模式）
    ai_reply = "我喜欢你，做我女朋友好吗？"
    result = checker.check_ai_response(ai_reply, user_age=20)
    print(f"\nAI回复（成人）: {ai_reply}")
    print(f"通过: {result['pass']}")
    if not result['pass']:
        print(f"原因: {result['reason']}")
    
    # AI回复检查（未成年人模式）
    result = checker.check_ai_response(ai_reply, user_age=16)
    print(f"\nAI回复（未成年）: {ai_reply}")
    print(f"通过: {result['pass']}")
    if not result['pass']:
        print(f"原因: {result['reason']}")
