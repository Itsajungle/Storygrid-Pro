/**
 * Content Hub - Modern Blue Design
 * Sophisticated blue gradient with glassmorphism
 * Floating decorative elements and premium animations
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Activity,
  RefreshCw,
  ArrowUpRight,
  ExternalLink,
  Check,
  X
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
// COLOR PALETTE
// ============================================

const colors = [
  '#105c8a',
  '#1a7ab3',
  '#2d5a7b',
  '#0d4a6e',
  '#1a6891',
  '#15527a'
];

// ============================================
// COMPONENT
// ============================================

const ContentHub = () => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [hoveredApp, setHoveredApp] = useState<number | null>(null);
  
  // Health & Recommendations State
  const [healthData, setHealthData] = useState<HealthOverview | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

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
    } catch (err) {
      console.error('Health fetch error:', err);
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
        await fetchRecommendations();
      }
    } catch (err) {
      console.error('Generate error:', err);
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
      }
    } catch (err) {
      console.error('Mark done error:', err);
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
      }
    } catch (err) {
      console.error('Dismiss error:', err);
    }
  };

  useEffect(() => {
    setMounted(true);
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
  // COMPUTED VALUES
  // ============================================

  const getOperationalCount = (): { healthy: number; total: number } => {
    if (!healthData) return { healthy: 0, total: 0 };
    const systems = Object.values(healthData.systems);
    const healthy = systems.filter(s => s.status === 'healthy').length;
    return { healthy, total: systems.length };
  };

  const getSampleRecommendations = (): Recommendation[] => [
    {
      id: 'sample-1',
      priority: 'high',
      type: 'optimization',
      title: 'Optimize posting schedule',
      description: 'Analysis suggests shifting to peak engagement hours could improve reach by 40%.',
      impact: '+40% engagement'
    },
    {
      id: 'sample-2',
      priority: 'medium',
      type: 'workflow',
      title: 'Review content pipeline',
      description: 'Average processing time has increased. Consider workflow optimization for faster turnaround.',
      impact: 'Faster turnaround'
    }
  ];

  const { healthy, total } = getOperationalCount();
  const displayRecs = recommendations.length > 0 ? recommendations : getSampleRecommendations();

  // ============================================
  // APP DATA
  // ============================================

  const apps = [
    {
      title: 'AI Agent Training',
      description: 'Train and configure AI agents for content analysis',
      link: 'https://web-production-29982.up.railway.app/api/agent-training',
      external: true
    },
    {
      title: 'Trending',
      description: 'Health & wellness trends with time filters and YouTube insights',
      link: '/trending',
      external: false
    },
    {
      title: 'Video Processor',
      description: 'Find clips in your library and process with Vizard + HeyGen',
      link: '/video-processor',
      external: false
    },
    {
      title: 'Video Library',
      description: 'Track and manage all video content',
      link: '/video-library',
      external: false
    },
    {
      title: 'Social Studio',
      description: 'AI content generation with GPT-4 and DALL-E',
      link: 'https://web-production-29982.up.railway.app/api/social-studio/dashboard',
      external: true
    },
    {
      title: 'Batch Studio',
      description: 'Generate 7 posts at once with AI topic suggestions',
      link: 'https://web-production-29982.up.railway.app/api/social-studio/batch',
      external: true
    },
    {
      title: 'RTÉ Articles',
      description: 'Generate article angles for RTÉ publication',
      link: '/rte-articles',
      external: false
    },
    {
      title: 'Analytics',
      description: 'Track performance across all platforms',
      link: 'https://app.metricool.com',
      external: true
    },
    {
      title: 'Story Grid Pro',
      description: 'Content planning and strategy tools',
      link: '/app',
      external: false
    },
    {
      title: 'Main Website',
      description: 'Visit the It\'s a Jungle website',
      link: 'https://itsajungle.tv',
      external: true
    },
    {
      title: 'YouTube Channel',
      description: 'Watch full episodes and clips',
      link: 'https://youtube.com/@ItsAJungle',
      external: true
    },
    {
      title: 'Shopify Store',
      description: 'Shop merchandise and wellness products',
      link: 'https://its-a-jungle-3.myshopify.com',
      external: true
    },
    {
      title: 'GitHub',
      description: 'View source code and documentation',
      link: 'https://github.com/Itsajungle/IAJ-Social-Media',
      external: true
    }
  ];

  const handleCardClick = (app: typeof apps[0]) => {
    if (app.external) {
      window.open(app.link, '_blank');
    } else {
      navigate(app.link);
    }
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(165deg, #f8f9fb 0%, #edf1f7 30%, #e3e9f2 60%, #dae2ed 100%)',
      fontFamily: "'Manrope', -apple-system, BlinkMacSystemFont, sans-serif",
      padding: '0',
      margin: '0',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Manrope:wght@300;400;500;600;700&display=swap');
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-12px) rotate(3deg); }
          66% { transform: translateY(6px) rotate(-3deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-in {
          animation: fadeInUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        
        .fade-in {
          animation: fadeIn 0.8s ease-out forwards;
          opacity: 0;
        }
        
        .texture-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0.03;
          background-image: 
            radial-gradient(circle at 20% 50%, rgba(16, 92, 138, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(26, 122, 179, 0.1) 0%, transparent 50%);
          pointer-events: none;
          z-index: 1;
        }
        
        .noise {
          position: fixed;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.02;
          pointer-events: none;
          z-index: 2;
        }
      `}</style>

      {/* Background elements */}
      <div className="texture-overlay" />
      <div className="noise" />

      {/* Floating decorative elements */}
      <div style={{
        position: 'fixed',
        top: '8%',
        right: '3%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(16, 92, 138, 0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(70px)',
        animation: 'float 10s ease-in-out infinite',
        zIndex: 0
      }} />

      <div style={{
        position: 'fixed',
        bottom: '15%',
        left: '8%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(26, 122, 179, 0.06) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(90px)',
        animation: 'float 14s ease-in-out infinite',
        animationDelay: '3s',
        zIndex: 0
      }} />

      {/* Main content wrapper */}
      <div style={{ position: 'relative', zIndex: 3 }}>
        {/* Header */}
        <header style={{
          padding: '50px 60px 70px',
          maxWidth: '1600px',
          margin: '0 auto'
        }}>
          {/* Logo */}
          <div 
            className={mounted ? 'fade-in' : ''}
            style={{
              animationDelay: '0ms',
              marginBottom: '60px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #105c8a 0%, #1a7ab3 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                width: '16px',
                height: '16px',
                background: 'rgba(255, 255, 255, 0.3)',
                borderRadius: '4px',
                border: '2px solid rgba(255, 255, 255, 0.8)'
              }} />
            </div>
            <div style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '15px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#1a2942',
              fontWeight: '700'
            }}>
              It's A Jungle
            </div>
          </div>

          {/* Hero Title - Modern asymmetric layout */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 0.8fr',
            gap: '60px',
            alignItems: 'end'
          }}>
            <div>
              <h1 
                className={mounted ? 'animate-in' : ''}
                style={{
                  animationDelay: '100ms',
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 'clamp(48px, 7vw, 96px)',
                  fontWeight: '700',
                  lineHeight: '0.95',
                  color: '#1a2942',
                  letterSpacing: '-0.04em',
                  marginBottom: '24px'
                }}
              >
                Content Hub
              </h1>
              
              <div 
                className={mounted ? 'animate-in' : ''}
                style={{
                  animationDelay: '200ms',
                  width: '60px',
                  height: '4px',
                  background: 'linear-gradient(to right, #105c8a, #9c785a)',
                  borderRadius: '2px',
                  marginBottom: '24px'
                }}
              />

              <p 
                className={mounted ? 'animate-in' : ''}
                style={{
                  animationDelay: '250ms',
                  fontFamily: "'Manrope', sans-serif",
                  fontSize: '17px',
                  fontWeight: '400',
                  lineHeight: '1.7',
                  color: '#4a5f7a',
                  maxWidth: '520px',
                  letterSpacing: '-0.01em'
                }}
              >
                AI-Powered Social Media Automation — Orchestrating your content ecosystem with intelligence and precision
              </p>
            </div>

            {/* Production Suite Card */}
            <div 
              className={mounted ? 'animate-in' : ''}
              style={{
                animationDelay: '300ms',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.5) 100%)',
                backdropFilter: 'blur(30px)',
                border: '1px solid rgba(16, 92, 138, 0.1)',
                borderRadius: '24px',
                padding: '32px',
                boxShadow: '0 8px 32px rgba(16, 92, 138, 0.08)'
              }}
            >
              <div style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '11px',
                fontWeight: '700',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: '#6b7a8f',
                marginBottom: '16px'
              }}>
                Production Suite
              </div>
              <div style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '48px',
                fontWeight: '700',
                color: '#1a2942',
                lineHeight: '1',
                letterSpacing: '-0.03em'
              }}>
                {loading ? '...' : healthy}<span style={{ fontSize: '24px', color: '#6b7a8f', fontWeight: '500' }}>/{total}</span>
              </div>
              <div style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: '13px',
                color: '#4a5f7a',
                marginTop: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: healthy === total ? 'linear-gradient(135deg, #105c8a 0%, #1a7ab3 100%)' : 'linear-gradient(135deg, #d4a574 0%, #c4956a 100%)',
                  boxShadow: healthy === total ? '0 0 16px rgba(16, 92, 138, 0.5)' : '0 0 16px rgba(212, 165, 116, 0.5)',
                  animation: 'pulse 2s ease-in-out infinite'
                }} />
                {healthy === total ? 'All systems operational' : `${total - healthy} system(s) need attention`}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main style={{
          maxWidth: '1600px',
          margin: '0 auto',
          padding: '0 60px 100px'
        }}>
          
          {/* System Health Section */}
          <section 
            className={mounted ? 'animate-in' : ''}
            style={{
              animationDelay: '350ms',
              marginBottom: '80px'
            }}
          >
            {/* Section Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '40px'
            }}>
              <Activity 
                size={28} 
                color="#105c8a"
                strokeWidth={2}
              />
              <h2 style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '28px',
                fontWeight: '700',
                color: '#1a2942',
                margin: 0,
                letterSpacing: '-0.02em'
              }}>
                System Health
              </h2>
              <div style={{
                flex: 1,
                height: '2px',
                background: 'linear-gradient(to right, rgba(16, 92, 138, 0.2), transparent)',
                marginLeft: '16px'
              }} />
            </div>

            {/* Services Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '20px'
            }}>
              {healthData && Object.entries(healthData.systems).map(([key, system], idx) => {
                const color = colors[idx % colors.length];
                return (
                  <div
                    key={key}
                    className={mounted ? 'animate-in' : ''}
                    onMouseEnter={() => setHoveredCard(key)}
                    onMouseLeave={() => setHoveredCard(null)}
                    style={{
                      animationDelay: `${350 + idx * 80}ms`,
                      background: hoveredCard === key 
                        ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)'
                        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.5) 100%)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid',
                      borderColor: hoveredCard === key ? 'rgba(16, 92, 138, 0.2)' : 'rgba(16, 92, 138, 0.08)',
                      borderRadius: '20px',
                      padding: '28px',
                      transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                      cursor: 'default',
                      transform: hoveredCard === key ? 'translateY(-8px)' : 'translateY(0)',
                      boxShadow: hoveredCard === key 
                        ? '0 20px 60px rgba(16, 92, 138, 0.15), 0 8px 20px rgba(16, 92, 138, 0.1)' 
                        : '0 4px 20px rgba(16, 92, 138, 0.04)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Gradient overlay */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      background: `linear-gradient(135deg, ${color}08 0%, transparent 60%)`,
                      opacity: hoveredCard === key ? 1 : 0,
                      transition: 'opacity 0.4s ease',
                      pointerEvents: 'none'
                    }} />

                    {/* Animated accent bar */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '4px',
                      height: hoveredCard === key ? '100%' : '0%',
                      background: `linear-gradient(to bottom, ${color}, transparent)`,
                      transition: 'height 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                    }} />

                    <div style={{ position: 'relative', zIndex: 1 }}>
                      {/* Abstract icon */}
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`,
                        border: `1px solid ${color}20`,
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                        transform: hoveredCard === key ? 'rotate(10deg) scale(1.1)' : 'rotate(0deg) scale(1)'
                      }}>
                        <div style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '6px',
                          background: color,
                          opacity: 0.3
                        }} />
                      </div>

                      <h3 style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#1a2942',
                        letterSpacing: '-0.01em',
                        lineHeight: '1.3',
                        marginBottom: '12px'
                      }}>
                        {system.name}
                      </h3>

                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <div style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: system.status === 'healthy' ? color : '#d4a574',
                            boxShadow: `0 0 12px ${system.status === 'healthy' ? color : '#d4a574'}60`
                          }} />
                          <span style={{
                            fontFamily: "'Manrope', sans-serif",
                            fontSize: '11px',
                            color: '#6b7a8f',
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                            fontWeight: '600'
                          }}>
                            {system.status === 'healthy' ? 'Active' : system.status}
                          </span>
                        </div>

                        <div style={{
                          fontFamily: "'Manrope', sans-serif",
                          fontSize: '13px',
                          fontWeight: '700',
                          color: system.status === 'healthy' ? color : '#d4a574',
                          letterSpacing: '0.02em'
                        }}>
                          {system.status === 'healthy' && system.response_time_ms 
                            ? `${Math.round(system.response_time_ms)}ms` 
                            : '—'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* AI Insights Section */}
          <section 
            className={mounted ? 'animate-in' : ''}
            style={{
              animationDelay: '500ms',
              marginBottom: '80px'
            }}
          >
            {/* Section Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '40px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}>
                <Sparkles 
                  size={28} 
                  color="#105c8a"
                  strokeWidth={2}
                />
                <h2 style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '28px',
                  fontWeight: '700',
                  color: '#1a2942',
                  margin: 0,
                  letterSpacing: '-0.02em'
                }}>
                  AI Insights
                </h2>
                <div style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontSize: '13px',
                  color: '#6b7a8f',
                  background: 'rgba(16, 92, 138, 0.08)',
                  padding: '6px 16px',
                  borderRadius: '12px',
                  fontWeight: '600'
                }}>
                  {displayRecs.length} recommendations
                </div>
              </div>

              <button 
                onClick={generateRecommendations}
                disabled={generating}
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#ffffff',
                  background: generating 
                    ? 'linear-gradient(135deg, #6b7a8f 0%, #8b9aaf 100%)'
                    : 'linear-gradient(135deg, #105c8a 0%, #1a7ab3 100%)',
                  border: 'none',
                  padding: '14px 28px',
                  borderRadius: '14px',
                  cursor: generating ? 'wait' : 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  letterSpacing: '0.02em',
                  boxShadow: '0 8px 24px rgba(16, 92, 138, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (!generating) {
                    (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 12px 32px rgba(16, 92, 138, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 24px rgba(16, 92, 138, 0.2)';
                }}
              >
                {generating ? (
                  <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <Sparkles size={16} />
                )}
                {generating ? 'Analyzing...' : 'Generate'}
              </button>
            </div>

            {/* Insights List */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              {displayRecs.map((insight, idx) => (
                <div
                  key={insight.id}
                  className={mounted ? 'animate-in' : ''}
                  style={{
                    animationDelay: `${600 + idx * 100}ms`,
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(16, 92, 138, 0.1)',
                    borderRadius: '20px',
                    padding: '36px',
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    cursor: 'default',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(16, 92, 138, 0.25)';
                    e.currentTarget.style.transform = 'translateX(8px)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(16, 92, 138, 0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(16, 92, 138, 0.1)';
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                  }}>
                    <div style={{ flex: 1, paddingRight: '32px' }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'rgba(156, 120, 90, 0.1)',
                        padding: '6px 16px',
                        borderRadius: '10px',
                        marginBottom: '16px'
                      }}>
                        <div style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: '#9c785a'
                        }} />
                        <span style={{
                          fontFamily: "'Outfit', sans-serif",
                          fontSize: '11px',
                          fontWeight: '700',
                          color: '#9c785a',
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase'
                        }}>
                          {insight.priority} Priority
                        </span>
                      </div>

                      <h3 style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: '22px',
                        fontWeight: '600',
                        color: '#1a2942',
                        marginBottom: '12px',
                        lineHeight: '1.3',
                        letterSpacing: '-0.01em'
                      }}>
                        {insight.title}
                      </h3>

                      <p style={{
                        fontFamily: "'Manrope', sans-serif",
                        fontSize: '15px',
                        fontWeight: '400',
                        lineHeight: '1.7',
                        color: '#4a5f7a',
                        letterSpacing: '-0.01em',
                        margin: 0
                      }}>
                        {insight.description}
                      </p>

                      {insight.impact && (
                        <p style={{
                          fontFamily: "'Manrope', sans-serif",
                          fontSize: '13px',
                          fontWeight: '600',
                          color: '#105c8a',
                          marginTop: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <ArrowUpRight size={14} />
                          {insight.impact}
                        </p>
                      )}
                    </div>

                    <div style={{
                      display: 'flex',
                      gap: '10px'
                    }}>
                      <button 
                        onClick={() => markRecommendationDone(insight.id)}
                        style={{
                          background: 'linear-gradient(135deg, #105c8a 0%, #1a7ab3 100%)',
                          border: 'none',
                          borderRadius: '12px',
                          padding: '12px 20px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          fontFamily: "'Outfit', sans-serif",
                          fontSize: '13px',
                          fontWeight: '700',
                          color: '#ffffff',
                          letterSpacing: '0.02em',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)';
                          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 24px rgba(16, 92, 138, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                          (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                        }}
                      >
                        <Check size={14} />
                        Apply
                      </button>

                      <button 
                        onClick={() => dismissRecommendation(insight.id)}
                        style={{
                          background: 'transparent',
                          border: '1px solid rgba(16, 92, 138, 0.15)',
                          borderRadius: '12px',
                          padding: '12px 20px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          fontFamily: "'Outfit', sans-serif",
                          fontSize: '13px',
                          fontWeight: '700',
                          color: '#6b7a8f',
                          letterSpacing: '0.02em',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(16, 92, 138, 0.3)';
                          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(16, 92, 138, 0.05)';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(16, 92, 138, 0.15)';
                          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                        }}
                      >
                        <X size={14} />
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Apps Section */}
          <section 
            className={mounted ? 'animate-in' : ''}
            style={{
              animationDelay: '700ms',
              marginBottom: '60px'
            }}
          >
            {/* Section Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '40px'
            }}>
              <ExternalLink 
                size={28} 
                color="#105c8a"
                strokeWidth={2}
              />
              <h2 style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '28px',
                fontWeight: '700',
                color: '#1a2942',
                margin: 0,
                letterSpacing: '-0.02em'
              }}>
                Applications
              </h2>
              <div style={{
                flex: 1,
                height: '2px',
                background: 'linear-gradient(to right, rgba(16, 92, 138, 0.2), transparent)',
                marginLeft: '16px'
              }} />
            </div>

            {/* Apps Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '20px'
            }}>
              {apps.map((app, idx) => {
                const color = colors[idx % colors.length];
                return (
                  <button
                    key={idx}
                    onClick={() => handleCardClick(app)}
                    onMouseEnter={() => setHoveredApp(idx)}
                    onMouseLeave={() => setHoveredApp(null)}
                    className={mounted ? 'animate-in' : ''}
                    style={{
                      animationDelay: `${800 + idx * 50}ms`,
                      background: hoveredApp === idx 
                        ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)'
                        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.5) 100%)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid',
                      borderColor: hoveredApp === idx ? 'rgba(16, 92, 138, 0.2)' : 'rgba(16, 92, 138, 0.08)',
                      borderRadius: '18px',
                      padding: '24px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                      transform: hoveredApp === idx ? 'translateY(-6px)' : 'translateY(0)',
                      boxShadow: hoveredApp === idx 
                        ? '0 16px 48px rgba(16, 92, 138, 0.12)' 
                        : '0 4px 16px rgba(16, 92, 138, 0.04)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Accent bar */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '4px',
                      height: hoveredApp === idx ? '100%' : '0%',
                      background: `linear-gradient(to bottom, ${color}, transparent)`,
                      transition: 'height 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                    }} />

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '12px'
                    }}>
                      <h3 style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#1a2942',
                        letterSpacing: '-0.01em',
                        lineHeight: '1.4'
                      }}>
                        {app.title}
                      </h3>
                      {app.external && (
                        <ExternalLink 
                          size={14} 
                          color="#6b7a8f" 
                          style={{
                            opacity: hoveredApp === idx ? 1 : 0.5,
                            transition: 'opacity 0.3s ease',
                            flexShrink: 0
                          }}
                        />
                      )}
                    </div>
                    <p style={{
                      fontFamily: "'Manrope', sans-serif",
                      fontSize: '13px',
                      fontWeight: '400',
                      lineHeight: '1.6',
                      color: '#4a5f7a',
                      letterSpacing: '-0.01em',
                      margin: 0
                    }}>
                      {app.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Footer */}
          <footer 
            className={mounted ? 'fade-in' : ''}
            style={{
              animationDelay: '1000ms',
              paddingTop: '40px',
              borderTop: '1px solid rgba(16, 92, 138, 0.1)',
              textAlign: 'center'
            }}
          >
            <p style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '12px',
              color: '#6b7a8f',
              letterSpacing: '0.05em',
              fontWeight: '600'
            }}>
              It's a Jungle Content Hub • 2025
            </p>
            <p style={{
              fontFamily: "'Manrope', sans-serif",
              fontSize: '11px',
              color: '#8b9aaf',
              marginTop: '8px',
              letterSpacing: '0.02em'
            }}>
              AI-powered social media automation for wellness content creators
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default ContentHub;
