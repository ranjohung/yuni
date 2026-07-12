import bcrypt from 'bcryptjs';

async function check() {
  const hash = '$2b$10$OEzIyKuNDG7QT3kufX5iYerBkLiCYjLc13ENNtCIMAodh3aOHt/Vy';
  const result = await bcrypt.compare('123456', hash);
  console.log('Password match:', result);
}

check();