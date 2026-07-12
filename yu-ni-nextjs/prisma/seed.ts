import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10);

  const user = await prisma.user.create({
    data: {
      phone: '11111111111',
      password: hashedPassword,
      nickname: '测试用户',
      age: 25,
      membershipType: 0,
      points: 100,
      weeklySimulations: 15,
      tickets: 5,
      referralCode: 'TEST001',
    },
  });

  await prisma.partner.create({
    data: {
      userId: user.id,
      name: '小明',
      coreType: 'ESFJ',
      voiceType: 'female',
      extroversion: 7,
      intuition: 4,
      feeling: 8,
      judging: 6,
      personalityTraits: {
        traits: ['热情', '体贴', '善解人意', '有责任心'],
        hobbies: ['读书', '旅行', '音乐'],
      },
    },
  });

  await prisma.affection.create({
    data: {
      userId: user.id,
      level: 3,
      score: 280,
      dailyInteractionCount: 5,
    },
  });

  await prisma.socialScene.createMany({
    data: [
      {
        sceneName: '初次见面',
        stage: 1,
        difficulty: 1,
        estimatedTime: 10,
        unlockAffection: 0,
        background: '你在朋友聚会上遇到了一个新朋友，对方看起来很友好，但你不太确定该如何开启话题。',
        dialogTree: {
          nodes: [
            { id: 'start', text: '你好，我是[用户昵称]', options: ['你好，很高兴认识你', '嗨，你也来参加聚会吗'] },
            { id: 'option1', text: '你好，很高兴认识你', next: 'intro' },
            { id: 'option2', text: '嗨，你也来参加聚会吗', next: 'party' },
          ],
        },
        evaluationDimensions: ['礼貌程度', '话题开启', '眼神交流', '微笑频率'],
      },
      {
        sceneName: '工作汇报',
        stage: 1,
        difficulty: 2,
        estimatedTime: 15,
        unlockAffection: 0,
        background: '你需要向领导汇报本周的工作进展，领导看起来很忙，你需要简洁明了地表达。',
        dialogTree: {
          nodes: [
            { id: 'start', text: '领导好，我来汇报一下本周工作', options: ['好的，简要说说', '放这里吧，我等下看'] },
          ],
        },
        evaluationDimensions: ['表达清晰', '重点突出', '时间控制', '专业度'],
      },
      {
        sceneName: '朋友倾诉',
        stage: 1,
        difficulty: 1,
        estimatedTime: 12,
        unlockAffection: 0,
        background: '朋友最近心情不太好，来找你倾诉。你需要倾听并给予适当的安慰。',
        dialogTree: {
          nodes: [
            { id: 'start', text: '最近感觉怎么样？', options: ['唉，别提了', '还好，就是有点累'] },
          ],
        },
        evaluationDimensions: ['倾听能力', '同理心', '安慰方式', '肢体语言'],
      },
      {
        sceneName: '餐厅点餐',
        stage: 1,
        difficulty: 1,
        estimatedTime: 8,
        unlockAffection: 0,
        background: '你和伴侣去餐厅吃饭，服务员过来点餐。你需要礼貌地点餐并考虑对方的口味。',
        dialogTree: {
          nodes: [
            { id: 'start', text: '请问需要点餐吗？', options: ['先看看菜单', '麻烦推荐一下招牌菜'] },
          ],
        },
        evaluationDimensions: ['礼貌程度', '沟通清晰', '考虑他人', '决策能力'],
      },
      {
        sceneName: '面试准备',
        stage: 2,
        difficulty: 3,
        estimatedTime: 20,
        unlockAffection: 50,
        background: '你即将参加一场重要的面试，面试官看起来很严肃。你需要自信地介绍自己。',
        dialogTree: {
          nodes: [
            { id: 'start', text: '请先做个自我介绍', options: ['好的，我来介绍一下', '面试官您好'] },
          ],
        },
        evaluationDimensions: ['自信程度', '表达流畅', '重点突出', '眼神交流', '肢体语言'],
      },
      {
        sceneName: '团队会议',
        stage: 2,
        difficulty: 3,
        estimatedTime: 18,
        unlockAffection: 50,
        background: '团队会议上，你需要提出自己的想法和建议。其他成员都在认真听。',
        dialogTree: {
          nodes: [
            { id: 'start', text: '大家有什么想法吗？', options: ['我有一些想法', '先听听其他人的'] },
          ],
        },
        evaluationDimensions: ['表达清晰', '逻辑思维', '团队协作', '说服力'],
      },
      {
        sceneName: '陌生人求助',
        stage: 2,
        difficulty: 2,
        estimatedTime: 10,
        unlockAffection: 50,
        background: '在地铁站，一位陌生人向你问路。你需要耐心地指引对方。',
        dialogTree: {
          nodes: [
            { id: 'start', text: '请问XX路怎么走？', options: ['往那边走', '我带你过去吧'] },
          ],
        },
        evaluationDimensions: ['乐于助人', '表达清晰', '耐心程度', '友善态度'],
      },
      {
        sceneName: '约会场景',
        stage: 2,
        difficulty: 3,
        estimatedTime: 15,
        unlockAffection: 50,
        background: '你和心仪的对象第一次约会，在咖啡厅见面。气氛有些紧张。',
        dialogTree: {
          nodes: [
            { id: 'start', text: '你想喝点什么？', options: ['和你一样', '来杯拿铁吧'] },
          ],
        },
        evaluationDimensions: ['自信程度', '幽默风趣', '倾听能力', '话题展开', '肢体语言'],
      },
      {
        sceneName: '商务谈判',
        stage: 3,
        difficulty: 4,
        estimatedTime: 25,
        unlockAffection: 100,
        background: '你代表公司与客户进行商务谈判，双方在价格上存在分歧。',
        dialogTree: {
          nodes: [
            { id: 'start', text: '这个价格我们很难接受', options: ['我们可以再商量', '这已经是最优惠的了'] },
          ],
        },
        evaluationDimensions: ['谈判技巧', '说服力', '情绪控制', '专业度', '双赢思维'],
      },
      {
        sceneName: '冲突调解',
        stage: 3,
        difficulty: 4,
        estimatedTime: 20,
        unlockAffection: 100,
        background: '两位同事发生了争吵，你作为团队负责人需要调解矛盾。',
        dialogTree: {
          nodes: [
            { id: 'start', text: '你们先冷静一下', options: ['我们私下谈', '大家都少说两句'] },
          ],
        },
        evaluationDimensions: ['公正公平', '倾听能力', '调解技巧', '情绪管理', '沟通能力'],
      },
      {
        sceneName: '公众演讲',
        stage: 3,
        difficulty: 5,
        estimatedTime: 30,
        unlockAffection: 150,
        background: '你需要在公司年会上做一次公众演讲，台下有上百名同事。',
        dialogTree: {
          nodes: [
            { id: 'start', text: '各位同事，大家好', options: ['很高兴站在这里', '感谢大家的到来'] },
          ],
        },
        evaluationDimensions: ['自信程度', '表达流畅', '感染力', '互动能力', '时间控制'],
      },
      {
        sceneName: '危机处理',
        stage: 3,
        difficulty: 5,
        estimatedTime: 25,
        unlockAffection: 150,
        background: '客户对产品质量提出严重投诉，情绪非常激动。你需要妥善处理。',
        dialogTree: {
          nodes: [
            { id: 'start', text: '你们的产品有严重问题！', options: ['非常抱歉，我们会处理', '请您冷静一下'] },
          ],
        },
        evaluationDimensions: ['情绪控制', '危机处理', '同理心', '解决方案', '沟通技巧'],
      },
    ],
  });

  await prisma.chatSession.create({
    data: {
      userId: user.id,
      sessionType: 'partner',
      messages: [
        { role: 'ai', content: '你好呀！今天感觉怎么样？😊', timestamp: new Date().toISOString() },
        { role: 'user', content: '挺好的，你呢？', timestamp: new Date().toISOString() },
        { role: 'ai', content: '我也很好！有什么想聊的吗？', timestamp: new Date().toISOString() },
      ],
    },
  });

  await prisma.giftItem.createMany({
    data: [
      { name: '虚拟鲜花', category: '花', tier: 1, pricePoints: 0, membershipRequired: 0, affectionMin: 5, affectionMax: 8 },
      { name: '虚拟卡片', category: '卡片', tier: 1, pricePoints: 0, membershipRequired: 0, affectionMin: 5, affectionMax: 8 },
      { name: '虚拟奶茶', category: '饮品', tier: 2, pricePoints: 50, membershipRequired: 0, affectionMin: 8, affectionMax: 12 },
      { name: '虚拟甜品', category: '食品', tier: 2, pricePoints: 60, membershipRequired: 0, affectionMin: 8, affectionMax: 12 },
      { name: '虚拟项链', category: '饰品', tier: 3, pricePoints: 150, membershipRequired: 1, affectionMin: 12, affectionMax: 18 },
      { name: '虚拟手链', category: '饰品', tier: 3, pricePoints: 120, membershipRequired: 1, affectionMin: 12, affectionMax: 18 },
      { name: '虚拟钻戒', category: '饰品', tier: 4, pricePoints: 300, membershipRequired: 2, affectionMin: 20, affectionMax: 30 },
      { name: '虚拟旅行', category: '体验', tier: 4, pricePoints: 500, membershipRequired: 2, affectionMin: 20, affectionMax: 30 },
      { name: '专属定制', category: '特殊', tier: 5, pricePoints: 1000, membershipRequired: 3, affectionMin: 30, affectionMax: 50 },
    ],
  });

  await prisma.relationshipMilestone.create({
    data: {
      userId: user.id,
      partnerId: user.id,
      milestoneType: 'first_chat',
      description: '第一次与伴侣聊天',
    },
  });

  console.log('Seed data created successfully!');
  console.log(`Test user: phone=11111111111, password=123456`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
