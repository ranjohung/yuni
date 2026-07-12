const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  await prisma.socialScene.createMany({
    data: [
      {
        id: 1,
        name: '初次见面',
        description: '在咖啡厅与陌生人初次见面',
        difficulty: 1,
        stage: 1,
        unlockAffection: 0,
        options: JSON.stringify([
          { label: '热情打招呼', value: 'warm', quality: 'good' },
          { label: '礼貌问候', value: 'polite', quality: 'safe' },
          { label: '沉默等待', value: 'silent', quality: 'cold' },
        ]),
      },
      {
        id: 2,
        name: '职场面试',
        description: '参加公司面试',
        difficulty: 2,
        stage: 1,
        unlockAffection: 0,
        options: JSON.stringify([
          { label: '自信回答', value: 'confident', quality: 'good' },
          { label: '谨慎回答', value: 'careful', quality: 'safe' },
          { label: '紧张回避', value: 'nervous', quality: 'cold' },
        ]),
      },
      {
        id: 3,
        name: '朋友聚会',
        description: '参加朋友聚会',
        difficulty: 1,
        stage: 2,
        unlockAffection: 100,
        options: JSON.stringify([
          { label: '主动交流', value: 'active', quality: 'good' },
          { label: '跟随话题', value: 'follow', quality: 'safe' },
          { label: '独自玩手机', value: 'alone', quality: 'cold' },
        ]),
      },
      {
        id: 4,
        name: '向上汇报',
        description: '向领导汇报工作',
        difficulty: 3,
        stage: 2,
        unlockAffection: 100,
        options: JSON.stringify([
          { label: '条理清晰', value: 'clear', quality: 'good' },
          { label: '按部就班', value: 'routine', quality: 'safe' },
          { label: '含糊不清', value: 'vague', quality: 'cold' },
        ]),
      },
      {
        id: 5,
        name: '约会场景',
        description: '与心仪对象约会',
        difficulty: 2,
        stage: 3,
        unlockAffection: 300,
        options: JSON.stringify([
          { label: '真诚交流', value: 'sincere', quality: 'good' },
          { label: '保持礼貌', value: 'polite', quality: 'safe' },
          { label: '敷衍了事', value: 'perfunctory', quality: 'cold' },
        ]),
      },
    ],
    skipDuplicates: true,
  })

  await prisma.giftItem.createMany({
    data: [
      { id: 1, name: '鲜花', category: '浪漫', tier: 1, pricePoints: 100, affectionMin: 5, affectionMax: 10 },
      { id: 2, name: '巧克力', category: '浪漫', tier: 1, pricePoints: 80, affectionMin: 4, affectionMax: 8 },
      { id: 3, name: '小熊玩偶', category: '可爱', tier: 1, pricePoints: 120, affectionMin: 6, affectionMax: 12 },
      { id: 4, name: '手写情书', category: '浪漫', tier: 2, pricePoints: 200, affectionMin: 10, affectionMax: 15 },
      { id: 5, name: '项链', category: '饰品', tier: 2, pricePoints: 500, affectionMin: 15, affectionMax: 20 },
      { id: 6, name: '手表', category: '饰品', tier: 3, pricePoints: 1000, affectionMin: 20, affectionMax: 30 },
    ],
    skipDuplicates: true,
  })

  console.log('Seed data created successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
