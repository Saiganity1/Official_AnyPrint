
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  // Check if owner already exists
  const ownerEmail = 'owner@anyprintavenue.com';
  let owner = await prisma.user.findUnique({ where: { email: ownerEmail } });

  if (!owner) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    owner = await prisma.user.create({
      data: {
        name: 'AnyPrint Owner',
        email: ownerEmail,
        password: hashedPassword,
        role: 'OWNER',
      },
    });
    console.log('Owner created:', owner.email);
  } else {
    console.log('Owner already exists');
  }

  // Wipe existing products to re-seed with accurate Shopee data
  await prisma.product.deleteMany({});

  const products = [
    {
      name: 'YALEX PLAIN SHIRT Emerald Green',
      description: 'YALEX Plain Shirt Emerald Green for Kids and Adults. High quality fabric.',
      price: 69.00,
      stock: 500,
      imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'YALEX PLAIN SHIRT Yellow Gold',
      description: 'YALEX Plain Shirt Yellow Gold for Kids and Adults in high quality fabric.',
      price: 69.00,
      stock: 500,
      imageUrl: 'https://images.unsplash.com/photo-1586363104862-3a5e228e1962?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'YALEX PLAIN SHIRT Black',
      description: 'YALEX Plain Shirt Black for Kids and Adults in high quality fabric.',
      price: 69.00,
      stock: 500,
      imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'YALEX PLAIN SHIRT White',
      description: 'YALEX Plain Shirt White for Kids and Adults in high quality fabric.',
      price: 69.00,
      stock: 500,
      imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'YALEX PLAIN SHIRT Royal Blue',
      description: 'YALEX Plain Shirt Royal Blue for Kids and Adults in high quality fabric.',
      price: 69.00,
      stock: 500,
      imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'YALEX PLAIN SHIRT Red',
      description: 'YALEX Plain Shirt Red for Kids and Adults in high quality fabric.',
      price: 69.00,
      stock: 500,
      imageUrl: 'https://images.unsplash.com/photo-1586363104862-3a5e228e1962?auto=format&fit=crop&w=800&q=80',
    }
  ];

  for (const p of products) {
    await prisma.product.create({ data: p });
  }
  console.log('Shopee Products seeded');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
