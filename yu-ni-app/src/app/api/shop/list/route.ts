import { prisma } from '@/lib/prisma'

const DEFAULT_ITEMS = [
  { name: '好感度药水', description: '使用后增加20点好感度', icon: '🧪', type: 'consumable', effect: 'affection_boost_20', pricePoints: 100, rarity: 'common', category: 'consumables' },
  { name: '经验加倍卡', description: '下次训练经验翻倍', icon: '📈', type: 'consumable', effect: 'exp_double', pricePoints: 150, rarity: 'rare', category: 'consumables' },
  { name: '积分礼包', description: '包含300积分', icon: '🎁', type: 'bundle', effect: 'points_300', pricePoints: 0, rarity: 'epic', category: 'bundles' },
  { name: '高级礼物券', description: '可兑换任意高级礼物', icon: '🎫', type: 'ticket', effect: 'premium_gift', pricePoints: 500, rarity: 'legendary', category: 'tickets' },
  { name: '心情探测器', description: '查看伴侣当前心情', icon: '🔍', type: 'tool', effect: 'mood_detect', pricePoints: 80, rarity: 'common', category: 'tools' },
  { name: '时间沙漏', description: '时空穿梭道具', icon: '⏳', type: 'tool', effect: 'time_travel', pricePoints: 200, rarity: 'rare', category: 'tools' },
  { name: '个性定制卡', description: '自定义伴侣外观', icon: '🎨', type: 'ticket', effect: 'customize_character', pricePoints: 300, rarity: 'epic', category: 'tickets' },
  { name: '心理测试券', description: '解锁所有心理测试', icon: '🧠', type: 'ticket', effect: 'unlock_tests', pricePoints: 120, rarity: 'common', category: 'tickets' },
]

export async function GET() {
  try {
    let items = await prisma.shopItem.findMany({ where: { isActive: true } })
    
    if (items.length === 0) {
      await prisma.shopItem.createMany({ data: DEFAULT_ITEMS })
      items = await prisma.shopItem.findMany({ where: { isActive: true } })
    }
    
    return new Response(JSON.stringify(items), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: '获取商品列表失败' }), { status: 500 })
  }
}