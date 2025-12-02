/**
 * System Health Monitor for Story Grid Pro Content Hub
 * Apple-inspired design with blue/silver glassmorphism
 * Sophisticated, minimal, professional aesthetic
 */

import React, { useState, useEffect } from 'react';
import {
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  Sparkles,
  Lightbulb,
  Zap,
  AlertOctagon,
  FileText,
  Check,
  X,
  TrendingUp,
  Server,
  Cpu,
  Radio,
  HelpCircle
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface SystemHealth {
  name: string;
  status: string;
  response_time_ms: number | null;
  last_check: string;
  priority: string;
}

interface HealthOverview {
  overall_health: string;
  systems: Record<string, SystemHealth>;
  timestamp: string;
  cached?: boolean;
}

interface Recommendation {
  id: string;
  priority: string;
  type?: string;
  title: string;
  description: string;
  impact?: string;
  status?: string;
}

interface RecommendationsResponse {
  recommendations: Recommendation[];
  count: number;
}

// ============================================
// COMPONENT
// ============================================

const SystemHealthMonitor: React.FC = () => {
  const [healthData, setHealthData] = useState<HealthOverview | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_MANAGEMENT_HUB_URL || 'http://localhost:8000';

  // ============================================
  // DATA FETCHING
  // ============================================

  const fetchHealthData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/health/overview`);
      if (!response.ok) throw new Error(`API returned ${response.status}`);
      const data: HealthOverview = await response.json();
      setHealthData(data);
      setError(null);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch health data');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await fetch(`${API_URL}/api/recommendations`);
      if (!response.ok) throw new Error(`API returned ${response.status}`);
      const data: RecommendationsResponse = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (err) {
      console.error('Recommendations fetch error:', err);
    }
  };

  const generateRecommendations = async () => {
    setGenerating(true);
    try {
      const response = await fetch(`${API_URL}/api/recommendations/generate`, { method: 'POST' });
      if (response.ok) {
        showToast('Analysis complete');
        await fetchRecommendations();
      } else {
        showToast('No new insights found');
      }
    } catch (err) {
      showToast('Analysis failed');
    } finally {
      setGenerating(false);
    }
  };

  const markRecommendationDone = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/api/recommendations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' })
      });
      if (response.ok) {
        setRecommendations(prev => prev.filter(r => r.id !== id));
        showToast('Marked complete');
      }
    } catch (err) {
      showToast('Update failed');
    }
  };

  const dismissRecommendation = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/api/recommendations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'dismissed' })
      });
      if (response.ok) {
        setRecommendations(prev => prev.filter(r => r.id !== id));
        showToast('Dismissed');
      }
    } catch (err) {
      showToast('Dismiss failed');
    }
  };

  // ============================================
  // EFFECTS
  // ============================================

  useEffect(() => {
    fetchHealthData();
    fetchRecommendations();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchHealthData();
      fetchRecommendations();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // ============================================
  // HELPERS
  // ============================================

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const getStatusIcon = (status: string) => {
    const iconClass = "w-5 h-5";
    switch (status) {
      case 'healthy': return <CheckCircle2 className={`${iconClass} text-emerald-400`} />;
      case 'unhealthy': return <AlertTriangle className={`${iconClass} text-amber-400`} />;
      case 'timeout': return <Clock className={`${iconClass} text-orange-400`} />;
      case 'error': return <XCircle className={`${iconClass} text-red-400`} />;
      default: return <HelpCircle className={`${iconClass} text-slate-400`} />;
    }
  };

  const getStatusBg = (status: string): string => {
    switch (status) {
      case 'healthy': return 'bg-emerald-500/10 border-emerald-500/20';
      case 'unhealthy': return 'bg-amber-500/10 border-amber-500/20';
      case 'timeout':
      case 'error': return 'bg-red-500/10 border-red-500/20';
      default: return 'bg-slate-500/10 border-slate-500/20';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'healthy': return 'text-emerald-400';
      case 'unhealthy': return 'text-amber-400';
      case 'timeout':
      case 'error': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getPriorityConfig = (priority: string) => {
    const configs: Record<string, { icon: React.ReactNode; bg: string; text: string; label: string; border: string }> = {
      critical: { 
        icon: <AlertOctagon className="w-5 h-5" />, 
        bg: 'bg-red-500/10', 
        text: 'text-red-400', 
        label: 'Critical',
        border: 'border-red-500/20'
      },
      high: { 
        icon: <Zap className="w-5 h-5" />, 
        bg: 'bg-orange-500/10', 
        text: 'text-orange-400', 
        label: 'High',
        border: 'border-orange-500/20'
      },
      medium: { 
        icon: <Lightbulb className="w-5 h-5" />, 
        bg: 'bg-blue-500/10', 
        text: 'text-blue-400', 
        label: 'Medium',
        border: 'border-blue-500/20'
      },
      low: { 
        icon: <FileText className="w-5 h-5" />, 
        bg: 'bg-slate-500/10', 
        text: 'text-slate-400', 
        label: 'Low',
        border: 'border-slate-500/20'
      }
    };
    return configs[priority] || configs.medium;
  };

  const getSystemIcon = (key: string) => {
    const iconClass = "w-4 h-4 text-slate-400";
    if (key.includes('social') || key.includes('studio')) return <Radio className={iconClass} />;
    if (key.includes('video') || key.includes('processor')) return <Cpu className={iconClass} />;
    return <Server className={iconClass} />;
  };

  const getOperationalCount = (): { healthy: number; total: number } => {
    if (!healthData) return { healthy: 0, total: 0 };
    const systems = Object.values(healthData.systems);
    const healthy = systems.filter(s => s.status === 'healthy').length;
    return { healthy, total: systems.length };
  };

  const formatLastUpdate = (): string => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
    if (diff < 5) return 'just now';
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  const getSampleRecommendations = (): Recommendation[] => [
    {
      id: 'sample-1',
      priority: 'high',
      type: 'optimization',
      title: 'Optimize posting schedule',
      description: 'Analysis suggests shifting to peak engagement hours could improve reach.',
      impact: '+40% engagement'
    },
    {
      id: 'sample-2',
      priority: 'medium',
      type: 'workflow',
      title: 'Review content pipeline',
      description: 'Average processing time has increased. Consider workflow optimization.',
      impact: 'Faster turnaround'
    }
  ];

  // ============================================
  // RENDER
  // ============================================

  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-3xl mb-8">
        {/* Glass background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/80 to-slate-900/80 backdrop-blur-xl" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5" />
        <div className="absolute inset-[1px] rounded-3xl border border-white/10" />
        
        <div className="relative p-8">
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 text-blue-400 animate-spin mr-3" />
            <span className="text-slate-400 font-medium">Loading system health...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative overflow-hidden rounded-3xl mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/80 to-slate-900/80 backdrop-blur-xl" />
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-orange-500/5" />
        <div className="absolute inset-[1px] rounded-3xl border border-red-500/20" />
        
        <div className="relative p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Connection Error</h3>
                <p className="text-slate-400 text-sm mt-0.5">Unable to reach Management Hub</p>
                <p className="text-red-400/70 text-xs mt-1 font-mono">{error}</p>
              </div>
            </div>
            <button
              onClick={() => { fetchHealthData(); fetchRecommendations(); }}
              className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white rounded-xl transition-all duration-300 flex items-center gap-2 text-sm font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { healthy, total } = getOperationalCount();
  const isAllHealthy = healthy === total;
  const displayRecs = recommendations.length > 0 ? recommendations : getSampleRecommendations();

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-slate-800/90 backdrop-blur-xl border border-white/10 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium">{toast}</span>
          </div>
        </div>
      )}

      <div className="relative overflow-hidden rounded-3xl mb-8">
        {/* Multi-layer glass background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-xl" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent" />
        <div className="absolute inset-[1px] rounded-3xl border border-white/[0.08]" />
        
        {/* Content */}
        <div className="relative p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20">
                <Activity className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white tracking-tight" style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}>
                  System Health
                </h2>
                <p className="text-slate-400 text-sm mt-0.5">Real-time infrastructure monitoring</p>
              </div>
            </div>
            
            {/* Status Badge */}
            <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl ${isAllHealthy ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-amber-500/10 border border-amber-500/20'}`}>
              {isAllHealthy ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              )}
              <div className="text-right">
                <div className={`text-2xl font-semibold tracking-tight ${isAllHealthy ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {healthy}/{total}
                </div>
                <p className="text-slate-500 text-xs">operational</p>
              </div>
            </div>
          </div>

          {/* Systems Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
            {healthData && Object.entries(healthData.systems).map(([key, system]) => (
              <div
                key={key}
                className={`group relative overflow-hidden rounded-2xl p-4 transition-all duration-300 border ${getStatusBg(system.status)} hover:scale-[1.02] cursor-default`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-3 p-2 rounded-xl bg-white/5">
                    {getStatusIcon(system.status)}
                  </div>
                  <p className="text-white font-medium text-sm truncate w-full">{system.name}</p>
                  <p className={`text-xs mt-1.5 font-mono ${getStatusText(system.status)}`}>
                    {system.status === 'healthy' && system.response_time_ms
                      ? `${Math.round(system.response_time_ms)}ms`
                      : system.status}
                  </p>
                </div>
                
                {/* Subtle shine effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-8" />

          {/* AI Recommendations Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/20">
                  <Sparkles className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">AI Insights</h3>
                  <p className="text-slate-500 text-xs">{displayRecs.length} active recommendations</p>
                </div>
              </div>
              <button
                onClick={generateRecommendations}
                disabled={generating}
                className="px-4 py-2.5 bg-gradient-to-r from-violet-500/20 to-purple-500/20 hover:from-violet-500/30 hover:to-purple-500/30 border border-violet-500/20 hover:border-violet-500/30 text-white rounded-xl transition-all duration-300 text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Insights</span>
                  </>
                )}
              </button>
            </div>

            {/* Recommendations List */}
            <div className="space-y-3">
              {displayRecs.map((rec) => {
                const config = getPriorityConfig(rec.priority);
                return (
                  <div
                    key={rec.id}
                    className={`group relative overflow-hidden rounded-2xl p-5 border transition-all duration-300 hover:scale-[1.01] ${config.bg} ${config.border}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`p-2.5 rounded-xl ${config.bg} border ${config.border}`}>
                          <span className={config.text}>{config.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${config.bg} ${config.text} border ${config.border}`}>
                              {config.label}
                            </span>
                            {rec.type && (
                              <span className="text-xs text-slate-500 font-medium">{rec.type}</span>
                            )}
                          </div>
                          <h4 className="font-semibold text-white text-sm">{rec.title}</h4>
                          <p className="text-slate-400 text-sm mt-1.5 leading-relaxed">{rec.description}</p>
                          {rec.impact && (
                            <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-500">
                              <TrendingUp className="w-3.5 h-3.5" />
                              <span>Expected: <span className="text-slate-300 font-medium">{rec.impact}</span></span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => markRecommendationDone(rec.id)}
                          className="p-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/30 text-emerald-400 rounded-xl transition-all duration-300"
                          title="Mark as done"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => dismissRecommendation(rec.id)}
                          className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-400 rounded-xl transition-all duration-300"
                          title="Dismiss"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Subtle shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/[0.06]">
            <div className="flex items-center gap-6 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Auto-refresh: 30s</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Updated {formatLastUpdate()}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Powered by Claude</span>
              </div>
            </div>
            <button
              onClick={() => { fetchHealthData(); fetchRecommendations(); }}
              className="px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-400 hover:text-white rounded-xl transition-all duration-300 text-xs font-medium flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Branding - Subtle "It's a Jungle" */}
      <div className="text-center mb-8">
        <p className="text-slate-600 text-sm font-medium tracking-wide" style={{ fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif" }}>
          <span className="text-blue-400/60">It's a Jungle</span>
          <span className="mx-2 text-slate-700">•</span>
          <span>Infrastructure Monitor</span>
        </p>
      </div>
    </>
  );
};

export default SystemHealthMonitor;
