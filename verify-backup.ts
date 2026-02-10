import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Starting Backup Integrity Verification...');

  try {
    // 1. Connection Check
    await prisma.$connect();
    console.log('✅ Database Connection Successful');

    // 2. Table Existence Check (Count Users)
    // Note: We use try/catch per table to diagnose specific issues
    try {
      const userCount = await prisma.user.count();
      console.log(`✅ Table 'User' accessible. Count: ${userCount}`);
    } catch (e) {
      console.error(`❌ Table 'User' access failed.`);
      throw e;
    }

    try {
      const orgCount = await prisma.organization.count();
      console.log(`✅ Table 'Organization' accessible. Count: ${orgCount}`);
    } catch (e) {
      console.error(`❌ Table 'Organization' access failed.`);
      throw e;
    }

    console.log('🟢 Backup Verification Passed: Database is accessible and readable.');
  } catch (error) {
    console.error('🔴 Backup Verification Failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
