# Deployment Guide

This guide covers deploying the PR Dashboard to various hosting platforms.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Build Process](#build-process)
- [Deployment Platforms](#deployment-platforms)
  - [Vercel (Recommended)](#vercel-recommended)
  - [Netlify](#netlify)
  - [GitHub Pages](#github-pages)
  - [Cloudflare Pages](#cloudflare-pages)
- [Environment Variables](#environment-variables)
- [PWA Configuration](#pwa-configuration)
- [Custom Domain](#custom-domain)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

- ✅ GitHub Personal Access Token with `repo` and `read:org` scopes
- ✅ All code committed to Git
- ✅ Project builds successfully locally (`npm run build`)
- ✅ No TypeScript or linting errors

**Pre-deployment Checklist:**

```bash
# 1. Type check
npm run type-check

# 2. Lint code
npm run lint

# 3. Build project
npm run build

# 4. Preview build
npm run preview
```

## Build Process

### Local Build

```bash
# Install dependencies
npm install

# Build for production
npm run build
```

**Output:**
- Directory: `dist/`
- Contains: HTML, CSS, JS, assets, PWA files
- Ready for static hosting

### Build Configuration

The build process (defined in `package.json`):

```json
{
  "scripts": {
    "build": "tsc -b && vite build"
  }
}
```

**Steps:**
1. TypeScript compilation (`tsc -b`)
2. Vite production build
3. PWA service worker generation
4. Asset optimization and minification

## Deployment Platforms

### Vercel (Recommended)

Vercel offers zero-configuration deployment with excellent performance.

#### Method 1: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

#### Method 2: GitHub Integration

1. Go to [vercel.com](https://vercel.com/)
2. Click "Import Project"
3. Connect GitHub account
4. Select `is-pull-request-dashboard` repository
5. Configure:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
6. Add environment variables (see below)
7. Click "Deploy"

**Configuration File (`vercel.json`):**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**Automatic Deployments:**
- Push to `main` → Production deployment
- Push to other branches → Preview deployment

---

### Netlify

#### Method 1: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy

# Deploy to production
netlify deploy --prod
```

#### Method 2: Git Integration

1. Go to [netlify.com](https://www.netlify.com/)
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub
4. Select repository
5. Configure:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
6. Add environment variables
7. Click "Deploy site"

**Configuration File (`netlify.toml`):**

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

---

### GitHub Pages

GitHub Pages is free for public repositories.

#### Setup

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Update `vite.config.ts` for GitHub Pages:**
   ```typescript
   export default defineConfig({
     base: '/is-pull-request-dashboard/',  // Repository name
     plugins: [react(), VitePWA({ ... })],
   })
   ```

3. **Deploy using gh-pages package:**
   ```bash
   # Install gh-pages
   npm install --save-dev gh-pages

   # Add deploy script to package.json
   "scripts": {
     "deploy": "npm run build && gh-pages -d dist"
   }

   # Deploy
   npm run deploy
   ```

4. **Enable GitHub Pages:**
   - Go to repository settings
   - Navigate to "Pages"
   - Source: `gh-pages` branch
   - Click "Save"

**URL:** `https://shaned-ping.github.io/is-pull-request-dashboard/`

**Note:** Environment variables must be set during build or use a proxy.

---

### Cloudflare Pages

#### Method 1: Cloudflare Dashboard

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com/)
2. Navigate to "Pages"
3. Click "Create a project"
4. Connect to GitHub
5. Select repository
6. Configure:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `/`
7. Add environment variables
8. Click "Save and Deploy"

#### Method 2: Wrangler CLI

```bash
# Install Wrangler
npm install -g wrangler

# Login
wrangler login

# Deploy
npx wrangler pages deploy dist
```

**Configuration File (`wrangler.toml`):**

```toml
name = "pr-dashboard"
pages_build_output_dir = "dist"

[env.production]
compatibility_date = "2024-01-01"
```

---

## Environment Variables

All platforms require the GitHub token as an environment variable.

### Variable Configuration

| Platform | Method |
|----------|--------|
| **Vercel** | Project Settings → Environment Variables |
| **Netlify** | Site Settings → Build & Deploy → Environment |
| **GitHub Pages** | Not supported (use build-time or proxy) |
| **Cloudflare** | Workers & Pages → Settings → Environment Variables |

### Setting the Token

**Variable Name:** `VITE_GITHUB_TOKEN`
**Value:** Your GitHub Personal Access Token (e.g., `ghp_xxxxxxxxxxxxx`)

**Security Notes:**
- ⚠️ Client-side tokens are visible in the browser
- ✅ Use tokens with minimal scopes (`repo`, `read:org`)
- ✅ Rotate tokens regularly
- ✅ Consider using a backend proxy for production

### Platform-Specific Setup

**Vercel:**
```bash
# Via CLI
vercel env add VITE_GITHUB_TOKEN

# Via Dashboard
# Settings → Environment Variables → Add
```

**Netlify:**
```bash
# Via CLI
netlify env:set VITE_GITHUB_TOKEN "ghp_xxxxx"

# Via Dashboard
# Site settings → Build & deploy → Environment
```

**Cloudflare Pages:**
```bash
# Via Dashboard only
# Settings → Environment variables
```

---

## PWA Configuration

The app is configured as a Progressive Web App.

### Service Worker

Automatically generated by `vite-plugin-pwa` during build.

**Location:** `dist/sw.js`

**Features:**
- Cache static assets
- Offline support
- Auto-update on new deployment

### Manifest

Generated manifest file for app installation.

**Location:** `dist/manifest.webmanifest`

**Configuration (`vite.config.ts`):**

```typescript
VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'PR Dashboard',
    short_name: 'PR Dashboard',
    description: 'Monitor open pull requests for is-ping-core team',
    theme_color: '#ffffff',
    icons: [
      {
        src: 'pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: 'pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ]
  }
})
```

### PWA Icons

Required icons in `public/` directory:
- `pwa-192x192.png` (192x192px)
- `pwa-512x512.png` (512x512px)

**Generate icons:** Use tools like [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)

---

## Custom Domain

### Vercel

1. Go to project settings
2. Navigate to "Domains"
3. Add custom domain
4. Configure DNS:
   ```
   Type: CNAME
   Name: pr-dashboard (or @)
   Value: cname.vercel-dns.com
   ```

### Netlify

1. Go to site settings
2. Navigate to "Domain management"
3. Add custom domain
4. Configure DNS:
   ```
   Type: CNAME
   Name: pr-dashboard
   Value: yoursitename.netlify.app
   ```

### Cloudflare Pages

1. Navigate to project
2. Click "Custom domains"
3. Add domain
4. Cloudflare automatically manages DNS

---

## Monitoring

### Performance Monitoring

**Vercel Analytics:**
```bash
npm install @vercel/analytics
```

```typescript
// src/main.tsx
import { Analytics } from '@vercel/analytics/react'

// Add to root
<Analytics />
```

**Web Vitals:**
Monitor Core Web Vitals in Vercel/Netlify dashboard.

### Error Tracking

**Sentry (Recommended):**

```bash
npm install @sentry/react
```

```typescript
// src/main.tsx
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production",
})
```

### API Rate Limit Monitoring

Monitor GitHub API usage to avoid rate limits.

```typescript
// Check rate limit status
const rateLimit = await octokit.rateLimit.get()
console.log(`Remaining: ${rateLimit.data.resources.search.remaining}`)
```

---

## Troubleshooting

### Build Failures

**Issue:** TypeScript errors during build
```bash
# Solution: Run type check locally
npm run type-check
# Fix all errors before deploying
```

**Issue:** Out of memory during build
```bash
# Solution: Increase Node memory
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Environment Variable Issues

**Issue:** "undefined" for environment variables
- ✅ Ensure variable starts with `VITE_`
- ✅ Rebuild after adding variables
- ✅ Check platform-specific env var settings

### PWA Not Installing

**Issue:** PWA install prompt not showing
- ✅ Must be served over HTTPS
- ✅ Check manifest.webmanifest is generated
- ✅ Ensure icons exist in correct sizes
- ✅ Clear browser cache

### 404 Errors on Refresh

**Issue:** SPA routes return 404
```bash
# Solution: Add redirect rules (see platform configs above)
# All platforms need /* → /index.html redirect
```

### API Rate Limits

**Issue:** 403 Forbidden from GitHub
- ✅ Check token is set correctly
- ✅ Verify token has required scopes
- ✅ Check rate limit status
- ✅ Wait for rate limit reset

---

## Continuous Deployment

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run type-check && npm run lint

      - name: Build
        run: npm run build
        env:
          VITE_GITHUB_TOKEN: ${{ secrets.VITE_GITHUB_TOKEN }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## Best Practices

1. **Use staging environments** - Test on preview deployments first
2. **Automate deployments** - Deploy on merge to main
3. **Monitor performance** - Track Core Web Vitals
4. **Set up error tracking** - Catch production issues early
5. **Use semantic versioning** - Tag releases in Git
6. **Document deployments** - Keep deployment log
7. **Test PWA functionality** - Verify offline support
8. **Rotate tokens** - Update GitHub tokens periodically

---

## Next Steps

After successful deployment:

1. ✅ Test the application in production
2. ✅ Verify GitHub API integration works
3. ✅ Test PWA installation
4. ✅ Set up monitoring and alerts
5. ✅ Share the URL with team members

---

**Questions?** Check the main [README.md](../README.md) or open an issue.
