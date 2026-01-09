/**
 * Trending - Health & Wellness Trend Analysis
 * Discover what's trending in health, wellness, longevity, and related topics
 * Time-based filtering with graphs and YouTube-specific insights
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Search, 
  ArrowLeft,
  Calendar,
  Youtube,
  Instagram,
  Clock,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Filter,
  BarChart3,
  LineChart,
  Hash,
  Users,
  Eye,
  MessageCircle
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface TrendingTopic {
  id: string;
  topic: string;
  category: string;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
  searchVolume: number;
  relatedTerms: string[];
  peakTime?: string;
  audienceDemo?: string;
}

interface YouTubeTrend {
  id: string;
  title: string;
  channel: string;
  views: string;
  published: string;
  category: string;
  thumbnail?: string;
  engagement: 'high' | 'medium' | 'low';
}

interface TrendDataPoint {
  date: string;
  value: number;
}

// ============================================
// HEALTH & WELLNESS CATEGORIES
// ============================================

const healthCategories = [
  'All Health & Wellness',
  'Gut Health',
  'Hormones & Menopause',
  'Hair & Skin',
  'Sleep & Recovery',
  'Nutrition & Diet',
  'Mental Health',
  'Fitness & Movement',
  'Longevity & Aging',
  'Women\'s Health',
  'Supplements',
  'Holistic Wellness'
];

// ============================================
// SAMPLE DATA - Health & Wellness Focus
// ============================================

const generateTrendingTopics = (timeframe: string): TrendingTopic[] => {
  const baseTopics: TrendingTopic[] = [
    {
      id: '1',
      topic: 'Ozempic alternatives natural',
      category: 'Weight Management',
      trend: 'up',
      changePercent: 156,
      searchVolume: 245000,
      relatedTerms: ['berberine', 'GLP-1 natural', 'appetite control herbs'],
      peakTime: 'Morning 8-10am',
      audienceDemo: 'Women 35-54'
    },
    {
      id: '2',
      topic: 'Perimenopause symptoms',
      category: 'Hormones & Menopause',
      trend: 'up',
      changePercent: 89,
      searchVolume: 189000,
      relatedTerms: ['hormone balance', 'perimenopause diet', 'early menopause signs'],
      peakTime: 'Evening 7-9pm',
      audienceDemo: 'Women 40-55'
    },
    {
      id: '3',
      topic: 'Gut microbiome test',
      category: 'Gut Health',
      trend: 'up',
      changePercent: 67,
      searchVolume: 156000,
      relatedTerms: ['microbiome analysis', 'gut health test at home', 'probiotics'],
      peakTime: 'Morning 9-11am',
      audienceDemo: 'Adults 30-50'
    },
    {
      id: '4',
      topic: 'Hair loss women over 40',
      category: 'Hair & Skin',
      trend: 'up',
      changePercent: 124,
      searchVolume: 134000,
      relatedTerms: ['female pattern hair loss', 'hair growth supplements', 'thinning hair menopause'],
      peakTime: 'Evening 8-10pm',
      audienceDemo: 'Women 40-60'
    },
    {
      id: '5',
      topic: 'Magnesium for sleep',
      category: 'Sleep & Recovery',
      trend: 'up',
      changePercent: 78,
      searchVolume: 198000,
      relatedTerms: ['magnesium glycinate', 'sleep supplements', 'natural sleep aids'],
      peakTime: 'Night 9-11pm',
      audienceDemo: 'Adults 35-55'
    },
    {
      id: '6',
      topic: 'Seed cycling hormones',
      category: 'Women\'s Health',
      trend: 'up',
      changePercent: 203,
      searchVolume: 87000,
      relatedTerms: ['hormone balance naturally', 'seed rotation', 'menstrual health'],
      peakTime: 'Morning 7-9am',
      audienceDemo: 'Women 25-45'
    },
    {
      id: '7',
      topic: 'Collagen peptides benefits',
      category: 'Longevity & Aging',
      trend: 'stable',
      changePercent: 12,
      searchVolume: 267000,
      relatedTerms: ['collagen for skin', 'marine collagen', 'collagen types'],
      peakTime: 'Morning 8-10am',
      audienceDemo: 'Women 30-55'
    },
    {
      id: '8',
      topic: 'Intermittent fasting women',
      category: 'Nutrition & Diet',
      trend: 'down',
      changePercent: -15,
      searchVolume: 145000,
      relatedTerms: ['fasting for women over 40', 'IF schedule', 'fasting and hormones'],
      peakTime: 'Morning 6-8am',
      audienceDemo: 'Women 35-50'
    },
    {
      id: '9',
      topic: 'Nervous system regulation',
      category: 'Mental Health',
      trend: 'up',
      changePercent: 167,
      searchVolume: 112000,
      relatedTerms: ['vagus nerve', 'polyvagal theory', 'stress response'],
      peakTime: 'Evening 6-8pm',
      audienceDemo: 'Adults 25-45'
    },
    {
      id: '10',
      topic: 'Zone 2 cardio benefits',
      category: 'Fitness & Movement',
      trend: 'up',
      changePercent: 234,
      searchVolume: 98000,
      relatedTerms: ['heart rate training', 'metabolic health', 'Peter Attia'],
      peakTime: 'Morning 5-7am',
      audienceDemo: 'Adults 35-55'
    }
  ];

  // Adjust values based on timeframe
  const multiplier = timeframe === 'today' ? 0.3 : timeframe === 'week' ? 0.6 : timeframe === 'month' ? 0.8 : 1;
  
  return baseTopics.map(topic => ({
    ...topic,
    searchVolume: Math.round(topic.searchVolume * (0.5 + Math.random() * multiplier)),
    changePercent: Math.round(topic.changePercent * (0.7 + Math.random() * 0.6))
  }));
};

const generateYouTubeTrends = (): YouTubeTrend[] => [
  {
    id: 'yt1',
    title: 'I Tried Seed Cycling for 3 Months - Here\'s What Happened to My Hormones',
    channel: 'Wellness With Sarah',
    views: '1.2M',
    published: '3 days ago',
    category: 'Women\'s Health',
    engagement: 'high'
  },
  {
    id: 'yt2',
    title: 'Doctor Explains: Why Your Gut is Making You Tired',
    channel: 'Dr. Health MD',
    views: '890K',
    published: '1 week ago',
    category: 'Gut Health',
    engagement: 'high'
  },
  {
    id: 'yt3',
    title: 'The TRUTH About Ozempic (From a Functional Medicine Doctor)',
    channel: 'Functional Health',
    views: '2.1M',
    published: '2 weeks ago',
    category: 'Weight Management',
    engagement: 'high'
  },
  {
    id: 'yt4',
    title: 'Perimenopause at 38? Signs You Shouldn\'t Ignore',
    channel: 'Women\'s Wellness',
    views: '567K',
    published: '5 days ago',
    category: 'Hormones & Menopause',
    engagement: 'medium'
  },
  {
    id: 'yt5',
    title: 'This Magnesium Changed My Sleep Forever',
    channel: 'Biohacker Life',
    views: '445K',
    published: '1 week ago',
    category: 'Sleep & Recovery',
    engagement: 'medium'
  },
  {
    id: 'yt6',
    title: 'Hair Loss After 40: What Your Doctor Won\'t Tell You',
    channel: 'Aging Gracefully',
    views: '334K',
    published: '4 days ago',
    category: 'Hair & Skin',
    engagement: 'high'
  }
];

const generateTrendGraph = (timeframe: string, topic: string): TrendDataPoint[] => {
  const points: TrendDataPoint[] = [];
  const numPoints = timeframe === 'today' ? 24 : timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 12;
  
  let baseValue = 50 + Math.random() * 30;
  const trend = Math.random() > 0.3 ? 1 : -1;
  
  for (let i = 0; i < numPoints; i++) {
    const variation = (Math.random() - 0.5) * 20;
    const trendEffect = trend * (i / numPoints) * 30;
    baseValue = Math.max(10, Math.min(100, baseValue + variation * 0.3));
    
    let label = '';
    if (timeframe === 'today') {
      label = `${i}:00`;
    } else if (timeframe === 'week') {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      label = days[i % 7];
    } else if (timeframe === 'month') {
      label = `${i + 1}`;
    } else {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      label = months[i % 12];
    }
    
    points.push({
      date: label,
      value: Math.round(baseValue + trendEffect)
    });
  }
  
  return points;
};

// ============================================
// COMPONENT
// ============================================

const Trending = () => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month' | 'year'>('week');
  const [selectedCategory, setSelectedCategory] = useState('All Health & Wellness');
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [youtubeTrends, setYoutubeTrends] = useState<YouTubeTrend[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<TrendingTopic | null>(null);
  const [graphData, setGraphData] = useState<TrendDataPoint[]>([]);
  const [activeTab, setActiveTab] = useState<'topics' | 'youtube' | 'search'>('topics');

  useEffect(() => {
    setMounted(true);
    loadTrends();
  }, []);

  useEffect(() => {
    loadTrends();
  }, [timeframe, selectedCategory]);

  const loadTrends = () => {
    const topics = generateTrendingTopics(timeframe);
    const filtered = selectedCategory === 'All Health & Wellness' 
      ? topics 
      : topics.filter(t => t.category === selectedCategory);
    setTrendingTopics(filtered);
    setYoutubeTrends(generateYouTubeTrends());
    
    if (filtered.length > 0 && !selectedTopic) {
      setSelectedTopic(filtered[0]);
      setGraphData(generateTrendGraph(timeframe, filtered[0].topic));
    }
  };

  const handleTopicSelect = (topic: TrendingTopic) => {
    setSelectedTopic(topic);
    setGraphData(generateTrendGraph(timeframe, topic.topic));
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    setActiveTab('search');
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate custom results for the search
    const searchResults: TrendingTopic[] = [
      {
        id: 'search-1',
        topic: searchQuery,
        category: 'Search Result',
        trend: Math.random() > 0.3 ? 'up' : 'stable',
        changePercent: Math.round(Math.random() * 150),
        searchVolume: Math.round(50000 + Math.random() * 200000),
        relatedTerms: [
          `${searchQuery} benefits`,
          `${searchQuery} for women`,
          `${searchQuery} natural`,
          `best ${searchQuery}`,
          `${searchQuery} side effects`
        ],
        peakTime: 'Morning 8-10am',
        audienceDemo: 'Women 35-55'
      }
    ];
    
    setTrendingTopics(searchResults);
    setSelectedTopic(searchResults[0]);
    setGraphData(generateTrendGraph(timeframe, searchQuery));
    setSearching(false);
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <ArrowUpRight size={16} color="#10B981" />;
    if (trend === 'down') return <ArrowDownRight size={16} color="#EF4444" />;
    return <Minus size={16} color="#6B7280" />;
  };

  const getTrendColor = (trend: string) => {
    if (trend === 'up') return '#10B981';
    if (trend === 'down') return '#EF4444';
    return '#6B7280';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
    return num.toString();
  };

  // Simple bar chart component
  const TrendChart = ({ data }: { data: TrendDataPoint[] }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-end', 
        gap: '4px', 
        height: '200px',
        padding: '20px 0'
      }}>
        {data.map((point, idx) => (
          <div 
            key={idx} 
            style={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '40px',
                height: `${(point.value / maxValue) * 150}px`,
                background: `linear-gradient(180deg, #F97316 0%, #EA580C 100%)`,
                borderRadius: '4px 4px 0 0',
                transition: 'height 0.3s ease',
                minHeight: '4px'
              }}
            />
            <span style={{ 
              fontSize: '10px', 
              color: '#9CA3AF',
              transform: 'rotate(-45deg)',
              transformOrigin: 'center',
              whiteSpace: 'nowrap'
            }}>
              {point.date}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(165deg, #fff7ed 0%, #ffedd5 30%, #fed7aa 60%, #fdba74 100%)',
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
            color: '#EA580C'
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
                background: 'linear-gradient(135deg, #EA580C 0%, #F97316 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <TrendingUp size={28} color="white" />
              </div>
              <h1 style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '42px',
                fontWeight: '700',
                color: '#1F2937',
                margin: 0
              }}>
                Health & Wellness Trends
              </h1>
            </div>
            <p style={{ color: '#6B7280', fontSize: '16px', marginLeft: '72px' }}>
              Discover what's trending in health, wellness, and longevity • Optimized for women 35+
            </p>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div style={{ padding: '0 60px 20px' }}>
        <div style={{
          display: 'flex',
          gap: '16px',
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '20px',
          borderRadius: '20px',
          backdropFilter: 'blur(20px)'
        }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={20} style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9CA3AF'
            }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search health topics... (e.g., 'hair loss', 'gut health', 'menopause')"
              style={{
                width: '100%',
                padding: '14px 14px 14px 48px',
                borderRadius: '12px',
                border: '2px solid rgba(234, 88, 12, 0.2)',
                fontSize: '15px',
                fontFamily: "'Manrope', sans-serif"
              }}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={searching}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #EA580C 0%, #F97316 100%)',
              color: 'white',
              border: 'none',
              padding: '14px 28px',
              borderRadius: '12px',
              cursor: 'pointer',
              fontFamily: "'Outfit', sans-serif",
              fontWeight: '700',
              fontSize: '15px'
            }}
          >
            {searching ? (
              <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <Sparkles size={18} />
            )}
            Analyze Trend
          </button>
        </div>
      </div>

      {/* Time Filters & Category */}
      <div style={{ padding: '0 60px 20px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Time Filters */}
          <div style={{
            display: 'flex',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.7)',
            padding: '6px',
            borderRadius: '14px'
          }}>
            {[
              { key: 'today', label: 'Today', icon: Clock },
              { key: 'week', label: 'This Week', icon: Calendar },
              { key: 'month', label: 'This Month', icon: Calendar },
              { key: 'year', label: 'This Year', icon: Calendar }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTimeframe(key as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  background: timeframe === key 
                    ? 'linear-gradient(135deg, #EA580C 0%, #F97316 100%)'
                    : 'transparent',
                  color: timeframe === key ? 'white' : '#6B7280',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontFamily: "'Outfit', sans-serif"
                }}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '12px 16px',
              borderRadius: '12px',
              border: '2px solid rgba(234, 88, 12, 0.2)',
              background: 'rgba(255, 255, 255, 0.9)',
              fontSize: '14px',
              fontWeight: '600',
              fontFamily: "'Outfit', sans-serif",
              cursor: 'pointer',
              minWidth: '200px'
            }}
          >
            {healthCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

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
          {[
            { key: 'topics', label: 'Trending Topics', icon: TrendingUp },
            { key: 'youtube', label: 'YouTube Trends', icon: Youtube },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === key 
                  ? 'linear-gradient(135deg, #EA580C 0%, #F97316 100%)'
                  : 'transparent',
                color: activeTab === key ? 'white' : '#6B7280',
                fontWeight: '700',
                fontSize: '14px',
                cursor: 'pointer',
                fontFamily: "'Outfit', sans-serif"
              }}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '0 60px 60px' }}>
        {activeTab === 'topics' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px' }}>
            {/* Trending Topics List */}
            <div>
              <h2 style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '20px',
                fontWeight: '700',
                marginBottom: '16px',
                color: '#1F2937'
              }}>
                🔥 Top Trending in {selectedCategory}
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {trendingTopics.map((topic, idx) => (
                  <div
                    key={topic.id}
                    onClick={() => handleTopicSelect(topic)}
                    className={mounted ? 'animate-in' : ''}
                    style={{
                      animationDelay: `${idx * 50}ms`,
                      background: selectedTopic?.id === topic.id 
                        ? 'rgba(234, 88, 12, 0.1)'
                        : 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(20px)',
                      borderRadius: '16px',
                      padding: '20px',
                      border: selectedTopic?.id === topic.id 
                        ? '2px solid #EA580C'
                        : '1px solid rgba(255, 255, 255, 0.5)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span style={{
                            fontFamily: "'Outfit', sans-serif",
                            fontSize: '14px',
                            fontWeight: '700',
                            color: '#EA580C'
                          }}>
                            #{idx + 1}
                          </span>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            background: 'rgba(234, 88, 12, 0.1)',
                            color: '#EA580C',
                            fontSize: '11px',
                            fontWeight: '700'
                          }}>
                            {topic.category}
                          </span>
                        </div>
                        
                        <h3 style={{
                          fontFamily: "'Outfit', sans-serif",
                          fontSize: '17px',
                          fontWeight: '700',
                          color: '#1F2937',
                          marginBottom: '8px'
                        }}>
                          {topic.topic}
                        </h3>
                        
                        <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#6B7280' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Eye size={14} />
                            {formatNumber(topic.searchVolume)} searches
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Users size={14} />
                            {topic.audienceDemo}
                          </span>
                        </div>
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '8px 12px',
                        borderRadius: '10px',
                        background: topic.trend === 'up' ? 'rgba(16, 185, 129, 0.1)' : 
                                   topic.trend === 'down' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                        color: getTrendColor(topic.trend),
                        fontWeight: '700',
                        fontSize: '14px'
                      }}>
                        {getTrendIcon(topic.trend)}
                        {topic.changePercent > 0 ? '+' : ''}{topic.changePercent}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trend Detail Panel */}
            {selectedTopic && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                padding: '24px',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                position: 'sticky',
                top: '20px',
                height: 'fit-content'
              }}>
                <h3 style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#1F2937',
                  marginBottom: '8px'
                }}>
                  📈 Trend Analysis
                </h3>
                <p style={{
                  fontSize: '15px',
                  color: '#EA580C',
                  fontWeight: '600',
                  marginBottom: '20px'
                }}>
                  "{selectedTopic.topic}"
                </p>

                {/* Graph */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#6B7280',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <BarChart3 size={14} />
                    SEARCH INTEREST OVER TIME
                  </div>
                  <TrendChart data={graphData} />
                </div>

                {/* Stats */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: 'rgba(234, 88, 12, 0.05)'
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#EA580C' }}>
                      {formatNumber(selectedTopic.searchVolume)}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>Monthly Searches</div>
                  </div>
                  <div style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: 'rgba(16, 185, 129, 0.05)'
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#10B981' }}>
                      {selectedTopic.peakTime}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>Peak Activity</div>
                  </div>
                </div>

                {/* Related Terms */}
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
                    <Hash size={14} />
                    RELATED SEARCHES
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {selectedTopic.relatedTerms.map((term, i) => (
                      <span
                        key={i}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          background: 'rgba(234, 88, 12, 0.1)',
                          color: '#EA580C',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}
                      >
                        {term}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Content Suggestion */}
                <div style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.1) 0%, rgba(249, 115, 22, 0.1) 100%)',
                  border: '1px solid rgba(234, 88, 12, 0.2)'
                }}>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#EA580C',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <Sparkles size={14} />
                    CONTENT OPPORTUNITY
                  </div>
                  <p style={{ fontSize: '13px', color: '#374151', margin: 0, lineHeight: '1.5' }}>
                    This topic is {selectedTopic.trend === 'up' ? 'rising quickly' : 'stable'} with {selectedTopic.audienceDemo}. 
                    Consider creating a Short addressing "{selectedTopic.relatedTerms[0]}" for maximum reach.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'youtube' && (
          <div>
            <h2 style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '20px',
              fontWeight: '700',
              marginBottom: '16px',
              color: '#1F2937',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Youtube size={24} color="#FF0000" />
              Trending Health & Wellness on YouTube
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
              gap: '20px'
            }}>
              {youtubeTrends.map((video, idx) => (
                <div
                  key={video.id}
                  className={mounted ? 'animate-in' : ''}
                  style={{
                    animationDelay: `${idx * 100}ms`,
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '16px',
                    padding: '20px',
                    border: '1px solid rgba(255, 255, 255, 0.5)'
                  }}
                >
                  <div style={{ display: 'flex', gap: '16px' }}>
                    {/* Thumbnail placeholder */}
                    <div style={{
                      width: '140px',
                      height: '80px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #FF0000 0%, #CC0000 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Youtube size={32} color="white" />
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: '15px',
                        fontWeight: '700',
                        color: '#1F2937',
                        marginBottom: '6px',
                        lineHeight: '1.3'
                      }}>
                        {video.title}
                      </h3>
                      
                      <p style={{
                        fontSize: '13px',
                        color: '#6B7280',
                        marginBottom: '8px'
                      }}>
                        {video.channel}
                      </p>
                      
                      <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#9CA3AF' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Eye size={12} />
                          {video.views} views
                        </span>
                        <span>{video.published}</span>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: video.engagement === 'high' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                          color: video.engagement === 'high' ? '#10B981' : '#EAB308',
                          fontWeight: '600'
                        }}>
                          {video.engagement} engagement
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{
                    marginTop: '12px',
                    paddingTop: '12px',
                    borderTop: '1px solid rgba(0, 0, 0, 0.05)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: 'rgba(234, 88, 12, 0.1)',
                      color: '#EA580C',
                      fontSize: '11px',
                      fontWeight: '700'
                    }}>
                      {video.category}
                    </span>
                    
                    <button style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 0, 0, 0.1)',
                      color: '#DC2626',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}>
                      <ExternalLink size={14} />
                      Study Video
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* YouTube Insights */}
            <div style={{
              marginTop: '32px',
              padding: '24px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(255, 0, 0, 0.05) 0%, rgba(234, 88, 12, 0.05) 100%)',
              border: '1px solid rgba(255, 0, 0, 0.1)'
            }}>
              <h3 style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '18px',
                fontWeight: '700',
                marginBottom: '16px',
                color: '#1F2937',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Sparkles size={20} color="#EA580C" />
                YouTube Health Trends Insights
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px'
              }}>
                <div style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.8)'
                }}>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#1F2937', marginBottom: '4px' }}>
                    🎯 Top Performing Format
                  </div>
                  <div style={{ fontSize: '13px', color: '#6B7280' }}>
                    "I tried X for Y days" personal experiments get 3x more engagement
                  </div>
                </div>
                <div style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.8)'
                }}>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#1F2937', marginBottom: '4px' }}>
                    ⏰ Best Upload Time
                  </div>
                  <div style={{ fontSize: '13px', color: '#6B7280' }}>
                    Tue-Thu 8-10am for health content targeting women 35+
                  </div>
                </div>
                <div style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.8)'
                }}>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#1F2937', marginBottom: '4px' }}>
                    🔥 Rising Topic This Week
                  </div>
                  <div style={{ fontSize: '13px', color: '#6B7280' }}>
                    "Cortisol face" and stress-related health content +180%
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Trending;
