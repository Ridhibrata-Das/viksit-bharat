# Hostinger Unlimited Hosting — Complete Deployment Guide

This guide covers deploying the **Viksit Bengal Dashboard** onto **Hostinger Unlimited Shared / Cloud Hosting** with Node.js 20.x/22.x, MySQL, LiteSpeed, and optional Mixpost integration.

---

## 1. Prerequisites in Hostinger hPanel

### 1.1 Create MySQL Database
1. Go to **hPanel $\rightarrow$ Databases $\rightarrow$ MySQL Databases**.
2. Under **Create a New MySQL Database And Database User**:
   - **Database Name**: e.g., `u123456789_viksit`
   - **Username**: e.g., `u123456789_admin`
   - **Password**: e.g., `YourSecurePassword2026!`
3. Note your credentials:
   - **Database Host**: `127.0.0.1` (or `localhost`)
   - **Port**: `3306`
   - **Constructed Connection String**:
     ```env
     DATABASE_URL="mysql://u123456789_admin:YourSecurePassword2026!@127.0.0.1:3306/u123456789_viksit"
     ```

### 1.2 Create Node.js Application
1. Go to **hPanel $\rightarrow$ Websites $\rightarrow$ [Your Domain] $\rightarrow$ Node.js**.
2. Click **Create Application**:
   - **Node.js Version**: Select **20.x** (or 22.x LTS).
   - **Application Mode**: **Production**.
   - **Application Root**: `public_html` (or your domain directory).
   - **Application Startup File**: `start.js`.
   - **Application URL**: `https://yourdomain.com`.
3. Keep the application stopped while deploying files.

---

## 2. Deployment Workflow

### Method A: Automated Pre-Packaged Bundle (Recommended)

Hostinger shared hosting limits build memory to 1GB–2GB RAM. Running `npm run build` locally guarantees a clean compile without resource limits.

1. **Build and package locally**:
   ```bash
   npm run bundle:hostinger
   ```
   This generates `dist-hostinger.zip` containing:
   - Compiled standalone Next.js server (`start.js`)
   - Bundled static assets (`public/`, `_next/static`)
   - LiteSpeed reverse proxy rules (`.htaccess`)
   - Prisma MySQL schema and seed data

2. **Upload to Hostinger**:
   - Open **hPanel $\rightarrow$ File Manager**.
   - Navigate to your Application Root (e.g., `public_html`).
   - Upload `dist-hostinger.zip` and click **Extract**.

3. **Configure Environment**:
   - In File Manager, create `.env` using `.env.example` as a template.
   - Set your `DATABASE_URL`, `JWT_SECRET`, and `NEXT_PUBLIC_APP_URL`.

4. **Initialize Database Tables & Seed**:
   - Open **hPanel $\rightarrow$ Advanced $\rightarrow$ Terminal** (or SSH):
     ```bash
     node packages/database/dist/seed.js
     ```

5. **Start Application**:
   - In **hPanel $\rightarrow$ Node.js**, click **Start Application**.
   - The status indicator will turn Green (**Running**).

---

### Method B: Git Clone & Server Build (Alternative)

If you prefer building directly on Hostinger via SSH:

```bash
# 1. Connect via SSH
ssh -p 65002 u123456789@your-server-ip

# 2. Navigate to application root
cd public_html

# 3. Clone repository
git clone https://github.com/DisruptianTechnologies/viksit-bengal-dashboard.git .

# 4. Install production dependencies
npm install --omit=dev

# 5. Push database schema to MySQL
npx prisma db push --schema=packages/database/prisma/schema.prisma

# 6. Seed initial commitments & 23 districts
node packages/database/dist/seed.js

# 7. Compile with memory ceiling
NODE_OPTIONS="--max-old-space-size=1536" npm run build

# 8. Start via hPanel Node.js or PM2
node start.js
```

---

## 3. LiteSpeed Reverse Proxy (`.htaccess`)

Ensure your `.htaccess` file in `public_html` has the following rewrite rules so LiteSpeed forwards port 443 traffic to the running Node.js process:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # 1. Force HTTPS
  RewriteCond %{HTTPS} !=on
  RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

  # 2. Allow direct access to physical files (PWA icons, manifest, sw.js)
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]

  # 3. Forward requests to Next.js standalone process (Port 3000)
  RewriteRule ^(.*)$ http://127.0.0.1:3000/$1 [P,L]
</IfModule>
```

---

## 4. Production Verification

Once started, test the following endpoints:

1. **System Health Probe**:
   ```bash
   curl https://yourdomain.com/api/health
   ```
   *Expected*: `{"status":"healthy","database":{"connected":true,"provider":"mysql"}}`

2. **Landing Page**:
   - English: `https://yourdomain.com/en`
   - Bengali: `https://yourdomain.com/bn`

3. **Social Media Dynamic Posters**:
   - Landscape: `https://yourdomain.com/api/social/posters/landscape`
   - Square: `https://yourdomain.com/api/social/posters/square`

4. **PWA Offline Fallback**:
   - Verify `https://yourdomain.com/sw.js` and `https://yourdomain.com/manifest.json`.
