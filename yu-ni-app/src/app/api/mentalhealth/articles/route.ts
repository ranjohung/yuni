import { prisma } from '@/lib/prisma'

const DEFAULT_ARTICLES = [
  {
    title: '如何应对社交焦虑',
    content: '社交焦虑是一种常见的心理状态，许多人在面对社交场合时都会感到紧张和不安。以下是一些应对社交焦虑的方法：\n\n1. **深呼吸**：在进入社交场合前，进行几次深呼吸可以帮助放松身心。\n\n2. **积极自我对话**：告诉自己"我可以的"，用积极的心态面对挑战。\n\n3. **从小事做起**：从简单的社交互动开始，逐渐积累经验和信心。\n\n4. **关注他人**：不要过度关注自己的表现，试着关注对方的话题和感受。\n\n5. **接受不完美**：没有人是完美的，接受自己的不足是成长的第一步。',
    category: 'anxiety',
    tags: '社交焦虑,应对方法',
  },
  {
    title: '情绪管理的重要性',
    content: '情绪管理是指能够识别、理解和控制自己情绪的能力。良好的情绪管理能力对身心健康至关重要。\n\n**为什么情绪管理很重要？**\n\n- 帮助我们更好地应对压力和挑战\n- 改善人际关系和沟通\n- 提高工作和学习效率\n- 促进身心健康\n\n**如何提高情绪管理能力？**\n\n1. 认识自己的情绪\n2. 学会情绪表达\n3. 练习情绪调节技巧\n4. 建立健康的生活习惯',
    category: 'emotion',
    tags: '情绪管理,心理健康',
  },
  {
    title: '建立健康的人际关系',
    content: '健康的人际关系是幸福生活的重要组成部分。以下是一些建立和维护健康人际关系的建议：\n\n1. **真诚相待**：真诚是建立信任的基础，不要伪装自己。\n\n2. **有效沟通**：学会倾听和表达，避免误解和冲突。\n\n3. **尊重边界**：每个人都有自己的边界，尊重他人的边界也是尊重自己。\n\n4. **给予和接受**：健康的关系是相互的，既要付出也要懂得接受。\n\n5. **保持独立**：在关系中保持自己的独立性和个人空间。',
    category: 'relationships',
    tags: '人际关系,沟通技巧',
  },
  {
    title: '自我关怀的艺术',
    content: '自我关怀是指善待自己、关心自己的身心健康。在快节奏的生活中，我们常常忽略了对自己的关怀。\n\n**自我关怀的方法：**\n\n1. **身体关怀**：保证充足的睡眠、均衡的饮食和适度的运动。\n\n2. **心理关怀**：学会放松、冥想，给自己留出休息和充电的时间。\n\n3. **情感关怀**：允许自己表达情绪，不要压抑内心的感受。\n\n4. **精神关怀**：培养兴趣爱好，寻找生活的意义和价值。\n\n记住，只有先照顾好自己，才能更好地照顾他人。',
    category: 'selfcare',
    tags: '自我关怀,身心健康',
  },
]

export async function GET() {
  try {
    let articles = await prisma.mentalHealthArticle.findMany({ where: { isActive: true } })
    
    if (articles.length === 0) {
      await prisma.mentalHealthArticle.createMany({ data: DEFAULT_ARTICLES })
      articles = await prisma.mentalHealthArticle.findMany({ where: { isActive: true } })
    }
    
    return new Response(JSON.stringify(articles), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: '获取文章列表失败' }), { status: 500 })
  }
}