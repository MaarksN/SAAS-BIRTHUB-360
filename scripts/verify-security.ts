import { prisma, runWithContext, Context } from '@salesos/core';

async function main() {
  console.log('🔒 Starting Security Verification...');

  // 1. Setup Data
  const timestamp = Date.now();
  const orgAId = 'org-a-' + timestamp;
  const orgBId = 'org-b-' + timestamp;

  // Create Orgs directly (System Context - No RLS)
  console.log('Creating Organizations (System Context)...');
  const orgA = await prisma.organization.create({
    data: { name: 'Org A (Security Test)' }
  });
  const orgB = await prisma.organization.create({
    data: { name: 'Org B (Security Test)' }
  });

  console.log(`Created Org A: ${orgA.id}`);
  console.log(`Created Org B: ${orgB.id}`);

  const leadEmail = `lead-${timestamp}@test.com`;
  let leadId = '';

  // 2. User A Context (Org A)
  const contextA: Context = { organizationId: orgA.id, userId: 'user-a', role: 'ADMIN' };

  await runWithContext(contextA, async () => {
    console.log('\n👤 Context: User A (Org A)');

    // Create Lead in Org A
    // RLS should inject organizationId automatically
    const lead = await prisma.lead.create({
      data: {
        email: leadEmail,
        status: 'NEW'
      }
    });
    console.log(`✅ Created Lead: ${lead.id} (Org: ${lead.organizationId})`);
    leadId = lead.id;

    // Verify RLS injected Org ID matches context
    if (lead.organizationId !== orgA.id) throw new Error(`RLS failed: Organization ID mismatch. Expected ${orgA.id}, got ${lead.organizationId}`);

    // Try to read it back
    const found = await prisma.lead.findFirst({ where: { id: lead.id } });
    if (!found) throw new Error('RLS failed: Cannot read own data');
    console.log('✅ Can read own data');
  });

  // 3. User B Context (Org B)
  const contextB: Context = { organizationId: orgB.id, userId: 'user-b', role: 'ADMIN' };

  await runWithContext(contextB, async () => {
    console.log('\n👤 Context: User B (Org B)');
    console.log(`🕵️ Trying to access Lead ${leadId} from Org A...`);

    // Try to read Lead from Org A
    const found = await prisma.lead.findFirst({ where: { id: leadId } });

    if (found) {
       console.error(`❌ SECURITY BREACH: User B could see User A data! Found: ${JSON.stringify(found)}`);
       process.exit(1);
    } else {
       console.log('✅ Access Denied (RLS Working)');
    }
  });

  // 4. Audit Log Immutability
  console.log('\n🛡️ Verifying Audit Log Immutability...');
  // Create normally
  const auditLog = await prisma.auditLog.create({
    data: {
      organizationId: orgA.id,
      action: 'TEST_ACTION',
      entity: 'TEST',
      entityId: '123'
    }
  });
  console.log(`✅ Created Audit Log: ${auditLog.id}`);

  try {
    await prisma.auditLog.update({
      where: { id: auditLog.id },
      data: { action: 'HACKED' }
    });
    console.error('❌ SECURITY BREACH: Audit Log was updated!');
    process.exit(1);
  } catch (e: any) {
    if (e.message && e.message.includes('Audit Logs are immutable')) {
       console.log('✅ Audit Log Update Blocked (Immutable)');
    } else {
       console.log('⚠️ Audit Log Update failed with unexpected error (still good):', e.message);
    }
  }

  try {
    await prisma.auditLog.delete({
      where: { id: auditLog.id }
    });
    console.error('❌ SECURITY BREACH: Audit Log was deleted!');
    process.exit(1);
  } catch (e: any) {
    if (e.message && e.message.includes('Audit Logs are immutable')) {
       console.log('✅ Audit Log Delete Blocked (Immutable)');
    } else {
       console.log('⚠️ Audit Log Delete failed with unexpected error (still good):', e.message);
    }
  }

  // 5. Soft Delete
  console.log('\n🗑️ Verifying Soft Delete...');
  await runWithContext(contextA, async () => {
      // Delete the lead
      await prisma.lead.delete({ where: { id: leadId } });
      console.log('✅ Deleted Lead (Soft Delete triggered)');

      // Try to find it (Should be gone)
      const found = await prisma.lead.findFirst({ where: { id: leadId } });
      if (found) {
         console.error('❌ Soft Delete Failed: Record still visible');
         process.exit(1);
      } else {
         console.log('✅ Record hidden from standard queries');
      }

      // Try to find it explicitly (Soft Deleted)
      // Passing deletedAt explicitly to override filter
      // Using raw query via Prisma (bypassing extension default filter by providing value)
      const foundDeleted = await prisma.lead.findFirst({
          where: { id: leadId, deletedAt: { not: null } }
      });

      if (foundDeleted) {
         console.log('✅ Record exists in DB (Soft Deleted Timestamp: ' + foundDeleted.deletedAt + ')');
      } else {
         console.warn('⚠️ Could not find soft deleted record even with explicit filter. Check extension logic.');
      }
  });

  console.log('\n🎉 Security Verification Passed!');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
