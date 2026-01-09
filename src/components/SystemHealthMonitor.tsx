/**
 * System Health Monitor - Apple Glassmorphism + IAJ Logo
 * Frosted glass cards, blue/silver only, NO purple
 */

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Circle,
  CircleDot,
  Clock,
  RefreshCw,
  Sparkles,
  ChevronRight,
  Check,
  X,
  ArrowUpRight,
  Minus
} from 'lucide-react';

// Import IAJ Logo
import logo from '/Assets/IAJ Orange White copy.png';

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
// STYLES - Blue/Silver Only, NO Purple
// ============================================

const styles = {
  // Light blue gradient background only
  gradientBg: {
    background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 30%, #e0f2fe 60%, #f0f9ff 100%)',
  },
  
  // Main glass card
  glassCard: {
    background: 'rgba(255, 255, 255, 0.75)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
  },
  
  // Inner glass cards
  glassCardInner: {
    background: 'rgba(255, 255, 255, 0.6)',
    backdropFilter: 'blur(10px) saturate(150%)',
    WebkitBackdropFilter: 'blur(10px) saturate(150%)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  },
  
  // Glass button
  glassButton: {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.4)',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
  },
  
  // Blue glass button
  glassButtonBlue: {
    background: 'rgba(0, 122, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(0, 122, 255, 0.3)',
    boxShadow: '0 4px 20px rgba(0, 122, 255, 0.25)',
  },
  
  // Icon container
  glassIcon: {
    background: 'rgba(0, 122, 255, 0.08)',
    border: '1px solid rgba(0, 122, 255, 0.1)',
  },
  
  // Logo filter: orange to blue
  logoFilter: {
    filter: 'hue-rotate(190deg) saturate(0.8) brightness(1.1)',
    height: '40px',
    width: 'auto',
  },
};

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

  const API_URL = 'https://management-hub-production-80d6.up.railway.app';

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
      setError(err instanceof Error ? err.message : 'Failed to fetch');
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
    } catch (_err) {
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
        showToast('Done');
      }
    } catch (_err) {
      showToast('Failed');
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
    } catch (_err) {
      showToast('Failed');
    }
  };

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

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  const getOperationalCount = (): { healthy: number; total: number } => {
    if (!healthData) return { healthy: 0, total: 0 };
    const systems = Object.values(healthData.systems);
    const healthy = systems.filter(s => s.status === 'healthy').length;
    return { healthy, total: systems.length };
  };

  const formatLastUpdate = (): string => {
    const diff = Math.floor((Date.now() - lastUpdate.getTime()) / 1000);
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
  // RENDER - LOADING
  // ============================================

  if (loading) {
    return (
      <div className="rounded-[32px] p-8 mb-8" style={styles.gradientBg}>
        <div className="rounded-[24px] p-8" style={styles.glassCard}>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-5 h-5 animate-spin mr-3" style={{ color: '#007AFF' }} />
            <span className="font-medium" style={{ color: '#1D1D1F' }}>Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER - ERROR
  // ============================================

  if (error) {
    return (
      <div className="rounded-[32px] p-8 mb-8" style={styles.gradientBg}>
        <div className="rounded-[24px] p-8" style={styles.glassCard}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={styles.glassIcon}>
                <Minus className="w-6 h-6" style={{ color: '#007AFF' }} />
              </div>
              <div>
                <h3 className="text-lg font-semibold" style={{ color: '#1D1D1F' }}>Connection Error</h3>
                <p className="text-sm mt-0.5" style={{ color: '#6B7280' }}>Unable to reach Management Hub</p>
              </div>
            </div>
            <button
              onClick={() => { fetchHealthData(); fetchRecommendations(); }}
              className="px-5 py-2.5 rounded-full text-sm font-medium text-white transition-all hover:scale-105"
              style={styles.glassButtonBlue}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { healthy, total } = getOperationalCount();
  const displayRecs = recommendations.length > 0 ? recommendations : getSampleRecommendations();

  // ============================================
  // RENDER - MAIN
  // ============================================

  return (
    <>
      {/* Toast */}
      {toast && (
        <div 
          className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl text-sm font-medium"
          style={{
            ...styles.glassCard,
            color: '#1D1D1F',
          }}
        >
          {toast}
        </div>
      )}

      {/* Container with gradient background */}
      <div className="rounded-[32px] p-8 mb-8" style={styles.gradientBg}>
        
        {/* Main Glass Card */}
        <div className="rounded-[24px]" style={styles.glassCard}>
          <div className="p-8">
            
            {/* Header with IAJ Logo */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-6">
                {/* IAJ Logo - filtered to blue */}
                <img 
                  src={logo} 
                  alt="It's a Jungle" 
                  style={styles.logoFilter}
                />
                
                {/* Divider */}
                <div className="w-px h-10" style={{ background: 'rgba(0, 122, 255, 0.15)' }} />
                
                {/* System Health Title */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={styles.glassIcon}>
                    <Activity className="w-5 h-5" style={{ color: '#007AFF' }} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight" style={{ color: '#1D1D1F' }}>
                      System Health
                    </h2>
                    <p className="text-xs" style={{ color: '#6B7280' }}>
                      Real-time monitoring
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Status Badge */}
              <div 
                className="flex items-center gap-3 px-5 py-3 rounded-2xl"
                style={styles.glassCardInner}
              >
                <CircleDot className="w-5 h-5" style={{ color: '#007AFF' }} />
                <div className="text-right">
                  <div className="text-2xl font-semibold" style={{ color: '#007AFF' }}>
                    {healthy}/{total}
                  </div>
                  <p className="text-xs font-medium" style={{ color: '#6B7280' }}>operational</p>
                </div>
              </div>
            </div>

            {/* Systems Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
              {healthData && Object.entries(healthData.systems).map(([key, system]) => (
                <div
                  key={key}
                  className="rounded-2xl p-4 transition-all duration-300 hover:scale-[1.03] hover:shadow-lg cursor-default"
                  style={styles.glassCardInner}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-2">
                      {system.status === 'healthy' ? (
                        <Circle className="w-5 h-5" style={{ color: '#007AFF', fill: '#007AFF' }} />
                      ) : (
                        <Circle className="w-5 h-5" style={{ color: '#9CA3AF' }} />
                      )}
                    </div>
                    <p className="font-semibold text-xs truncate w-full" style={{ color: '#1D1D1F' }}>
                      {system.name}
                    </p>
                    <p 
                      className="text-xs mt-1 font-medium" 
                      style={{ color: system.status === 'healthy' ? '#007AFF' : '#9CA3AF' }}
                    >
                      {system.status === 'healthy' && system.response_time_ms
                        ? `${Math.round(system.response_time_ms)}ms`
                        : system.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div 
              className="h-px my-6" 
              style={{ background: 'linear-gradient(to right, transparent, rgba(0, 122, 255, 0.15), transparent)' }} 
            />

            {/* AI Insights */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={styles.glassIcon}>
                    <Sparkles className="w-5 h-5" style={{ color: '#007AFF' }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold" style={{ color: '#1D1D1F' }}>AI Insights</h3>
                    <p className="text-xs" style={{ color: '#6B7280' }}>{displayRecs.length} recommendations</p>
                  </div>
                </div>
                <button
                  onClick={generateRecommendations}
                  disabled={generating}
                  className="px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all hover:scale-105 disabled:opacity-60 disabled:hover:scale-100 flex items-center gap-2"
                  style={styles.glassButtonBlue}
                >
                  {generating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate
                    </>
                  )}
                </button>
              </div>

              {/* Recommendations */}
              <div className="space-y-3">
                {displayRecs.map((rec) => (
                  <div
                    key={rec.id}
                    className="rounded-2xl p-5 transition-all duration-300 hover:shadow-lg"
                    style={styles.glassCardInner}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={styles.glassIcon}
                        >
                          <ChevronRight className="w-5 h-5" style={{ color: '#007AFF' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span 
                              className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                              style={{ 
                                background: 'rgba(0, 122, 255, 0.1)',
                                color: '#007AFF'
                              }}
                            >
                              {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)}
                            </span>
                            {rec.type && (
                              <span className="text-xs" style={{ color: '#9CA3AF' }}>
                                {rec.type}
                              </span>
                            )}
                          </div>
                          <h4 className="font-semibold text-sm" style={{ color: '#1D1D1F' }}>{rec.title}</h4>
                          <p className="text-sm mt-1.5 leading-relaxed" style={{ color: '#6B7280' }}>{rec.description}</p>
                          {rec.impact && (
                            <div className="flex items-center gap-1.5 mt-2">
                              <ArrowUpRight className="w-3.5 h-3.5" style={{ color: '#007AFF' }} />
                              <span className="text-xs" style={{ color: '#6B7280' }}>
                                Expected: <span style={{ color: '#007AFF' }} className="font-semibold">{rec.impact}</span>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => markRecommendationDone(rec.id)}
                          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                          style={{
                            ...styles.glassButton,
                            background: 'rgba(0, 122, 255, 0.1)',
                          }}
                          title="Done"
                        >
                          <Check className="w-4 h-4" style={{ color: '#007AFF' }} />
                        </button>
                        <button
                          onClick={() => dismissRecommendation(rec.id)}
                          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                          style={styles.glassButton}
                          title="Dismiss"
                        >
                          <X className="w-4 h-4" style={{ color: '#9CA3AF' }} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div 
              className="flex items-center justify-between mt-6 pt-5" 
              style={{ borderTop: '1px solid rgba(0, 122, 255, 0.08)' }}
            >
              <div className="flex items-center gap-5 text-xs" style={{ color: '#9CA3AF' }}>
                <div className="flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Auto-refresh 30s</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Updated {formatLastUpdate()}</span>
                </div>
              </div>
              <button
                onClick={() => { fetchHealthData(); fetchRecommendations(); }}
                className="px-4 py-2 rounded-full text-xs font-medium transition-all hover:scale-105 flex items-center gap-1.5"
                style={{
                  ...styles.glassButton,
                  color: '#1D1D1F',
                }}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SystemHealthMonitor;
