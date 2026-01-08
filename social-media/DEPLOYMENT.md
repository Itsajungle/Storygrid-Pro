# IAJ Social Media - Railway Deployment Guide

## 🚀 Quick Deploy to Railway

### Step 1: Push to GitHub (if not already)

```bash
cd "/Users/peterstone/Desktop/Peter - Coding Projects/IAJ Social Media"
git init
git add .
git commit -m "Initial commit - IAJ Social Media complete system"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### Step 2: Deploy to Railway

1. **Go to Railway:** https://railway.app
2. **Click "New Project"**
3. **Select "Deploy from GitHub repo"**
4. **Choose your IAJ Social Media repository**
5. **Railway will auto-detect the configuration**

### Step 3: Add PostgreSQL Database

1. **In your Railway project, click "New"**
2. **Select "Database" → "Add PostgreSQL"**
3. **Railway will automatically create the database**
4. **Copy the connection string**

### Step 4: Configure Environment Variables

In Railway project settings, add these variables:

```env
# OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# Claude
CLAUDE_API_KEY=your_claude_api_key_here

# Supabase
SUPABASE_URL=https://yljdgsywqombavyzxhqj.supabase.co
SUPABASE_KEY=your_supabase_anon_key_here

# Twilio WhatsApp
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
TWILIO_WHATSAPP_TO=whatsapp:+your_phone_number

# Metricool
METRICOOL_API_KEY=your_metricool_api_key_here
METRICOOL_BASE_URL=https://api.metricool.com/v1

# YouTube
YOUTUBE_API_KEY=AIzaSyCMv98lquTx5UvdAGkRT3pp4AjPz5DJBKo

# Configuration
ENVIRONMENT=production
LOG_LEVEL=INFO
API_HOST=0.0.0.0
API_PORT=$PORT
```

### Step 5: Update Twilio Webhook

Once deployed, Railway will give you a URL like: `https://your-app.railway.app`

1. **Go to Twilio Console**
2. **Messaging → WhatsApp Sandbox**
3. **Update webhook URL to:** `https://your-app.railway.app/api/whatsapp/webhook`
4. **Save**

### Step 6: Test Deployment

```bash
# Check health
curl https://your-app.railway.app/health

# Access dashboard
open https://your-app.railway.app/api/social-studio/dashboard
```

---

## 🔧 Troubleshooting

### Build Fails
- Check Railway logs
- Ensure all dependencies in `requirements.txt`
- Verify Python version compatibility

### Database Connection Issues
- Verify Supabase credentials
- Check firewall rules
- Test connection locally first

### WhatsApp Not Working
- Verify ngrok is NOT running locally
- Update Twilio webhook to Railway URL
- Check Twilio logs for errors

---

## 📊 Post-Deployment Checklist

- [ ] Health endpoint responds
- [ ] Dashboard loads
- [ ] Can generate posts
- [ ] WhatsApp commands work
- [ ] Publishing works
- [ ] Metricool analytics load
- [ ] All API keys are valid

---

## 🚀 Next Steps

After deployment:
1. Build React frontend for IAJ Content Hub
2. Integrate Story Grid Pro
3. Add custom domain
4. Set up monitoring
5. Configure backups

---

**Your Railway URL will be:** `https://iaj-social-media-production.up.railway.app` (or similar)
