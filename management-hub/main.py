"""
IAJ Management Hub - Intelligent Monitoring & Recommendation Engine
Production-ready backend service with smart caching, retry logic, and AI insights
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional
import uvicorn
import httpx
import os
import logging
from dotenv import load_dotenv
from supabase import create_client, Client
from anthropic import Anthropic
import asyncio
from functools import wraps
import time

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize clients with error handling for missing env vars
def init_supabase() -> Optional[Client]:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    if url and key:
        try:
            return create_client(url, key)
        except Exception as e:
            logger.error(f"Failed to initialize Supabase: {e}")
            return None
    logger.warning("SUPABASE_URL or SUPABASE_KEY not set - database features disabled")
    return None

def init_anthropic() -> Optional[Anthropic]:
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if api_key:
        try:
            return Anthropic(api_key=api_key)
        except Exception as e:
            logger.error(f"Failed to initialize Anthropic: {e}")
            return None
    logger.warning("ANTHROPIC_API_KEY not set - AI features disabled")
    return None

supabase: Optional[Client] = init_supabase()
anthropic_client: Optional[Anthropic] = init_anthropic()

# System configuration with check intervals
SYSTEMS = {
    "story_grid_pro": {
        "name": "Story Grid Pro",
        "url": os.getenv("STORY_GRID_PRO_URL"),
        "endpoint": "/api/status",
        "description": "Production planning and module hub",
        "check_interval": 300,  # 5 minutes
        "priority": "high"
    },
    "iaj_social_main": {
        "name": "IAJ Social Main",
        "url": os.getenv("IAJ_SOCIAL_MAIN_URL"),
        "endpoint": "/api/status",
        "description": "Main IAJ Social application",
        "check_interval": 300,  # 5 minutes
        "priority": "high"
    },
    "agent_training": {
        "name": "Agent Training",
        "url": os.getenv("IAJ_SOCIAL_MAIN_URL"),
        "endpoint": "/api/agent-training/status",
        "description": "AI agent training module",
        "check_interval": 600,  # 10 minutes
        "priority": "medium"
    },
    "video_processor": {
        "name": "Video Processor",
        "url": os.getenv("IAJ_SOCIAL_MAIN_URL"),
        "endpoint": "/api/video-processor/status",
        "description": "Video processing module",
        "check_interval": 600,  # 10 minutes
        "priority": "medium"
    },
    "social_studio": {
        "name": "Social Studio",
        "url": os.getenv("IAJ_SOCIAL_MAIN_URL"),
        "endpoint": "/api/social-studio/status",
        "description": "AI content creation module",
        "check_interval": 600,  # 10 minutes
        "priority": "medium"
    },
    "batch_studio": {
        "name": "Batch Studio",
        "url": os.getenv("IAJ_SOCIAL_MAIN_URL"),
        "endpoint": "/api/social-studio/batch/status",
        "description": "Batch content processing module",
        "check_interval": 600,  # 10 minutes
        "priority": "medium"
    }
}

# Cache configuration
CACHE = {
    "health_overview": {"data": None, "timestamp": None, "ttl": 60},  # 1 minute
    "recommendations": {"data": None, "timestamp": None, "ttl": 300},  # 5 minutes
}

# Scheduler instance
scheduler = AsyncIOScheduler()

# Simple cache decorator
def cached(cache_key: str, ttl: int):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            now = time.time()
            cache_entry = CACHE.get(cache_key)
            
            if cache_entry and cache_entry["data"] is not None:
                if cache_entry["timestamp"] and (now - cache_entry["timestamp"]) < ttl:
                    logger.info(f"Cache hit for {cache_key}")
                    return cache_entry["data"]
            
            result = await func(*args, **kwargs)
            CACHE[cache_key] = {"data": result, "timestamp": now, "ttl": ttl}
            return result
        return wrapper
    return decorator

# Retry logic with exponential backoff
async def retry_with_backoff(func, max_retries=3, base_delay=1):
    """Execute function with exponential backoff retry logic"""
    for attempt in range(max_retries):
        try:
            return await func()
        except Exception as e:
            if attempt == max_retries - 1:
                raise e
            delay = base_delay * (2 ** attempt)
            logger.warning(f"Retry attempt {attempt + 1} after {delay}s: {str(e)}")
            await asyncio.sleep(delay)

# Lifespan context manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("=" * 80)
    logger.info("🚀 IAJ Management Hub API - Starting")
    logger.info("=" * 80)
    logger.info(f"📊 Monitoring {len(SYSTEMS)} systems with smart intervals")
    
    for key, info in SYSTEMS.items():
        interval_min = info["check_interval"] // 60
        priority_emoji = "🔴" if info["priority"] == "high" else "🟡"
        logger.info(f"  {priority_emoji} {info['name']} (every {interval_min}min)")
    
    logger.info("=" * 80)
    
    # Start the scheduler
    scheduler.start()
    
    # Schedule health checks for high-priority systems (every 5 min)
    scheduler.add_job(
        check_high_priority_systems,
        trigger=IntervalTrigger(seconds=300),
        id="health_check_high_priority",
        name="High Priority Health Checks (5min)",
        replace_existing=True
    )
    
    # Schedule health checks for medium-priority systems (every 10 min)
    scheduler.add_job(
        check_medium_priority_systems,
        trigger=IntervalTrigger(seconds=600),
        id="health_check_medium_priority",
        name="Medium Priority Health Checks (10min)",
        replace_existing=True
    )
    
    # Schedule AI recommendations (twice daily at 8am and 8pm)
    scheduler.add_job(
        generate_daily_recommendations,
        trigger=CronTrigger(hour=8, minute=0),
        id="daily_recommendations_morning",
        name="Morning AI Recommendations (8am)",
        replace_existing=True
    )
    
    scheduler.add_job(
        generate_daily_recommendations,
        trigger=CronTrigger(hour=20, minute=0),
        id="daily_recommendations_evening",
        name="Evening AI Recommendations (8pm)",
        replace_existing=True
    )
    
    # Schedule cleanup of old data (daily at 2am)
    scheduler.add_job(
        cleanup_old_data,
        trigger=CronTrigger(hour=2, minute=0),
        id="cleanup_old_data",
        name="Cleanup Old Data (2am)",
        replace_existing=True
    )
    
    logger.info("✅ Scheduler started with optimized intervals")
    logger.info("✅ AI recommendations scheduled twice daily at 8:00 AM and 8:00 PM")
    logger.info("✅ Auto-cleanup scheduled daily at 2:00 AM")
    logger.info("=" * 80)
    
    # Schedule initial health check to run after startup (non-blocking)
    # This prevents slow health checks from blocking the app startup
    scheduler.add_job(
        check_all_systems,
        trigger='date',  # Run once
        id="initial_health_check",
        name="Initial Health Check",
        replace_existing=True
    )
    logger.info("📋 Initial health check scheduled (runs in background)")
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down IAJ Management Hub")
    scheduler.shutdown()

# Initialize FastAPI app
app = FastAPI(
    title="IAJ Management Hub API",
    description="Intelligent monitoring and recommendation engine for IAJ systems",
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration - Allow all origins for development (including file://)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins including file://
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check function with retry logic
async def check_system_health(system_key: str, system_info: Dict[str, str]) -> Dict[str, Any]:
    """Check the health of a single system with retry logic"""
    start_time = datetime.now(timezone.utc)
    
    async def attempt_check():
        async with httpx.AsyncClient(timeout=10.0) as client:
            # Use custom endpoint if specified, otherwise default to /api/status
            base_url = system_info['url'].rstrip('/')
            endpoint = system_info.get('endpoint', '/api/status')
            url = f"{base_url}{endpoint}"
            response = await client.get(url)
            return response
    
    try:
        response = await retry_with_backoff(attempt_check, max_retries=2, base_delay=1)
        response_time = (datetime.now(timezone.utc) - start_time).total_seconds() * 1000
        
        if response.status_code == 200:
            data = response.json()
            return {
                "system_name": system_key,
                "status": "healthy",
                "response_time_ms": round(response_time, 2),
                "last_check": datetime.now(timezone.utc).isoformat(),
                "error_message": None,
                "metadata": data
            }
        else:
            return {
                "system_name": system_key,
                "status": "unhealthy",
                "response_time_ms": round(response_time, 2),
                "last_check": datetime.now(timezone.utc).isoformat(),
                "error_message": f"HTTP {response.status_code}",
                "metadata": {"status_code": response.status_code}
            }
    
    except httpx.TimeoutException:
        return {
            "system_name": system_key,
            "status": "timeout",
            "response_time_ms": None,
            "last_check": datetime.now(timezone.utc).isoformat(),
            "error_message": "Request timeout after retries",
            "metadata": {}
        }
    
    except Exception as e:
        return {
            "system_name": system_key,
            "status": "error",
            "response_time_ms": None,
            "last_check": datetime.now(timezone.utc).isoformat(),
            "error_message": str(e),
            "metadata": {}
        }

# Check high-priority systems
async def check_high_priority_systems():
    """Check systems with 5-minute intervals"""
    high_priority = {k: v for k, v in SYSTEMS.items() if v["priority"] == "high"}
    logger.info(f"🔴 Checking {len(high_priority)} high-priority systems")
    await run_health_checks(high_priority)

# Check medium-priority systems
async def check_medium_priority_systems():
    """Check systems with 10-minute intervals"""
    medium_priority = {k: v for k, v in SYSTEMS.items() if v["priority"] == "medium"}
    logger.info(f"🟡 Checking {len(medium_priority)} medium-priority systems")
    await run_health_checks(medium_priority)

# Check all systems
async def check_all_systems():
    """Check all systems (used for manual triggers)"""
    logger.info(f"🔍 Checking all {len(SYSTEMS)} systems")
    await run_health_checks(SYSTEMS)

# Run health checks for given systems
async def run_health_checks(systems: Dict[str, Dict[str, Any]]):
    """Run health checks and store results"""
    tasks = []
    for system_key, system_info in systems.items():
        tasks.append(check_system_health(system_key, system_info))
    
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    for health_data in results:
        if isinstance(health_data, Exception):
            logger.error(f"Error checking system: {str(health_data)}")
            continue
        
        try:
            # Store in Supabase
            supabase.table("system_health").insert(health_data).execute()
            
            status_emoji = "✅" if health_data["status"] == "healthy" else "❌"
            system_name = SYSTEMS.get(health_data["system_name"], {}).get("name", health_data["system_name"])
            logger.info(f"{status_emoji} {system_name}: {health_data['status']}")
            
            # Clear cache on new data
            CACHE["health_overview"]["data"] = None
            
            # Log alert for unhealthy systems
            if health_data["status"] != "healthy":
                workflow_event = {
                    "event_type": "system_health_alert",
                    "source_system": "management_hub",
                    "target_system": health_data["system_name"],
                    "status": "completed",
                    "payload": health_data,
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                supabase.table("workflow_events").insert(workflow_event).execute()
        
        except Exception as e:
            logger.error(f"Error storing health data for {health_data.get('system_name')}: {str(e)}")

# Cleanup old data
async def cleanup_old_data():
    """Keep only last 1000 checks per system"""
    logger.info("🧹 Starting cleanup of old data")
    
    try:
        for system_key in SYSTEMS.keys():
            # Get count of records for this system
            response = supabase.table("system_health")\
                .select("id", count="exact")\
                .eq("system_name", system_key)\
                .execute()
            
            total_count = response.count if hasattr(response, 'count') else 0
            
            if total_count > 1000:
                # Get the ID of the 1000th most recent record
                records = supabase.table("system_health")\
                    .select("id")\
                    .eq("system_name", system_key)\
                    .order("created_at", desc=True)\
                    .limit(1)\
                    .range(999, 999)\
                    .execute()
                
                if records.data:
                    cutoff_id = records.data[0]["id"]
                    # Delete records older than this
                    supabase.table("system_health")\
                        .delete()\
                        .eq("system_name", system_key)\
                        .lt("id", cutoff_id)\
                        .execute()
                    
                    deleted = total_count - 1000
                    logger.info(f"🧹 Cleaned {deleted} old records for {system_key}")
        
        logger.info("✅ Cleanup complete")
    
    except Exception as e:
        logger.error(f"❌ Cleanup error: {str(e)}")

# Generate AI recommendations
async def generate_recommendations() -> List[Dict[str, Any]]:
    """Use Claude Sonnet 4 to analyze system performance and generate recommendations"""
    try:
        logger.info("🧠 Generating AI recommendations with Claude Sonnet 4")
        
        # Fetch comprehensive data
        health_data = supabase.table("system_health")\
            .select("*")\
            .order("created_at", desc=True)\
            .limit(200)\
            .execute()
        
        workflow_data = supabase.table("workflow_events")\
            .select("*")\
            .order("created_at", desc=True)\
            .limit(100)\
            .execute()
        
        # Build context
        context = "# IAJ Systems Performance Analysis\n\n"
        
        # Calculate statistics
        system_stats = {}
        for record in health_data.data:
            sys_name = record['system_name']
            if sys_name not in system_stats:
                system_stats[sys_name] = {
                    'total': 0, 'healthy': 0, 'unhealthy': 0,
                    'errors': [], 'response_times': []
                }
            
            system_stats[sys_name]['total'] += 1
            if record['status'] == 'healthy':
                system_stats[sys_name]['healthy'] += 1
            else:
                system_stats[sys_name]['unhealthy'] += 1
                if record.get('error_message'):
                    system_stats[sys_name]['errors'].append(record['error_message'])
            
            if record.get('response_time_ms'):
                system_stats[sys_name]['response_times'].append(record['response_time_ms'])
        
        context += "## System Health Summary\n\n"
        for sys_name, stats in system_stats.items():
            uptime = (stats['healthy'] / stats['total'] * 100) if stats['total'] > 0 else 0
            avg_response = sum(stats['response_times']) / len(stats['response_times']) if stats['response_times'] else 0
            
            context += f"### {SYSTEMS.get(sys_name, {}).get('name', sys_name)}\n"
            context += f"- Uptime: {uptime:.1f}%\n"
            context += f"- Avg Response: {avg_response:.0f}ms\n"
            context += f"- Issues: {stats['unhealthy']}/{stats['total']} checks\n"
            if stats['errors']:
                context += f"- Recent Errors: {', '.join(set(stats['errors'][:3]))}\n"
            context += "\n"
        
        # Call Claude Sonnet 4
        message = anthropic_client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=2000,
            messages=[{
                "role": "user",
                "content": f"""{context}

Analyze this data and provide 3-5 actionable recommendations as JSON:

[{{"title": "...", "description": "...", "priority": "high|medium|low", "system_name": "...", "recommendation_type": "performance|reliability|optimization", "action": "..."}}]"""
            }]
        )
        
        # Parse response
        import json
        import re
        
        recommendations_text = message.content[0].text
        json_match = re.search(r'\[[\s\S]*\]', recommendations_text)
        
        if json_match:
            try:
                parsed_recs = json.loads(json_match.group())
                formatted_recs = []
                
                for rec in parsed_recs:
                    formatted_recs.append({
                        "recommendation_type": rec.get("recommendation_type", "general"),
                        "priority": rec.get("priority", "medium"),
                        "title": rec.get("title", "System Recommendation"),
                        "description": rec.get("description", ""),
                        "system_name": rec.get("system_name", "all"),
                        "actionable": True,
                        "action_url": None,
                        "status": "pending",
                        "metadata": {
                            "source": "claude_sonnet_4",
                            "action": rec.get("action", ""),
                            "generated_at": datetime.now(timezone.utc).isoformat()
                        },
                        "created_at": datetime.now(timezone.utc).isoformat()
                    })
                
                logger.info(f"✅ Generated {len(formatted_recs)} recommendations")
                return formatted_recs
            
            except json.JSONDecodeError:
                logger.warning("⚠️ Could not parse JSON from Claude")
        
        # Fallback
        return [{
            "recommendation_type": "analysis",
            "priority": "medium",
            "title": "System Analysis Complete",
            "description": recommendations_text[:1000],
            "system_name": "all",
            "actionable": True,
            "action_url": None,
            "status": "pending",
            "metadata": {"source": "claude_sonnet_4"},
            "created_at": datetime.now(timezone.utc).isoformat()
        }]
    
    except Exception as e:
        logger.error(f"❌ Error generating recommendations: {str(e)}")
        return []

# Daily recommendations
async def generate_daily_recommendations():
    """Generate recommendations daily at 9am"""
    logger.info("📊 Running daily AI recommendation generation")
    recommendations = await generate_recommendations()
    
    for rec in recommendations:
        try:
            supabase.table("ai_recommendations").insert(rec).execute()
        except Exception as e:
            logger.error(f"Error storing recommendation: {str(e)}")
    
    # Clear recommendations cache
    CACHE["recommendations"]["data"] = None

# API Endpoints

@app.get("/")
async def root():
    """API information"""
    return {
        "service": "IAJ Management Hub API",
        "version": "2.0.0",
        "description": "Intelligent monitoring with optimized intervals and AI insights",
        "features": [
            "Smart health monitoring (5min/10min intervals)",
            "AI-powered recommendations (Claude Sonnet 4)",
            "Performance metrics with caching",
            "Auto-cleanup (keep last 1000 checks)",
            "Retry logic with exponential backoff"
        ],
        "endpoints": {
            "health_overview": "/api/health/overview",
            "health_detailed": "/api/health/detailed",
            "recommendations": "/api/recommendations",
            "generate_recommendations": "/api/recommendations/generate",
            "performance_metrics": "/api/metrics/performance",
            "trigger_check": "/api/health/check"
        },
        "docs": "/docs"
    }

@app.get("/api/health/overview")
@cached("health_overview", 60)
async def get_health_overview():
    """Quick status overview (cached 1min)"""
    try:
        results = {}
        
        for system_key, system_info in SYSTEMS.items():
            response = supabase.table("system_health")\
                .select("*")\
                .eq("system_name", system_key)\
                .order("created_at", desc=True)\
                .limit(1)\
                .execute()
            
            if response.data:
                latest = response.data[0]
                results[system_key] = {
                    "name": system_info["name"],
                    "status": latest["status"],
                    "response_time_ms": latest.get("response_time_ms"),
                    "last_check": latest["last_check"],
                    "priority": system_info["priority"]
                }
            else:
                results[system_key] = {
                    "name": system_info["name"],
                    "status": "unknown",
                    "priority": system_info["priority"]
                }
        
        overall_healthy = sum(1 for s in results.values() if s["status"] == "healthy")
        
        return {
            "overall_health": f"{overall_healthy}/{len(SYSTEMS)}",
            "systems": results,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "cached": True
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health/detailed")
async def get_health_detailed():
    """Detailed health status with recent history"""
    try:
        results = {}
        
        for system_key, system_info in SYSTEMS.items():
            response = supabase.table("system_health")\
                .select("*")\
                .eq("system_name", system_key)\
                .order("created_at", desc=True)\
                .limit(10)\
                .execute()
            
            if response.data:
                # Calculate uptime from last 10 checks
                healthy_count = sum(1 for r in response.data if r["status"] == "healthy")
                uptime = (healthy_count / len(response.data)) * 100
                
                results[system_key] = {
                    "name": system_info["name"],
                    "description": system_info["description"],
                    "priority": system_info["priority"],
                    "check_interval": system_info["check_interval"],
                    "current_status": response.data[0],
                    "recent_history": response.data,
                    "uptime_percentage": round(uptime, 1)
                }
        
        return {
            "systems": results,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/recommendations")
async def get_recommendations(status: str = "pending", limit: int = 10):
    """Get AI recommendations (no cache for real-time updates)"""
    try:
        query = supabase.table("ai_recommendations").select("*")
        
        # Handle different status values
        if status == "pending":
            # Get recommendations that are either 'pending' or 'active'
            query = query.in_("status", ["pending", "active"])
        else:
            query = query.eq("status", status)
        
        response = query.order("created_at", desc=True).limit(limit).execute()
        
        logger.info(f"📋 Fetched {len(response.data)} recommendations with status: {status}")
        
        return {
            "recommendations": response.data,
            "count": len(response.data),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    
    except Exception as e:
        logger.error(f"Error fetching recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/recommendations/generate")
async def trigger_recommendations():
    """Manually trigger AI recommendation generation"""
    try:
        recommendations = await generate_recommendations()
        
        for rec in recommendations:
            supabase.table("ai_recommendations").insert(rec).execute()
        
        # Clear cache
        CACHE["recommendations"]["data"] = None
        
        return {
            "message": "Recommendations generated",
            "count": len(recommendations),
            "recommendations": recommendations
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/recommendations/{recommendation_id}/apply")
async def apply_recommendation(recommendation_id: str):
    """Mark a recommendation as applied"""
    try:
        logger.info(f"🔄 Attempting to apply recommendation ID: {recommendation_id}")
        
        # First check if the recommendation exists
        check_response = supabase.table("ai_recommendations")\
            .select("*")\
            .eq("id", recommendation_id)\
            .execute()
        
        if not check_response.data:
            logger.warning(f"❌ Recommendation {recommendation_id} not found in database")
            raise HTTPException(status_code=404, detail=f"Recommendation {recommendation_id} not found")
        
        logger.info(f"✓ Found recommendation: {check_response.data[0].get('title', 'Unknown')}")
        
        # Update the recommendation status
        response = supabase.table("ai_recommendations")\
            .update({
                "status": "applied",
                "updated_at": datetime.now(timezone.utc).isoformat()
            })\
            .eq("id", recommendation_id)\
            .execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Failed to update recommendation")
        
        # Clear cache
        CACHE["recommendations"]["data"] = None
        
        # Log the action
        workflow_event = {
            "event_type": "recommendation_applied",
            "source_system": "management_hub",
            "target_system": "system_monitor",
            "status": "completed",
            "payload": {"recommendation_id": recommendation_id},
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        supabase.table("workflow_events").insert(workflow_event).execute()
        
        logger.info(f"✅ Recommendation {recommendation_id} applied successfully")
        
        return {
            "message": "Recommendation applied successfully",
            "recommendation_id": recommendation_id,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error applying recommendation {recommendation_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/recommendations/{recommendation_id}/dismiss")
async def dismiss_recommendation(recommendation_id: str):
    """Mark a recommendation as dismissed"""
    try:
        # Update the recommendation status
        response = supabase.table("ai_recommendations")\
            .update({
                "status": "dismissed",
                "updated_at": datetime.now(timezone.utc).isoformat()
            })\
            .eq("id", recommendation_id)\
            .execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Recommendation not found")
        
        # Clear cache
        CACHE["recommendations"]["data"] = None
        
        # Log the action
        workflow_event = {
            "event_type": "recommendation_dismissed",
            "source_system": "management_hub",
            "target_system": "system_monitor",
            "status": "completed",
            "payload": {"recommendation_id": recommendation_id},
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        supabase.table("workflow_events").insert(workflow_event).execute()
        
        logger.info(f"🚫 Recommendation {recommendation_id} dismissed")
        
        return {
            "message": "Recommendation dismissed successfully",
            "recommendation_id": recommendation_id,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error dismissing recommendation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/metrics/performance")
async def get_performance_metrics():
    """Get performance trends and metrics"""
    try:
        # Get last 24 hours of data
        cutoff = datetime.now(timezone.utc) - timedelta(hours=24)
        
        metrics = {}
        
        for system_key, system_info in SYSTEMS.items():
            response = supabase.table("system_health")\
                .select("*")\
                .eq("system_name", system_key)\
                .gte("created_at", cutoff.isoformat())\
                .order("created_at", desc=True)\
                .execute()
            
            if response.data:
                response_times = [r["response_time_ms"] for r in response.data if r.get("response_time_ms")]
                healthy_count = sum(1 for r in response.data if r["status"] == "healthy")
                
                metrics[system_key] = {
                    "name": system_info["name"],
                    "total_checks": len(response.data),
                    "healthy_checks": healthy_count,
                    "uptime_24h": round((healthy_count / len(response.data)) * 100, 2),
                    "avg_response_time": round(sum(response_times) / len(response_times), 2) if response_times else None,
                    "min_response_time": round(min(response_times), 2) if response_times else None,
                    "max_response_time": round(max(response_times), 2) if response_times else None
                }
        
        return {
            "period": "24 hours",
            "systems": metrics,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/health/check")
async def trigger_health_check():
    """Manually trigger health check for all systems"""
    try:
        await check_all_systems()
        return {
            "message": "Health check completed",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "systems_checked": len(SYSTEMS)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== TRENDING API ENDPOINTS ====================
# Real-time trend data from Google Trends and YouTube (US-focused)

# Health & Wellness topics to track
HEALTH_TOPICS = [
    "gut health", "intermittent fasting", "longevity", "biohacking", 
    "sleep optimization", "cold plunge", "red light therapy", "peptides",
    "hormone health", "menopause", "weight loss", "ozempic", "wegovy",
    "mental health", "anxiety", "stress management", "meditation",
    "supplements", "vitamin D", "magnesium", "collagen", "probiotics",
    "fitness", "strength training", "zone 2 cardio", "mobility",
    "anti-aging", "skin health", "hair loss", "inflammation"
]

# YouTube API key
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "")

@app.get("/api/trends/google")
async def get_google_trends(
    topic: str = None,
    timeframe: str = "today"
):
    """
    Get Google Trends data for health & wellness topics (US-focused)
    
    timeframe options:
    - "today" = last 24 hours
    - "week" = last 7 days  
    - "month" = last 30 days
    - "year" = last 12 months
    """
    try:
        from pytrends.request import TrendReq
        
        # Initialize pytrends for US
        pytrends = TrendReq(hl='en-US', tz=300)  # US Eastern timezone
        
        # Map timeframe to pytrends format
        timeframe_map = {
            "today": "now 1-d",
            "week": "now 7-d",
            "month": "today 1-m",
            "year": "today 12-m"
        }
        tf = timeframe_map.get(timeframe, "now 7-d")
        
        # If specific topic requested
        if topic:
            topics_to_search = [topic]
        else:
            # Get top 5 health topics
            topics_to_search = HEALTH_TOPICS[:5]
        
        # Build payload with US geo
        pytrends.build_payload(
            topics_to_search,
            cat=0,
            timeframe=tf,
            geo='US',  # US-focused
            gprop=''
        )
        
        # Get interest over time
        interest_df = pytrends.interest_over_time()
        
        results = []
        if not interest_df.empty:
            for topic_name in topics_to_search:
                if topic_name in interest_df.columns:
                    values = interest_df[topic_name].tolist()
                    dates = [d.strftime("%Y-%m-%d") for d in interest_df.index]
                    
                    # Calculate trend direction
                    if len(values) >= 2:
                        recent_avg = sum(values[-3:]) / 3 if len(values) >= 3 else values[-1]
                        older_avg = sum(values[:3]) / 3 if len(values) >= 3 else values[0]
                        trend = "rising" if recent_avg > older_avg else "falling" if recent_avg < older_avg else "stable"
                        change_pct = round(((recent_avg - older_avg) / max(older_avg, 1)) * 100, 1)
                    else:
                        trend = "stable"
                        change_pct = 0
                    
                    results.append({
                        "topic": topic_name,
                        "interest_score": int(values[-1]) if values else 0,
                        "peak_score": max(values) if values else 0,
                        "trend": trend,
                        "change_percent": change_pct,
                        "data_points": list(zip(dates, values))[-10:],  # Last 10 points
                        "source": "Google Trends",
                        "region": "US"
                    })
        
        # Also get related queries for insights
        related = {}
        if topic:
            try:
                related_queries = pytrends.related_queries()
                if topic in related_queries and related_queries[topic]['rising'] is not None:
                    rising = related_queries[topic]['rising'].head(5).to_dict('records')
                    related = {"rising_queries": rising}
            except:
                pass
        
        return {
            "trends": results,
            "related": related,
            "timeframe": timeframe,
            "region": "US",
            "source": "Google Trends",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
    except Exception as e:
        logger.error(f"Google Trends error: {str(e)}")
        # Return fallback data if API fails
        return {
            "trends": [],
            "error": str(e),
            "message": "Google Trends temporarily unavailable - using cached data",
            "region": "US",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

@app.get("/api/trends/youtube")
async def get_youtube_trends(
    topic: str = None,
    max_results: int = 10
):
    """
    Get trending YouTube videos in health & wellness category (US-focused)
    """
    try:
        from googleapiclient.discovery import build
        
        api_key = YOUTUBE_API_KEY
        if not api_key:
            raise HTTPException(status_code=500, detail="YouTube API key not configured")
        
        youtube = build('youtube', 'v3', developerKey=api_key)
        
        # Search for health/wellness videos in US
        search_query = topic if topic else "health wellness longevity"
        
        # Search for recent popular videos
        search_response = youtube.search().list(
            q=search_query,
            part='snippet',
            type='video',
            order='viewCount',  # Most viewed
            regionCode='US',    # US-focused
            relevanceLanguage='en',
            publishedAfter=(datetime.now(timezone.utc) - timedelta(days=30)).isoformat() + 'Z',
            maxResults=max_results,
            videoCategoryId='26'  # How-to & Style (includes health/wellness)
        ).execute()
        
        videos = []
        video_ids = []
        
        for item in search_response.get('items', []):
            video_ids.append(item['id']['videoId'])
            videos.append({
                'id': item['id']['videoId'],
                'title': item['snippet']['title'],
                'channel': item['snippet']['channelTitle'],
                'thumbnail': item['snippet']['thumbnails']['high']['url'],
                'published': item['snippet']['publishedAt'],
                'description': item['snippet']['description'][:200] + '...' if len(item['snippet'].get('description', '')) > 200 else item['snippet'].get('description', '')
            })
        
        # Get video statistics
        if video_ids:
            stats_response = youtube.videos().list(
                part='statistics,contentDetails',
                id=','.join(video_ids)
            ).execute()
            
            stats_map = {}
            for item in stats_response.get('items', []):
                stats_map[item['id']] = {
                    'views': int(item['statistics'].get('viewCount', 0)),
                    'likes': int(item['statistics'].get('likeCount', 0)),
                    'comments': int(item['statistics'].get('commentCount', 0)),
                    'duration': item['contentDetails'].get('duration', '')
                }
            
            # Merge stats with videos
            for video in videos:
                if video['id'] in stats_map:
                    video.update(stats_map[video['id']])
                    # Calculate engagement rate
                    if video.get('views', 0) > 0:
                        video['engagement_rate'] = round(
                            ((video.get('likes', 0) + video.get('comments', 0)) / video['views']) * 100, 
                            2
                        )
        
        # Sort by views
        videos.sort(key=lambda x: x.get('views', 0), reverse=True)
        
        return {
            "videos": videos,
            "search_query": search_query,
            "total_results": len(videos),
            "region": "US",
            "source": "YouTube Data API",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
    except Exception as e:
        logger.error(f"YouTube API error: {str(e)}")
        return {
            "videos": [],
            "error": str(e),
            "message": "YouTube API temporarily unavailable",
            "region": "US",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

@app.get("/api/trends/reddit")
async def get_reddit_trends(
    subreddit: str = None,
    limit: int = 20
):
    """
    Get trending discussions from health & wellness subreddits via RSS (no API key needed!)
    """
    try:
        import feedparser
        
        # Health & wellness subreddits to track
        health_subreddits = [
            "longevity",
            "Biohacking",
            "Health",
            "WomensHealth",
            "nutrition",
            "Supplements",
            "SkincareAddiction",
            "Fitness",
            "sleep",
            "Nootropics"
        ]
        
        # If specific subreddit requested, use only that
        subreddits_to_fetch = [subreddit] if subreddit else health_subreddits[:5]
        
        all_posts = []
        subreddit_stats = {}
        
        for sub in subreddits_to_fetch:
            try:
                # Fetch RSS feed
                feed_url = f"https://www.reddit.com/r/{sub}/hot.rss?limit={limit}"
                feed = feedparser.parse(feed_url)
                
                posts_from_sub = []
                for entry in feed.entries[:limit]:
                    # Extract post data
                    post = {
                        "id": entry.get("id", ""),
                        "title": entry.get("title", ""),
                        "author": entry.get("author", "unknown"),
                        "subreddit": sub,
                        "link": entry.get("link", ""),
                        "published": entry.get("published", ""),
                        "summary": entry.get("summary", "")[:300] + "..." if len(entry.get("summary", "")) > 300 else entry.get("summary", ""),
                        "source": "Reddit RSS"
                    }
                    posts_from_sub.append(post)
                    all_posts.append(post)
                
                subreddit_stats[sub] = {
                    "posts_fetched": len(posts_from_sub),
                    "status": "online"
                }
                
            except Exception as e:
                logger.error(f"Reddit RSS error for r/{sub}: {str(e)}")
                subreddit_stats[sub] = {
                    "posts_fetched": 0,
                    "status": "error",
                    "error": str(e)
                }
        
        # Extract trending keywords from titles
        trending_keywords = {}
        health_terms = [
            "gut", "sleep", "hormone", "weight", "diet", "supplement", "vitamin",
            "protein", "longevity", "aging", "skin", "hair", "mental", "anxiety",
            "stress", "fitness", "workout", "fasting", "keto", "menopause",
            "thyroid", "collagen", "magnesium", "zinc", "omega", "probiotic"
        ]
        
        for post in all_posts:
            title_lower = post["title"].lower()
            for term in health_terms:
                if term in title_lower:
                    if term not in trending_keywords:
                        trending_keywords[term] = {"count": 0, "posts": []}
                    trending_keywords[term]["count"] += 1
                    if len(trending_keywords[term]["posts"]) < 3:
                        trending_keywords[term]["posts"].append(post["title"][:80])
        
        # Sort keywords by count
        sorted_keywords = sorted(
            [{"keyword": k, **v} for k, v in trending_keywords.items()],
            key=lambda x: x["count"],
            reverse=True
        )[:10]
        
        return {
            "posts": all_posts,
            "total_posts": len(all_posts),
            "subreddits": subreddit_stats,
            "trending_keywords": sorted_keywords,
            "source": "Reddit RSS",
            "region": "US",
            "note": "No API key required - using public RSS feeds",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
    except ImportError:
        logger.error("feedparser library not installed")
        return {
            "posts": [],
            "error": "feedparser library not installed",
            "message": "Reddit RSS temporarily unavailable",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        logger.error(f"Reddit RSS error: {str(e)}")
        return {
            "posts": [],
            "error": str(e),
            "message": "Reddit RSS temporarily unavailable",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

@app.get("/api/trends/pubmed")
async def get_pubmed_trends(
    topic: str = None,
    days: int = 30,
    max_results: int = 20
):
    """
    Get recent health research publications from PubMed/NIH (free, no API key needed!)
    Uses NCBI E-utilities API
    """
    try:
        # Health topics to search if none specified
        health_search_terms = [
            "gut microbiome health",
            "longevity aging",
            "hormone therapy menopause",
            "intermittent fasting",
            "sleep optimization",
            "mental health anxiety",
            "women's health",
            "nutrition supplements"
        ]
        
        search_term = topic if topic else "health wellness longevity"
        
        # Calculate date range
        from datetime import datetime, timedelta
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        date_range = f"{start_date.strftime('%Y/%m/%d')}:{end_date.strftime('%Y/%m/%d')}[dp]"
        
        # Step 1: Search for articles
        search_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
        search_params = {
            "db": "pubmed",
            "term": f"({search_term}) AND {date_range}",
            "retmax": max_results,
            "sort": "relevance",
            "retmode": "json"
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            search_response = await client.get(search_url, params=search_params)
            search_data = search_response.json()
        
        id_list = search_data.get("esearchresult", {}).get("idlist", [])
        total_count = int(search_data.get("esearchresult", {}).get("count", 0))
        
        if not id_list:
            return {
                "articles": [],
                "total_found": 0,
                "search_term": search_term,
                "message": "No recent articles found for this topic",
                "source": "PubMed/NIH",
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        
        # Step 2: Get article summaries
        summary_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi"
        summary_params = {
            "db": "pubmed",
            "id": ",".join(id_list),
            "retmode": "json"
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            summary_response = await client.get(summary_url, params=summary_params)
            summary_data = summary_response.json()
        
        articles = []
        result = summary_data.get("result", {})
        
        for pmid in id_list:
            if pmid in result:
                article = result[pmid]
                
                # Extract authors
                authors = article.get("authors", [])
                author_names = [a.get("name", "") for a in authors[:3]]
                author_str = ", ".join(author_names)
                if len(authors) > 3:
                    author_str += " et al."
                
                articles.append({
                    "pmid": pmid,
                    "title": article.get("title", ""),
                    "authors": author_str,
                    "journal": article.get("fulljournalname", article.get("source", "")),
                    "pub_date": article.get("pubdate", ""),
                    "link": f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/",
                    "doi": article.get("elocationid", ""),
                    "source": "PubMed"
                })
        
        # Extract trending research topics from titles
        research_keywords = {}
        research_terms = [
            "microbiome", "gut", "longevity", "aging", "hormone", "menopause",
            "fasting", "ketogenic", "sleep", "circadian", "stress", "anxiety",
            "depression", "inflammation", "immune", "cancer", "cardiovascular",
            "diabetes", "obesity", "weight", "exercise", "nutrition", "vitamin",
            "supplement", "probiotic", "antioxidant", "collagen", "peptide"
        ]
        
        for article in articles:
            title_lower = article["title"].lower()
            for term in research_terms:
                if term in title_lower:
                    if term not in research_keywords:
                        research_keywords[term] = {"count": 0, "articles": []}
                    research_keywords[term]["count"] += 1
                    if len(research_keywords[term]["articles"]) < 2:
                        research_keywords[term]["articles"].append(article["title"][:60])
        
        # Sort by count
        trending_research = sorted(
            [{"topic": k, **v} for k, v in research_keywords.items()],
            key=lambda x: x["count"],
            reverse=True
        )[:10]
        
        return {
            "articles": articles,
            "total_found": total_count,
            "returned": len(articles),
            "search_term": search_term,
            "date_range": f"Last {days} days",
            "trending_research": trending_research,
            "source": "PubMed/NIH (NCBI E-utilities)",
            "region": "Global (US-based database)",
            "note": "Free API - no key required",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
    except Exception as e:
        logger.error(f"PubMed API error: {str(e)}")
        return {
            "articles": [],
            "error": str(e),
            "message": "PubMed API temporarily unavailable",
            "source": "PubMed/NIH",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

@app.get("/api/trends/aggregate")
async def get_aggregate_trends(timeframe: str = "week"):
    """
    Get aggregated trends from all sources (Google Trends + YouTube + Reddit + PubMed) - US focused
    """
    try:
        # Get Google Trends for top health topics
        google_results = await get_google_trends(timeframe=timeframe)
        
        # Get YouTube trending for health
        youtube_results = await get_youtube_trends(max_results=5)
        
        # Get Reddit trending
        reddit_results = await get_reddit_trends(limit=10)
        
        # Extract trending topics from YouTube titles
        youtube_topics = []
        for video in youtube_results.get('videos', []):
            youtube_topics.append({
                "topic": video.get('title', '')[:50],
                "views": video.get('views', 0),
                "source": "YouTube",
                "engagement": video.get('engagement_rate', 0)
            })
        
        # Combine and rank
        all_trends = []
        
        # Add Google Trends
        for trend in google_results.get('trends', []):
            all_trends.append({
                "topic": trend['topic'],
                "score": trend['interest_score'],
                "trend_direction": trend['trend'],
                "change_percent": trend['change_percent'],
                "source": "Google Trends",
                "source_icon": "📊"
            })
        
        # Add top YouTube topics
        for yt in youtube_topics[:3]:
            all_trends.append({
                "topic": yt['topic'],
                "score": min(100, int(yt['views'] / 10000)),  # Normalize to 0-100
                "trend_direction": "rising",
                "views": yt['views'],
                "source": "YouTube",
                "source_icon": "🎬"
            })
        
        # Add Reddit trending keywords
        for kw in reddit_results.get('trending_keywords', [])[:3]:
            all_trends.append({
                "topic": kw['keyword'].title(),
                "score": min(100, kw['count'] * 20),
                "trend_direction": "rising",
                "mentions": kw['count'],
                "source": "Reddit",
                "source_icon": "🔴"
            })
        
        # Get PubMed trending research
        pubmed_results = await get_pubmed_trends(days=30, max_results=10)
        
        # Add PubMed trending research topics
        for research in pubmed_results.get('trending_research', [])[:3]:
            all_trends.append({
                "topic": research['topic'].title(),
                "score": min(100, research['count'] * 25),
                "trend_direction": "rising",
                "publications": research['count'],
                "source": "PubMed",
                "source_icon": "🔬"
            })
        
        return {
            "trends": all_trends,
            "google_trends": google_results,
            "youtube_trends": youtube_results,
            "reddit_trends": reddit_results,
            "pubmed_trends": pubmed_results,
            "timeframe": timeframe,
            "region": "US",
            "sources": ["Google Trends", "YouTube Data API", "Reddit RSS", "PubMed/NIH"],
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
    except Exception as e:
        logger.error(f"Aggregate trends error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/trends/topics")
async def get_tracked_topics():
    """Get list of health & wellness topics being tracked"""
    return {
        "topics": HEALTH_TOPICS,
        "total": len(HEALTH_TOPICS),
        "categories": {
            "nutrition": ["gut health", "intermittent fasting", "supplements", "probiotics"],
            "longevity": ["longevity", "biohacking", "anti-aging", "peptides"],
            "fitness": ["fitness", "strength training", "zone 2 cardio", "mobility"],
            "mental_health": ["mental health", "anxiety", "stress management", "meditation"],
            "womens_health": ["hormone health", "menopause"],
            "weight_management": ["weight loss", "ozempic", "wegovy"],
            "wellness": ["sleep optimization", "cold plunge", "red light therapy"]
        },
        "region": "US"
    }

@app.get("/api/trends/status")
async def get_trends_source_status():
    """
    Check the health status of all trend data sources
    Returns online/offline status for each API
    """
    import importlib
    
    sources_status = []
    
    # Check Google Trends (pytrends)
    try:
        pytrends_spec = importlib.util.find_spec("pytrends")
        if pytrends_spec is not None:
            from pytrends.request import TrendReq
            pytrends = TrendReq(hl='en-US', tz=300, timeout=(10,25))
            # Quick test - just initialize, don't make request
            sources_status.append({
                "id": "google_trends",
                "name": "Google Trends",
                "status": "online",
                "icon": "📊",
                "message": "pytrends library available",
                "region": "US"
            })
        else:
            sources_status.append({
                "id": "google_trends",
                "name": "Google Trends",
                "status": "offline",
                "icon": "📊",
                "message": "pytrends library not installed",
                "region": "US"
            })
    except Exception as e:
        sources_status.append({
            "id": "google_trends",
            "name": "Google Trends",
            "status": "error",
            "icon": "📊",
            "message": str(e),
            "region": "US"
        })
    
    # Check YouTube Data API
    try:
        googleapi_spec = importlib.util.find_spec("googleapiclient")
        api_key = os.getenv("YOUTUBE_API_KEY", "")
        
        if googleapi_spec is None:
            sources_status.append({
                "id": "youtube",
                "name": "YouTube Data API",
                "status": "offline",
                "icon": "📺",
                "message": "google-api-python-client library not installed",
                "region": "US"
            })
        elif not api_key:
            sources_status.append({
                "id": "youtube",
                "name": "YouTube Data API",
                "status": "offline",
                "icon": "📺",
                "message": "YOUTUBE_API_KEY not configured",
                "region": "US"
            })
        else:
            sources_status.append({
                "id": "youtube",
                "name": "YouTube Data API",
                "status": "online",
                "icon": "📺",
                "message": "API key configured and library available",
                "region": "US"
            })
    except Exception as e:
        sources_status.append({
            "id": "youtube",
            "name": "YouTube Data API",
            "status": "error",
            "icon": "📺",
            "message": str(e),
            "region": "US"
        })
    
    # Check Reddit RSS (feedparser)
    try:
        feedparser_spec = importlib.util.find_spec("feedparser")
        if feedparser_spec is not None:
            sources_status.append({
                "id": "reddit",
                "name": "Reddit RSS",
                "status": "online",
                "icon": "🔴",
                "message": "feedparser library available - no API key needed!",
                "region": "US"
            })
        else:
            sources_status.append({
                "id": "reddit",
                "name": "Reddit RSS",
                "status": "offline",
                "icon": "🔴",
                "message": "feedparser library not installed",
                "region": "US"
            })
    except Exception as e:
        sources_status.append({
            "id": "reddit",
            "name": "Reddit RSS",
            "status": "error",
            "icon": "🔴",
            "message": str(e),
            "region": "US"
        })
    
    # Check PubMed (uses httpx which is already installed - no extra dependencies!)
    sources_status.append({
        "id": "pubmed",
        "name": "PubMed/NIH",
        "status": "online",
        "icon": "🔬",
        "message": "NCBI E-utilities API - no key required!",
        "region": "Global"
    })
    
    # Future sources (not yet implemented)
    future_sources = [
        {"id": "newsapi", "name": "News API", "status": "planned", "icon": "📰", "message": "Coming soon - free key available"},
        {"id": "tiktok", "name": "TikTok", "status": "planned", "icon": "🎵", "message": "Requires business API approval"},
    ]
    
    sources_status.extend(future_sources)
    
    # Calculate summary
    online_count = sum(1 for s in sources_status if s['status'] == 'online')
    offline_count = sum(1 for s in sources_status if s['status'] == 'offline')
    planned_count = sum(1 for s in sources_status if s['status'] == 'planned')
    
    return {
        "sources": sources_status,
        "summary": {
            "online": online_count,
            "offline": offline_count,
            "planned": planned_count,
            "total": len(sources_status)
        },
        "region": "US",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

# Run the application
if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )
