import { prisma } from '@/lib/prisma'

const DEFAULT_TESTS = [
  {
    title: '焦虑自评量表 (SAS)',
    description: '评估您当前的焦虑程度',
    type: 'anxiety',
    questions: JSON.stringify([
      { question: '我觉得比平常容易紧张或着急', options: ['没有或很少', '小部分时间', '相当多时间', '绝大部分时间'] },
      { question: '我无缘无故地感到害怕', options: ['没有或很少', '小部分时间', '相当多时间', '绝大部分时间'] },
      { question: '我容易心烦意乱或感到惊恐', options: ['没有或很少', '小部分时间', '相当多时间', '绝大部分时间'] },
      { question: '我觉得自己可能将要发疯', options: ['没有或很少', '小部分时间', '相当多时间', '绝大部分时间'] },
      { question: '我觉得一切都很好，没什么不幸', options: ['没有或很少', '小部分时间', '相当多时间', '绝大部分时间'] },
    ]),
  },
  {
    title: '抑郁自评量表 (SDS)',
    description: '评估您当前的抑郁程度',
    type: 'depression',
    questions: JSON.stringify([
      { question: '我觉得闷闷不乐，情绪低沉', options: ['没有或很少', '小部分时间', '相当多时间', '绝大部分时间'] },
      { question: '我觉得一天之中早晨最好', options: ['没有或很少', '小部分时间', '相当多时间', '绝大部分时间'] },
      { question: '我一阵阵哭出来或觉得想哭', options: ['没有或很少', '小部分时间', '相当多时间', '绝大部分时间'] },
      { question: '我晚上睡眠不好', options: ['没有或很少', '小部分时间', '相当多时间', '绝大部分时间'] },
      { question: '我吃得跟平常一样多', options: ['没有或很少', '小部分时间', '相当多时间', '绝大部分时间'] },
    ]),
  },
  {
    title: '压力测试',
    description: '评估您当前的压力水平',
    type: 'stress',
    questions: JSON.stringify([
      { question: '最近一周，您感到有压力吗？', options: ['完全没有', '偶尔有', '经常有', '总是有'] },
      { question: '您能轻松应对日常工作吗？', options: ['完全可以', '大部分可以', '有点困难', '非常困难'] },
      { question: '您感到焦虑或紧张吗？', options: ['完全没有', '偶尔有', '经常有', '总是有'] },
      { question: '您有足够的休息时间吗？', options: ['完全足够', '大部分足够', '有点不够', '非常不够'] },
      { question: '您感到身心疲惫吗？', options: ['完全没有', '偶尔有', '经常有', '总是有'] },
    ]),
  },
]

export async function GET() {
  try {
    let tests = await prisma.mentalHealthTest.findMany({ where: { isActive: true } })
    
    if (tests.length === 0) {
      await prisma.mentalHealthTest.createMany({ data: DEFAULT_TESTS })
      tests = await prisma.mentalHealthTest.findMany({ where: { isActive: true } })
    }
    
    return new Response(JSON.stringify(tests), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: '获取测试列表失败' }), { status: 500 })
  }
}