import { prisma } from '@salesos/database';

async function main() {
  console.log('Seeding database...');
  console.log('DB URL:', process.env.DATABASE_URL);

  try {
    // Clean up existing data (optional, but good for idempotency if repeated runs)
    // Using deleteMany in reverse order of dependency
    await prisma.quote.deleteMany();
    await prisma.meeting.deleteMany();
    await prisma.deal.deleteMany();
    await prisma.contact.deleteMany();
    await prisma.buyingCommittee.deleteMany();
    await prisma.companyProfile.deleteMany();
    await prisma.user.deleteMany();
    await prisma.organization.deleteMany();
    console.log('Cleaned up existing data.');
  } catch (e) {
    console.log('Cleanup skipped or failed (first run?):', e);
  }

  // 1. Create Organization
  const org = await prisma.organization.create({
    data: {
      name: 'Acme Corp',
    }
  });
  console.log('Created Org:', org.id);

  // 2. Create User
  const user = await prisma.user.create({
    data: {
      email: 'demo@salesos.io',
      name: 'Demo User',
      organizationId: org.id
    }
  });
  console.log('Created User:', user.id);

  // 3. Create Company Profile
  const company = await prisma.companyProfile.create({
    data: {
      cnpj: '12345678000199',
      name: 'Target Company Inc',
      segment: 'Technology',
      reliability: {
         create: {
            score: 85,
            factors: {}
         }
      }
    }
  });
  console.log('Created Company:', company.id);

  // 4. Create Buying Committee & Contact
  const committee = await prisma.buyingCommittee.create({
    data: {
      companyId: company.id
    }
  });

  const contact1 = await prisma.contact.create({
    data: {
      name: 'John Doe',
      email: 'john@target.com',
      role: 'CEO',
      buyingCommittee: { connect: { id: committee.id } },
      companyName: company.name,
      stage: 'LEAD'
    }
  });
  console.log('Created Contact 1:', contact1.id);

  const contact2 = await prisma.contact.create({
    data: {
      name: 'Jane Smith',
      email: 'jane@target.com',
      role: 'VP Sales',
      buyingCommittee: { connect: { id: committee.id } },
      companyName: company.name,
      stage: 'LEAD'
    }
  });
  console.log('Created Contact 2:', contact2.id);

  // 5. Create Deal
  const deal = await prisma.deal.create({
    data: {
      title: 'Big Enterprise Deal',
      value: 100000,
      stage: 'Negotiation',
      probability: 75,
      companyId: company.id,
      ownerId: user.id
    }
  });
  console.log('Created Deal:', deal.id);

   const deal2 = await prisma.deal.create({
    data: {
      title: 'Small Startup Deal',
      value: 5000,
      stage: 'Discovery',
      probability: 20,
      companyId: company.id,
      ownerId: user.id
    }
  });
  console.log('Created Deal 2:', deal2.id);

  console.log('Seeding completed successfully.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
