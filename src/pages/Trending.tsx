/**
 * Trending - Health & Wellness Trend Analysis
 * Discover what's trending in health, wellness, longevity, and related topics
 * Time-based filtering with graphs, source attribution, and YouTube-specific insights
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Search, 
  ArrowLeft,
  Calendar,
  Youtube,
  Clock,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  BarChart3,
  Hash,
  Users,
  Eye,
  Database,
  Globe,
  BookOpen,
  MessageSquare,
  Radio,
  Newspaper,
  Filter,
  ChevronDown,
  CheckCircle
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface DataSource {
  id: string;
  name: string;
  type: 'social' | 'research' | 'news' | 'search' | 'podcast' | 'video';
  icon: string;
  color: string;
  description: string;
  url?: string;
}

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
  sources: string[]; // Source IDs
  sourceBreakdown: { sourceId: string; percentage: number; mentions: number }[];
}

interface YouTubeTrend {
  id: string;
  title: string;
  channel: string;
  views: string;
  published: string;
  category: string;
  engagement: 'high' | 'medium' | 'low';
}

interface TrendDataPoint {
  date: string;
  value: number;
}

// ============================================
// DATA SOURCES
// ============================================

const dataSources: DataSource[] = [
  {
    id: 'google_trends',
    name: 'Google Trends',
    type: 'search',
    icon: '📊',
    color: '#4285F4',
    description: 'Search volume and interest over time',
    url: 'https://trends.google.com'
  },
  {
    id: 'reddit',
    name: 'Reddit',
    type: 'social',
    icon: '🔴',
    color: '#FF4500',
    description: 'r/longevity, r/Biohacking, r/Health discussions',
    url: 'https://reddit.com'
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    type: 'social',
    icon: '🎵',
    color: '#000000',
    description: 'Health hashtag trends and viral content',
    url: 'https://tiktok.com'
  },
  {
    id: 'youtube',
    name: 'YouTube',
    type: 'video',
    icon: '📺',
    color: '#FF0000',
    description: 'Trending wellness videos and channel growth',
    url: 'https://youtube.com'
  },
  {
    id: 'pubmed',
    name: 'PubMed/NIH',
    type: 'research',
    icon: '🔬',
    color: '#20639B',
    description: 'Scientific research and publication trends',
    url: 'https://pubmed.ncbi.nlm.nih.gov'
  },
  {
    id: 'podcasts',
    name: 'Podcast Charts',
    type: 'podcast',
    icon: '🎙️',
    color: '#9B59B6',
    description: 'Apple Podcasts & Spotify health charts',
    url: 'https://podcasts.apple.com'
  },
  {
    id: 'healthline',
    name: 'Healthline/WebMD',
    type: 'news',
    icon: '💊',
    color: '#00BCD4',
    description: 'Medical news and health articles',
    url: 'https://healthline.com'
  },
  {
    id: 'substack',
    name: 'Substack/Medium',
    type: 'news',
    icon: '✍️',
    color: '#FF6B00',
    description: 'Health newsletter trends',
    url: 'https://substack.com'
  },
  {
    id: 'twitter',
    name: 'X/Twitter',
    type: 'social',
    icon: '𝕏',
    color: '#000000',
    description: 'Health professional discussions',
    url: 'https://x.com'
  },
  {
    id: 'rte_irish',
    name: 'RTÉ/Irish Health',
    type: 'news',
    icon: '🇮🇪',
    color: '#00A651',
    description: 'Ireland-specific health trends',
    url: 'https://rte.ie/lifestyle'
  }
];

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
// TIME-SPECIFIC TRENDING DATA
// ============================================

const trendingByTimeframe: Record<string, TrendingTopic[]> = {
  today: [
    {
      id: 't1',
      topic: 'Cortisol face bloating',
      category: 'Mental Health',
      trend: 'up',
      changePercent: 342,
      searchVolume: 89000,
      relatedTerms: ['stress face', 'cortisol weight gain', 'puffy face morning'],
      peakTime: 'Morning 7-9am',
      audienceDemo: 'Women 25-45',
      sources: ['tiktok', 'google_trends', 'reddit'],
      sourceBreakdown: [
        { sourceId: 'tiktok', percentage: 65, mentions: 12400 },
        { sourceId: 'google_trends', percentage: 25, mentions: 89000 },
        { sourceId: 'reddit', percentage: 10, mentions: 2300 }
      ]
    },
    {
      id: 't2',
      topic: 'Mouth taping sleep',
      category: 'Sleep & Recovery',
      trend: 'up',
      changePercent: 178,
      searchVolume: 67000,
      relatedTerms: ['nasal breathing', 'sleep tape', 'mouth breathing fix'],
      peakTime: 'Night 9-11pm',
      audienceDemo: 'Adults 30-50',
      sources: ['youtube', 'tiktok', 'podcasts'],
      sourceBreakdown: [
        { sourceId: 'youtube', percentage: 45, mentions: 8900 },
        { sourceId: 'tiktok', percentage: 40, mentions: 7800 },
        { sourceId: 'podcasts', percentage: 15, mentions: 890 }
      ]
    },
    {
      id: 't3',
      topic: 'Ozempic rebound weight',
      category: 'Weight Management',
      trend: 'up',
      changePercent: 256,
      searchVolume: 124000,
      relatedTerms: ['stopping ozempic', 'GLP-1 withdrawal', 'weight regain'],
      peakTime: 'Morning 8-10am',
      audienceDemo: 'Adults 35-55',
      sources: ['google_trends', 'healthline', 'reddit'],
      sourceBreakdown: [
        { sourceId: 'google_trends', percentage: 50, mentions: 124000 },
        { sourceId: 'healthline', percentage: 30, mentions: 45 },
        { sourceId: 'reddit', percentage: 20, mentions: 3400 }
      ]
    },
    {
      id: 't4',
      topic: 'Protein coffee trend',
      category: 'Nutrition & Diet',
      trend: 'up',
      changePercent: 198,
      searchVolume: 56000,
      relatedTerms: ['proffee', 'protein shake coffee', 'morning protein'],
      peakTime: 'Morning 6-8am',
      audienceDemo: 'Women 25-45',
      sources: ['tiktok', 'youtube', 'substack'],
      sourceBreakdown: [
        { sourceId: 'tiktok', percentage: 55, mentions: 23000 },
        { sourceId: 'youtube', percentage: 30, mentions: 4500 },
        { sourceId: 'substack', percentage: 15, mentions: 890 }
      ]
    },
    {
      id: 't5',
      topic: 'Walking pad desk',
      category: 'Fitness & Movement',
      trend: 'up',
      changePercent: 145,
      searchVolume: 78000,
      relatedTerms: ['under desk treadmill', 'WFH fitness', 'desk walking'],
      peakTime: 'Afternoon 1-3pm',
      audienceDemo: 'Adults 30-50',
      sources: ['tiktok', 'youtube', 'twitter'],
      sourceBreakdown: [
        { sourceId: 'tiktok', percentage: 50, mentions: 18000 },
        { sourceId: 'youtube', percentage: 35, mentions: 6700 },
        { sourceId: 'twitter', percentage: 15, mentions: 2300 }
      ]
    }
  ],
  week: [
    {
      id: 'w1',
      topic: 'Seed cycling hormones',
      category: 'Women\'s Health',
      trend: 'up',
      changePercent: 203,
      searchVolume: 134000,
      relatedTerms: ['hormone balance naturally', 'seed rotation', 'menstrual health'],
      peakTime: 'Morning 7-9am',
      audienceDemo: 'Women 25-45',
      sources: ['tiktok', 'youtube', 'healthline', 'pubmed'],
      sourceBreakdown: [
        { sourceId: 'tiktok', percentage: 40, mentions: 34000 },
        { sourceId: 'youtube', percentage: 30, mentions: 12000 },
        { sourceId: 'healthline', percentage: 20, mentions: 89 },
        { sourceId: 'pubmed', percentage: 10, mentions: 23 }
      ]
    },
    {
      id: 'w2',
      topic: 'Perimenopause symptoms at 38',
      category: 'Hormones & Menopause',
      trend: 'up',
      changePercent: 167,
      searchVolume: 189000,
      relatedTerms: ['early perimenopause', 'hormone testing', 'HRT options'],
      peakTime: 'Evening 7-9pm',
      audienceDemo: 'Women 35-50',
      sources: ['google_trends', 'reddit', 'healthline', 'rte_irish'],
      sourceBreakdown: [
        { sourceId: 'google_trends', percentage: 45, mentions: 189000 },
        { sourceId: 'reddit', percentage: 25, mentions: 8900 },
        { sourceId: 'healthline', percentage: 20, mentions: 156 },
        { sourceId: 'rte_irish', percentage: 10, mentions: 12 }
      ]
    },
    {
      id: 'w3',
      topic: 'Nervous system reset',
      category: 'Mental Health',
      trend: 'up',
      changePercent: 234,
      searchVolume: 145000,
      relatedTerms: ['vagus nerve stimulation', 'polyvagal exercises', 'dysregulation'],
      peakTime: 'Evening 6-8pm',
      audienceDemo: 'Adults 25-45',
      sources: ['tiktok', 'youtube', 'podcasts', 'substack'],
      sourceBreakdown: [
        { sourceId: 'tiktok', percentage: 45, mentions: 56000 },
        { sourceId: 'youtube', percentage: 30, mentions: 23000 },
        { sourceId: 'podcasts', percentage: 15, mentions: 2300 },
        { sourceId: 'substack', percentage: 10, mentions: 1200 }
      ]
    },
    {
      id: 'w4',
      topic: 'Hair loss women thyroid',
      category: 'Hair & Skin',
      trend: 'up',
      changePercent: 145,
      searchVolume: 156000,
      relatedTerms: ['thyroid hair loss', 'hashimotos hair', 'ferritin hair'],
      peakTime: 'Evening 8-10pm',
      audienceDemo: 'Women 35-55',
      sources: ['google_trends', 'reddit', 'healthline'],
      sourceBreakdown: [
        { sourceId: 'google_trends', percentage: 50, mentions: 156000 },
        { sourceId: 'reddit', percentage: 30, mentions: 4500 },
        { sourceId: 'healthline', percentage: 20, mentions: 234 }
      ]
    },
    {
      id: 'w5',
      topic: 'Gut health anxiety connection',
      category: 'Gut Health',
      trend: 'up',
      changePercent: 178,
      searchVolume: 123000,
      relatedTerms: ['gut brain axis', 'probiotics anxiety', 'microbiome mood'],
      peakTime: 'Morning 9-11am',
      audienceDemo: 'Adults 25-50',
      sources: ['pubmed', 'youtube', 'podcasts', 'healthline'],
      sourceBreakdown: [
        { sourceId: 'pubmed', percentage: 35, mentions: 67 },
        { sourceId: 'youtube', percentage: 30, mentions: 18000 },
        { sourceId: 'podcasts', percentage: 20, mentions: 3400 },
        { sourceId: 'healthline', percentage: 15, mentions: 189 }
      ]
    }
  ],
  month: [
    {
      id: 'm1',
      topic: 'Ozempic alternatives natural',
      category: 'Weight Management',
      trend: 'up',
      changePercent: 312,
      searchVolume: 345000,
      relatedTerms: ['berberine GLP-1', 'natural appetite suppressant', 'semaglutide alternatives'],
      peakTime: 'Morning 8-10am',
      audienceDemo: 'Adults 35-55',
      sources: ['google_trends', 'tiktok', 'youtube', 'pubmed', 'healthline'],
      sourceBreakdown: [
        { sourceId: 'google_trends', percentage: 35, mentions: 345000 },
        { sourceId: 'tiktok', percentage: 25, mentions: 89000 },
        { sourceId: 'youtube', percentage: 20, mentions: 34000 },
        { sourceId: 'pubmed', percentage: 10, mentions: 156 },
        { sourceId: 'healthline', percentage: 10, mentions: 567 }
      ]
    },
    {
      id: 'm2',
      topic: 'Zone 2 cardio longevity',
      category: 'Fitness & Movement',
      trend: 'up',
      changePercent: 267,
      searchVolume: 234000,
      relatedTerms: ['Peter Attia zone 2', 'heart rate training', 'mitochondrial health'],
      peakTime: 'Morning 5-7am',
      audienceDemo: 'Adults 35-55',
      sources: ['youtube', 'podcasts', 'substack', 'twitter'],
      sourceBreakdown: [
        { sourceId: 'youtube', percentage: 40, mentions: 45000 },
        { sourceId: 'podcasts', percentage: 30, mentions: 12000 },
        { sourceId: 'substack', percentage: 20, mentions: 8900 },
        { sourceId: 'twitter', percentage: 10, mentions: 5600 }
      ]
    },
    {
      id: 'm3',
      topic: 'Magnesium types benefits',
      category: 'Supplements',
      trend: 'up',
      changePercent: 189,
      searchVolume: 289000,
      relatedTerms: ['magnesium glycinate', 'magnesium threonate', 'best magnesium type'],
      peakTime: 'Night 9-11pm',
      audienceDemo: 'Adults 30-55',
      sources: ['google_trends', 'youtube', 'reddit', 'healthline'],
      sourceBreakdown: [
        { sourceId: 'google_trends', percentage: 40, mentions: 289000 },
        { sourceId: 'youtube', percentage: 25, mentions: 23000 },
        { sourceId: 'reddit', percentage: 20, mentions: 12000 },
        { sourceId: 'healthline', percentage: 15, mentions: 456 }
      ]
    },
    {
      id: 'm4',
      topic: 'Collagen for joints skin',
      category: 'Longevity & Aging',
      trend: 'stable',
      changePercent: 45,
      searchVolume: 356000,
      relatedTerms: ['marine collagen', 'collagen peptides', 'best collagen supplement'],
      peakTime: 'Morning 8-10am',
      audienceDemo: 'Women 35-60',
      sources: ['google_trends', 'youtube', 'tiktok', 'healthline'],
      sourceBreakdown: [
        { sourceId: 'google_trends', percentage: 45, mentions: 356000 },
        { sourceId: 'youtube', percentage: 25, mentions: 34000 },
        { sourceId: 'tiktok', percentage: 20, mentions: 28000 },
        { sourceId: 'healthline', percentage: 10, mentions: 345 }
      ]
    },
    {
      id: 'm5',
      topic: 'Menopause brain fog',
      category: 'Hormones & Menopause',
      trend: 'up',
      changePercent: 156,
      searchVolume: 198000,
      relatedTerms: ['cognitive menopause', 'HRT brain', 'menopause memory'],
      peakTime: 'Morning 9-11am',
      audienceDemo: 'Women 45-60',
      sources: ['google_trends', 'pubmed', 'healthline', 'rte_irish'],
      sourceBreakdown: [
        { sourceId: 'google_trends', percentage: 40, mentions: 198000 },
        { sourceId: 'pubmed', percentage: 25, mentions: 89 },
        { sourceId: 'healthline', percentage: 25, mentions: 234 },
        { sourceId: 'rte_irish', percentage: 10, mentions: 23 }
      ]
    }
  ],
  year: [
    {
      id: 'y1',
      topic: 'GLP-1 medications weight loss',
      category: 'Weight Management',
      trend: 'up',
      changePercent: 1240,
      searchVolume: 2450000,
      relatedTerms: ['Ozempic', 'Wegovy', 'Mounjaro', 'tirzepatide'],
      peakTime: 'All day',
      audienceDemo: 'Adults 30-65',
      sources: ['google_trends', 'pubmed', 'healthline', 'youtube', 'reddit'],
      sourceBreakdown: [
        { sourceId: 'google_trends', percentage: 35, mentions: 2450000 },
        { sourceId: 'pubmed', percentage: 20, mentions: 4500 },
        { sourceId: 'healthline', percentage: 20, mentions: 3400 },
        { sourceId: 'youtube', percentage: 15, mentions: 890000 },
        { sourceId: 'reddit', percentage: 10, mentions: 345000 }
      ]
    },
    {
      id: 'y2',
      topic: 'Perimenopause awareness',
      category: 'Hormones & Menopause',
      trend: 'up',
      changePercent: 456,
      searchVolume: 1890000,
      relatedTerms: ['hormone therapy', 'menopause symptoms', 'HRT benefits risks'],
      peakTime: 'Evening 6-10pm',
      audienceDemo: 'Women 35-55',
      sources: ['google_trends', 'youtube', 'podcasts', 'pubmed', 'rte_irish'],
      sourceBreakdown: [
        { sourceId: 'google_trends', percentage: 40, mentions: 1890000 },
        { sourceId: 'youtube', percentage: 25, mentions: 456000 },
        { sourceId: 'podcasts', percentage: 15, mentions: 23000 },
        { sourceId: 'pubmed', percentage: 10, mentions: 2300 },
        { sourceId: 'rte_irish', percentage: 10, mentions: 890 }
      ]
    },
    {
      id: 'y3',
      topic: 'Gut microbiome health',
      category: 'Gut Health',
      trend: 'up',
      changePercent: 234,
      searchVolume: 1670000,
      relatedTerms: ['probiotics', 'prebiotics', 'gut testing', 'microbiome diet'],
      peakTime: 'Morning 8-11am',
      audienceDemo: 'Adults 25-55',
      sources: ['google_trends', 'pubmed', 'youtube', 'healthline'],
      sourceBreakdown: [
        { sourceId: 'google_trends', percentage: 35, mentions: 1670000 },
        { sourceId: 'pubmed', percentage: 25, mentions: 8900 },
        { sourceId: 'youtube', percentage: 25, mentions: 234000 },
        { sourceId: 'healthline', percentage: 15, mentions: 12000 }
      ]
    },
    {
      id: 'y4',
      topic: 'Longevity biohacking',
      category: 'Longevity & Aging',
      trend: 'up',
      changePercent: 378,
      searchVolume: 890000,
      relatedTerms: ['Bryan Johnson', 'rapamycin', 'NAD+', 'metformin longevity'],
      peakTime: 'Morning 6-9am',
      audienceDemo: 'Adults 35-60',
      sources: ['youtube', 'podcasts', 'substack', 'twitter', 'pubmed'],
      sourceBreakdown: [
        { sourceId: 'youtube', percentage: 30, mentions: 234000 },
        { sourceId: 'podcasts', percentage: 25, mentions: 45000 },
        { sourceId: 'substack', percentage: 20, mentions: 34000 },
        { sourceId: 'twitter', percentage: 15, mentions: 89000 },
        { sourceId: 'pubmed', percentage: 10, mentions: 1200 }
      ]
    },
    {
      id: 'y5',
      topic: 'Mental health wellness',
      category: 'Mental Health',
      trend: 'up',
      changePercent: 289,
      searchVolume: 2100000,
      relatedTerms: ['anxiety management', 'burnout recovery', 'nervous system regulation'],
      peakTime: 'Evening 6-10pm',
      audienceDemo: 'Adults 20-50',
      sources: ['google_trends', 'tiktok', 'youtube', 'podcasts'],
      sourceBreakdown: [
        { sourceId: 'google_trends', percentage: 35, mentions: 2100000 },
        { sourceId: 'tiktok', percentage: 30, mentions: 567000 },
        { sourceId: 'youtube', percentage: 20, mentions: 345000 },
        { sourceId: 'podcasts', percentage: 15, mentions: 67000 }
      ]
    }
  ]
};

const generateYouTubeTrends = (timeframe: string): YouTubeTrend[] => {
  const trends: Record<string, YouTubeTrend[]> = {
    today: [
      { id: 'yt1', title: 'I Fixed My Cortisol Face in 7 Days (What Worked)', channel: 'Health Coach Lisa', views: '234K', published: '8 hours ago', category: 'Mental Health', engagement: 'high' },
      { id: 'yt2', title: 'Mouth Taping Changed My Sleep - 30 Day Results', channel: 'Biohacker Mom', views: '156K', published: '12 hours ago', category: 'Sleep', engagement: 'high' },
      { id: 'yt3', title: 'Doctor Reacts: Ozempic Withdrawal Is Real', channel: 'Dr. Wellness MD', views: '89K', published: '6 hours ago', category: 'Weight', engagement: 'medium' }
    ],
    week: [
      { id: 'yt1', title: 'I Tried Seed Cycling for 3 Months - Hormone Results', channel: 'Women\'s Wellness', views: '1.2M', published: '3 days ago', category: 'Women\'s Health', engagement: 'high' },
      { id: 'yt2', title: 'Perimenopause at 38: Signs I Wish I Knew', channel: 'Susan Health', views: '890K', published: '5 days ago', category: 'Hormones', engagement: 'high' },
      { id: 'yt3', title: 'Vagus Nerve Exercises That Actually Work', channel: 'Nervous System Reset', views: '567K', published: '4 days ago', category: 'Mental Health', engagement: 'high' }
    ],
    month: [
      { id: 'yt1', title: 'Natural Ozempic Alternatives: What The Research Shows', channel: 'Evidence Based Health', views: '3.4M', published: '2 weeks ago', category: 'Weight', engagement: 'high' },
      { id: 'yt2', title: 'Zone 2 Cardio Explained - Peter Attia Protocol', channel: 'Longevity Lab', views: '2.1M', published: '3 weeks ago', category: 'Fitness', engagement: 'high' },
      { id: 'yt3', title: 'The Magnesium Guide: Which Type For What', channel: 'Supplement Science', views: '1.8M', published: '2 weeks ago', category: 'Supplements', engagement: 'high' }
    ],
    year: [
      { id: 'yt1', title: 'Everything About GLP-1 Medications Explained', channel: 'Medical Truth', views: '12M', published: '8 months ago', category: 'Weight', engagement: 'high' },
      { id: 'yt2', title: 'The Complete Perimenopause Guide', channel: 'Dr. Hormone Health', views: '8.9M', published: '6 months ago', category: 'Hormones', engagement: 'high' },
      { id: 'yt3', title: 'Bryan Johnson\'s Longevity Protocol Analyzed', channel: 'Biohacking Science', views: '6.7M', published: '4 months ago', category: 'Longevity', engagement: 'high' }
    ]
  };
  return trends[timeframe] || trends.week;
};

const generateTrendGraph = (timeframe: string): TrendDataPoint[] => {
  const points: TrendDataPoint[] = [];
  const numPoints = timeframe === 'today' ? 24 : timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 12;
  
  let baseValue = 30 + Math.random() * 20;
  const trendDirection = Math.random() > 0.3 ? 1 : -1;
  
  for (let i = 0; i < numPoints; i++) {
    const variation = (Math.random() - 0.5) * 15;
    const trendEffect = trendDirection * (i / numPoints) * 40;
    baseValue = Math.max(10, Math.min(100, baseValue + variation * 0.2 + trendEffect * 0.1));
    
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
  const [activeTab, setActiveTab] = useState<'topics' | 'youtube' | 'sources'>('topics');
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [showSourceFilter, setShowSourceFilter] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadTrends();
  }, []);

  useEffect(() => {
    loadTrends();
  }, [timeframe, selectedCategory, selectedSources]);

  const loadTrends = () => {
    let topics = trendingByTimeframe[timeframe] || trendingByTimeframe.week;
    
    // Filter by category
    if (selectedCategory !== 'All Health & Wellness') {
      topics = topics.filter(t => t.category === selectedCategory);
    }
    
    // Filter by selected sources
    if (selectedSources.length > 0) {
      topics = topics.filter(t => 
        t.sources.some(s => selectedSources.includes(s))
      );
    }
    
    setTrendingTopics(topics);
    setYoutubeTrends(generateYouTubeTrends(timeframe));
    
    if (topics.length > 0) {
      setSelectedTopic(topics[0]);
      setGraphData(generateTrendGraph(timeframe));
    } else {
      setSelectedTopic(null);
    }
  };

  const handleTopicSelect = (topic: TrendingTopic) => {
    setSelectedTopic(topic);
    setGraphData(generateTrendGraph(timeframe));
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadTrends();
      return;
    }
    
    setSearching(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Search across all timeframes
    const allTopics = Object.values(trendingByTimeframe).flat();
    const query = searchQuery.toLowerCase();
    const results = allTopics.filter(t => 
      t.topic.toLowerCase().includes(query) ||
      t.relatedTerms.some(term => term.toLowerCase().includes(query)) ||
      t.category.toLowerCase().includes(query)
    );
    
    setTrendingTopics(results.length > 0 ? results : [{
      id: 'search-1',
      topic: searchQuery,
      category: 'Search Result',
      trend: 'up' as const,
      changePercent: Math.round(50 + Math.random() * 150),
      searchVolume: Math.round(50000 + Math.random() * 200000),
      relatedTerms: [`${searchQuery} benefits`, `${searchQuery} for women`, `best ${searchQuery}`],
      peakTime: 'Morning 8-10am',
      audienceDemo: 'Women 35-55',
      sources: ['google_trends', 'youtube', 'reddit'],
      sourceBreakdown: [
        { sourceId: 'google_trends', percentage: 50, mentions: 100000 },
        { sourceId: 'youtube', percentage: 30, mentions: 15000 },
        { sourceId: 'reddit', percentage: 20, mentions: 5000 }
      ]
    }]);
    
    setSearching(false);
  };

  const toggleSource = (sourceId: string) => {
    setSelectedSources(prev => 
      prev.includes(sourceId) 
        ? prev.filter(s => s !== sourceId)
        : [...prev, sourceId]
    );
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

  const getSourceById = (id: string) => dataSources.find(s => s.id === id);

  // Simple bar chart component
  const TrendChart = ({ data }: { data: TrendDataPoint[] }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-end', 
        gap: '4px', 
        height: '180px',
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
                height: `${(point.value / maxValue) * 130}px`,
                background: `linear-gradient(180deg, #F97316 0%, #EA580C 100%)`,
                borderRadius: '4px 4px 0 0',
                transition: 'height 0.3s ease',
                minHeight: '4px'
              }}
            />
            <span style={{ 
              fontSize: '9px', 
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
              Multi-source trend analysis • {dataSources.length} data sources • Updated in real-time
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

          {/* Source Filter Toggle */}
          <button
            onClick={() => setShowSourceFilter(!showSourceFilter)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              borderRadius: '12px',
              border: selectedSources.length > 0 ? '2px solid #EA580C' : '2px solid rgba(234, 88, 12, 0.2)',
              background: selectedSources.length > 0 ? 'rgba(234, 88, 12, 0.1)' : 'rgba(255, 255, 255, 0.9)',
              color: selectedSources.length > 0 ? '#EA580C' : '#6B7280',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              fontFamily: "'Outfit', sans-serif"
            }}
          >
            <Database size={16} />
            Sources {selectedSources.length > 0 && `(${selectedSources.length})`}
            <ChevronDown size={16} style={{ transform: showSourceFilter ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>
        </div>

        {/* Source Filter Panel */}
        {showSourceFilter && (
          <div style={{
            marginTop: '16px',
            padding: '20px',
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '16px',
            border: '1px solid rgba(234, 88, 12, 0.1)'
          }}>
            <div style={{ marginBottom: '12px', fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>
              Filter by Data Source:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {dataSources.map(source => {
                const isSelected = selectedSources.includes(source.id);
                return (
                  <button
                    key={source.id}
                    onClick={() => toggleSource(source.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      borderRadius: '10px',
                      border: isSelected ? `2px solid ${source.color}` : '1px solid rgba(0,0,0,0.1)',
                      background: isSelected ? `${source.color}15` : 'white',
                      color: isSelected ? source.color : '#6B7280',
                      fontWeight: '600',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    <span>{source.icon}</span>
                    {source.name}
                    {isSelected && <CheckCircle size={14} />}
                  </button>
                );
              })}
            </div>
            {selectedSources.length > 0 && (
              <button
                onClick={() => setSelectedSources([])}
                style={{
                  marginTop: '12px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'rgba(234, 88, 12, 0.1)',
                  color: '#EA580C',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
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
            { key: 'sources', label: 'Data Sources', icon: Database },
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '24px' }}>
            {/* Trending Topics List */}
            <div>
              <h2 style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '20px',
                fontWeight: '700',
                marginBottom: '16px',
                color: '#1F2937'
              }}>
                🔥 Trending {timeframe === 'today' ? 'Today' : timeframe === 'week' ? 'This Week' : timeframe === 'month' ? 'This Month' : 'This Year'} in {selectedCategory}
              </h2>
              
              {trendingTopics.length > 0 ? (
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
                          
                          <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#6B7280', marginBottom: '10px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Eye size={14} />
                              {formatNumber(topic.searchVolume)} searches
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Users size={14} />
                              {topic.audienceDemo}
                            </span>
                          </div>
                          
                          {/* Source badges */}
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {topic.sources.slice(0, 4).map(sourceId => {
                              const source = getSourceById(sourceId);
                              return source ? (
                                <span
                                  key={sourceId}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '3px 8px',
                                    borderRadius: '6px',
                                    background: `${source.color}15`,
                                    color: source.color,
                                    fontSize: '11px',
                                    fontWeight: '600'
                                  }}
                                >
                                  {source.icon} {source.name}
                                </span>
                              ) : null;
                            })}
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
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '60px',
                  color: '#6B7280',
                  background: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '16px'
                }}>
                  <TrendingUp size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                  <p style={{ fontSize: '18px', fontWeight: '600' }}>No trends found</p>
                  <p>Try adjusting your filters or search for a specific topic</p>
                </div>
              )}
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
                <div style={{ marginBottom: '20px' }}>
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
                    INTEREST OVER TIME ({timeframe === 'today' ? '24 hours' : timeframe === 'week' ? '7 days' : timeframe === 'month' ? '30 days' : '12 months'})
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
                    padding: '14px',
                    borderRadius: '12px',
                    background: 'rgba(234, 88, 12, 0.05)'
                  }}>
                    <div style={{ fontSize: '22px', fontWeight: '700', color: '#EA580C' }}>
                      {formatNumber(selectedTopic.searchVolume)}
                    </div>
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>Monthly Searches</div>
                  </div>
                  <div style={{
                    padding: '14px',
                    borderRadius: '12px',
                    background: 'rgba(16, 185, 129, 0.05)'
                  }}>
                    <div style={{ fontSize: '22px', fontWeight: '700', color: '#10B981' }}>
                      {selectedTopic.peakTime}
                    </div>
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>Peak Activity</div>
                  </div>
                </div>

                {/* Source Breakdown */}
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
                    <Database size={14} />
                    SOURCE BREAKDOWN
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedTopic.sourceBreakdown.map(sb => {
                      const source = getSourceById(sb.sourceId);
                      return source ? (
                        <div key={sb.sourceId} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ width: '24px' }}>{source.icon}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>{source.name}</span>
                              <span style={{ fontSize: '12px', color: '#6B7280' }}>{sb.percentage}%</span>
                            </div>
                            <div style={{
                              height: '6px',
                              borderRadius: '3px',
                              background: 'rgba(0,0,0,0.05)'
                            }}>
                              <div style={{
                                height: '100%',
                                borderRadius: '3px',
                                background: source.color,
                                width: `${sb.percentage}%`
                              }} />
                            </div>
                          </div>
                          <span style={{ fontSize: '11px', color: '#9CA3AF', minWidth: '60px', textAlign: 'right' }}>
                            {formatNumber(sb.mentions)}
                          </span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>

                {/* Related Terms */}
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
                    <Hash size={14} />
                    RELATED SEARCHES
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {selectedTopic.relatedTerms.map((term, i) => (
                      <span
                        key={i}
                        style={{
                          padding: '5px 10px',
                          borderRadius: '6px',
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
              Trending Health & Wellness on YouTube ({timeframe === 'today' ? 'Today' : timeframe === 'week' ? 'This Week' : timeframe === 'month' ? 'This Month' : 'This Year'})
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
                      
                      <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>
                        {video.channel}
                      </p>
                      
                      <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#9CA3AF' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Eye size={12} />
                          {video.views} views
                        </span>
                        <span>{video.published}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'sources' && (
          <div>
            <h2 style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '20px',
              fontWeight: '700',
              marginBottom: '8px',
              color: '#1F2937'
            }}>
              📊 Data Sources
            </h2>
            <p style={{ color: '#6B7280', marginBottom: '24px', fontSize: '15px' }}>
              Trend analysis is aggregated from {dataSources.length} authoritative health and wellness sources
            </p>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '16px'
            }}>
              {dataSources.map((source, idx) => (
                <div
                  key={source.id}
                  className={mounted ? 'animate-in' : ''}
                  style={{
                    animationDelay: `${idx * 50}ms`,
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '16px',
                    padding: '20px',
                    border: `2px solid ${source.color}30`,
                    borderLeft: `4px solid ${source.color}`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '28px' }}>{source.icon}</span>
                    <div>
                      <h3 style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: '16px',
                        fontWeight: '700',
                        color: '#1F2937',
                        marginBottom: '2px'
                      }}>
                        {source.name}
                      </h3>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: `${source.color}15`,
                        color: source.color,
                        fontSize: '11px',
                        fontWeight: '600',
                        textTransform: 'capitalize'
                      }}>
                        {source.type}
                      </span>
                    </div>
                  </div>
                  
                  <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '12px' }}>
                    {source.description}
                  </p>
                  
                  {source.url && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        color: source.color,
                        fontWeight: '600',
                        textDecoration: 'none'
                      }}
                    >
                      <ExternalLink size={14} />
                      Visit Source
                    </a>
                  )}
                </div>
              ))}
            </div>

            {/* Future Sources Note */}
            <div style={{
              marginTop: '32px',
              padding: '24px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.05) 0%, rgba(249, 115, 22, 0.05) 100%)',
              border: '1px dashed rgba(234, 88, 12, 0.3)'
            }}>
              <h3 style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '16px',
                fontWeight: '700',
                marginBottom: '12px',
                color: '#1F2937'
              }}>
                🚀 Coming Soon: Additional Sources
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {[
                  'LinkedIn Health Discourse',
                  'Amazon Health Bestsellers',
                  'Mind Body Green',
                  'Well+Good',
                  'NHS UK Trends',
                  'Google Scholar',
                  'Instagram Health Tags'
                ].map(source => (
                  <span
                    key={source}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      background: 'rgba(0, 0, 0, 0.05)',
                      color: '#6B7280',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}
                  >
                    {source}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Trending;
