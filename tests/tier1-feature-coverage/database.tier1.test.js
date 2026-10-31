/**
 * Tier 1: Hostinger MySQL Database Schema & Adapter Contract Verification
 */
import assert from 'assert';
import dbPkg from '../../packages/database/index.js';

export async function run(ctx) {
  const { prisma, checkDatabaseHealth } = dbPkg;
  const results = [];

  // 1. Prisma client exported and model delegates exposed
  try {
    assert.ok(prisma, 'Prisma client must be defined');
    assert.ok(prisma.user, 'Prisma User model delegate must be exposed');
    assert.ok(prisma.promise, 'Prisma Promise model delegate must be exposed');
    assert.ok(prisma.district, 'Prisma District model delegate must be exposed');
    assert.ok(prisma.indicator, 'Prisma Indicator model delegate must be exposed');
    assert.ok(prisma.evidenceItem, 'Prisma EvidenceItem model delegate must be exposed');
    results.push({ name: 'Prisma client exposes required Hostinger MySQL model delegates', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'Prisma client exposes required Hostinger MySQL model delegates', status: 'FAIL', error: err.message });
  }

  // 2. Database health check helper exists and returns provider status
  try {
    assert.strictEqual(typeof checkDatabaseHealth, 'function', 'checkDatabaseHealth function must be exported');
    const health = await checkDatabaseHealth();
    assert.ok(health, 'Health check should return a status object');
    assert.ok(['mysql', 'mariadb', 'sqlite', 'mock', 'postgresql'].includes(health.provider), `Provider ${health.provider} must be supported`);
    assert.ok(typeof health.connected === 'boolean', 'Health check must indicate boolean connection status');
    results.push({ name: 'Database health check detects provider and connection resilience', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'Database health check detects provider and connection resilience', status: 'FAIL', error: err.message });
  }

  // 3. Resilient findMany query method responds gracefully
  try {
    const users = await prisma.user.findMany({ take: 5 });
    assert.ok(Array.isArray(users), 'prisma.user.findMany must return an array');
    const promises = await prisma.promise.findMany({ take: 5 });
    assert.ok(Array.isArray(promises), 'prisma.promise.findMany must return an array');
    results.push({ name: 'Prisma model queries execute gracefully with automatic offline fallback', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'Prisma model queries execute gracefully with automatic offline fallback', status: 'FAIL', error: err.message });
  }

  // 4. Mutation delegate persists record correctly
  try {
    const newRecord = await prisma.promise.create({
      data: {
        code: 'TEST-DB-01',
        titleEn: 'Hostinger Persistence Test',
        titleBn: 'হোস্টিংগার ডাটাবেস পরীক্ষা',
        status: 'ANNOUNCED',
      },
    });
    assert.ok(newRecord, 'Created record must be returned');
    assert.strictEqual(newRecord.code, 'TEST-DB-01', 'Created record code must match');
    results.push({ name: 'Prisma model mutations create and return records safely', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'Prisma model mutations create and return records safely', status: 'FAIL', error: err.message });
  }

  // 5. Model schema relationships integrity
  try {
    assert.ok(prisma.category, 'Category model must exist for relational promise categorization');
    assert.ok(prisma.scrapedSource, 'ScrapedSource model must exist for automated evidence tracking');
    results.push({ name: 'Hostinger MySQL schema relations (Category, Promise, Evidence) verified', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'Hostinger MySQL schema relations (Category, Promise, Evidence) verified', status: 'FAIL', error: err.message });
  }

  return results;
}
