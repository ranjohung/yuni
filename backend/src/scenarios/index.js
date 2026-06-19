/**
 * 6个社交模拟场景数据
 * 每个场景包含：基础信息 + 3-4轮对话（每轮3个选项）
 */

const SCENARIOS = [
  {
    id: 1,
    title: '咖啡厅破冰',
    stage: 1,
    stageName: '陌生人→认识（破冰期）',
    difficulty: 1,
    durationMinutes: 8,
    skill: '从环境开启话题、观察细节',
    background: '你在咖啡厅排队，旁边的人看起来也很犹豫，你决定主动打个招呼。',
    atmosphere: '温暖的午后咖啡厅，空气中弥漫着咖啡香，背景有轻柔的爵士乐和零星的谈话声。',
    rounds: [
      {
        index: 0,
        title: '破冰',
        aiLine: '（站在你旁边，看着菜单犹豫）这家店的饮品好多啊...',
        teaching: '观察环境细节是很好的破冰方式',
        choices: [
          { text: '你也喜欢喝拿铁吗？看你在看那款', quality: 'high', affinity: 5, feedback: '很好的观察力！从具体细节开启对话最自然' },
          { text: '今天人好多啊', quality: 'normal', affinity: 0, feedback: '可以从更具体的话题切入' },
          { text: '（低头玩手机，不说话）', quality: 'avoid', affinity: -3, feedback: '回避会让机会溜走，试试迈出第一步' }
        ]
      },
      {
        index: 1,
        title: '展开',
        aiLine: '对呀，周末喜欢来这种安静的地方待着。你周末一般怎么过？',
        teaching: '用开放式问题可以让对话继续深入',
        choices: [
          { text: '我周末喜欢去书店或者看展，最近发现了一个很有意思的摄影展', quality: 'high', affinity: 5, feedback: '分享具体兴趣会让对话更有共鸣' },
          { text: '也没什么特别的，就是在家待着', quality: 'normal', affinity: 0, feedback: '可以多说一点细节，让对方更容易接话' },
          { text: '嗯，就那样吧', quality: 'avoid', affinity: -5, feedback: '简短回应容易让对话冷场，试试多说两句' }
        ]
      },
      {
        index: 2,
        title: '收尾',
        aiLine: '那家摄影展听起来不错！我最近也在看一本关于城市摄影的书...',
        teaching: '在气氛最好的时候收尾，留下下次再聊的余地',
        choices: [
          { text: '认识你很高兴，下次可以一起去看展', quality: 'high', affinity: 5, feedback: '很好的收尾！表达了继续交往的意愿又不显得唐突' },
          { text: '那加个微信吧', quality: 'normal', affinity: 2, feedback: '合理，但可以先建立多一点连接' },
          { text: '那我先走了', quality: 'low', affinity: -8, feedback: '突然结束显得有点突兀，不如说"下次见"' }
        ]
      }
    ]
  },
  {
    id: 2,
    title: '兴趣社群自我介绍',
    stage: 1,
    stageName: '陌生人→认识（破冰期）',
    difficulty: 2,
    durationMinutes: 10,
    skill: '自信自我介绍、兴趣话题延伸',
    background: '你加入了一个读书社群，今天是第一次线下活动，轮到你做3分钟自我介绍。',
    atmosphere: '温馨的社区书店一角，十几个人围坐成圈，有人端着茶杯微笑着看向你。',
    rounds: [
      {
        index: 0,
        title: '开场',
        aiLine: '（主理人微笑）好，下一位轮到你了，给大家介绍一下自己吧！',
        teaching: '自我介绍要有记忆点，不只报名字',
        choices: [
          { text: '大家好，我是XX，最近在看《被讨厌的勇气》，推荐给大家', quality: 'high', affinity: 5, feedback: '分享正在读的书是个很好的记忆点！' },
          { text: '大家好，我叫XX，很高兴认识大家', quality: 'normal', affinity: 0, feedback: '可以加入一些个人特色' },
          { text: '我...我没什么好说的', quality: 'avoid', affinity: -5, feedback: '每个人都有值得分享的故事，别紧张' }
        ]
      },
      {
        index: 1,
        title: '互动',
        aiLine: '（有人举手）那本书我也看过！你觉得哪一段最打动你？',
        teaching: '回应别人的问题时，先肯定再展开',
        choices: [
          { text: '关于"课题分离"那段特别触动我，让我学会了不活在别人的期待里', quality: 'high', affinity: 5, feedback: '结合个人感悟的回答最能引起共鸣' },
          { text: '挺好看的，你也喜欢吗', quality: 'normal', affinity: 0, feedback: '可以更深入地分享你的体会' },
          { text: '呃...我记不太清了', quality: 'low', affinity: -5, feedback: '提前准备几个想分享的点就会更自信' }
        ]
      },
      {
        index: 2,
        title: '延伸',
        aiLine: '说得真好！那你平时还喜欢看什么类型的书？',
        teaching: '把话题扩展到相关的兴趣领域',
        choices: [
          { text: '我还喜欢看心理学和科幻类的，最近在读《思考，快与慢》', quality: 'high', affinity: 5, feedback: '展示多维度兴趣让人更想和你交流' },
          { text: '什么书都随便看看', quality: 'normal', affinity: 0, feedback: '可以说一两个具体的书名' },
          { text: '我其实不太看书...', quality: 'low', affinity: -5, feedback: '来读书社群说不太看书会让场面尴尬' }
        ]
      }
    ]
  },
  {
    id: 3,
    title: '模拟面试',
    stage: 2,
    stageName: '认识→普通朋友（接触期）',
    difficulty: 3,
    durationMinutes: 15,
    skill: '结构化表达、STAR法则',
    background: '你正在参加一家心仪公司的面试，面试官是一位看起来很专业的中年人。',
    atmosphere: '简洁明亮的会议室，面试官坐在你对面的办公桌后，面前放着一份简历。',
    rounds: [
      {
        index: 0,
        title: '自我介绍',
        aiLine: '请简单介绍一下你自己，以及为什么想加入我们公司？',
        teaching: '自我介绍要有结构：我是谁→我做过什么→为什么适合',
        choices: [
          { text: '我是XX，有3年产品经理经验，主导过两个从0到1的项目。我研究过贵公司的产品，很认同你们的设计理念', quality: 'high', affinity: 5, feedback: '结构清晰，展示了匹配度！' },
          { text: '我叫XX，之前做产品经理，想换个环境', quality: 'normal', affinity: 0, feedback: '可以多突出你的成就和动机' },
          { text: '额...我简历上都写了', quality: 'low', affinity: -8, feedback: '面试是展示沟通能力的机会，抓紧！' }
        ]
      },
      {
        index: 1,
        title: '专业提问',
        aiLine: '能分享一个你处理过的有挑战性的项目吗？',
        teaching: '用STAR法则：情境→任务→行动→结果',
        choices: [
          { text: '去年有个项目上线前发现了严重的性能问题（S），我负责定位和修复（T），用了3天重构查询逻辑（A），最终上线后响应速度提升了60%（R）', quality: 'high', affinity: 5, feedback: '完美的STAR表达！有数据有结果' },
          { text: '有个项目挺难的，最后也做完了', quality: 'normal', affinity: 0, feedback: '试着用STAR结构展开' },
          { text: '好像没有什么特别的项目', quality: 'low', affinity: -8, feedback: '每个工作都有亮点，提前准备好' }
        ]
      },
      {
        index: 2,
        title: '质疑应对',
        aiLine: '我觉得你在这个领域的经验可能还不够？',
        teaching: '被质疑时先认可再补充，不要防御',
        choices: [
          { text: '您说得对，我确实在这个领域经验不多，但我在类似项目上快速学习的能力很强，比如之前用3周掌握了一个新技术栈并完成了交付', quality: 'high', affinity: 5, feedback: '承认不足+展示学习能力，非常有说服力' },
          { text: '我觉得经验够的，我之前做过的项目也很相关', quality: 'normal', affinity: 0, feedback: '可以更坦诚地面对质疑' },
          { text: '（沉默）...', quality: 'avoid', affinity: -10, feedback: '沉默是最差的回应，勇于接话' }
        ]
      },
      {
        index: 3,
        title: '结束',
        aiLine: '好的，今天面试到这里。你有什么想问我的吗？',
        teaching: '准备2-3个有深度的问题展示你的思考',
        choices: [
          { text: '请问这个岗位最大的挑战是什么？以及您对理想候选人的期待是什么？', quality: 'high', affinity: 5, feedback: '好问题！展示了你对这个岗位的认真思考' },
          { text: '没有问题了，谢谢', quality: 'normal', affinity: 2, feedback: '准备几个问题会让面试官印象更深刻' },
          { text: '请问工资多少？', quality: 'low', affinity: -8, feedback: '薪资可以留到后续谈，先把专业印象留下' }
        ]
      }
    ]
  },
  {
    id: 4,
    title: '向上汇报被质疑',
    stage: 2,
    stageName: '认识→普通朋友（接触期）',
    difficulty: 4,
    durationMinutes: 12,
    skill: '应对质疑、数据支撑、情绪管理',
    background: '你向领导汇报项目进度，领导对你的方案提出了质疑。',
    atmosphere: '办公室会议室，白板上写着项目进度表，领导双手交叉看着你。',
    rounds: [
      {
        index: 0,
        title: '汇报开始',
        aiLine: '你这个方案的时间太紧了吧？能保证质量吗？',
        teaching: '被质疑时先稳住，用数据说话',
        choices: [
          { text: '我理解您的担心。我们做了风险评估，关键路径上预留了20%的缓冲时间，并且核心模块已经完成了60%', quality: 'high', affinity: 5, feedback: '数据化回应最有说服力！' },
          { text: '我觉得可以的，没问题的', quality: 'normal', affinity: 0, feedback: '用具体数据支撑你的回答' },
          { text: '那您觉得应该怎么做？', quality: 'avoid', affinity: -5, feedback: '反问领导虽然不算错，但先表达你的思考更重要' }
        ]
      },
      {
        index: 1,
        title: '深度追问',
        aiLine: '如果开发资源被其他项目占用了怎么办？',
        teaching: '展现出你已经想过风险和应对方案',
        choices: [
          { text: '我们准备了B计划：如果核心开发被占用，可以先用外包团队支撑标准化模块，我们有备选供应商已经谈好了', quality: 'high', affinity: 5, feedback: '有备选方案是最让人放心的回答' },
          { text: '那到时候再说吧', quality: 'normal', affinity: -3, feedback: '提前想好风险应对方案' },
          { text: '那我也没办法啊', quality: 'low', affinity: -8, feedback: '作为负责人不能表现出无能为力' }
        ]
      },
      {
        index: 2,
        title: '预算质疑',
        aiLine: '预算也不够吧？你算过没有？',
        teaching: '被质疑预算时，展示详细的成本结构',
        choices: [
          { text: '预算我细算过：人力成本占60%，云服务占25%，预留15%给不可预见的支出，比同类项目还低了10%', quality: 'high', affinity: 5, feedback: '详细的成本结构让人信服' },
          { text: '应该够用吧', quality: 'normal', affinity: -3, feedback: '预算问题不能含糊' },
          { text: '是您批的预算啊', quality: 'low', affinity: -10, feedback: '不要推卸责任，这会损害信任' }
        ]
      }
    ]
  },
  {
    id: 5,
    title: '被朋友误解',
    stage: 3,
    stageName: '普通朋友→好朋友（熟悉期）',
    difficulty: 3,
    durationMinutes: 10,
    skill: '非暴力沟通（NVC）、共情回应',
    background: '你的朋友因为一件事误以为你不在乎TA，你需要主动解释和修复关系。',
    atmosphere: '安静的公园长椅旁，秋风微凉，你朋友坐在一旁低着头。',
    rounds: [
      {
        index: 0,
        title: '面对责备',
        aiLine: '你昨天根本没来，你是不是根本不在乎我？',
        teaching: '用NVC四步法：事实+感受+需求+请求',
        choices: [
          { text: '我昨天确实没到，让你失望了（事实），我感到很抱歉（感受），因为我真的很珍惜我们的友谊（需求），我们可以找时间好好聊聊吗（请求）？', quality: 'high', affinity: 10, feedback: '完美的NVC示范！先承认事实，表达感受，说出需求，提出请求' },
          { text: '不是的，我昨天真的有事', quality: 'normal', affinity: 0, feedback: '解释了但缺少共情，先回应对方的情绪' },
          { text: '你怎么能这么说，我才不是那样的人', quality: 'low', affinity: -8, feedback: '防御性回应会让矛盾升级，先放下防备' }
        ]
      },
      {
        index: 1,
        title: '表达理解',
        aiLine: '你知道我等了你很久吗？给你发了那么多消息你都没回',
        teaching: '先共情再解释，不要急于自辩',
        choices: [
          { text: '让你等了这么久，一定很委屈吧。我当时手机没电了，到了之后才发现你的消息，真的对不起', quality: 'high', affinity: 8, feedback: '先共情对方的感受再解释原因，对方会更容易接受' },
          { text: '我那会儿手机没电了', quality: 'normal', affinity: 0, feedback: '解释原因之前先共情' },
          { text: '你发消息了我就要秒回吗', quality: 'low', affinity: -10, feedback: '这种反问非常伤感情' }
        ]
      },
      {
        index: 2,
        title: '和好',
        aiLine: '好吧...其实我就是觉得你不重视我了',
        teaching: '表达重视和愿意改变的态度',
        choices: [
          { text: '我明白你的感受。你对我很重要，以后我会提前告诉你如果不能赴约，不会再让你空等了', quality: 'high', affinity: 8, feedback: '表达重视+具体承诺，关系会更强' },
          { text: '以后不会了', quality: 'normal', affinity: 0, feedback: '可以更具体地表达重视' },
          { text: '你真的想太多了', quality: 'low', affinity: -8, feedback: '否定对方的感受会加深裂痕' }
        ]
      }
    ]
  },
  {
    id: 6,
    title: '安慰失落的朋友',
    stage: 3,
    stageName: '普通朋友→好朋友（熟悉期）',
    difficulty: 2,
    durationMinutes: 10,
    skill: '共情回应、情绪陪伴',
    background: '你的朋友刚经历了挫折（面试被拒/分手/被批评），情绪低落，TA来找你倾诉。',
    atmosphere: '温馨的客厅，灯光柔和，你的朋友蜷缩在沙发上，抱着一个抱枕。',
    rounds: [
      {
        index: 0,
        title: '倾听',
        aiLine: '（声音低沉）我今天面试被拒了...我觉得我太差劲了',
        teaching: '先接纳情绪，不要急着给建议',
        choices: [
          { text: '被拒了一定很难受吧（轻拍肩膀）。不要急着否定自己，能和我说说发生了什么吗？', quality: 'high', affinity: 8, feedback: '先共情感受，再引导倾诉，效果最好' },
          { text: '没事的，下次就好了', quality: 'normal', affinity: 0, feedback: '不要急着安慰，先让对方把情绪说出来' },
          { text: '你那家公司确实要求很高', quality: 'low', affinity: -5, feedback: '不要说贬低对方的话，即使是善意的' }
        ]
      },
      {
        index: 1,
        title: '共情',
        aiLine: '我觉得自己准备得很充分了，但面试官问的问题我都答不上来...',
        teaching: '反映式倾听：重述对方的话表示你在认真听',
        choices: [
          { text: '所以你不是没有准备，而是有些问题出乎意料，对吗？这种感觉确实很挫败', quality: 'high', affinity: 8, feedback: '反映式倾听让对方感到被理解' },
          { text: '哪些问题没答上来？', quality: 'normal', affinity: 0, feedback: '先共情情绪再问细节' },
          { text: '那你下次多准备一些可能的问题吧', quality: 'low', affinity: -5, feedback: '对方还在情绪中，不适合立刻给建议' }
        ]
      },
      {
        index: 2,
        title: '支持',
        aiLine: '（开始有点放松了）其实我知道自己有些地方确实需要提升',
        teaching: '当对方开始理性思考时，可以适当给出鼓励和支持',
        choices: [
          { text: '能正视自己的不足已经很棒了。要不要我们一起复盘一下面试，看看可以怎么提升？', quality: 'high', affinity: 5, feedback: '情绪平复后提供具体帮助是最好的支持' },
          { text: '你已经很优秀了', quality: 'normal', affinity: 0, feedback: '鼓励虽好，但帮助更有价值' },
          { text: '那家公司面试确实很难的，不用太在意', quality: 'low', affinity: -5, feedback: '不要低估对方的感受，正面支持更有力量' }
        ]
      }
    ]
  }
];

function getScenarioById(id) {
  return SCENARIOS.find(s => s.id === id) || null;
}

module.exports = { scenarios: SCENARIOS, getScenarioById };
