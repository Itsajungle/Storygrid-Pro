# Story Grid Pro - Complete IAJ Ecosystem

**One unified project containing all It's a Jungle systems**

---

## 📁 Project Structure

```
Story Grid Pro/
│
├── src/                          # 📱 Frontend - React/TypeScript
│   ├── pages/
│   │   └── ContentHub.tsx        # Main hub with system monitoring
│   ├── components/
│   │   └── SystemHealthMonitor.tsx  # Health dashboard component
│   └── ...                       # Other Story Grid Pro components
│
├── social-media/                 # 🤖 IAJ Social Media System (FastAPI)
│   ├── api/
│   │   └── main.py               # Main social automation backend
│   ├── modules/
│   │   ├── agent-training/       # AI agent configuration
│   │   ├── video-processor/      # YouTube + Vizard processing
│   │   ├── social-studio/        # GPT-4 + DALL-E content creation
│   │   └── batch-studio/         # Bulk content generation
│   └── .env                      # Social media credentials
│
└── management-hub/               # 📊 Monitoring Backend (FastAPI + Claude)
    ├── main.py                   # Health monitoring service
    ├── .env                      # Monitoring credentials
    └── requirements.txt          # Python dependencies

```

---

## 🚀 What Each Part Does

### Frontend (React App)
- **Purpose**: Story Grid Pro planning tools + monitoring dashboard
- **Tech Stack**: React, TypeScript, Vite, Tailwind CSS
- **Key Features**:
  - Content Hub page with system health monitoring
  - AI insights from Claude displayed in UI
  - Links to all IAJ applications
  - Episode planning, scripts, fact-checking, timeline

### Social Media System
- **Purpose**: Complete AI-powered social media automation
- **Tech Stack**: FastAPI, Python, OpenAI, Anthropic, Supabase
- **Deployed**: `https://web-production-29982.up.railway.app`
- **Modules**:
  - **Social Studio** - GPT-4 + DALL-E content generation
  - **Batch Studio** - Generate 7 posts at once
  - **Video Processor** - YouTube + Vizard AI processing
  - **Agent Training** - Configure AI agents

### Management Hub
- **Purpose**: Monitor all systems + generate AI insights
- **Tech Stack**: FastAPI, Python, Claude Sonnet 4, Supabase
- **Deployed**: `https://web-production-a2e7f.up.railway.app`
- **Features**:
  - Health checks every 5-10 minutes
  - Performance tracking
  - Claude AI recommendations (daily at 9 AM)
  - Auto-cleanup old data

---

## 🏃 How to Run Everything

### Option 1: Use Railway (Easiest - Current Setup)
Everything is already deployed and working:
- Frontend: Story Grid Pro on Railway
- Social Media: Running on Railway
- Management Hub: Running on Railway

**No local setup needed!** Just open your deployed URL.

### Option 2: Run Locally (Development)

**Terminal 1 - Frontend:**
```bash
cd "/Users/peterstone/Desktop/Peter - Coding Projects/Storygrid Pro"
npm run dev
```

**Terminal 2 - Social Media Backend:**
```bash
cd "/Users/peterstone/Desktop/Peter - Coding Projects/Storygrid Pro/social-media"
source venv/bin/activate  # or create: python -m venv venv
python api/main.py
```

**Terminal 3 - Management Hub:**
```bash
cd "/Users/peterstone/Desktop/Peter - Coding Projects/Storygrid Pro/management-hub"
source venv/bin/activate
python main.py
```

---

## 🔧 Configuration

### Environment Variables

**Frontend** (`.env` in root):
```bash
VITE_MANAGEMENT_HUB_URL=https://management-hub-production-80d6.up.railway.app
```

**Social Media** (`social-media/.env`):
- Contains OpenAI, Anthropic, Supabase credentials
- YouTube API keys
- Social media platform credentials

**Management Hub** (`management-hub/.env`):
- Supabase URL and key
- Anthropic API key (for Claude)
- URLs of all systems to monitor

---

## 📦 Deployment

All three parts deploy independently to Railway:

1. **Frontend**: Builds React app, serves with Node/Express
2. **Social Media**: Python FastAPI backend
3. **Management Hub**: Python FastAPI monitoring service

Push to GitHub → Railway auto-deploys each service.

---

## 🔄 How They Work Together

```
User opens ContentHub
       ↓
Frontend fetches from Management Hub
       ↓
Management Hub checks health of Social Media System
       ↓
Claude AI analyzes data → generates insights
       ↓
Results displayed in ContentHub UI
```

---

## 📊 Key Features

✅ **Unified Dashboard** - See everything in one place  
✅ **Real-time Monitoring** - Health checks every 5-10 minutes  
✅ **AI Insights** - Claude Sonnet 4 recommendations  
✅ **Social Automation** - Complete content generation pipeline  
✅ **Video Processing** - Automated YouTube + Vizard workflow  
✅ **Content Planning** - Story Grid Pro episode planning tools  

---

## 🎯 This is Your Complete IAJ Ecosystem

Everything you need to plan, create, automate, and monitor your content - all in one project!

**Built with**: React, TypeScript, Python, FastAPI, Claude AI, OpenAI, Supabase, Railway

**Updated**: January 2025

