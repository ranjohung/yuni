import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10);
  console.log('New hash:', hashedPassword);
  
  const user = await prisma.user.findUnique({
    where: { phone: '11111111111' },
  });
  
  if (!user) {
    console.log('User not found, creating...');
    await prisma.user.create({
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
  } else {
    console.log('User found, updating password...');
    await prisma.user.update({
      where: { phone: '11111111111' },
      data: { password: hashedPassword },
    });
  }
  
  console.log('Done!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());