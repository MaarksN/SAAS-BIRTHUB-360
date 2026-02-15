import { faker } from '@faker-js/faker';

import { prisma } from '../libs/core/src/prisma';

async function main() {
  console.log('🌱 Starting stress seed...');

  // 1. Create Organization
  const org = await prisma.organization.create({
    data: {
      name: 'Stress Test Corp ' + faker.string.uuid(),
    },
  });
  console.log(`Created Organization: ${org.id}`);

  // 2. Create Users
  const user = await prisma.user.create({
    data: {
      email: faker.internet.email(),
      name: faker.person.fullName(),
      organizationId: org.id,
      role: 'ADMIN',
    },
  });
  console.log(`Created User: ${user.id}`);

  // 3. Create 10,000 Leads (Batch)
  console.log('Generating 10,000 leads...');
  const leadsData = [];
  const statusOptions = ['NEW', 'QUALIFIED', 'DISQUALIFIED', 'CONTACTED'];

  for (let i = 0; i < 10000; i++) {
    leadsData.push({
      email: faker.internet.email({ provider: 'example.com' }), // Ensure uniqueness or randomness
      name: faker.person.fullName() + (i % 100 === 0 ? ' 👲 (Chinese)' : ''), // Special chars
      phone: faker.phone.number(),
      companyName: faker.company.name(),
      score: faker.number.float({ min: 0, max: 100 }),
      status: statusOptions[Math.floor(Math.random() * statusOptions.length)],
      organizationId: org.id,
      // Special payload test
      createdAt: faker.date.past(),
    });
  }

  // Batch insert in chunks to avoid query limit
  const batchSize = 1000;
  for (let i = 0; i < leadsData.length; i += batchSize) {
    const batch = leadsData.slice(i, i + batchSize);
    await prisma.lead.createMany({
      data: batch,
    });
    console.log(
      `Inserted batch ${i / batchSize + 1}/${leadsData.length / batchSize}`,
    );
  }

  // 4. Create Cadences (Campaigns)
  console.log('Creating 50 Cadences...');
  for (let i = 0; i < 50; i++) {
    await prisma.cadence.create({
      data: {
        name: faker.commerce.productName() + ' Campaign',
        steps: {
          step1: { type: 'email', templateId: faker.string.uuid() },
          step2: { type: 'call', script: 'Hello...' },
          step3: { type: 'linkedin', message: 'Hi there! 👋' }, // Emoji
        },
      },
    });
  }

  // 5. Create Enrichment Logs
  console.log('Creating 500 Enrichment Logs...');
  // Need a company profile first
  const company = await prisma.companyProfile.create({
    data: {
      cnpj: faker.string.numeric(14),
      name: faker.company.name(),
      segment: 'SaaS',
    },
  });

  const logsData = [];
  for (let i = 0; i < 500; i++) {
    logsData.push({
      companyId: company.id,
      source: 'LinkedIn',
      dataField: 'employeesCount',
      previousValue: String(faker.number.int({ min: 10, max: 100 })),
      newValue: String(faker.number.int({ min: 100, max: 200 })),
      confidenceScore: faker.number.float({ min: 0, max: 1 }),
    });
  }
  await prisma.enrichmentLog.createMany({
    data: logsData,
  });

  console.log('✅ Stress seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
