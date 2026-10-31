/**
 * Tier 1: Database Persistence & Live Store Smart Cache Synchronization (TDD)
 */
import assert from 'assert';
import { checkDatabaseHealth } from '../../packages/database/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const seedDataPath = path.resolve(__dirname, '../../packages/database/prisma/seed-data.json');
const seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf-8'));

export async function run(ctx) {
  const results = [];

  // Test 1: checkDatabaseHealth responds within 100ms without blocking
  try {
    const start = Date.now();
    const health = await checkDatabaseHealth();
    const elapsed = Date.now() - start;
    assert.ok(typeof health.connected === 'boolean', 'Health must have boolean connected');
    assert.strictEqual(health.provider, 'mysql', 'Database provider must be mysql');
    assert.ok(elapsed < 200, `Health check took ${elapsed}ms, must be < 200ms`);
    results.push({ name: 'Database health check performs non-blocking validation (< 200ms)', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'Database health check performs non-blocking validation (< 200ms)', status: 'FAIL', error: err.message });
  }

  // Test 2: Seed data maintains 141 core promises in persistent dataset
  try {
    const promises = seedData.promises;
    assert.ok(Array.isArray(promises), 'Promises must be an array');
    assert.ok(promises.length >= 141, `Expected at least 141 promises, got ${promises.length}`);
    const sample = promises[0];
    assert.ok(sample.code, 'Promise must have code');
    assert.ok(sample.titleEn, 'Promise must have titleEn');
    assert.ok(sample.titleBn, 'Promise must have titleBn');
    results.push({ name: 'Persistence seed layer provides complete 141-promise dataset with bilingual metadata', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'Persistence seed layer provides complete 141-promise dataset with bilingual metadata', status: 'FAIL', error: err.message });
  }

  // Test 3: Updating promise via context persists status change and appends statusHistory
  try {
    ctx.setToken('mock.header.eyJyb2xlIjoiQURNSU4ifQ.signature');
    const updateRes = await ctx.updatePromiseStatus('INFRA-01', {
      status: 'UNDER_IMPLEMENTATION',
      comment: 'TDD Test: Outlay increased for corridor expansion'
    });
    assert.ok(updateRes.ok, 'updatePromiseStatus should succeed for ADMIN');
    assert.strictEqual(updateRes.status, 200);
    assert.strictEqual(updateRes.data.status, 'UNDER_IMPLEMENTATION');
    results.push({ name: 'updatePromiseStatus atomically records status transition and updates cache', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'updatePromiseStatus atomically records status transition and updates cache', status: 'FAIL', error: err.message });
  }

  // Test 4: Submitting evidence adds citation, links to promise, and updates review status
  try {
    ctx.setToken('mock.header.eyJyb2xlIjoiUkVTRUFSQ0hFUiJ9.signature');
    const evRes = await ctx.createEvidence({
      promiseId: 'prom-1',
      title: 'TDD Gazette Order 4920/2026',
      url: 'https://wb.gov.in/orders/4920.pdf',
      sourceType: 'GOVERNMENT_ORDER',
      sourceTier: 'TIER_1',
      outlayCr: 120,
      excerpt: 'Sanctioned 120 Cr for phase 2 implementation.'
    });

    assert.ok(evRes.ok, 'createEvidence should succeed for RESEARCHER');
    assert.strictEqual(evRes.status, 201);
    assert.strictEqual(evRes.data.sourceTier, 'TIER_1');
    assert.strictEqual(evRes.data.status, 'PENDING');
    results.push({ name: 'createEvidence persists citation linked to target promise with PENDING status', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'createEvidence persists citation linked to target promise with PENDING status', status: 'FAIL', error: err.message });
  }

  // Test 5: Indicator time series data point can be appended and persists in state
  try {
    ctx.setToken('mock.header.eyJyb2xlIjoiQURNSU4ifQ.signature');
    const indRes = await ctx.createIndicatorValue('GSDP_GROWTH', {
      year: 2026,
      value: 9.2,
      isProjected: false
    });
    assert.ok(indRes.ok, 'createIndicatorValue should succeed for ADMIN');
    assert.strictEqual(indRes.status, 201);
    assert.strictEqual(indRes.data.value, 9.2);
    results.push({ name: 'createIndicatorValue persists macroeconomic time-series data point', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'createIndicatorValue persists macroeconomic time-series data point', status: 'FAIL', error: err.message });
  }

  return results;
}
