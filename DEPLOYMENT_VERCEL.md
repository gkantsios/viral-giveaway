# Vercel Deployment Guide

## Prerequisites
- Vercel account created and configured
- GitHub repository access granted to Vercel
- Environment variables documented

## Deployment Steps

### Step 1: Install Vercel CLI (if needed)
```bash
npm install -g vercel
# OR use npx (no installation needed):
npx vercel
```

### Step 2: Authenticate with Vercel
```bash
vercel login
# Follow the prompts to authenticate with your Vercel account
```

### Step 3: Deploy to Vercel
```bash
# From project root directory
npx vercel --prod

# This will:
# - Build the Next.js app
# - Create the Vercel deployment
# - Prompt for environment variables
# - Output the deployment URL
```

### Step 4: Configure Environment Variables
When prompted or via Vercel dashboard, set these variables:

**Required for MVP Testing:**
```
DATABASE_URL: file:./data.db
NEXTAUTH_SECRET: [Generate with: openssl rand -base64 32]
NEXTAUTH_URL: https://[your-vercel-url].vercel.app
```

**Optional (for email features):**
```
RESEND_API_KEY: [Get from https://resend.com]
```

### Step 5: Verify Deployment
1. Visit your Vercel deployment URL
2. Confirm the app loads without errors
3. Check console for any errors or warnings

### Step 6: Test Critical Paths
Before running full QA suite, test:
- [ ] Homepage loads
- [ ] Signup form appears
- [ ] Can click through navigation
- [ ] No console errors

## Deployment Timeline
- Vercel CLI setup: 2-3 minutes
- Deployment execution: 2-3 minutes
- Environment variable setup: 2 minutes
- Verification: 2 minutes
- **Total: 8-10 minutes**

## QA Testing Begins
Once deployment verified, see [HAP-17](/HAP/issues/HAP-17) for full test plan execution.

## Rollback Instructions
If deployment has issues:
```bash
# Deploy previous version
vercel rollback

# Or redeploy current version
vercel deploy --prod
```

## Database Notes
- SQLite database will be ephemeral (resets on each deployment)
- For persistent data, consider switching to Postgres via Supabase
- For MVP testing, ephemeral database is fine - data resets per test cycle

## Support
If deployment fails:
1. Check Vercel dashboard for build logs
2. Review environment variable configuration
3. Verify GitHub permissions are correct
4. Contact board/CTO if issues persist
