import { authOptions } from '@/lib/authOptions'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const userId = parseInt(session.user.id)

  const records = await prisma.nvcRecord.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  return new Response(JSON.stringify(records), { status: 200 })
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const userId = parseInt(session.user.id)
  const data = await request.json()

  const record = await prisma.nvcRecord.create({
    data: {
      id: Date.now().toString(),
      userId,
      ...data,
      savedAt: new Date(),
    },
  })

  return new Response(JSON.stringify(record), { status: 201 })
}
