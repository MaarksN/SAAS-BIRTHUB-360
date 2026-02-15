import { PrismaClient, Role } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const DEMO_ORG_ID = 'demo-org-id-123';

  // Criar organização de teste
  const org = await prisma.organization.upsert({
    where: { id: DEMO_ORG_ID },
    update: {},
    create: {
      id: DEMO_ORG_ID,
      name: 'Demo Organization',
      subscriptionStatus: 'active'
    }
  });

  console.log('✅ Created organization:', org.name);

  // Criar usuário admin
  const user = await prisma.user.upsert({
    where: { email: 'admin@salesos.com' },
    update: {},
    create: {
      email: 'admin@salesos.com',
      name: 'Admin User',
      role: 'OWNER' as Role,
      organizationId: org.id
    }
  });

  console.log('✅ Created user:', user.email);

  // Criar plano
  const plan = await prisma.subscriptionPlan.upsert({
    where: { name: 'Growth' },
    update: {},
    create: {
      name: 'Growth',
      limits: {
        max_leads: 10000,
        ai_tokens: 1000000,
        seats: 10,
        campaigns: 50
      },
      priceMonthly: 100.0,
      priceYearly: 1000.0
    }
  });

  console.log('✅ Created plan:', plan.name);

  // Criar leads de teste
  console.log('Creating test leads...');

  const leads = [];
  for (let i = 0; i < 50; i++) {
    leads.push({
      email: faker.internet.email(),
      name: faker.person.fullName(),
      companyName: faker.company.name(),
      phone: faker.phone.number(),
      organizationId: org.id
    });
  }

  await prisma.lead.createMany({
    data: leads,
    skipDuplicates: true
  });

  console.log(`✅ Created ${leads.length} test leads`);

  // Criar campanha de teste
  const campaign = await prisma.campaign.create({
    data: {
      name: 'Demo Campaign',
      status: 'ACTIVE',
      organizationId: org.id,
      creatorId: user.id
    }
  });

  console.log('✅ Created campaign:', campaign.name);

  console.log('');
  console.log('🎉 Seeding completed!');
  console.log('');
  console.log('Login credentials:');
  console.log('Email: admin@salesos.com');
  console.log('Organization: Demo Organization');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
