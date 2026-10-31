/**
 * Tier 1: Progressive Web App (PWA) Contract & Asset Verification (TDD)
 */
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webPublicDir = path.resolve(__dirname, '../../apps/web/public');
const layoutPath = path.resolve(__dirname, '../../apps/web/app/[locale]/layout.tsx');

export async function run(ctx) {
  const results = [];

  // Test 1: manifest.json exists and satisfies PWA installability specification
  try {
    const manifestPath = path.join(webPublicDir, 'manifest.json');
    assert.ok(fs.existsSync(manifestPath), 'manifest.json must exist in apps/web/public');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

    assert.ok(manifest.name, 'manifest must have name');
    assert.ok(manifest.short_name, 'manifest must have short_name');
    assert.strictEqual(manifest.start_url, '/en', 'start_url must route to default locale');
    assert.strictEqual(manifest.display, 'standalone', 'display mode must be standalone for native feel');
    assert.strictEqual(manifest.theme_color, '#0A5C36', 'theme_color must match brand emerald #0A5C36');
    assert.ok(Array.isArray(manifest.icons), 'manifest must declare icon set');
    assert.ok(manifest.icons.length >= 2, 'manifest must declare at least 192 and 512 icons');
    results.push({ name: 'Web App Manifest (manifest.json) satisfies PWA installability criteria', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'Web App Manifest (manifest.json) satisfies PWA installability criteria', status: 'FAIL', error: err.message });
  }

  // Test 2: PWA Icon assets exist on disk (192, 512, maskable, apple-touch, favicon)
  try {
    const requiredIcons = [
      'icon-192x192.png',
      'icon-512x512.png',
      'maskable-icon-512x512.png',
      'apple-touch-icon.png',
      'favicon.svg'
    ];

    for (const icon of requiredIcons) {
      const p = path.join(webPublicDir, icon);
      assert.ok(fs.existsSync(p), `Icon ${icon} must exist in public directory`);
      const stat = fs.statSync(p);
      assert.ok(stat.size > 0, `Icon ${icon} must be non-empty`);
    }
    results.push({ name: 'Complete multi-resolution PWA and Apple touch icon suite present on disk', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'Complete multi-resolution PWA and Apple touch icon suite present on disk', status: 'FAIL', error: err.message });
  }

  // Test 3: Service Worker (sw.js) implements lifecycle and caching strategies
  try {
    const swPath = path.join(webPublicDir, 'sw.js');
    assert.ok(fs.existsSync(swPath), 'sw.js service worker must exist in apps/web/public');
    const swContent = fs.readFileSync(swPath, 'utf-8');

    assert.ok(swContent.includes("addEventListener('install'"), 'sw.js must handle install event');
    assert.ok(swContent.includes("addEventListener('activate'"), 'sw.js must handle activate event');
    assert.ok(swContent.includes("addEventListener('fetch'"), 'sw.js must handle fetch event');
    assert.ok(swContent.includes('skipWaiting()'), 'sw.js must support immediate activation (skipWaiting)');
    assert.ok(swContent.includes('clients.claim()'), 'sw.js must claim clients on activate');
    assert.ok(swContent.includes('/offline.html'), 'sw.js must pre-cache offline.html');
    results.push({ name: 'Service Worker (sw.js) implements install, activate, and caching strategies', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'Service Worker (sw.js) implements install, activate, and caching strategies', status: 'FAIL', error: err.message });
  }

  // Test 4: Offline fallback page (offline.html) exists with bilingual fallback
  try {
    const offlinePath = path.join(webPublicDir, 'offline.html');
    assert.ok(fs.existsSync(offlinePath), 'offline.html must exist');
    const content = fs.readFileSync(offlinePath, 'utf-8');
    assert.ok(content.includes('Offline Mode') || content.includes('You are Currently Offline'), 'Must contain offline headline');
    assert.ok(content.includes('অফলাইন'), 'Must contain bilingual Bengali offline text');
    assert.ok(content.includes('window.location.reload()'), 'Must contain retry mechanism');
    results.push({ name: 'Offline fallback HTML page present with bilingual retry controls', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'Offline fallback HTML page present with bilingual retry controls', status: 'FAIL', error: err.message });
  }

  // Test 5: Root layout links manifest, themeColor, and mounts PwaInstallPrompt
  try {
    assert.ok(fs.existsSync(layoutPath), 'Locale layout must exist');
    const layoutContent = fs.readFileSync(layoutPath, 'utf-8');

    assert.ok(layoutContent.includes("manifest: '/manifest.json'"), 'Layout metadata must define manifest');
    assert.ok(layoutContent.includes("themeColor: '#0A5C36'"), 'Layout metadata must set themeColor to #0A5C36');
    assert.ok(layoutContent.includes('<PwaInstallPrompt'), 'Layout must render PwaInstallPrompt component');
    results.push({ name: 'Application layout wires PWA manifest metadata and install banner', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'Application layout wires PWA manifest metadata and install banner', status: 'FAIL', error: err.message });
  }

  return results;
}
