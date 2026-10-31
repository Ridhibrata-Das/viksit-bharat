/**
 * Tier 1: Production Backend Endpoints Contract Verification
 * (/api/health, /api/auth/me, /api/districts/[code])
 */
import assert from 'assert';
import { USERS } from '../harness/fixtures.js';

export async function run(ctx) {
  const results = [];

  // 1. GET /api/health returns healthy system status
  try {
    const res = await ctx.getHealth();
    assert.strictEqual(res.status, 200, 'GET /health must return 200');
    assert.strictEqual(res.data.status, 'healthy', 'Status must be healthy');
    assert.ok(res.data.timestamp, 'Timestamp must be present');
    assert.ok(typeof res.data.uptime === 'number', 'Uptime must be a number');
    assert.ok(res.data.database, 'Database health object must be present');
    results.push({ name: 'GET /api/health returns system uptime, memory and database status', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'GET /api/health returns system uptime, memory and database status', status: 'FAIL', error: err.message });
  }

  // 2. GET /api/auth/me with valid Bearer token returns profile
  try {
    await ctx.login(USERS.admin.email, USERS.admin.password);
    const res = await ctx.getMe();
    assert.strictEqual(res.status, 200, 'GET /auth/me with token must return 200');
    assert.strictEqual(res.data.email, USERS.admin.email);
    assert.strictEqual(res.data.role, 'ADMIN');
    results.push({ name: 'GET /api/auth/me returns authenticated user profile for valid JWT', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'GET /api/auth/me returns authenticated user profile for valid JWT', status: 'FAIL', error: err.message });
  }

  // 3. GET /api/auth/me without token returns 401
  try {
    ctx.setToken(null);
    const res = await ctx.getMe();
    assert.strictEqual(res.status, 401, 'GET /auth/me without token must return 401');
    results.push({ name: 'GET /api/auth/me rejects unauthenticated request with 401', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'GET /api/auth/me rejects unauthenticated request with 401', status: 'FAIL', error: err.message });
  }

  // 4. GET /api/districts/[code] returns single district detail
  try {
    const res = await ctx.getDistrictByCode('KOL');
    assert.strictEqual(res.status, 200, 'GET /districts/KOL must return 200');
    assert.strictEqual(res.data.code, 'KOL');
    assert.strictEqual(res.data.nameEn, 'Kolkata');
    assert.ok(res.data.nameBn, 'Bengali name must be present');
    assert.ok(Array.isArray(res.data.promises), 'Associated promises must be returned');
    results.push({ name: 'GET /api/districts/[code] returns full district detail with bilingual data', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'GET /api/districts/[code] returns full district detail with bilingual data', status: 'FAIL', error: err.message });
  }

  // 5. GET /api/districts/[code] with invalid code returns 404
  try {
    const res = await ctx.getDistrictByCode('INVALID_CODE_999');
    assert.strictEqual(res.status, 404, 'GET /districts/INVALID_CODE_999 must return 404');
    results.push({ name: 'GET /api/districts/[code] returns 404 for non-existent district code', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'GET /api/districts/[code] returns 404 for non-existent district code', status: 'FAIL', error: err.message });
  }

  return results;
}
