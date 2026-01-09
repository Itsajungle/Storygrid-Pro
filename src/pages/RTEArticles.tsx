/**
 * RTÉ Articles - Generate article angles for RTÉ publication
 * Turn episode content into credible article pitches for Susan
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Sparkles, 
  ArrowLeft,
  Copy,
  Check,
  RefreshCw,
  BookOpen,
  Target,
  Users,
  Lightbulb,
  ExternalLink,
  Save,
  Trash2
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface ArticleAngle {
  id: string;
  headline: string;
  hook: string;
  keyPoints: string[];
  targetAudience: string;
  uniqueAngle: string;
  suggestedSources: string[];
  status: 'draft' | 'pitched' | 'accepted' | 'published';
  createdAt: string;
  episodeTopic?: string;
}

// ============================================
// COMPONENT
// ============================================

const RTEArticles = () => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [topicInput, setTopicInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedAngles, setGeneratedAngles] = useState<ArticleAngle[]>([]);
  const [savedAngles, setSavedAngles] = useState<ArticleAngle[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'generate' | 'saved'>('generate');

  useEffect(() => {
    setMounted(true);
    // Load saved angles from localStorage
    const saved = localStorage.getItem('iaj_rte_articles');
    if (saved) {
      setSavedAngles(JSON.parse(saved));
    }
  }, []);

  const generateAngles = async () => {
    if (!topicInput.trim()) return;
    
    setGenerating(true);
    
    // Simulate AI generation (in production, this would call Claude API)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newAngles: ArticleAngle[] = [
      {
        id: Date.now().toString() + '-1',
        headline: `The Science Behind ${topicInput}: What Irish Women Need to Know`,
        hook: `New research reveals surprising connections between ${topicInput.toLowerCase()} and overall health that many doctors overlook. Here's what the evidence actually shows.`,
        keyPoints: [
          'Latest research findings from peer-reviewed journals',
          'Common misconceptions addressed',
          'Practical, evidence-based recommendations',
          'Expert insights from Irish health professionals'
        ],
        targetAudience: 'Health-conscious women 35-55, RTÉ Lifestyle readers',
        uniqueAngle: 'Combining international research with Irish health context and practical application',
        suggestedSources: [
          'Irish Nutrition & Dietetic Institute',
          'Recent studies from The Lancet/BMJ',
          'Irish experts in the field'
        ],
        status: 'draft',
        createdAt: new Date().toISOString(),
        episodeTopic: topicInput
      },
      {
        id: Date.now().toString() + '-2',
        headline: `"I Changed One Thing About My ${topicInput} Routine - Here's What Happened"`,
        hook: `A personal exploration of how small changes can make a significant difference, backed by science and real experience.`,
        keyPoints: [
          'Personal narrative with scientific backing',
          'Step-by-step approach readers can follow',
          'Results and timeline expectations',
          'Common pitfalls to avoid'
        ],
        targetAudience: 'Women seeking relatable health content with actionable advice',
        uniqueAngle: 'First-person narrative combined with expert credibility from It\'s a Jungle platform',
        suggestedSources: [
          'Personal experience and research',
          'Supporting clinical studies',
          'Expert quotes for validation'
        ],
        status: 'draft',
        createdAt: new Date().toISOString(),
        episodeTopic: topicInput
      },
      {
        id: Date.now().toString() + '-3',
        headline: `${topicInput} Myths Debunked: Separating Fact from Fiction`,
        hook: `With so much conflicting information about ${topicInput.toLowerCase()}, it's hard to know what to believe. We separate evidence-based facts from popular myths.`,
        keyPoints: [
          '5-7 common myths with evidence-based corrections',
          'Why these myths persist',
          'What the research actually shows',
          'Expert recommendations for Irish readers'
        ],
        targetAudience: 'Readers frustrated by conflicting health advice, seeking clarity',
        uniqueAngle: 'Myth-busting format is highly shareable and positions Susan as trusted voice',
        suggestedSources: [
          'Academic research contradicting myths',
          'Expert commentary',
          'Historical context of myths'
        ],
        status: 'draft',
        createdAt: new Date().toISOString(),
        episodeTopic: topicInput
      }
    ];
    
    setGeneratedAngles(newAngles);
    setGenerating(false);
  };

  const saveAngle = (angle: ArticleAngle) => {
    const updated = [...savedAngles, angle];
    setSavedAngles(updated);
    localStorage.setItem('iaj_rte_articles', JSON.stringify(updated));
    setGeneratedAngles(generatedAngles.filter(a => a.id !== angle.id));
  };

  const deleteAngle = (id: string) => {
    const updated = savedAngles.filter(a => a.id !== id);
    setSavedAngles(updated);
    localStorage.setItem('iaj_rte_articles', JSON.stringify(updated));
  };

  const updateAngleStatus = (id: string, status: ArticleAngle['status']) => {
    const updated = savedAngles.map(a => a.id === id ? { ...a, status } : a);
    setSavedAngles(updated);
    localStorage.setItem('iaj_rte_articles', JSON.stringify(updated));
  };

  const copyToClipboard = (angle: ArticleAngle) => {
    const text = `
HEADLINE: ${angle.headline}

HOOK: ${angle.hook}

KEY POINTS:
${angle.keyPoints.map(p => `• ${p}`).join('\n')}

TARGET AUDIENCE: ${angle.targetAudience}

UNIQUE ANGLE: ${angle.uniqueAngle}

SUGGESTED SOURCES:
${angle.suggestedSources.map(s => `• ${s}`).join('\n')}
    `.trim();
    
    navigator.clipboard.writeText(text);
    setCopiedId(angle.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'draft': return { bg: '#FEF3C7', text: '#92400E' };
      case 'pitched': return { bg: '#DBEAFE', text: '#1E40AF' };
      case 'accepted': return { bg: '#D1FAE5', text: '#065F46' };
      case 'published': return { bg: '#E0E7FF', text: '#3730A3' };
      default: return { bg: '#F3F4F6', text: '#374151' };
    }
  };

  const AngleCard = ({ angle, showSave = false, showDelete = false }: { 
    angle: ArticleAngle; 
    showSave?: boolean;
    showDelete?: boolean;
  }) => {
    const statusStyle = getStatusStyle(angle.status);
    
    return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '28px',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            borderRadius: '8px',
            background: statusStyle.bg,
            color: statusStyle.text,
            fontSize: '12px',
            fontWeight: '700',
            fontFamily: "'Outfit', sans-serif",
            textTransform: 'capitalize'
          }}>
            {angle.status}
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => copyToClipboard(angle)}
              style={{
                background: copiedId === angle.id ? 'rgba(16, 185, 129, 0.1)' : 'rgba(5, 150, 105, 0.1)',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#059669',
                fontWeight: '600',
                fontSize: '13px'
              }}
            >
              {copiedId === angle.id ? <Check size={16} /> : <Copy size={16} />}
              {copiedId === angle.id ? 'Copied!' : 'Copy'}
            </button>
            {showSave && (
              <button
                onClick={() => saveAngle(angle)}
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '13px'
                }}
              >
                <Save size={16} />
                Save
              </button>
            )}
            {showDelete && (
              <button
                onClick={() => deleteAngle(angle.id)}
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px',
                  cursor: 'pointer'
                }}
              >
                <Trash2 size={16} color="#EF4444" />
              </button>
            )}
          </div>
        </div>

        {/* Headline */}
        <h3 style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: '20px',
          fontWeight: '700',
          color: '#1F2937',
          marginBottom: '12px',
          lineHeight: '1.3'
        }}>
          {angle.headline}
        </h3>

        {/* Hook */}
        <div style={{
          padding: '16px',
          borderRadius: '12px',
          background: 'rgba(5, 150, 105, 0.05)',
          marginBottom: '20px',
          borderLeft: '4px solid #059669'
        }}>
          <div style={{
            fontSize: '12px',
            fontWeight: '700',
            color: '#059669',
            marginBottom: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Lightbulb size={14} />
            HOOK
          </div>
          <p style={{
            fontSize: '15px',
            color: '#374151',
            lineHeight: '1.6',
            margin: 0,
            fontStyle: 'italic'
          }}>
            "{angle.hook}"
          </p>
        </div>

        {/* Key Points */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            fontSize: '12px',
            fontWeight: '700',
            color: '#6B7280',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Target size={14} />
            KEY POINTS
          </div>
          <ul style={{
            margin: 0,
            paddingLeft: '20px',
            color: '#4B5563'
          }}>
            {angle.keyPoints.map((point, i) => (
              <li key={i} style={{ marginBottom: '6px', fontSize: '14px' }}>{point}</li>
            ))}
          </ul>
        </div>

        {/* Target Audience */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            fontSize: '12px',
            fontWeight: '700',
            color: '#6B7280',
            marginBottom: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Users size={14} />
            TARGET AUDIENCE
          </div>
          <p style={{ fontSize: '14px', color: '#4B5563', margin: 0 }}>
            {angle.targetAudience}
          </p>
        </div>

        {/* Unique Angle */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            fontSize: '12px',
            fontWeight: '700',
            color: '#6B7280',
            marginBottom: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Sparkles size={14} />
            UNIQUE ANGLE
          </div>
          <p style={{ fontSize: '14px', color: '#4B5563', margin: 0 }}>
            {angle.uniqueAngle}
          </p>
        </div>

        {/* Suggested Sources */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            fontSize: '12px',
            fontWeight: '700',
            color: '#6B7280',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <BookOpen size={14} />
            SUGGESTED SOURCES
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {angle.suggestedSources.map((source, i) => (
              <span
                key={i}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: 'rgba(5, 150, 105, 0.1)',
                  color: '#059669',
                  fontSize: '13px',
                  fontWeight: '600'
                }}
              >
                {source}
              </span>
            ))}
          </div>
        </div>

        {/* Status Selector for saved angles */}
        {showDelete && (
          <div style={{
            paddingTop: '16px',
            borderTop: '1px solid rgba(0, 0, 0, 0.05)',
            display: 'flex',
            gap: '8px',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: '600' }}>Status:</span>
            {['draft', 'pitched', 'accepted', 'published'].map(status => (
              <button
                key={status}
                onClick={() => updateAngleStatus(angle.id, status as ArticleAngle['status'])}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: angle.status === status 
                    ? 'linear-gradient(135deg, #059669 0%, #10B981 100%)'
                    : 'rgba(0, 0, 0, 0.05)',
                  color: angle.status === status ? 'white' : '#6B7280',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {status}
              </button>
            ))}
          </div>
        )}

        {/* Episode Topic Tag */}
        {angle.episodeTopic && (
          <div style={{
            marginTop: '16px',
            fontSize: '12px',
            color: '#9CA3AF'
          }}>
            Based on: <strong>{angle.episodeTopic}</strong>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(165deg, #ecfdf5 0%, #d1fae5 30%, #a7f3d0 60%, #6ee7b7 100%)',
      fontFamily: "'Manrope', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Manrope:wght@300;400;500;600;700&display=swap');
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-in {
          animation: fadeInUp 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>

      {/* Header */}
      <header style={{ padding: '40px 60px 30px' }}>
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.7)',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '12px',
            cursor: 'pointer',
            marginBottom: '30px',
            fontFamily: "'Outfit', sans-serif",
            fontWeight: '600',
            color: '#059669'
          }}
        >
          <ArrowLeft size={18} />
          Back to Content Hub
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FileText size={28} color="white" />
              </div>
              <h1 style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '42px',
                fontWeight: '700',
                color: '#1F2937',
                margin: 0
              }}>
                RTÉ Article Generator
              </h1>
            </div>
            <p style={{ color: '#6B7280', fontSize: '16px', marginLeft: '72px' }}>
              Generate credible article angles for RTÉ publication • Build authority & drive YouTube traffic
            </p>
          </div>

          <a
            href="https://www.rte.ie/lifestyle/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.8)',
              color: '#059669',
              border: 'none',
              padding: '14px 24px',
              borderRadius: '14px',
              textDecoration: 'none',
              fontFamily: "'Outfit', sans-serif",
              fontWeight: '700',
              fontSize: '15px'
            }}
          >
            <ExternalLink size={18} />
            RTÉ Lifestyle
          </a>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ padding: '0 60px 20px' }}>
        <div style={{
          display: 'flex',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.5)',
          padding: '6px',
          borderRadius: '14px',
          width: 'fit-content'
        }}>
          <button
            onClick={() => setActiveTab('generate')}
            style={{
              padding: '12px 24px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'generate' 
                ? 'linear-gradient(135deg, #059669 0%, #10B981 100%)'
                : 'transparent',
              color: activeTab === 'generate' ? 'white' : '#6B7280',
              fontWeight: '700',
              fontSize: '15px',
              cursor: 'pointer',
              fontFamily: "'Outfit', sans-serif"
            }}
          >
            Generate New
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            style={{
              padding: '12px 24px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'saved' 
                ? 'linear-gradient(135deg, #059669 0%, #10B981 100%)'
                : 'transparent',
              color: activeTab === 'saved' ? 'white' : '#6B7280',
              fontWeight: '700',
              fontSize: '15px',
              cursor: 'pointer',
              fontFamily: "'Outfit', sans-serif",
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            Saved Angles
            {savedAngles.length > 0 && (
              <span style={{
                background: activeTab === 'saved' ? 'rgba(255,255,255,0.3)' : 'rgba(5, 150, 105, 0.2)',
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '12px'
              }}>
                {savedAngles.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Generate Tab Content */}
      {activeTab === 'generate' && (
        <div style={{ padding: '0 60px 60px' }}>
          {/* Input Section */}
          <div 
            className={mounted ? 'animate-in' : ''}
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              padding: '32px',
              marginBottom: '40px',
              border: '1px solid rgba(255, 255, 255, 0.5)'
            }}
          >
            <h2 style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '20px',
              fontWeight: '700',
              marginBottom: '16px',
              color: '#1F2937'
            }}>
              What's the episode topic or theme?
            </h2>
            <p style={{ color: '#6B7280', marginBottom: '20px', fontSize: '15px' }}>
              Enter the main topic from your episode (e.g., "Gut Health", "Hair Loss", "Sleep Optimization")
            </p>
            
            <div style={{ display: 'flex', gap: '16px' }}>
              <input
                type="text"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && generateAngles()}
                placeholder="e.g., Menopause and Hormone Health"
                style={{
                  flex: 1,
                  padding: '16px 20px',
                  borderRadius: '14px',
                  border: '2px solid rgba(5, 150, 105, 0.2)',
                  fontSize: '16px',
                  fontFamily: "'Manrope', sans-serif"
                }}
              />
              <button
                onClick={generateAngles}
                disabled={generating || !topicInput.trim()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: generating 
                    ? 'rgba(107, 114, 128, 0.5)'
                    : 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '16px 32px',
                  borderRadius: '14px',
                  cursor: generating ? 'wait' : 'pointer',
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: '700',
                  fontSize: '16px',
                  boxShadow: '0 8px 24px rgba(5, 150, 105, 0.3)'
                }}
              >
                {generating ? (
                  <>
                    <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Generate Article Angles
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Generated Angles */}
          {generatedAngles.length > 0 && (
            <div>
              <h2 style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '24px',
                fontWeight: '700',
                marginBottom: '24px',
                color: '#1F2937'
              }}>
                Generated Article Angles ({generatedAngles.length})
              </h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))',
                gap: '24px'
              }}>
                {generatedAngles.map((angle, idx) => (
                  <div
                    key={angle.id}
                    className={mounted ? 'animate-in' : ''}
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <AngleCard angle={angle} showSave />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {generatedAngles.length === 0 && !generating && (
            <div style={{
              textAlign: 'center',
              padding: '60px',
              color: '#6B7280'
            }}>
              <FileText size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <p style={{ fontSize: '18px', fontWeight: '600' }}>No angles generated yet</p>
              <p>Enter a topic above and click Generate to create RTÉ article angles</p>
            </div>
          )}
        </div>
      )}

      {/* Saved Tab Content */}
      {activeTab === 'saved' && (
        <div style={{ padding: '0 60px 60px' }}>
          {savedAngles.length > 0 ? (
            <>
              {/* Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '16px',
                marginBottom: '32px'
              }}>
                {[
                  { label: 'Draft', count: savedAngles.filter(a => a.status === 'draft').length },
                  { label: 'Pitched', count: savedAngles.filter(a => a.status === 'pitched').length },
                  { label: 'Accepted', count: savedAngles.filter(a => a.status === 'accepted').length },
                  { label: 'Published', count: savedAngles.filter(a => a.status === 'published').length }
                ].map((stat, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(255, 255, 255, 0.8)',
                      borderRadius: '16px',
                      padding: '20px',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{
                      fontSize: '32px',
                      fontWeight: '700',
                      fontFamily: "'Outfit', sans-serif",
                      color: '#059669'
                    }}>
                      {stat.count}
                    </div>
                    <div style={{ fontSize: '13px', color: '#6B7280', fontWeight: '600' }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))',
                gap: '24px'
              }}>
                {savedAngles.map((angle, idx) => (
                  <div
                    key={angle.id}
                    className={mounted ? 'animate-in' : ''}
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <AngleCard angle={angle} showDelete />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '60px',
              color: '#6B7280'
            }}>
              <Save size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <p style={{ fontSize: '18px', fontWeight: '600' }}>No saved angles yet</p>
              <p>Generate some article angles and save the ones you like</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RTEArticles;
