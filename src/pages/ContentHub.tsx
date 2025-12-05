/**
 * Content Hub - Editorial/Magazine Premium Design
 * Inspired by high-end editorial publications
 * Clean, sophisticated, expensive-feeling aesthetic
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  ArrowUpRight,
  ExternalLink
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
      title: 'IAJ Social Media',
      description: 'Complete AI-powered social media automation system',
      link: 'https://web-production-29982.up.railway.app/dashboard',
      external: true
    },
    {
      title: 'AI Agent Training',
      description: 'Train and configure AI agents for content analysis',
      link: 'https://web-production-29982.up.railway.app/api/agent-training',
      external: true
    },
    {
      title: 'Video Processor',
      description: 'Process YouTube videos with Vizard AI',
      link: 'https://web-production-29982.up.railway.app/api/video-processor/dashboard',
      external: true
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
      background: 'linear-gradient(135deg, #faf9f7 0%, #f5f3f0 50%, #f0ece7 100%)',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      padding: '0',
      margin: '0'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
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
        
        .animate-in {
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        
        .fade-in {
          animation: fadeIn 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>

      {/* Header - Ultra refined */}
      <header style={{
        padding: '60px 60px 80px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Logo */}
        <div 
          className={mounted ? 'fade-in' : ''}
          style={{
            animationDelay: '0ms',
            marginBottom: '80px'
          }}
        >
          <div style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '13px',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: '#9a8b7a',
            fontWeight: '500',
            marginBottom: '4px'
          }}>
            It's A
          </div>
          <div style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '15px',
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            color: '#5d5346',
            fontWeight: '600'
          }}>
            Jungle
          </div>
        </div>

        {/* Hero Title */}
        <div style={{ maxWidth: '900px' }}>
          <h1 
            className={mounted ? 'animate-in' : ''}
            style={{
              animationDelay: '100ms',
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(48px, 8vw, 92px)',
              fontWeight: '300',
              lineHeight: '1.1',
              color: '#1a1614',
              marginBottom: '24px',
              letterSpacing: '-0.02em'
            }}
          >
            Content Hub
          </h1>
          
          <p 
            className={mounted ? 'animate-in' : ''}
            style={{
              animationDelay: '200ms',
              fontFamily: "'Inter', sans-serif",
              fontSize: '18px',
              fontWeight: '400',
              lineHeight: '1.7',
              color: '#6b5d52',
              maxWidth: '520px',
              letterSpacing: '-0.01em'
            }}
          >
            AI-Powered Social Media Automation
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 60px 100px'
      }}>
        
        {/* System Health Section */}
        <section 
          className={mounted ? 'animate-in' : ''}
          style={{
            animationDelay: '300ms',
            marginBottom: '100px'
          }}
        >
          {/* Section Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: '48px',
            paddingBottom: '20px',
            borderBottom: '1px solid #e5dfd7'
          }}>
            <div>
              <h2 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '32px',
                fontWeight: '400',
                color: '#1a1614',
                marginBottom: '6px',
                letterSpacing: '-0.01em'
              }}>
                System Health
              </h2>
              <p style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '13px',
                color: '#9a8b7a',
                letterSpacing: '0.02em'
              }}>
                Real-time monitoring
              </p>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              {loading ? (
                <RefreshCw 
                  size={18} 
                  color="#9a8b7a" 
                  style={{ animation: 'spin 1s linear infinite' }}
                />
              ) : (
                <>
                  <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: healthy === total ? '#2d7a4f' : '#d4a574',
                    boxShadow: healthy === total ? '0 0 12px rgba(45, 122, 79, 0.4)' : '0 0 12px rgba(212, 165, 116, 0.4)'
                  }} />
                  <div style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '42px',
                    fontWeight: '300',
                    color: '#1a1614',
                    letterSpacing: '-0.02em'
                  }}>
                    {healthy}<span style={{ 
                      fontSize: '20px',
                      color: '#9a8b7a',
                      fontWeight: '400',
                      marginLeft: '2px'
                    }}>/{total}</span>
                  </div>
                  <p style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '12px',
                    color: '#9a8b7a',
                    marginLeft: '6px',
                    letterSpacing: '0.02em'
                  }}>
                    operational
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Services Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '24px'
          }}>
            {healthData && Object.entries(healthData.systems).map(([key, system], idx) => (
              <div
                key={key}
                className={mounted ? 'animate-in' : ''}
                onMouseEnter={() => setHoveredCard(key)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  animationDelay: `${300 + idx * 80}ms`,
                  background: hoveredCard === key ? '#ffffff' : '#faf9f7',
                  border: '1px solid',
                  borderColor: hoveredCard === key ? '#d4cdc1' : '#e5dfd7',
                  padding: '32px 24px',
                  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  cursor: 'default',
                  transform: hoveredCard === key ? 'translateY(-4px)' : 'translateY(0)',
                  boxShadow: hoveredCard === key ? '0 12px 40px rgba(0,0,0,0.08)' : '0 2px 8px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: system.status === 'healthy' ? '#2d7a4f' : '#d4a574',
                    boxShadow: system.status === 'healthy' 
                      ? '0 0 8px rgba(45, 122, 79, 0.3)' 
                      : '0 0 8px rgba(212, 165, 116, 0.3)'
                  }} />
                  <span style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '12px',
                    fontWeight: '500',
                    color: system.status === 'healthy' ? '#2d7a4f' : '#d4a574',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                  }}>
                    {system.status === 'healthy' && system.response_time_ms 
                      ? `${Math.round(system.response_time_ms)}ms` 
                      : system.status}
                  </span>
                </div>

                <h3 style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '15px',
                  fontWeight: '500',
                  color: '#1a1614',
                  letterSpacing: '-0.01em',
                  lineHeight: '1.4'
                }}>
                  {system.name}
                </h3>
              </div>
            ))}
          </div>
        </section>

        {/* AI Insights Section */}
        <section 
          className={mounted ? 'animate-in' : ''}
          style={{
            animationDelay: '500ms',
            marginBottom: '100px'
          }}
        >
          {/* Section Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '40px',
            paddingBottom: '20px',
            borderBottom: '1px solid #e5dfd7'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px'
            }}>
              <Sparkles 
                size={22} 
                color="#9a8b7a"
                strokeWidth={1.5}
              />
              <div>
                <h2 style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '32px',
                  fontWeight: '400',
                  color: '#1a1614',
                  marginBottom: '4px',
                  letterSpacing: '-0.01em'
                }}>
                  AI Insights
                </h2>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '13px',
                  color: '#9a8b7a',
                  letterSpacing: '0.02em'
                }}>
                  {displayRecs.length} recommendations
                </p>
              </div>
            </div>

            <button 
              onClick={generateRecommendations}
              disabled={generating}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '13px',
                fontWeight: '500',
                color: generating ? '#9a8b7a' : '#1a1614',
                background: 'transparent',
                border: '1px solid',
                borderColor: generating ? '#e5dfd7' : '#1a1614',
                padding: '10px 28px',
                cursor: generating ? 'wait' : 'pointer',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                letterSpacing: '0.02em',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                if (!generating) {
                  (e.target as HTMLButtonElement).style.background = '#1a1614';
                  (e.target as HTMLButtonElement).style.color = '#faf9f7';
                }
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.background = 'transparent';
                (e.target as HTMLButtonElement).style.color = generating ? '#9a8b7a' : '#1a1614';
              }}
            >
              {generating && <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />}
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
                  background: '#ffffff',
                  border: '1px solid #e5dfd7',
                  padding: '40px',
                  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  cursor: 'default'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#d4cdc1';
                  e.currentTarget.style.transform = 'translateX(8px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5dfd7';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start'
                }}>
                  <div style={{ flex: 1, paddingRight: '32px' }}>
                    <span style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '11px',
                      fontWeight: '600',
                      color: '#9a8b7a',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      marginBottom: '14px',
                      display: 'block'
                    }}>
                      {insight.priority}
                    </span>

                    <h3 style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: '24px',
                      fontWeight: '400',
                      color: '#1a1614',
                      marginBottom: '12px',
                      lineHeight: '1.3',
                      letterSpacing: '-0.01em'
                    }}>
                      {insight.title}
                    </h3>

                    <p style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '14px',
                      fontWeight: '400',
                      lineHeight: '1.7',
                      color: '#6b5d52',
                      letterSpacing: '-0.01em'
                    }}>
                      {insight.description}
                    </p>

                    {insight.impact && (
                      <p style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#2d7a4f',
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
                    gap: '10px',
                    marginTop: '4px'
                  }}>
                    <button 
                      onClick={() => markRecommendationDone(insight.id)}
                      style={{
                        background: 'transparent',
                        border: '1px solid #e5dfd7',
                        padding: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#2d7a4f';
                        e.currentTarget.style.background = '#f0fdf4';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e5dfd7';
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <CheckCircle2 size={18} color="#2d7a4f" strokeWidth={1.5} />
                    </button>

                    <button 
                      onClick={() => dismissRecommendation(insight.id)}
                      style={{
                        background: 'transparent',
                        border: '1px solid #e5dfd7',
                        padding: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#9a8b7a';
                        e.currentTarget.style.background = '#faf9f7';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e5dfd7';
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <XCircle size={18} color="#9a8b7a" strokeWidth={1.5} />
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
            marginBottom: '80px'
          }}
        >
          {/* Section Header */}
          <div style={{
            marginBottom: '48px',
            paddingBottom: '20px',
            borderBottom: '1px solid #e5dfd7'
          }}>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '32px',
              fontWeight: '400',
              color: '#1a1614',
              marginBottom: '6px',
              letterSpacing: '-0.01em'
            }}>
              Applications
            </h2>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '13px',
              color: '#9a8b7a',
              letterSpacing: '0.02em'
            }}>
              Your complete toolkit
            </p>
          </div>

          {/* Apps Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {apps.map((app, idx) => (
              <button
                key={idx}
                onClick={() => handleCardClick(app)}
                onMouseEnter={() => setHoveredApp(idx)}
                onMouseLeave={() => setHoveredApp(null)}
                className={mounted ? 'animate-in' : ''}
                style={{
                  animationDelay: `${800 + idx * 60}ms`,
                  background: hoveredApp === idx ? '#ffffff' : '#faf9f7',
                  border: '1px solid',
                  borderColor: hoveredApp === idx ? '#d4cdc1' : '#e5dfd7',
                  padding: '32px 28px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  transform: hoveredApp === idx ? 'translateY(-4px)' : 'translateY(0)',
                  boxShadow: hoveredApp === idx ? '0 12px 40px rgba(0,0,0,0.08)' : '0 2px 8px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '16px'
                }}>
                  <h3 style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '16px',
                    fontWeight: '500',
                    color: '#1a1614',
                    letterSpacing: '-0.01em',
                    lineHeight: '1.4'
                  }}>
                    {app.title}
                  </h3>
                  {app.external && (
                    <ExternalLink 
                      size={14} 
                      color="#9a8b7a" 
                      style={{
                        opacity: hoveredApp === idx ? 1 : 0.5,
                        transition: 'opacity 0.3s ease'
                      }}
                    />
                  )}
                </div>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '13px',
                  fontWeight: '400',
                  lineHeight: '1.6',
                  color: '#6b5d52',
                  letterSpacing: '-0.01em'
                }}>
                  {app.description}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer 
          className={mounted ? 'fade-in' : ''}
          style={{
            animationDelay: '1000ms',
            paddingTop: '40px',
            borderTop: '1px solid #e5dfd7',
            textAlign: 'center'
          }}
        >
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '12px',
            color: '#9a8b7a',
            letterSpacing: '0.05em'
          }}>
            It's a Jungle Content Hub • 2025
          </p>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '11px',
            color: '#b8a99a',
            marginTop: '8px',
            letterSpacing: '0.02em'
          }}>
            AI-powered social media automation for wellness content creators
          </p>
        </footer>
      </main>

      {/* CSS for spinner animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ContentHub;
