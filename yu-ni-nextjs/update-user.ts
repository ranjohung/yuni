import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10);
  await prisma.user.update({
    where: { phone: '11111111111' },
    data: { password: hashedPassword },
  });
  console.log('Password updated successfully');
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());