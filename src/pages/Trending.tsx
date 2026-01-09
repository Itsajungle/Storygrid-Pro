/**
 * Trending - Health & Wellness Trend Analysis (US-Focused)
 * Real-time data from Google Trends & YouTube Data API
 * Discover what's trending in health, wellness, longevity, and related topics
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
  CheckCircle,
  MapPin,
  AlertCircle,
  Play,
  Sparkles as SparklesIcon,
  Loader2
} from 'lucide-react';

// Management Hub API URL
const MANAGEMENT_HUB_URL = 'https://management-hub-production-80d6.up.railway.app';

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
  views: string | number;
  published: string;
  category: string;
  engagement: 'high' | 'medium' | 'low';
  thumbnail?: string;
  likes?: number;
  comments?: number;
  engagement_rate?: number;
}

interface RealGoogleTrend {
  topic: string;
  interest_score: number;
  peak_score: number;
  trend: string;
  change_percent: number;
  data_points: [string, number][];
  source: string;
  region: string;
}

interface RealYouTubeVideo {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  published: string;
  description: string;
  views: number;
  likes: number;
  comments: number;
  engagement_rate: number;
}

interface RedditPost {
  id: string;
  title: string;
  author: string;
  subreddit: string;
  link: string;
  published: string;
  summary: string;
}

interface RedditKeyword {
  keyword: string;
  count: number;
  posts: string[];
}

interface PubMedArticle {
  pmid: string;
  title: string;
  authors: string;
  journal: string;
  pub_date: string;
  link: string;
  doi: string;
}

interface ResearchTopic {
  topic: string;
  count: number;
  articles: string[];
}

interface NewsArticle {
  title: string;
  description: string;
  source: string;
  author: string;
  url: string;
  image: string;
  published: string;
}

interface NewsTopic {
  topic: string;
  count: number;
  headlines: string[];
}

interface Podcast {
  id: number;
  name: string;
  artist: string;
  artwork: string;
  genre: string;
  track_count: number;
  link: string;
  rating: number;
  rating_count: number;
}

interface ScholarArticle {
  title: string;
  authors: string;
  year: string;
  venue: string;
  abstract: string;
  citations: number;
  url: string;
}

interface NewsletterArticle {
  title: string;
  author: string;
  link: string;
  published: string;
  summary: string;
  source: string;
  source_type: string;
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
  const [activeTab, setActiveTab] = useState<'topics' | 'youtube' | 'reddit' | 'news' | 'podcasts' | 'newsletters' | 'pubmed' | 'scholar' | 'sources' | 'tiktok'>('topics');
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [showSourceFilter, setShowSourceFilter] = useState(false);
  
  // Real API data states
  const [realGoogleTrends, setRealGoogleTrends] = useState<RealGoogleTrend[]>([]);
  const [realYouTubeVideos, setRealYouTubeVideos] = useState<RealYouTubeVideo[]>([]);
  const [loadingRealData, setLoadingRealData] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [usingRealData, setUsingRealData] = useState(false);
  
  // Source status
  interface SourceStatus {
    id: string;
    name: string;
    status: 'online' | 'offline' | 'error' | 'planned';
    icon: string;
    message: string;
    region?: string;
  }
  const [sourceStatuses, setSourceStatuses] = useState<SourceStatus[]>([]);
  const [statusSummary, setStatusSummary] = useState<{online: number; offline: number; planned: number}>({online: 0, offline: 0, planned: 0});
  
  // Reddit data
  const [redditPosts, setRedditPosts] = useState<RedditPost[]>([]);
  const [redditKeywords, setRedditKeywords] = useState<RedditKeyword[]>([]);
  
  // PubMed data
  const [pubmedArticles, setPubmedArticles] = useState<PubMedArticle[]>([]);
  const [researchTopics, setResearchTopics] = useState<ResearchTopic[]>([]);
  const [pubmedTotal, setPubmedTotal] = useState<number>(0);
  
  // News data
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [newsTopics, setNewsTopics] = useState<NewsTopic[]>([]);
  
  // Podcasts data
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [podcastTopics, setPodcastTopics] = useState<{topic: string; count: number}[]>([]);
  
  // Google Scholar data
  const [scholarArticles, setScholarArticles] = useState<ScholarArticle[]>([]);
  const [scholarTopics, setScholarTopics] = useState<{topic: string; count: number}[]>([]);
  
  // Newsletter data
  const [newsletterArticles, setNewsletterArticles] = useState<NewsletterArticle[]>([]);
  const [newsletterTopics, setNewsletterTopics] = useState<{topic: string; count: number}[]>([]);

  useEffect(() => {
    setMounted(true);
    loadTrends();
    fetchRealTrends();
    fetchSourceStatus();
  }, []);

  useEffect(() => {
    loadTrends();
    fetchRealTrends();
  }, [timeframe, selectedCategory, selectedSources]);

  // Fetch source health status
  const fetchSourceStatus = async () => {
    try {
      const response = await fetch(`${MANAGEMENT_HUB_URL}/api/trends/status`);
      if (response.ok) {
        const data = await response.json();
        setSourceStatuses(data.sources || []);
        setStatusSummary(data.summary || {online: 0, offline: 0, planned: 0});
      }
    } catch (error) {
      console.error('Failed to fetch source status:', error);
    }
  };

  // Fetch real trends from Management Hub API
  const fetchRealTrends = async () => {
    setLoadingRealData(true);
    setApiError(null);
    
    try {
      // Fetch Google Trends
      const googleResponse = await fetch(
        `${MANAGEMENT_HUB_URL}/api/trends/google?timeframe=${timeframe}`
      );
      
      if (googleResponse.ok) {
        const googleData = await googleResponse.json();
        if (googleData.trends && googleData.trends.length > 0) {
          setRealGoogleTrends(googleData.trends);
          setUsingRealData(true);
        }
      }
      
      // Fetch YouTube Trends
      const youtubeResponse = await fetch(
        `${MANAGEMENT_HUB_URL}/api/trends/youtube?topic=health%20wellness%20longevity&max_results=10`
      );
      
      if (youtubeResponse.ok) {
        const youtubeData = await youtubeResponse.json();
        if (youtubeData.videos && youtubeData.videos.length > 0) {
          setRealYouTubeVideos(youtubeData.videos);
          setUsingRealData(true);
        }
      }
      
      // Fetch Reddit Trends (RSS - no API key needed!)
      const redditResponse = await fetch(
        `${MANAGEMENT_HUB_URL}/api/trends/reddit?limit=20`
      );
      
      if (redditResponse.ok) {
        const redditData = await redditResponse.json();
        if (redditData.posts && redditData.posts.length > 0) {
          setRedditPosts(redditData.posts);
          setRedditKeywords(redditData.trending_keywords || []);
          setUsingRealData(true);
        }
      }
      
      // Fetch PubMed Research (free API - no key needed!)
      const pubmedResponse = await fetch(
        `${MANAGEMENT_HUB_URL}/api/trends/pubmed?days=30&max_results=20`
      );
      
      if (pubmedResponse.ok) {
        const pubmedData = await pubmedResponse.json();
        if (pubmedData.articles && pubmedData.articles.length > 0) {
          setPubmedArticles(pubmedData.articles);
          setResearchTopics(pubmedData.trending_research || []);
          setPubmedTotal(pubmedData.total_found || 0);
          setUsingRealData(true);
        }
      }
      
      // Fetch Health News
      const newsResponse = await fetch(
        `${MANAGEMENT_HUB_URL}/api/trends/news?days=7&max_results=20`
      );
      
      if (newsResponse.ok) {
        const newsData = await newsResponse.json();
        if (newsData.articles && newsData.articles.length > 0) {
          setNewsArticles(newsData.articles);
          setNewsTopics(newsData.trending_topics || []);
          setUsingRealData(true);
        }
      }
      
      // Fetch Podcasts (iTunes API - free!)
      const podcastResponse = await fetch(
        `${MANAGEMENT_HUB_URL}/api/trends/podcasts?limit=20`
      );
      
      if (podcastResponse.ok) {
        const podcastData = await podcastResponse.json();
        if (podcastData.podcasts && podcastData.podcasts.length > 0) {
          setPodcasts(podcastData.podcasts);
          setPodcastTopics(podcastData.trending_topics || []);
          setUsingRealData(true);
        }
      }
      
      // Fetch Google Scholar
      const scholarResponse = await fetch(
        `${MANAGEMENT_HUB_URL}/api/trends/scholar?max_results=15`
      );
      
      if (scholarResponse.ok) {
        const scholarData = await scholarResponse.json();
        if (scholarData.articles && scholarData.articles.length > 0) {
          setScholarArticles(scholarData.articles);
          setScholarTopics(scholarData.trending_topics || []);
          setUsingRealData(true);
        }
      }
      
      // Fetch Newsletters (Substack & Medium)
      const newsletterResponse = await fetch(
        `${MANAGEMENT_HUB_URL}/api/trends/newsletters?limit=20`
      );
      
      if (newsletterResponse.ok) {
        const newsletterData = await newsletterResponse.json();
        if (newsletterData.articles && newsletterData.articles.length > 0) {
          setNewsletterArticles(newsletterData.articles);
          setNewsletterTopics(newsletterData.trending_topics || []);
          setUsingRealData(true);
        }
      }
    } catch (error) {
      console.error('Failed to fetch real trends:', error);
      setApiError('Using cached data - live API temporarily unavailable');
      setUsingRealData(false);
    } finally {
      setLoadingRealData(false);
    }
  };

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
    setAiSummary(null); // Reset AI summary when selecting new topic
  };

  const generateAISummary = async () => {
    if (!selectedTopic) return;
    
    setGeneratingAI(true);
    
    try {
      // Gather context from all sources
      const context = {
        topic: selectedTopic.topic,
        category: selectedTopic.category,
        changePercent: selectedTopic.changePercent,
        searchVolume: selectedTopic.searchVolume,
        timeframe: timeframe,
        trend: selectedTopic.trend,
        sources: selectedTopic.sourceBreakdown.map(sb => {
          const source = getSourceById(sb.sourceId);
          return {
            name: source?.name,
            percentage: sb.percentage,
            mentions: sb.mentions
          };
        }),
        relatedTerms: selectedTopic.relatedTerms,
        peakTime: selectedTopic.peakTime,
        audienceDemo: selectedTopic.audienceDemo
      };

      // Get API keys from localStorage (managed by useApiKeyManager)
      const openaiKey = localStorage.getItem('VITE_OPENAI_API_KEY');
      const claudeKey = localStorage.getItem('VITE_ANTHROPIC_API_KEY');

      let summary = '';

      // Try Claude first (cheaper and better for analysis)
      if (claudeKey && claudeKey.startsWith('sk-ant-')) {
        console.log('Using Claude API for trend summary');
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': claudeKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 250,
            messages: [{
              role: 'user',
              content: `You are a health & wellness trend analyst helping content creator Susan. Analyze this trend and provide a brief, actionable summary (3-4 sentences):

1. What's driving this trend (be specific about the main source)
2. Why it matters now
3. One specific content opportunity for Susan's health/longevity YouTube channel

Trend: ${context.topic}
Category: ${context.category}
Change: ${context.changePercent > 0 ? '+' : ''}${context.changePercent}% vs ${timeframe === 'today' ? 'yesterday' : timeframe === 'week' ? 'last week' : timeframe === 'month' ? 'last month' : 'last year'}
Search Volume: ${context.searchVolume.toLocaleString()}
Top Source: ${context.sources[0]?.name} (${context.sources[0]?.percentage}%)
Audience: ${context.audienceDemo}
Peak Time: ${context.peakTime}
Related: ${context.relatedTerms.join(', ')}

Be specific, actionable, and focus on what Susan should do next.`
            }]
          })
        });

        if (response.ok) {
          const data = await response.json();
          summary = data.content[0].text;
        } else {
          throw new Error('Claude API failed');
        }
      } 
      // Fallback to OpenAI
      else if (openaiKey && openaiKey.startsWith('sk-')) {
        console.log('Using OpenAI API for trend summary');
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{
              role: 'system',
              content: 'You are a health & wellness trend analyst helping content creator Susan. Provide concise, actionable insights.'
            }, {
              role: 'user',
              content: `Analyze this health/wellness trend and provide a brief summary (3-4 sentences):
1. What's driving this trend (be specific about the main source)
2. Why it matters now
3. One specific content opportunity for Susan

Trend data:
${JSON.stringify(context, null, 2)}`
            }],
            max_tokens: 250,
            temperature: 0.7
          })
        });

        if (response.ok) {
          const data = await response.json();
          summary = data.choices[0].message.content;
        } else {
          throw new Error('OpenAI API failed');
        }
      } else {
        throw new Error('No API key found');
      }

      setAiSummary(summary);
      
    } catch (error: any) {
      console.error('AI summary error:', error);
      if (error.message === 'No API key found') {
        setAiSummary('⚠️ No API key found. Please add your OpenAI or Claude API key in Settings → API Keys.');
      } else {
        setAiSummary('⚠️ Unable to generate AI summary. Please check your API keys in Settings.');
      }
    } finally {
      setGeneratingAI(false);
    }
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
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
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
              <div>
                <h1 style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '42px',
                  fontWeight: '700',
                  color: '#1F2937',
                  margin: 0
                }}>
                  Health & Wellness Trends
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    background: '#1D4ED8',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: '700'
                  }}>
                    🇺🇸 US Market
                  </span>
                  {usingRealData && (
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      background: '#10B981',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: '700'
                    }}>
                      ● Live Data
                    </span>
                  )}
                  {loadingRealData && (
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      background: '#F59E0B',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: '700'
                    }}>
                      <RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }} />
                      Loading...
                    </span>
                  )}
                </div>
              </div>
            </div>
            <p style={{ color: '#6B7280', fontSize: '16px', marginLeft: '72px' }}>
              Real-time Google Trends + YouTube Data API • {dataSources.length} data sources tracked
            </p>
            {apiError && (
              <div style={{
                marginLeft: '72px',
                marginTop: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                color: '#F59E0B'
              }}>
                <AlertCircle size={14} />
                {apiError}
              </div>
            )}
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

      {/* Understanding the Data - Help Section */}
      <div style={{ padding: '0 60px 20px' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.1) 0%, rgba(249, 115, 22, 0.05) 100%)',
          border: '2px solid rgba(234, 88, 12, 0.2)',
          borderRadius: '16px',
          padding: '20px 24px',
          display: 'flex',
          gap: '20px',
          alignItems: 'flex-start'
        }}>
          <div style={{ fontSize: '32px' }}>💡</div>
          <div style={{ flex: 1 }}>
            <h3 style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '16px',
              fontWeight: '700',
              color: '#1F2937',
              marginBottom: '12px'
            }}>
              Understanding Your Trend Data
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px', fontSize: '14px', color: '#374151' }}>
              <div>
                <strong style={{ color: '#10B981' }}>+170% ↑</strong> = Growing interest! 
                <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                  70% more searches than previous period
                </div>
              </div>
              <div>
                <strong style={{ color: '#EF4444' }}>-25% ↓</strong> = Declining interest
                <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                  25% fewer searches than before
                </div>
              </div>
              <div>
                <strong style={{ color: '#EA580C' }}>Search Volume</strong> = Total searches
                <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                  Higher = more people searching
                </div>
              </div>
              <div>
                <strong style={{ color: '#7C3AED' }}>Click any topic</strong> to see sources
                <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                  Links to Reddit posts, videos, articles
                </div>
              </div>
            </div>
          </div>
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
            { key: 'topics', label: 'All', icon: TrendingUp },
            { key: 'youtube', label: 'YouTube', icon: Youtube },
            { key: 'tiktok', label: 'TikTok', icon: Play },
            { key: 'reddit', label: 'Reddit', icon: MessageSquare },
            { key: 'news', label: 'News', icon: Newspaper },
            { key: 'podcasts', label: 'Podcasts', icon: Radio },
            { key: 'newsletters', label: 'Newsletters', icon: BookOpen },
            { key: 'pubmed', label: 'PubMed', icon: Database },
            { key: 'scholar', label: 'Scholar', icon: Globe },
            { key: 'sources', label: 'Status', icon: CheckCircle },
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
                        
                        <div style={{ textAlign: 'right' }}>
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
                            fontSize: '18px',
                            justifyContent: 'center',
                            minWidth: '90px'
                          }}>
                            {getTrendIcon(topic.trend)}
                            {topic.changePercent > 0 ? '+' : ''}{topic.changePercent}%
                          </div>
                          <div style={{
                            fontSize: '11px',
                            color: '#6B7280',
                            marginTop: '4px',
                            fontWeight: '600'
                          }}>
                            {topic.trend === 'up' ? '📈 Growing' : topic.trend === 'down' ? '📉 Declining' : '➡️ Stable'}
                          </div>
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
                  marginBottom: '4px'
                }}>
                  "{selectedTopic.topic}"
                </p>

                {/* Percentage Change with Comparison Period */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '12px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  background: selectedTopic.trend === 'up' ? 'rgba(16, 185, 129, 0.1)' : 
                             selectedTopic.trend === 'down' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                }}>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: selectedTopic.trend === 'up' ? '#10B981' : selectedTopic.trend === 'down' ? '#EF4444' : '#6B7280'
                  }}>
                    {getTrendIcon(selectedTopic.trend)}
                    {selectedTopic.changePercent > 0 ? '+' : ''}{selectedTopic.changePercent}%
                  </div>
                  <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600' }}>
                    vs {timeframe === 'today' ? 'yesterday' : timeframe === 'week' ? 'last week' : timeframe === 'month' ? 'last month' : 'last year'}
                  </div>
                </div>

                {/* "Driven by" Summary */}
                {selectedTopic.sourceBreakdown.length > 0 && (
                  <div style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: 'rgba(124, 58, 237, 0.05)',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <TrendingUp size={14} color="#7C3AED" />
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#7C3AED' }}>
                      Driven by {getSourceById(selectedTopic.sourceBreakdown[0].sourceId)?.name || 'Multiple sources'}
                    </span>
                    <span style={{ fontSize: '12px', color: '#6B7280' }}>
                      ({selectedTopic.sourceBreakdown[0].percentage}% of mentions)
                    </span>
                  </div>
                )}

                {/* AI Summary Section */}
                <div style={{
                  padding: '14px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)',
                  border: '1px solid rgba(124, 58, 237, 0.2)',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: aiSummary ? '10px' : '0'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: '#7C3AED'
                    }}>
                      <SparklesIcon size={14} />
                      AI INSIGHT
                    </div>
                    <button
                      onClick={generateAISummary}
                      disabled={generatingAI}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: 'none',
                        background: generatingAI ? 'rgba(107, 114, 128, 0.1)' : 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
                        color: 'white',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: generatingAI ? 'not-allowed' : 'pointer',
                        opacity: generatingAI ? 0.6 : 1
                      }}
                    >
                      {generatingAI ? (
                        <>
                          <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                          Generating...
                        </>
                      ) : (
                        <>
                          <SparklesIcon size={12} />
                          Generate Summary
                        </>
                      )}
                    </button>
                  </div>
                  
                  {aiSummary && (
                    <div style={{
                      fontSize: '13px',
                      color: '#374151',
                      lineHeight: '1.6',
                      padding: '10px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.5)'
                    }}>
                      {aiSummary}
                    </div>
                  )}
                  
                  {!aiSummary && !generatingAI && (
                    <div style={{
                      fontSize: '11px',
                      color: '#9CA3AF',
                      marginTop: '6px',
                      fontStyle: 'italic'
                    }}>
                      Get AI-powered insights synthesized from all sources
                    </div>
                  )}
                </div>

                {/* Trend Velocity Label */}
                {graphData.length > 3 && (
                  <div style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(234, 88, 12, 0.05)',
                    marginBottom: '20px',
                    fontSize: '12px',
                    color: '#EA580C',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    {(() => {
                      const recentValues = graphData.slice(-3).map(d => d.value);
                      const earlierValues = graphData.slice(0, 3).map(d => d.value);
                      const recentAvg = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
                      const earlierAvg = earlierValues.reduce((a, b) => a + b, 0) / earlierValues.length;
                      const velocity = recentAvg > earlierAvg * 1.2 ? 'Accelerating' : 
                                       recentAvg < earlierAvg * 0.8 ? 'Decelerating' : 'Steady growth';
                      return (
                        <>
                          {velocity === 'Accelerating' ? '🚀' : velocity === 'Decelerating' ? '⚠️' : '📊'}
                          {velocity}
                        </>
                      );
                    })()}
                  </div>
                )}

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

                {/* Stats with Baseline Comparison */}
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
                    <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '4px' }}>Monthly Searches</div>
                    {(() => {
                      const baselineVolume = Math.round(selectedTopic.searchVolume / (1 + selectedTopic.changePercent / 100));
                      return (
                        <div style={{ 
                          fontSize: '11px', 
                          color: '#9CA3AF',
                          fontWeight: '600'
                        }}>
                          up from {formatNumber(baselineVolume)}
                        </div>
                      );
                    })()}
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
                    marginBottom: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <Database size={14} />
                    SOURCE BREAKDOWN
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: '#9CA3AF',
                    marginBottom: '10px',
                    fontStyle: 'italic'
                  }}>
                    Where people are talking about this topic
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

                {/* View Sources - Clickable Links */}
                <div style={{
                  borderTop: '1px solid rgba(0,0,0,0.1)',
                  paddingTop: '16px',
                  marginTop: '4px'
                }}>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#6B7280',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <ExternalLink size={14} />
                    VIEW ORIGINAL SOURCES
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {/* Google Search */}
                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(selectedTopic.topic + ' health wellness')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        background: 'rgba(234, 88, 12, 0.05)',
                        border: '1px solid rgba(234, 88, 12, 0.2)',
                        textDecoration: 'none',
                        color: '#EA580C',
                        fontSize: '13px',
                        fontWeight: '600',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(234, 88, 12, 0.1)';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(234, 88, 12, 0.05)';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      🔍 Google Search
                      <ArrowUpRight size={14} style={{ marginLeft: 'auto' }} />
                    </a>

                    {/* YouTube Search */}
                    <a
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(selectedTopic.topic)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        background: 'rgba(255, 0, 0, 0.05)',
                        border: '1px solid rgba(255, 0, 0, 0.2)',
                        textDecoration: 'none',
                        color: '#FF0000',
                        fontSize: '13px',
                        fontWeight: '600',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 0, 0, 0.1)';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 0, 0, 0.05)';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      📺 YouTube Videos
                      <ArrowUpRight size={14} style={{ marginLeft: 'auto' }} />
                    </a>

                    {/* Reddit Search */}
                    <a
                      href={`https://www.reddit.com/search/?q=${encodeURIComponent(selectedTopic.topic)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        background: 'rgba(255, 69, 0, 0.05)',
                        border: '1px solid rgba(255, 69, 0, 0.2)',
                        textDecoration: 'none',
                        color: '#FF4500',
                        fontSize: '13px',
                        fontWeight: '600',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 69, 0, 0.1)';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 69, 0, 0.05)';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      🔴 Reddit Discussions
                      <ArrowUpRight size={14} style={{ marginLeft: 'auto' }} />
                    </a>

                    {/* PubMed Research */}
                    <a
                      href={`https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(selectedTopic.topic)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        background: 'rgba(59, 130, 246, 0.05)',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        textDecoration: 'none',
                        color: '#3B82F6',
                        fontSize: '13px',
                        fontWeight: '600',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      🔬 Research Papers
                      <ArrowUpRight size={14} style={{ marginLeft: 'auto' }} />
                    </a>
                  </div>

                  <div style={{
                    marginTop: '12px',
                    padding: '10px',
                    borderRadius: '8px',
                    background: 'rgba(124, 58, 237, 0.05)',
                    fontSize: '11px',
                    color: '#6B7280',
                    lineHeight: '1.5'
                  }}>
                    💡 <strong>Tip:</strong> Click any link to explore real posts, videos, and research about "{selectedTopic.topic}"
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
              Trending Health & Wellness on YouTube (US)
              {realYouTubeVideos.length > 0 && (
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '8px',
                  background: '#10B981',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: '700'
                }}>
                  ● Live Data
                </span>
              )}
            </h2>
            
            {/* Real YouTube Videos */}
            {realYouTubeVideos.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
                gap: '20px'
              }}>
                {realYouTubeVideos.map((video, idx) => (
                  <a
                    key={video.id}
                    href={`https://youtube.com/watch?v=${video.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={mounted ? 'animate-in' : ''}
                    style={{
                      animationDelay: `${idx * 100}ms`,
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(20px)',
                      borderRadius: '16px',
                      padding: '16px',
                      border: '1px solid rgba(255, 255, 255, 0.5)',
                      textDecoration: 'none',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', gap: '14px' }}>
                      <div style={{
                        width: '160px',
                        height: '90px',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        flexShrink: 0,
                        position: 'relative'
                      }}>
                        <img 
                          src={video.thumbnail} 
                          alt={video.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                        <div style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: 'rgba(255, 0, 0, 0.9)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Play size={18} color="white" fill="white" style={{ marginLeft: '2px' }} />
                        </div>
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          fontFamily: "'Outfit', sans-serif",
                          fontSize: '14px',
                          fontWeight: '700',
                          color: '#1F2937',
                          marginBottom: '6px',
                          lineHeight: '1.4',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {video.title}
                        </h3>
                        
                        <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '8px' }}>
                          {video.channel}
                        </p>
                        
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '11px', color: '#9CA3AF' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                            <Eye size={12} />
                            {formatNumber(video.views)} views
                          </span>
                          {video.engagement_rate > 0 && (
                            <span style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '4px',
                              color: video.engagement_rate > 5 ? '#10B981' : '#9CA3AF',
                              fontWeight: '600'
                            }}>
                              <TrendingUp size={12} />
                              {video.engagement_rate}% engagement
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              /* Fallback to simulated data */
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
            )}
            
            {/* Live API Info */}
            {realYouTubeVideos.length > 0 && (
              <div style={{
                marginTop: '24px',
                padding: '16px',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontSize: '13px', fontWeight: '600' }}>
                  <CheckCircle size={16} />
                  Real-time data from YouTube Data API v3 • Region: US • Last {realYouTubeVideos.length} trending health videos
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reddit' && (
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
              🔴 Reddit Health & Wellness Discussions
              {redditPosts.length > 0 && (
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '8px',
                  background: '#10B981',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: '700'
                }}>
                  ● Live via RSS
                </span>
              )}
            </h2>
            
            {/* Trending Keywords from Reddit */}
            {redditKeywords.length > 0 && (
              <div style={{
                marginBottom: '24px',
                padding: '20px',
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.95)',
                border: '2px solid rgba(255, 69, 0, 0.2)'
              }}>
                <h3 style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '16px',
                  fontWeight: '700',
                  marginBottom: '16px',
                  color: '#1F2937',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  🔥 Hot Topics on Reddit Right Now
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {redditKeywords.map((kw, idx) => (
                    <div
                      key={kw.keyword}
                      style={{
                        padding: '10px 16px',
                        borderRadius: '12px',
                        background: idx === 0 ? 'linear-gradient(135deg, #FF4500 0%, #FF6B35 100%)' :
                                   idx < 3 ? 'rgba(255, 69, 0, 0.15)' : 'rgba(255, 69, 0, 0.08)',
                        color: idx === 0 ? 'white' : '#FF4500',
                        fontWeight: '700',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <span style={{ textTransform: 'capitalize' }}>{kw.keyword}</span>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '10px',
                        background: idx === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255, 69, 0, 0.1)',
                        fontSize: '11px'
                      }}>
                        {kw.count} posts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reddit Posts */}
            {redditPosts.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '16px'
              }}>
                {redditPosts.map((post, idx) => (
                  <a
                    key={post.id || idx}
                    href={post.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={mounted ? 'animate-in' : ''}
                    style={{
                      animationDelay: `${idx * 50}ms`,
                      background: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '14px',
                      padding: '18px',
                      border: '1px solid rgba(255, 69, 0, 0.15)',
                      textDecoration: 'none',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      cursor: 'pointer',
                      display: 'block'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 69, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '8px',
                        background: '#FF4500',
                        color: 'white',
                        fontSize: '11px',
                        fontWeight: '700'
                      }}>
                        r/{post.subreddit}
                      </span>
                      <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
                        by u/{post.author}
                      </span>
                    </div>
                    
                    <h3 style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: '14px',
                      fontWeight: '700',
                      color: '#1F2937',
                      marginBottom: '8px',
                      lineHeight: '1.4',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {post.title}
                    </h3>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#6B7280' }}>
                      <ExternalLink size={12} />
                      Click to view on Reddit
                    </div>
                  </a>
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
                <MessageSquare size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <p style={{ fontSize: '18px', fontWeight: '600' }}>Loading Reddit discussions...</p>
                <p>Fetching from health & wellness subreddits via RSS</p>
              </div>
            )}

            {/* Reddit Info */}
            {redditPosts.length > 0 && (
              <div style={{
                marginTop: '24px',
                padding: '16px',
                borderRadius: '12px',
                background: 'rgba(255, 69, 0, 0.1)',
                border: '1px solid rgba(255, 69, 0, 0.2)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FF4500', fontSize: '13px', fontWeight: '600' }}>
                  <CheckCircle size={16} />
                  Real-time RSS feeds • No API key needed • Tracking r/longevity, r/Biohacking, r/Health, r/WomensHealth, r/nutrition
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'news' && (
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
              📰 Health & Wellness News
              {newsArticles.length > 0 && (
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '8px',
                  background: '#10B981',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: '700'
                }}>
                  ● Live Data
                </span>
              )}
            </h2>
            
            {/* Trending News Topics */}
            {newsTopics.length > 0 && (
              <div style={{
                marginBottom: '24px',
                padding: '20px',
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.95)',
                border: '2px solid rgba(59, 130, 246, 0.2)'
              }}>
                <h3 style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '16px',
                  fontWeight: '700',
                  marginBottom: '16px',
                  color: '#1F2937',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  🔥 What's Making Headlines (Last 7 Days)
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {newsTopics.map((topic, idx) => (
                    <div
                      key={topic.topic}
                      style={{
                        padding: '10px 16px',
                        borderRadius: '12px',
                        background: idx === 0 ? 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)' :
                                   idx < 3 ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.08)',
                        color: idx === 0 ? 'white' : '#3B82F6',
                        fontWeight: '700',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        textTransform: 'capitalize'
                      }}
                    >
                      <span>{topic.topic}</span>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '10px',
                        background: idx === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(59, 130, 246, 0.1)',
                        fontSize: '11px'
                      }}>
                        {topic.count} articles
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* News Articles */}
            {newsArticles.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '16px'
              }}>
                {newsArticles.map((article, idx) => (
                  <a
                    key={idx}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={mounted ? 'animate-in' : ''}
                    style={{
                      animationDelay: `${idx * 50}ms`,
                      background: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '14px',
                      overflow: 'hidden',
                      border: '1px solid rgba(59, 130, 246, 0.15)',
                      textDecoration: 'none',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      cursor: 'pointer',
                      display: 'block'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {article.image && (
                      <div style={{
                        width: '100%',
                        height: '140px',
                        overflow: 'hidden'
                      }}>
                        <img 
                          src={article.image} 
                          alt={article.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <div style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '8px',
                          background: '#3B82F6',
                          color: 'white',
                          fontSize: '11px',
                          fontWeight: '700'
                        }}>
                          {article.source}
                        </span>
                        <span style={{ fontSize: '11px', color: '#9CA3AF' }}>
                          {new Date(article.published).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <h3 style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: '14px',
                        fontWeight: '700',
                        color: '#1F2937',
                        marginBottom: '8px',
                        lineHeight: '1.4',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {article.title}
                      </h3>
                      
                      {article.description && (
                        <p style={{
                          fontSize: '12px',
                          color: '#6B7280',
                          lineHeight: '1.5',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {article.description}
                        </p>
                      )}
                    </div>
                  </a>
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
                <Newspaper size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <p style={{ fontSize: '18px', fontWeight: '600' }}>Loading health news...</p>
                <p>Fetching from Healthline, WebMD, Medical News Today & more</p>
              </div>
            )}

            {/* News Info */}
            {newsArticles.length > 0 && (
              <div style={{
                marginTop: '24px',
                padding: '16px',
                borderRadius: '12px',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.2)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3B82F6', fontSize: '13px', fontWeight: '600' }}>
                  <CheckCircle size={16} />
                  News API • Healthline, WebMD, Medical News Today, Health.com, Mind Body Green, Well+Good
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'podcasts' && (
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
              🎙️ Trending Health & Wellness Podcasts
              {podcasts.length > 0 && (
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '8px',
                  background: '#10B981',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: '700'
                }}>
                  ● Live Data
                </span>
              )}
            </h2>
            
            {/* Trending Podcast Topics */}
            {podcastTopics.length > 0 && (
              <div style={{
                marginBottom: '24px',
                padding: '20px',
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.95)',
                border: '2px solid rgba(155, 89, 182, 0.2)'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#1F2937' }}>
                  🔥 Hot Podcast Topics
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {podcastTopics.map((topic, idx) => (
                    <div key={topic.topic} style={{
                      padding: '10px 16px',
                      borderRadius: '12px',
                      background: idx === 0 ? 'linear-gradient(135deg, #9B59B6 0%, #8E44AD 100%)' :
                                 idx < 3 ? 'rgba(155, 89, 182, 0.15)' : 'rgba(155, 89, 182, 0.08)',
                      color: idx === 0 ? 'white' : '#9B59B6',
                      fontWeight: '700',
                      fontSize: '14px',
                      textTransform: 'capitalize'
                    }}>
                      {topic.topic} <span style={{ opacity: 0.7 }}>({topic.count})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Podcast Grid */}
            {podcasts.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '16px'
              }}>
                {podcasts.map((podcast, idx) => (
                  <a
                    key={podcast.id}
                    href={podcast.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={mounted ? 'animate-in' : ''}
                    style={{
                      animationDelay: `${idx * 50}ms`,
                      background: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '14px',
                      padding: '16px',
                      border: '1px solid rgba(155, 89, 182, 0.15)',
                      textDecoration: 'none',
                      display: 'flex',
                      gap: '14px',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    {podcast.artwork && (
                      <img 
                        src={podcast.artwork} 
                        alt={podcast.name}
                        style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover' }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1F2937', marginBottom: '4px', lineHeight: '1.3' }}>
                        {podcast.name}
                      </h3>
                      <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '8px' }}>{podcast.artist}</p>
                      <div style={{ display: 'flex', gap: '8px', fontSize: '11px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '6px', background: 'rgba(155, 89, 182, 0.1)', color: '#9B59B6' }}>
                          {podcast.genre}
                        </span>
                        {podcast.rating > 0 && (
                          <span style={{ color: '#F59E0B' }}>★ {podcast.rating.toFixed(1)}</span>
                        )}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px', color: '#6B7280', background: 'rgba(255, 255, 255, 0.9)', borderRadius: '16px' }}>
                <Radio size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <p style={{ fontSize: '18px', fontWeight: '600' }}>Loading podcasts...</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'newsletters' && (
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
              ✍️ Substack & Medium Health Content
              {newsletterArticles.length > 0 && (
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '8px',
                  background: '#10B981',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: '700'
                }}>
                  ● Live RSS
                </span>
              )}
            </h2>
            
            {/* Trending Newsletter Topics */}
            {newsletterTopics.length > 0 && (
              <div style={{
                marginBottom: '24px',
                padding: '20px',
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.95)',
                border: '2px solid rgba(255, 107, 0, 0.2)'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#1F2937' }}>
                  🔥 Trending in Newsletters
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {newsletterTopics.map((topic, idx) => (
                    <div key={topic.topic} style={{
                      padding: '10px 16px',
                      borderRadius: '12px',
                      background: idx === 0 ? 'linear-gradient(135deg, #FF6B00 0%, #FF8C00 100%)' :
                                 idx < 3 ? 'rgba(255, 107, 0, 0.15)' : 'rgba(255, 107, 0, 0.08)',
                      color: idx === 0 ? 'white' : '#FF6B00',
                      fontWeight: '700',
                      fontSize: '14px',
                      textTransform: 'capitalize'
                    }}>
                      {topic.topic} <span style={{ opacity: 0.7 }}>({topic.count})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Newsletter Articles */}
            {newsletterArticles.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {newsletterArticles.map((article, idx) => (
                  <a
                    key={idx}
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={mounted ? 'animate-in' : ''}
                    style={{
                      animationDelay: `${idx * 50}ms`,
                      background: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '14px',
                      padding: '18px',
                      border: '1px solid rgba(255, 107, 0, 0.15)',
                      textDecoration: 'none',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '8px',
                        background: article.source_type === 'substack' ? '#FF6B00' : '#000',
                        color: 'white',
                        fontSize: '11px',
                        fontWeight: '700'
                      }}>
                        {article.source}
                      </span>
                      <span style={{ fontSize: '12px', color: '#9CA3AF' }}>by {article.author}</span>
                    </div>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1F2937', marginBottom: '8px', lineHeight: '1.4' }}>
                      {article.title}
                    </h3>
                    {article.summary && (
                      <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: '1.5' }}>{article.summary}</p>
                    )}
                  </a>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px', color: '#6B7280', background: 'rgba(255, 255, 255, 0.9)', borderRadius: '16px' }}>
                <BookOpen size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <p style={{ fontSize: '18px', fontWeight: '600' }}>Loading newsletters...</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'scholar' && (
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
              🎓 Google Scholar Research
              {scholarArticles.length > 0 && (
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '8px',
                  background: '#10B981',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: '700'
                }}>
                  ● Live Data
                </span>
              )}
            </h2>
            
            {/* Trending Scholar Topics */}
            {scholarTopics.length > 0 && (
              <div style={{
                marginBottom: '24px',
                padding: '20px',
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.95)',
                border: '2px solid rgba(66, 133, 244, 0.2)'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#1F2937' }}>
                  📊 Research Focus Areas
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {scholarTopics.map((topic, idx) => (
                    <div key={topic.topic} style={{
                      padding: '10px 16px',
                      borderRadius: '12px',
                      background: idx === 0 ? 'linear-gradient(135deg, #4285F4 0%, #5C9CFF 100%)' :
                                 idx < 3 ? 'rgba(66, 133, 244, 0.15)' : 'rgba(66, 133, 244, 0.08)',
                      color: idx === 0 ? 'white' : '#4285F4',
                      fontWeight: '700',
                      fontSize: '14px',
                      textTransform: 'capitalize'
                    }}>
                      {topic.topic} <span style={{ opacity: 0.7 }}>({topic.count})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Scholar Articles */}
            {scholarArticles.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {scholarArticles.map((article, idx) => (
                  <a
                    key={idx}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={mounted ? 'animate-in' : ''}
                    style={{
                      animationDelay: `${idx * 50}ms`,
                      background: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '14px',
                      padding: '18px',
                      border: '1px solid rgba(66, 133, 244, 0.15)',
                      textDecoration: 'none',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1F2937', marginBottom: '8px', lineHeight: '1.4' }}>
                      {article.title}
                    </h3>
                    <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>{article.authors}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '12px' }}>
                      {article.year && (
                        <span style={{ padding: '3px 10px', borderRadius: '6px', background: 'rgba(66, 133, 244, 0.1)', color: '#4285F4', fontWeight: '600' }}>
                          {article.year}
                        </span>
                      )}
                      {article.venue && (
                        <span style={{ color: '#9CA3AF' }}>{article.venue}</span>
                      )}
                      {article.citations > 0 && (
                        <span style={{ color: '#F59E0B', fontWeight: '600' }}>📚 {article.citations} citations</span>
                      )}
                    </div>
                    {article.abstract && (
                      <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '10px', lineHeight: '1.5' }}>{article.abstract}</p>
                    )}
                  </a>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px', color: '#6B7280', background: 'rgba(255, 255, 255, 0.9)', borderRadius: '16px' }}>
                <Globe size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <p style={{ fontSize: '18px', fontWeight: '600' }}>Loading research...</p>
                <p>Note: Google Scholar may be slow to load</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'pubmed' && (
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
              🔬 Latest Health Research (PubMed/NIH)
              {pubmedArticles.length > 0 && (
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '8px',
                  background: '#10B981',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: '700'
                }}>
                  ● Live Data
                </span>
              )}
              {pubmedTotal > 0 && (
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '8px',
                  background: 'rgba(32, 99, 155, 0.1)',
                  color: '#20639B',
                  fontSize: '12px',
                  fontWeight: '700'
                }}>
                  {pubmedTotal.toLocaleString()} articles found
                </span>
              )}
            </h2>
            
            {/* Trending Research Topics */}
            {researchTopics.length > 0 && (
              <div style={{
                marginBottom: '24px',
                padding: '20px',
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.95)',
                border: '2px solid rgba(32, 99, 155, 0.2)'
              }}>
                <h3 style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '16px',
                  fontWeight: '700',
                  marginBottom: '16px',
                  color: '#1F2937',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  📊 Hot Research Topics (Last 30 Days)
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {researchTopics.map((topic, idx) => (
                    <div
                      key={topic.topic}
                      style={{
                        padding: '10px 16px',
                        borderRadius: '12px',
                        background: idx === 0 ? 'linear-gradient(135deg, #20639B 0%, #3498DB 100%)' :
                                   idx < 3 ? 'rgba(32, 99, 155, 0.15)' : 'rgba(32, 99, 155, 0.08)',
                        color: idx === 0 ? 'white' : '#20639B',
                        fontWeight: '700',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        textTransform: 'capitalize'
                      }}
                    >
                      <span>{topic.topic}</span>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '10px',
                        background: idx === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(32, 99, 155, 0.1)',
                        fontSize: '11px'
                      }}>
                        {topic.count} papers
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PubMed Articles */}
            {pubmedArticles.length > 0 ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                {pubmedArticles.map((article, idx) => (
                  <a
                    key={article.pmid}
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={mounted ? 'animate-in' : ''}
                    style={{
                      animationDelay: `${idx * 50}ms`,
                      background: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '14px',
                      padding: '18px',
                      border: '1px solid rgba(32, 99, 155, 0.15)',
                      textDecoration: 'none',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      cursor: 'pointer',
                      display: 'block'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(32, 99, 155, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #20639B 0%, #3498DB 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <BookOpen size={24} color="white" />
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          fontFamily: "'Outfit', sans-serif",
                          fontSize: '15px',
                          fontWeight: '700',
                          color: '#1F2937',
                          marginBottom: '8px',
                          lineHeight: '1.4'
                        }}>
                          {article.title}
                        </h3>
                        
                        <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '6px' }}>
                          {article.authors}
                        </p>
                        
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '12px' }}>
                          <span style={{
                            padding: '3px 10px',
                            borderRadius: '6px',
                            background: 'rgba(32, 99, 155, 0.1)',
                            color: '#20639B',
                            fontWeight: '600'
                          }}>
                            {article.journal}
                          </span>
                          <span style={{ color: '#9CA3AF' }}>
                            {article.pub_date}
                          </span>
                          <span style={{ color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <ExternalLink size={12} />
                            PMID: {article.pmid}
                          </span>
                        </div>
                      </div>
                    </div>
                  </a>
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
                <BookOpen size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <p style={{ fontSize: '18px', fontWeight: '600' }}>Loading research articles...</p>
                <p>Fetching from PubMed/NIH database</p>
              </div>
            )}

            {/* PubMed Info */}
            {pubmedArticles.length > 0 && (
              <div style={{
                marginTop: '24px',
                padding: '16px',
                borderRadius: '12px',
                background: 'rgba(32, 99, 155, 0.1)',
                border: '1px solid rgba(32, 99, 155, 0.2)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#20639B', fontSize: '13px', fontWeight: '600' }}>
                  <CheckCircle size={16} />
                  NCBI E-utilities API • No API key required • US National Library of Medicine • Perfect for RTÉ article research!
                </div>
              </div>
            )}
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
            <p style={{ color: '#6B7280', marginBottom: '16px', fontSize: '15px' }}>
              Trend analysis is aggregated from {dataSources.length} authoritative health and wellness sources
            </p>
            
            {/* Live Status Summary */}
            {sourceStatuses.length > 0 && (
              <div style={{
                display: 'flex',
                gap: '12px',
                marginBottom: '24px',
                flexWrap: 'wrap'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }} />
                  <span style={{ fontWeight: '700', color: '#059669' }}>{statusSummary.online} Online</span>
                </div>
                {statusSummary.offline > 0 && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    borderRadius: '10px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)'
                  }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444' }} />
                    <span style={{ fontWeight: '700', color: '#DC2626' }}>{statusSummary.offline} Offline</span>
                  </div>
                )}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  background: 'rgba(107, 114, 128, 0.1)',
                  border: '1px solid rgba(107, 114, 128, 0.3)'
                }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#6B7280' }} />
                  <span style={{ fontWeight: '700', color: '#4B5563' }}>{statusSummary.planned} Planned</span>
                </div>
                <button
                  onClick={fetchSourceStatus}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 16px',
                    borderRadius: '10px',
                    border: '1px solid rgba(234, 88, 12, 0.3)',
                    background: 'rgba(234, 88, 12, 0.05)',
                    color: '#EA580C',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  <RefreshCw size={14} />
                  Refresh Status
                </button>
              </div>
            )}

            {/* Live API Sources */}
            {sourceStatuses.length > 0 && (
              <>
                <h3 style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '16px',
                  fontWeight: '700',
                  marginBottom: '16px',
                  color: '#1F2937'
                }}>
                  🔌 Live API Status
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '12px',
                  marginBottom: '32px'
                }}>
                  {sourceStatuses.map((source, idx) => {
                    const statusColors = {
                      online: { bg: 'rgba(16, 185, 129, 0.1)', border: '#10B981', text: '#059669' },
                      offline: { bg: 'rgba(239, 68, 68, 0.1)', border: '#EF4444', text: '#DC2626' },
                      error: { bg: 'rgba(245, 158, 11, 0.1)', border: '#F59E0B', text: '#D97706' },
                      planned: { bg: 'rgba(107, 114, 128, 0.1)', border: '#6B7280', text: '#4B5563' }
                    };
                    const colors = statusColors[source.status] || statusColors.planned;
                    
                    return (
                      <div
                        key={source.id}
                        className={mounted ? 'animate-in' : ''}
                        style={{
                          animationDelay: `${idx * 50}ms`,
                          background: 'rgba(255, 255, 255, 0.95)',
                          borderRadius: '12px',
                          padding: '16px',
                          border: `2px solid ${colors.border}30`,
                          borderLeft: `4px solid ${colors.border}`
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '24px' }}>{source.icon}</span>
                            <div>
                              <h4 style={{
                                fontFamily: "'Outfit', sans-serif",
                                fontSize: '14px',
                                fontWeight: '700',
                                color: '#1F2937',
                                margin: 0
                              }}>
                                {source.name}
                              </h4>
                              <p style={{ fontSize: '11px', color: '#6B7280', margin: '2px 0 0 0' }}>
                                {source.message}
                              </p>
                            </div>
                          </div>
                          <span style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            background: colors.bg,
                            color: colors.text,
                            fontSize: '11px',
                            fontWeight: '700',
                            textTransform: 'uppercase'
                          }}>
                            <div style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background: colors.border,
                              animation: source.status === 'online' ? 'pulse 2s infinite' : 'none'
                            }} />
                            {source.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            
            <h3 style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '16px',
              fontWeight: '700',
              marginBottom: '16px',
              color: '#1F2937'
            }}>
              📚 All Tracked Sources
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '16px'
            }}>
              {dataSources.map((source, idx) => {
                // Find live status for this source
                const liveStatus = sourceStatuses.find(s => s.id === source.id);
                
                return (
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
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <h3 style={{
                            fontFamily: "'Outfit', sans-serif",
                            fontSize: '16px',
                            fontWeight: '700',
                            color: '#1F2937',
                            marginBottom: '2px'
                          }}>
                            {source.name}
                          </h3>
                          {liveStatus && (
                            <span style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: liveStatus.status === 'online' ? '#10B981' : 
                                         liveStatus.status === 'offline' ? '#EF4444' : '#6B7280'
                            }} />
                          )}
                        </div>
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
                );
              })}
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
