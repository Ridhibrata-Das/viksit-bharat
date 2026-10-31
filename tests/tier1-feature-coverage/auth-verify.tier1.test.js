/**
 * Tier 1: /api/auth/verify Dedicated Endpoint & Verification Contract (TDD)
 */
import assert from 'assert';
import { generateAuthToken } from '../../apps/web/lib/auth-guard.js';

export async function run(ctx) {
  const results = [];

  // Test 1: Verify endpoint with valid ADMIN JWT returns valid: true and user details
  try {
    const adminToken = generateAuthToken({
      sub: 'admin@wb.gov.in',
      email: 'admin@wb.gov.in',
      role: 'ADMIN',
      name: 'System Administrator'
    });

    const res = await ctx.post('/api/auth/verify', {}, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    assert.strictEqual(res.status, 200, 'Expected 200 OK for valid admin token');
    assert.strictEqual(res.body.valid, true, 'Token must be verified as valid');
    assert.strictEqual(res.body.user.role, 'ADMIN', 'User role must match ADMIN');
    assert.strictEqual(res.body.user.email, 'admin@wb.gov.in');
    results.push({ name: 'POST /api/auth/verify validates valid ADMIN JWT with 200', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'POST /api/auth/verify validates valid ADMIN JWT with 200', status: 'FAIL', error: err.message });
  }

  // Test 2: Verify endpoint with token in request body or cookie
  try {
    const researcherToken = generateAuthToken({
      sub: 'researcher@wb.gov.in',
      email: 'researcher@wb.gov.in',
      role: 'RESEARCHER',
      name: 'Field Researcher'
    });

    const res = await ctx.post('/api/auth/verify', { token: researcherToken });
    assert.strictEqual(res.status, 200, 'Expected 200 OK when token is passed in body');
    assert.strictEqual(res.body.valid, true);
    assert.strictEqual(res.body.user.role, 'RESEARCHER');
    results.push({ name: 'POST /api/auth/verify accepts token in body payload', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'POST /api/auth/verify accepts token in body payload', status: 'FAIL', error: err.message });
  }

  // Test 3: Verify endpoint rejects tampered or forged signature with 401
  try {
    const res = await ctx.post('/api/auth/verify', { token: 'invalid.tampered.token_signature_xyz' });
    assert.strictEqual(res.status, 401, 'Tampered token must return 401');
    assert.strictEqual(res.body.valid, false);
    assert.ok(res.body.error, 'Must provide explanatory error string');
    results.push({ name: 'POST /api/auth/verify rejects tampered token with 401 Unauthorized', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'POST /api/auth/verify rejects tampered token with 401 Unauthorized', status: 'FAIL', error: err.message });
  }

  // Test 4: Verify endpoint rejects missing token with 401
  try {
    const res = await ctx.post('/api/auth/verify', {});
    assert.strictEqual(res.status, 401, 'Missing token must return 401');
    assert.strictEqual(res.body.valid, false);
    results.push({ name: 'POST /api/auth/verify rejects missing token with 401 Unauthorized', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'POST /api/auth/verify rejects missing token with 401 Unauthorized', status: 'FAIL', error: err.message });
  }

  // Test 5: Verify endpoint returns permissions map for role
  try {
    const adminToken = generateAuthToken({
      sub: 'admin@wb.gov.in',
      email: 'admin@wb.gov.in',
      role: 'ADMIN',
      name: 'Admin'
    });

    const res = await ctx.post('/api/auth/verify', { token: adminToken });
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.permissions, 'Permissions array or map must be returned');
    assert.ok(res.body.permissions.canModerateEvidence === true, 'Admin must have canModerateEvidence');
    assert.ok(res.body.permissions.canOverridePromises === true, 'Admin must have canOverridePromises');
    results.push({ name: 'POST /api/auth/verify returns granular RBAC permissions map', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'POST /api/auth/verify returns granular RBAC permissions map', status: 'FAIL', error: err.message });
  }

  return results;
}
