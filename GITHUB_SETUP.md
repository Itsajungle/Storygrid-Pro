# 🔗 Connect to GitHub and Railway

## Current Status
- ✅ Local git repository exists
- ✅ Changes committed locally
- ❌ No GitHub remote configured
- ✅ Railway is deployed (but not connected to git)

## Option 1: Create New GitHub Repo (Recommended)

### Step 1: Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `iaj-content-hub` or `storygrid-pro`
3. Keep it **Private** (recommended)
4. **DO NOT** initialize with README (we already have files)
5. Click "Create repository"

### Step 2: Connect Local Repo to GitHub
GitHub will show you commands like this:

```bash
cd "/Users/peterstone/Desktop/Peter - Coding Projects/iaj-content-hub"
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
git branch -M main
git push -u origin main
```

### Step 3: Connect Railway to GitHub
1. Go to Railway dashboard: https://railway.app
2. Click on "Storygrid-Pro" project
3. Click on your service
4. Go to **Settings** → **Source**
5. Click "Connect GitHub Repository"
6. Select the repository you just created
7. Railway will automatically redeploy from GitHub

### Step 4: Verify
- Railway will detect `railway.json` and deploy correctly
- SSL certificate will provision for `storygridpro.com`
- Future pushes to GitHub will auto-deploy

---

## Option 2: Manual Railway Configuration (Quick Fix)

If you don't want to set up GitHub right now:

### In Railway Dashboard:
1. Go to https://railway.app
2. Click "Storygrid-Pro" project
3. Go to **Settings** → **Build & Deploy**
4. Set these values:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npx serve -s build -l 8080`
5. Click "Deploy" to trigger manual redeploy

This will fix the SSL issue without GitHub, but you won't have auto-deploy.

---

## Why SSL Certificate Failed

The SSL error happens because:
1. Railway was serving the wrong files (not the built React app)
2. The app wasn't starting correctly on port 8080
3. Railway couldn't verify domain ownership without a working app

Once properly deployed with the new configuration, SSL will auto-provision in 5-15 minutes.

---

## Recommended: Option 1 (GitHub)
- ✅ Auto-deploy on every push
- ✅ Version control in the cloud
- ✅ Easy rollbacks
- ✅ Collaboration ready
- ✅ Railway's full CI/CD pipeline
