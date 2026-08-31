import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
  await prisma.aIInsight.deleteMany();

  // Create sample users
  const farmerPassword = await bcrypt.hash('farmer123', 10);
  const buyerPassword = await bcrypt.hash('buyer123', 10);

  const farmer1 = await prisma.user.create({
    data: {
      name: 'Rajesh Kumar',
      email: 'rajesh@farm.com',
      password: farmerPassword,
      role: Role.FARMER,
    },
  });

  const farmer2 = await prisma.user.create({
    data: {
      name: 'Priya Singh',
      email: 'priya@farm.com',
      password: farmerPassword,
      role: Role.FARMER,
    },
  });

  const buyer1 = await prisma.user.create({
    data: {
      name: 'Amit Patel',
      email: 'amit@buyer.com',
      password: buyerPassword,
      role: Role.BUYER,
    },
  });

  const buyer2 = await prisma.user.create({
    data: {
      name: 'Neha Sharma',
      email: 'neha@buyer.com',
      password: buyerPassword,
      role: Role.BUYER,
    },
  });

  console.log('✅ Created 4 sample users (2 farmers, 2 buyers)');

  // Create sample products
  const product1 = await prisma.product.create({
    data: {
      name: 'Fresh Tomatoes',
      category: 'vegetables',
      description: 'Organic red tomatoes, fresh from farm',
      price: 50.0,
      stock: 100,
      imageUrl: 'https://images.unsplash.com/photo-1592841494411-c288e2cde7d7?w=400',
      farmerId: farmer1.id,
    },
  });

  const product2 = await prisma.product.create({
    data: {
      name: 'Basmati Rice',
      category: 'grains',
      description: 'Premium long grain basmati rice',
      price: 150.0,
      stock: 200,
      imageUrl: 'https://images.unsplash.com/photo-1586080876-7ea0c3e5d2e0?w=400',
      farmerId: farmer1.id,
    },
  });

  const product3 = await prisma.product.create({
    data: {
      name: 'Organic Carrots',
      category: 'vegetables',
      description: 'Freshly harvested orange carrots',
      price: 40.0,
      stock: 150,
      imageUrl: 'https://images.unsplash.com/photo-1584622278695-fb821e4e9b03?w=400',
      farmerId: farmer2.id,
    },
  });

  const product4 = await prisma.product.create({
    data: {
      name: 'Wheat Flour',
      category: 'grains',
      description: 'Whole wheat flour for baking',
      price: 80.0,
      stock: 300,
      imageUrl: 'https://images.unsplash.com/photo-1574080143236-1b3b6f9c2d5e?w=400',
      farmerId: farmer2.id,
    },
  });

  console.log('✅ Created 4 sample products');

  // Create sample orders
  const order1 = await prisma.order.create({
    data: {
      userId: buyer1.id,
      productId: product1.id,
      quantity: 10,
      total: 500.0,
      status: 'PENDING',
    },
  });

  const order2 = await prisma.order.create({
    data: {
      userId: buyer2.id,
      productId: product2.id,
      quantity: 5,
      total: 750.0,
      status: 'PAID',
    },
  });

  const order3 = await prisma.order.create({
    data: {
      userId: buyer1.id,
      productId: product3.id,
      quantity: 20,
      total: 800.0,
      status: 'SHIPPED',
    },
  });

  console.log('✅ Created 3 sample orders');

  // Create sample AI insights
  await prisma.aIInsight.create({
    data: {
      title: 'Tomato Market Surge Expected',
      content: 'Market analysis shows strong demand for tomatoes in the next 2 weeks due to seasonal demand.',
      category: 'market_trends',
    },
  });

  await prisma.aIInsight.create({
    data: {
      title: 'Rice Prices Stability',
      content: 'Basmati rice prices are expected to remain stable with minor fluctuations.',
      category: 'price_forecast',
    },
  });

  await prisma.aIInsight.create({
    data: {
      title: 'Monsoon Impact on Crops',
      content: 'Early monsoon predictions suggest beneficial weather for kharif crops.',
      category: 'weather_impact',
    },
  });

  console.log('✅ Created 3 sample AI insights');

  console.log(`
╔════════════════════════════════════════════════════════════════╗
║           🌾 Database Seeding Complete! 🌾                     ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║ 📊 Sample Data Created:                                        ║
║   • 4 Users (2 Farmers, 2 Buyers)                             ║
║   • 4 Products                                                 ║
║   • 3 Orders                                                   ║
║   • 3 AI Insights                                              ║
║                                                                ║
║ 🔑 Test Credentials:                                           ║
║   Farmer: rajesh@farm.com / farmer123                         ║
║   Buyer:  amit@buyer.com / buyer123                           ║
║                                                                ║
║ 🚀 Ready to use!                                               ║
╚════════════════════════════════════════════════════════════════╝
  `);
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
