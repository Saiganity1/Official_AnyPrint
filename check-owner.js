const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
  const users = await prisma.user.findMany();
  if (users.length > 0) {
    console.log("Users found. Promoting the first user to OWNER.");
    const owner = await prisma.user.update({
      where: { id: users[0].id },
      data: { role: 'OWNER' }
    });
    console.log(`Promoted user: ${owner.email || owner.phone} (Name: ${owner.name})`);
  } else {
    console.log("No users found. Creating a default owner account.");
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    const owner = await prisma.user.create({
      data: {
        email: 'admin@anyprint.com',
        phone: '09000000000',
        password: hashedPassword,
        name: 'System Admin',
        role: 'OWNER',
      }
    });
    console.log("Created default owner account:");
    console.log("Email/Phone: admin@anyprint.com (or 09000000000)");
    console.log("Password: Admin@123");
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
