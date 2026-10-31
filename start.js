/**
 * Viksit Bengal Dashboard — Production Entry Point for Hostinger Unlimited
 * Used by Hostinger hPanel Node.js Application Manager
 */
const path = require('path');
const fs = require('fs');

// Set production environment defaults
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '3000';
process.env.HOSTNAME = process.env.HOSTNAME || '0.0.0.0';

// Detect standalone server location
const standaloneCandidates = [
  path.join(__dirname, 'apps', 'web', 'server.js'),
  path.join(__dirname, 'server.js'),
  path.join(__dirname, 'apps', 'web', '.next', 'standalone', 'apps', 'web', 'server.js'),
  path.join(__dirname, 'apps', 'web', '.next', 'standalone', 'server.js'),
  path.join(__dirname, '.next', 'standalone', 'server.js'),
];

let targetServer = null;
for (const candidate of standaloneCandidates) {
  if (fs.existsSync(candidate)) {
    targetServer = candidate;
    break;
  }
}

if (!targetServer) {
  console.error('[Hostinger Boot Error] Standalone Next.js server not found.');
  console.error('Please run "npm run build" before starting the production application.');
  console.error('Searched locations:', standaloneCandidates);
  process.exit(1);
}

console.log('====================================================');
console.log('   VIKSIT BENGAL DASHBOARD — HOSTINGER PRODUCTION');
console.log('====================================================');
console.log(`Port        : ${process.env.PORT}`);
console.log(`Host        : ${process.env.HOSTNAME}`);
console.log(`Server File : ${targetServer}`);
console.log('====================================================\n');

require(targetServer);
