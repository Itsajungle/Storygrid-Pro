/**
 * System Health Monitor - Apple-Inspired Light Glassmorphism
 * Clean, minimal design with frosted glass cards on light background
 * Inspired by macOS Big Sur, iOS Control Center, Apple Health
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
        showToast('No new insights');
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
    const size = "w-5 h-5";
    switch (status) {
      case 'healthy': return <CheckCircle2 className={`${size} text-[#34C759]`} />;
      case 'unhealthy': return <AlertTriangle className={`${size} text-[#FF9500]`} />;
      case 'timeout': return <Clock className={`${size} text-[#FF9500]`} />;
      case 'error': return <XCircle className={`${size} text-[#FF3B30]`} />;
      default: return <HelpCircle className={`${size} text-[#8E8E93]`} />;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'healthy': return 'text-[#34C759]';
      case 'unhealthy': return 'text-[#FF9500]';
      case 'timeout':
      case 'error': return 'text-[#FF3B30]';
      default: return 'text-[#8E8E93]';
    }
  };

  const getPriorityConfig = (priority: string) => {
    const configs: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
      critical: { 
        icon: <AlertOctagon className="w-4 h-4" />, 
        color: 'text-[#FF3B30]',
        label: 'Critical'
      },
      high: { 
        icon: <Zap className="w-4 h-4" />, 
        color: 'text-[#FF9500]',
        label: 'High'
      },
      medium: { 
        icon: <Lightbulb className="w-4 h-4" />, 
        color: 'text-[#007AFF]',
        label: 'Medium'
      },
      low: { 
        icon: <FileText className="w-4 h-4" />, 
        color: 'text-[#8E8E93]',
        label: 'Low'
      }
    };
    return configs[priority] || configs.medium;
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
      description: 'Analysis suggests shifting to peak engagement hours could improve reach significantly.',
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
  // GLASS CARD STYLES
  // ============================================
  
  const glassCard = "bg-white/70 backdrop-blur-xl backdrop-saturate-150 border border-white/50 shadow-[0_4px_30px_rgba(0,0,0,0.08)] rounded-3xl";
  const glassCardInner = "bg-white/50 backdrop-blur-md border border-white/60 shadow-[0_2px_15px_rgba(0,0,0,0.04)] rounded-2xl";

  // ============================================
  // RENDER
  // ============================================

  if (loading) {
    return (
      <div className="bg-[#F5F5F7] rounded-3xl p-8 mb-8">
        <div className={`${glassCard} p-8`}>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-5 h-5 text-[#007AFF] animate-spin mr-3" />
            <span className="text-[#1D1D1F] font-medium">Loading system health...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#F5F5F7] rounded-3xl p-8 mb-8">
        <div className={`${glassCard} p-8`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-[#FF3B30]/10">
                <AlertTriangle className="w-6 h-6 text-[#FF3B30]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#1D1D1F]">Connection Error</h3>
                <p className="text-[#86868B] text-sm mt-0.5">Unable to reach Management Hub</p>
              </div>
            </div>
            <button
              onClick={() => { fetchHealthData(); fetchRecommendations(); }}
              className="px-5 py-2.5 bg-[#007AFF] hover:bg-[#0056CC] text-white rounded-full transition-all duration-200 flex items-center gap-2 text-sm font-medium shadow-sm"
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
          <div className="bg-[#1D1D1F] text-white px-5 py-3 rounded-full shadow-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#34C759]" />
            <span className="text-sm font-medium">{toast}</span>
          </div>
        </div>
      )}

      {/* Main Container - Light Background */}
      <div className="bg-[#F5F5F7] rounded-3xl p-8 mb-8">
        
        {/* Main Glass Card */}
        <div className={glassCard}>
          <div className="p-8">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-[#007AFF]/20 to-[#5AC8FA]/20">
                  <Activity className="w-6 h-6 text-[#007AFF]" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">
                    System Health
                  </h2>
                  <p className="text-[#86868B] text-sm mt-0.5">Real-time infrastructure monitoring</p>
                </div>
              </div>
              
              {/* Status Badge */}
              <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl ${isAllHealthy ? 'bg-[#34C759]/10' : 'bg-[#FF9500]/10'}`}>
                {isAllHealthy ? (
                  <CheckCircle2 className="w-5 h-5 text-[#34C759]" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-[#FF9500]" />
                )}
                <div className="text-right">
                  <div className={`text-2xl font-semibold tracking-tight ${isAllHealthy ? 'text-[#34C759]' : 'text-[#FF9500]'}`}>
                    {healthy}/{total}
                  </div>
                  <p className="text-[#86868B] text-xs">operational</p>
                </div>
              </div>
            </div>

            {/* Systems Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
              {healthData && Object.entries(healthData.systems).map(([key, system]) => (
                <div
                  key={key}
                  className={`${glassCardInner} p-4 transition-all duration-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:scale-[1.02] cursor-default`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-3">
                      {getStatusIcon(system.status)}
                    </div>
                    <p className="text-[#1D1D1F] font-medium text-sm truncate w-full">{system.name}</p>
                    <p className={`text-xs mt-1 font-medium ${getStatusColor(system.status)}`}>
                      {system.status === 'healthy' && system.response_time_ms
                        ? `${Math.round(system.response_time_ms)}ms`
                        : system.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-[#D1D1D6] to-transparent my-8" />

            {/* AI Recommendations Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#5856D6]/20 to-[#AF52DE]/20">
                    <Sparkles className="w-5 h-5 text-[#5856D6]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#1D1D1F]">AI Insights</h3>
                    <p className="text-[#86868B] text-xs">{displayRecs.length} recommendations</p>
                  </div>
                </div>
                <button
                  onClick={generateRecommendations}
                  disabled={generating}
                  className="px-5 py-2.5 bg-[#007AFF] hover:bg-[#0056CC] disabled:bg-[#007AFF]/50 text-white rounded-full transition-all duration-200 text-sm font-medium flex items-center gap-2 shadow-sm disabled:cursor-not-allowed"
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
                      className={`${glassCardInner} p-5 transition-all duration-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)]`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className={`p-2 rounded-xl bg-[#F5F5F7] ${config.color}`}>
                            {config.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs font-semibold ${config.color}`}>
                                {config.label}
                              </span>
                              {rec.type && (
                                <span className="text-xs text-[#86868B]">• {rec.type}</span>
                              )}
                            </div>
                            <h4 className="font-semibold text-[#1D1D1F] text-sm">{rec.title}</h4>
                            <p className="text-[#86868B] text-sm mt-1 leading-relaxed">{rec.description}</p>
                            {rec.impact && (
                              <div className="flex items-center gap-1.5 mt-2 text-xs text-[#86868B]">
                                <TrendingUp className="w-3.5 h-3.5 text-[#34C759]" />
                                <span>Expected: <span className="text-[#1D1D1F] font-medium">{rec.impact}</span></span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => markRecommendationDone(rec.id)}
                            className="p-2.5 bg-[#34C759]/10 hover:bg-[#34C759]/20 text-[#34C759] rounded-xl transition-all duration-200"
                            title="Mark as done"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => dismissRecommendation(rec.id)}
                            className="p-2.5 bg-[#F5F5F7] hover:bg-[#E5E5EA] text-[#86868B] rounded-xl transition-all duration-200"
                            title="Dismiss"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#D1D1D6]/50">
              <div className="flex items-center gap-6 text-xs text-[#86868B]">
                <div className="flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Auto-refresh 30s</span>
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
                className="px-4 py-2 bg-[#F5F5F7] hover:bg-[#E5E5EA] text-[#1D1D1F] rounded-full transition-all duration-200 text-xs font-medium flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Branding */}
        <div className="text-center mt-6">
          <p className="text-[#86868B] text-sm">
            <span className="text-[#007AFF] font-medium">It's a Jungle</span>
            <span className="mx-2">•</span>
            <span>Infrastructure Monitor</span>
          </p>
        </div>
      </div>
    </>
  );
};

export default SystemHealthMonitor;
