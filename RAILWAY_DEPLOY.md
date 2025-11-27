# 🚂 Railway Deployment Guide for Story Grid Pro

## 🔍 Problem Identified

Your React app is deployed to Railway but not configured correctly:
- Railway needs to **build** the React app (`npm run build`)
- Railway needs to **serve** the `build` folder (not `public`)
- Port 8080 must be exposed for Railway

## ✅ Files Created

1. **`railway.json`** - Tells Railway how to build and deploy
2. **`package.json`** - Added `serve` package to serve static files

## 📤 How to Deploy

### Step 1: Commit and Push Changes

```bash
cd "/Users/peterstone/Desktop/Peter - Coding Projects/iaj-content-hub"
git add railway.json package.json
git commit -m "Add Railway configuration for proper React deployment"
git push
```

### Step 2: Railway Will Auto-Deploy

Once you push, Railway will:
1. Detect the changes
2. Run `npm install && npm run build`
3. Start serving with `npx serve -s build -l 8080`
4. Provision SSL certificate for `storygridpro.com`

### Step 3: Wait for SSL Certificate

- **Initial deployment**: 2-5 minutes
- **SSL certificate**: 5-15 minutes after deployment
- Check Railway logs to confirm deployment success

## 🔧 Alternative: Manual Railway Settings

If auto-deploy doesn't work, configure manually in Railway dashboard:

### Build Settings:
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npx serve -s build -l 8080`
- **Watch Paths**: Leave default

### Environment Variables:
- **PORT**: `8080` (Railway requires this)

## 🌐 After Deployment

### Check These URLs:
1. **Railway subdomain**: https://storygrid-pro-production.up.railway.app
   - Should work immediately after deployment
   
2. **Custom domain**: https://storygridpro.com
   - May take 5-15 minutes for SSL to provision
   - If still showing "Not Private" after 15 minutes, check:
     - Railway dashboard → Settings → Networking
     - Ensure custom domain shows "Setup complete" with green checkmark
     - DNS records are correct (CNAME pointing to Railway)

## 🐛 Troubleshooting

### SSL Certificate Not Working?

1. **Check Railway Logs**:
   - Go to Railway dashboard
   - Click on your service
   - View deployment logs

2. **Verify DNS**:
   ```bash
   dig storygridpro.com
   ```
   Should point to Railway's servers

3. **Remove and Re-add Domain**:
   - In Railway dashboard → Settings → Networking
   - Remove `storygridpro.com`
   - Wait 1 minute
   - Re-add it
   - Wait 10-15 minutes for SSL

### App Not Loading?

Check Railway logs for errors:
- Build failures
- Port binding issues
- Missing dependencies

## 📝 What Changed

### Before:
- Railway was serving the wrong folder
- No build process configured
- No proper static file server

### After:
- Railway builds React app properly
- Serves optimized production build
- Uses `serve` package on port 8080
- SSL certificates auto-provision

---

**Need help?** Check Railway logs or run locally first:
```bash
npm run build
npx serve -s build -l 8080
```
Then visit http://localhost:8080
