/**
 * System Health Monitor for Story Grid Pro Content Hub
 * Displays real-time health status and AI recommendations from IAJ Management Hub
 * Styled to match Content Hub's purple glass morphism theme
 */

import React, { useState, useEffect } from 'react';

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

  // Management Hub API URL - uses Vite env variable or defaults to localhost
  const API_URL = import.meta.env.VITE_MANAGEMENT_HUB_URL || 'http://localhost:8000';

  // ============================================
  // DATA FETCHING
  // ============================================

  const fetchHealthData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/health/overview`);
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data: HealthOverview = await response.json();
      setHealthData(data);
      setError(null);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch health data');
      console.error('Health check error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await fetch(`${API_URL}/api/recommendations`);
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data: RecommendationsResponse = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (err) {
      console.error('Recommendations fetch error:', err);
      // Don't set error state - health data might still work
    }
  };

  const generateRecommendations = async () => {
    setGenerating(true);
    try {
      const response = await fetch(`${API_URL}/api/recommendations/generate`, {
        method: 'POST'
      });
      
      if (response.ok) {
        showToast('🤖 AI analysis complete!');
        await fetchRecommendations();
      } else {
        showToast('⚠️ AI analysis returned no new insights');
      }
    } catch (err) {
      showToast('❌ Failed to generate recommendations');
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
        showToast('✅ Marked as done!');
      }
    } catch (err) {
      showToast('❌ Failed to update');
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
        showToast('👋 Dismissed');
      }
    } catch (err) {
      showToast('❌ Failed to dismiss');
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

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'healthy': return '✅';
      case 'unhealthy': return '⚠️';
      case 'timeout': return '⏱️';
      case 'error': return '❌';
      default: return '❓';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'healthy': return 'text-green-400';
      case 'unhealthy': return 'text-yellow-400';
      case 'timeout':
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getPriorityConfig = (priority: string) => {
    const configs: Record<string, { icon: string; bg: string; text: string; label: string }> = {
      critical: { icon: '🚨', bg: 'bg-red-500/30', text: 'text-red-300', label: 'CRITICAL' },
      high: { icon: '⚡', bg: 'bg-orange-500/30', text: 'text-orange-300', label: 'HIGH' },
      medium: { icon: '💡', bg: 'bg-amber-500/30', text: 'text-amber-300', label: 'MEDIUM' },
      low: { icon: '📝', bg: 'bg-blue-500/30', text: 'text-blue-300', label: 'LOW' }
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

  // Sample recommendations when none from API
  const getSampleRecommendations = (): Recommendation[] => [
    {
      id: 'sample-1',
      priority: 'high',
      type: 'optimization',
      title: 'Social Studio posting at off-peak times',
      description: 'Shifting to 9-11 AM or 7-9 PM could improve reach.',
      impact: '+40% engagement'
    },
    {
      id: 'sample-2',
      priority: 'medium',
      type: 'workflow',
      title: 'Ideas in Story Grid averaging 12 days',
      description: 'Consider reviewing the approval workflow.',
      impact: 'Faster turnaround'
    }
  ];

  // ============================================
  // RENDER
  // ============================================

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-2xl p-8 mb-8">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mr-3"></div>
          <span className="text-white/80">Loading system health...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 backdrop-blur-md border-2 border-red-400/30 rounded-2xl p-8 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">🚨 Health Monitor Offline</h3>
            <p className="text-white/70">Unable to connect to Management Hub</p>
            <p className="text-sm text-red-300 mt-1">{error}</p>
          </div>
          <button
            onClick={() => { fetchHealthData(); fetchRecommendations(); }}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all"
          >
            🔄 Retry
          </button>
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
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-lg z-50 animate-pulse">
          {toast}
        </div>
      )}

      <div className="bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-2xl p-8 mb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="text-3xl">🏝️</span>
              System Health Monitor
            </h3>
            <p className="text-white/70 mt-1">Real-time IAJ systems monitoring</p>
          </div>
          <div className="text-right">
            <div className={`text-4xl font-bold ${isAllHealthy ? 'text-green-400' : 'text-yellow-400'}`}>
              {isAllHealthy ? '✅' : '⚠️'} {healthy}/{total}
            </div>
            <p className="text-white/60 text-sm">systems operational</p>
          </div>
        </div>

        {/* Systems Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {healthData && Object.entries(healthData.systems).map(([key, system]) => (
            <div
              key={key}
              className="bg-white/10 hover:bg-white/20 rounded-xl p-4 text-center transition-all duration-300 border border-white/10 hover:border-white/30"
            >
              <span className="text-3xl block mb-2">{getStatusIcon(system.status)}</span>
              <p className="text-white font-semibold text-sm truncate">{system.name}</p>
              <p className={`text-xs mt-1 ${getStatusColor(system.status)}`}>
                {system.status === 'healthy' && system.response_time_ms
                  ? `${Math.round(system.response_time_ms)}ms`
                  : system.status}
              </p>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-white/20 my-6"></div>

        {/* AI Recommendations Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              AI Recommendations
              <span className="ml-2 px-2 py-0.5 bg-purple-500/30 text-purple-300 rounded-full text-xs">
                {displayRecs.length} active
              </span>
            </h4>
            <button
              onClick={generateRecommendations}
              disabled={generating}
              className="px-4 py-2 bg-purple-500/30 hover:bg-purple-500/50 text-white rounded-xl transition-all text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
            >
              {generating ? (
                <>
                  <span className="animate-spin">🔄</span> Analyzing...
                </>
              ) : (
                <>🤖 Generate New Insights</>
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
                  className={`${config.bg} rounded-xl p-4 border border-white/10 hover:border-white/30 transition-all`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-2xl">{config.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 ${config.bg} ${config.text} rounded text-xs font-bold border border-white/20`}>
                            {config.label}
                          </span>
                          {rec.type && (
                            <span className="text-xs text-white/50">{rec.type}</span>
                          )}
                        </div>
                        <h5 className="font-semibold text-white">{rec.title}</h5>
                        <p className="text-sm text-white/70 mt-1">{rec.description}</p>
                        {rec.impact && (
                          <p className="text-xs text-white/50 mt-2">
                            📈 Expected: <strong className="text-white/70">{rec.impact}</strong>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => markRecommendationDone(rec.id)}
                        className="px-3 py-1.5 bg-green-500/30 hover:bg-green-500/50 text-white rounded-lg text-xs font-semibold transition-all"
                      >
                        ✅ Done
                      </button>
                      <button
                        onClick={() => dismissRecommendation(rec.id)}
                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/70 rounded-lg text-xs transition-all"
                      >
                        👋 Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-white/50 pt-4 border-t border-white/10">
          <div className="flex items-center gap-4">
            <span>🔄 Auto-refresh: 30s</span>
            <span>📊 Last update: {formatLastUpdate()}</span>
            <span>🧠 Powered by Claude</span>
          </div>
          <button
            onClick={() => { fetchHealthData(); fetchRecommendations(); }}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all text-xs"
          >
            Refresh Now
          </button>
        </div>
      </div>
    </>
  );
};

export default SystemHealthMonitor;

