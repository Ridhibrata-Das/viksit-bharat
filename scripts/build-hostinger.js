/**
 * Hostinger Unlimited Packaging & Bundle Generator
 * Prepares the production standalone bundle, static assets, .htaccess, and database scripts.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const WEB_DIR = path.join(ROOT_DIR, 'apps', 'web');
const STANDALONE_DIR = path.join(WEB_DIR, '.next', 'standalone');
const DIST_DIR = path.join(ROOT_DIR, 'dist-hostinger');
const ZIP_OUTPUT = path.join(ROOT_DIR, 'dist-hostinger.zip');

function log(msg) {
  console.log(`[Hostinger Packager] ${msg}`);
}

function copyRecursiveSync(src, dest) {
  if (!fs.existsSync(src)) return;
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    const parentDir = path.dirname(dest);
    if (!fs.existsSync(parentDir)) fs.mkdirSync(parentDir, { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

async function run() {
  log('====================================================');
  log('   BUILDING PRODUCTION BUNDLE FOR HOSTINGER UNLIMITED');
  log('====================================================');

  // Step 1: Execute Next.js build
  log('Compiling Next.js standalone application...');
  try {
    execSync('npm run build', {
      cwd: ROOT_DIR,
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' }
    });
  } catch (err) {
    console.error('[Error] Next.js compilation failed:', err.message);
    process.exit(1);
  }

  // Step 2: Validate Standalone Output
  if (!fs.existsSync(STANDALONE_DIR)) {
    console.error(`[Error] Standalone directory not found at: ${STANDALONE_DIR}`);
    process.exit(1);
  }

  // Step 3: Prepare clean staging directory
  log('Preparing staging directory: dist-hostinger...');
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(DIST_DIR, { recursive: true });

  // Step 4: Copy standalone server files
  log('Copying standalone runtime...');
  copyRecursiveSync(STANDALONE_DIR, DIST_DIR);

  // Step 5: Copy public & static assets
  log('Bundling static assets and PWA icons into standalone folders...');
  const publicSrc = path.join(WEB_DIR, 'public');
  const staticSrc = path.join(WEB_DIR, '.next', 'static');

  // Next.js standalone requires static assets in these specific relative locations:
  copyRecursiveSync(publicSrc, path.join(DIST_DIR, 'apps', 'web', 'public'));
  copyRecursiveSync(publicSrc, path.join(DIST_DIR, 'public'));
  copyRecursiveSync(staticSrc, path.join(DIST_DIR, 'apps', 'web', '.next', 'static'));
  copyRecursiveSync(staticSrc, path.join(DIST_DIR, '.next', 'static'));

  // Step 6: Copy Hostinger Entrypoint, Process Manager & Server configs
  log('Adding Hostinger entry points and LiteSpeed proxy configuration...');
  const filesToCopy = [
    { src: path.join(ROOT_DIR, 'start.js'), dest: path.join(DIST_DIR, 'start.js') },
    { src: path.join(ROOT_DIR, 'ecosystem.config.js'), dest: path.join(DIST_DIR, 'ecosystem.config.js') },
    { src: path.join(ROOT_DIR, '.htaccess'), dest: path.join(DIST_DIR, '.htaccess') },
    { src: path.join(ROOT_DIR, '.env.example'), dest: path.join(DIST_DIR, '.env.example') },
    { src: path.join(ROOT_DIR, 'HOSTINGER_DEPLOYMENT_GUIDE.md'), dest: path.join(DIST_DIR, 'HOSTINGER_DEPLOYMENT_GUIDE.md') },
  ];

  for (const item of filesToCopy) {
    if (fs.existsSync(item.src)) {
      fs.copyFileSync(item.src, item.dest);
    }
  }

  // Step 7: Bundle Database Migrations & Seeds for MySQL
  log('Bundling Prisma schema and database seeds...');
  const dbSrc = path.join(ROOT_DIR, 'packages', 'database');
  const dbDest = path.join(DIST_DIR, 'packages', 'database');
  if (fs.existsSync(dbSrc)) {
    copyRecursiveSync(path.join(dbSrc, 'prisma'), path.join(dbDest, 'prisma'));
    copyRecursiveSync(path.join(dbSrc, 'dist'), path.join(dbDest, 'dist'));
    copyRecursiveSync(path.join(dbSrc, 'package.json'), path.join(dbDest, 'package.json'));
  }

  // Step 8: Create Zip archive
  log('Creating ready-to-upload archive: dist-hostinger.zip...');
  if (fs.existsSync(ZIP_OUTPUT)) {
    fs.unlinkSync(ZIP_OUTPUT);
  }

  try {
    if (process.platform === 'win32') {
      execSync(`powershell -NoProfile -Command "Compress-Archive -Path '${DIST_DIR}\\*' -DestinationPath '${ZIP_OUTPUT}' -Force"`, {
        stdio: 'inherit'
      });
    } else {
      execSync(`zip -r "${ZIP_OUTPUT}" .`, { cwd: DIST_DIR, stdio: 'inherit' });
    }
    const stats = fs.statSync(ZIP_OUTPUT);
    const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);
    log(`Successfully generated dist-hostinger.zip (${sizeMb} MB)!`);
  } catch (err) {
    log(`Archive creation notice: Zip utility returned: ${err.message}. The dist-hostinger/ directory is ready for manual FTP upload.`);
  }

  log('====================================================');
  log('HOSTINGER PACKAGING COMPLETE!');
  log('Next Steps:');
  log('1. Upload dist-hostinger.zip to Hostinger hPanel -> File Manager (public_html).');
  log('2. Click "Extract" to unpack.');
  log('3. Create your .env file with your Hostinger MySQL credentials.');
  log('4. In hPanel -> Node.js, set Startup File to "start.js" and click Start Application.');
  log('====================================================');
}

run();
