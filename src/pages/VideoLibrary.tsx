/**
 * Video Library - Track and manage all video content with Supabase
 * Full database integration, advanced search, and clip tracking
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  Video, 
  Search, 
  Plus, 
  Filter, 
  Calendar,
  Clock,
  Tag,
  CheckCircle,
  Circle,
  PlayCircle,
  ArrowLeft,
  Trash2,
  Edit2,
  ExternalLink,
  Youtube,
  Film,
  Scissors,
  TrendingUp,
  BarChart3,
  X,
  Loader2,
  AlertCircle
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface VideoItem {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  youtube_url: string | null;
  youtube_id: string | null;
  duration: number | null;
  duration_formatted: string | null;
  recorded_date: string | null;
  uploaded_date: string | null;
  status: 'raw' | 'edited' | 'published' | 'clipped' | 'archived';
  clips_extracted: number;
  clips_used: number;
  tags: string[] | null;
  notes: string | null;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
}

interface VideoClip {
  id: string;
  video_id: string;
  user_id: string;
  title: string;
  start_time: number;
  end_time: number;
  status: 'extracted' | 'edited' | 'posted' | 'archived';
  platform: string | null;
  post_url: string | null;
  posted_date: string | null;
  description: string | null;
  hook: string | null;
  tags: string[] | null;
  notes: string | null;
  views: number;
  engagement_rate: number | null;
  created_at: string;
}

interface VideoStats {
  total: number;
  raw: number;
  edited: number;
  published: number;
  clipped: number;
  archived: number;
  totalClips: number;
  usedClips: number;
}

// ============================================
// COMPONENT
// ============================================

const VideoLibrary = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  
  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [showFilters, setShowFilters] = useState(false);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [viewingClips, setViewingClips] = useState<VideoItem | null>(null);
  const [clips, setClips] = useState<VideoClip[]>([]);
  
  // Stats
  const [stats, setStats] = useState<VideoStats>({
    total: 0,
    raw: 0,
    edited: 0,
    published: 0,
    clipped: 0,
    archived: 0,
    totalClips: 0,
    usedClips: 0
  });

  useEffect(() => {
    setMounted(true);
    fetchVideos();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [videos, searchTerm, filterStatus, selectedTags, dateRange]);

  // ============================================
  // DATA FETCHING
  // ============================================

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Please log in to view your video library');
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setVideos(data || []);
      calculateStats(data || []);
    } catch (err: any) {
      console.error('Error fetching videos:', err);
      setError(err.message || 'Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const fetchClips = async (videoId: string) => {
    try {
      const { data, error } = await supabase
        .from('video_clips')
        .select('*')
        .eq('video_id', videoId)
        .order('start_time', { ascending: true });

      if (error) throw error;
      setClips(data || []);
    } catch (err: any) {
      console.error('Error fetching clips:', err);
    }
  };

  // ============================================
  // FILTERING & SEARCH
  // ============================================

  const applyFilters = () => {
    let filtered = [...videos];

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(video => 
        video.title.toLowerCase().includes(term) ||
        video.description?.toLowerCase().includes(term) ||
        video.notes?.toLowerCase().includes(term) ||
        video.tags?.some(tag => tag.toLowerCase().includes(term))
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(v => v.status === filterStatus);
    }

    // Tags filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(v => 
        v.tags?.some(tag => selectedTags.includes(tag))
      );
    }

    // Date range filter
    if (dateRange.start) {
      filtered = filtered.filter(v => 
        v.recorded_date && v.recorded_date >= dateRange.start
      );
    }
    if (dateRange.end) {
      filtered = filtered.filter(v => 
        v.recorded_date && v.recorded_date <= dateRange.end
      );
    }

    setFilteredVideos(filtered);
  };

  const calculateStats = (videoList: VideoItem[]) => {
    setStats({
      total: videoList.length,
      raw: videoList.filter(v => v.status === 'raw').length,
      edited: videoList.filter(v => v.status === 'edited').length,
      published: videoList.filter(v => v.status === 'published').length,
      clipped: videoList.filter(v => v.status === 'clipped').length,
      archived: videoList.filter(v => v.status === 'archived').length,
      totalClips: videoList.reduce((sum, v) => sum + v.clips_extracted, 0),
      usedClips: videoList.reduce((sum, v) => sum + v.clips_used, 0)
    });
  };

  // Get all unique tags from videos
  const getAllTags = (): string[] => {
    const tagSet = new Set<string>();
    videos.forEach(v => {
      v.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  };

  // ============================================
  // CRUD OPERATIONS
  // ============================================

  const handleAddVideo = async (newVideo: Partial<VideoItem>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('videos')
        .insert([{
          user_id: user.id,
          title: newVideo.title,
          description: newVideo.description,
          youtube_url: newVideo.youtube_url,
          duration_formatted: newVideo.duration_formatted,
          recorded_date: newVideo.recorded_date,
          status: newVideo.status || 'raw',
          tags: newVideo.tags,
          notes: newVideo.notes,
          clips_extracted: 0,
          clips_used: 0
        }])
        .select()
        .single();

      if (error) throw error;

      setVideos([data, ...videos]);
      setShowAddModal(false);
    } catch (err: any) {
      console.error('Error adding video:', err);
      alert('Failed to add video: ' + err.message);
    }
  };

  const handleUpdateVideo = async (updatedVideo: VideoItem) => {
    try {
      const { error } = await supabase
        .from('videos')
        .update({
          title: updatedVideo.title,
          description: updatedVideo.description,
          youtube_url: updatedVideo.youtube_url,
          duration_formatted: updatedVideo.duration_formatted,
          recorded_date: updatedVideo.recorded_date,
          status: updatedVideo.status,
          tags: updatedVideo.tags,
          notes: updatedVideo.notes,
          clips_extracted: updatedVideo.clips_extracted,
          clips_used: updatedVideo.clips_used
        })
        .eq('id', updatedVideo.id);

      if (error) throw error;

      setVideos(videos.map(v => v.id === updatedVideo.id ? updatedVideo : v));
      setEditingVideo(null);
    } catch (err: any) {
      console.error('Error updating video:', err);
      alert('Failed to update video: ' + err.message);
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video? This will also delete all associated clips.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setVideos(videos.filter(v => v.id !== id));
    } catch (err: any) {
      console.error('Error deleting video:', err);
      alert('Failed to delete video: ' + err.message);
    }
  };

  const handleAddClip = async (videoId: string, clipData: Partial<VideoClip>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('video_clips')
        .insert([{
          video_id: videoId,
          user_id: user.id,
          ...clipData
        }])
        .select()
        .single();

      if (error) throw error;

      // Update clips_extracted count
      const video = videos.find(v => v.id === videoId);
      if (video) {
        await handleUpdateVideo({
          ...video,
          clips_extracted: video.clips_extracted + 1
        });
      }

      fetchClips(videoId);
    } catch (err: any) {
      console.error('Error adding clip:', err);
      alert('Failed to add clip: ' + err.message);
    }
  };

  const handleUpdateClipStatus = async (clipId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('video_clips')
        .update({ status })
        .eq('id', clipId);

      if (error) throw error;

      // Refresh clips
      if (viewingClips) {
        fetchClips(viewingClips.id);
      }

      // Update clips_used count if status changed to 'posted'
      if (status === 'posted' && viewingClips) {
        const postedClips = clips.filter(c => c.status === 'posted').length + 1;
        await handleUpdateVideo({
          ...viewingClips,
          clips_used: postedClips
        });
      }
    } catch (err: any) {
      console.error('Error updating clip:', err);
    }
  };

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'raw': return { bg: '#FEF3C7', text: '#92400E', label: 'Raw Footage' };
      case 'edited': return { bg: '#DBEAFE', text: '#1E40AF', label: 'Edited' };
      case 'published': return { bg: '#D1FAE5', text: '#065F46', label: 'Published' };
      case 'clipped': return { bg: '#E0E7FF', text: '#3730A3', label: 'Fully Clipped' };
      case 'archived': return { bg: '#F3F4F6', text: '#6B7280', label: 'Archived' };
      default: return { bg: '#F3F4F6', text: '#374151', label: status };
    }
  };

  const getClipProgress = (video: VideoItem) => {
    if (video.clips_extracted === 0) return 0;
    return Math.round((video.clips_used / video.clips_extracted) * 100);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ============================================
  // RENDER
  // ============================================

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(165deg, #faf5ff 0%, #f3e8ff 30%, #ede9fe 60%, #e9d5ff 100%)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={48} style={{ animation: 'spin 1s linear infinite', color: '#7C3AED' }} />
          <p style={{ marginTop: '16px', color: '#6B7280', fontWeight: '600' }}>Loading video library...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(165deg, #faf5ff 0%, #f3e8ff 30%, #ede9fe 60%, #e9d5ff 100%)'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '40px',
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '20px',
          maxWidth: '500px'
        }}>
          <AlertCircle size={48} color="#EF4444" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px', color: '#1F2937' }}>Error Loading Library</h2>
          <p style={{ color: '#6B7280', marginBottom: '24px' }}>{error}</p>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
              color: 'white',
              border: 'none',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Back to Content Hub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(165deg, #faf5ff 0%, #f3e8ff 30%, #ede9fe 60%, #e9d5ff 100%)',
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
            color: '#6B21A8'
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
                background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Film size={28} color="white" />
              </div>
              <h1 style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '42px',
                fontWeight: '700',
                color: '#1F2937',
                margin: 0
              }}>
                Video Library
              </h1>
            </div>
            <p style={{ color: '#6B7280', fontSize: '16px', marginLeft: '72px' }}>
              Database-powered video management • {stats.total} videos • {stats.totalClips} clips extracted • Supabase
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
              color: 'white',
              border: 'none',
              padding: '14px 28px',
              borderRadius: '14px',
              cursor: 'pointer',
              fontFamily: "'Outfit', sans-serif",
              fontWeight: '700',
              fontSize: '15px',
              boxShadow: '0 8px 24px rgba(124, 58, 237, 0.3)'
            }}
          >
            <Plus size={20} />
            Add Video
          </button>
        </div>
      </header>

      {/* Stats Bar */}
      <div style={{ padding: '0 60px 30px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '16px'
        }}>
          {[
            { label: 'Raw Footage', value: stats.raw, color: '#F59E0B', icon: Circle },
            { label: 'Edited', value: stats.edited, color: '#3B82F6', icon: PlayCircle },
            { label: 'Published', value: stats.published, color: '#10B981', icon: Youtube },
            { label: 'Fully Clipped', value: stats.clipped, color: '#6366F1', icon: CheckCircle },
            { label: 'Archived', value: stats.archived, color: '#6B7280', icon: Film },
            { label: 'Clips Used', value: `${stats.usedClips}/${stats.totalClips}`, color: '#8B5CF6', icon: Scissors }
          ].map((stat, idx) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={idx}
                className={mounted ? 'animate-in' : ''}
                style={{
                  animationDelay: `${idx * 50}ms`,
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '16px',
                  padding: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.5)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <IconComponent size={20} color={stat.color} />
                  <div style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    fontFamily: "'Outfit', sans-serif",
                    color: stat.color
                  }}>
                    {stat.value}
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600' }}>
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search and Filters */}
      <div style={{ padding: '0 60px 30px' }}>
        <div style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <div style={{
            flex: 1,
            position: 'relative'
          }}>
            <Search size={20} style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9CA3AF'
            }} />
            <input
              type="text"
              placeholder="Search videos by title, description, tags, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 14px 14px 48px',
                borderRadius: '14px',
                border: '1px solid rgba(124, 58, 237, 0.2)',
                background: 'rgba(255, 255, 255, 0.9)',
                fontSize: '15px',
                fontFamily: "'Manrope', sans-serif"
              }}
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 24px',
              borderRadius: '14px',
              border: 'none',
              background: showFilters ? 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)' : 'rgba(255, 255, 255, 0.9)',
              color: showFilters ? 'white' : '#6B7280',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              fontFamily: "'Outfit', sans-serif"
            }}
          >
            <Filter size={18} />
            Advanced Filters
            {(selectedTags.length > 0 || dateRange.start || dateRange.end) && (
              <span style={{
                background: showFilters ? 'rgba(255,255,255,0.3)' : 'rgba(124, 58, 237, 0.2)',
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: '700'
              }}>
                {selectedTags.length + (dateRange.start ? 1 : 0) + (dateRange.end ? 1 : 0)}
              </span>
            )}
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            {['all', 'raw', 'edited', 'published', 'clipped'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                style={{
                  padding: '12px 20px',
                  borderRadius: '12px',
                  border: 'none',
                  background: filterStatus === status 
                    ? 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)'
                    : 'rgba(255, 255, 255, 0.8)',
                  color: filterStatus === status ? 'white' : '#6B7280',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontFamily: "'Outfit', sans-serif",
                  textTransform: 'capitalize'
                }}
              >
                {status === 'all' ? 'All' : status}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid rgba(124, 58, 237, 0.2)'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '20px' }}>
              {/* Tags Filter */}
              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '700', fontSize: '14px', color: '#1F2937' }}>
                  <Tag size={16} style={{ display: 'inline', marginRight: '6px' }} />
                  Filter by Tags
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {getAllTags().map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        if (selectedTags.includes(tag)) {
                          setSelectedTags(selectedTags.filter(t => t !== tag));
                        } else {
                          setSelectedTags([...selectedTags, tag]);
                        }
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: 'none',
                        background: selectedTags.includes(tag) 
                          ? 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)'
                          : 'rgba(124, 58, 237, 0.1)',
                        color: selectedTags.includes(tag) ? 'white' : '#7C3AED',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Range - Start */}
              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '700', fontSize: '14px', color: '#1F2937' }}>
                  <Calendar size={16} style={{ display: 'inline', marginRight: '6px' }} />
                  From Date
                </label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid rgba(124, 58, 237, 0.2)',
                    fontSize: '14px'
                  }}
                />
              </div>

              {/* Date Range - End */}
              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '700', fontSize: '14px', color: '#1F2937' }}>
                  <Calendar size={16} style={{ display: 'inline', marginRight: '6px' }} />
                  To Date
                </label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid rgba(124, 58, 237, 0.2)',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            {/* Clear Filters Button */}
            {(selectedTags.length > 0 || dateRange.start || dateRange.end) && (
              <button
                onClick={() => {
                  setSelectedTags([]);
                  setDateRange({ start: '', end: '' });
                }}
                style={{
                  marginTop: '16px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#DC2626',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <X size={14} />
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results Count */}
      {searchTerm || filterStatus !== 'all' || selectedTags.length > 0 || dateRange.start || dateRange.end ? (
        <div style={{ padding: '0 60px 20px' }}>
          <p style={{ color: '#6B7280', fontSize: '14px', fontWeight: '600' }}>
            Showing {filteredVideos.length} of {stats.total} videos
          </p>
        </div>
      ) : null}

      {/* Video Grid */}
      <div style={{ padding: '0 60px 60px' }}>
        {filteredVideos.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
            gap: '24px'
          }}>
            {filteredVideos.map((video, idx) => {
              const statusStyle = getStatusColor(video.status);
              const clipProgress = getClipProgress(video);
              
              return (
                <div
                  key={video.id}
                  className={mounted ? 'animate-in' : ''}
                  style={{
                    animationDelay: `${idx * 50}ms`,
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '20px',
                    padding: '28px',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
                  }}
                >
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
                      fontFamily: "'Outfit', sans-serif"
                    }}>
                      {video.status === 'raw' && <Circle size={12} />}
                      {video.status === 'edited' && <PlayCircle size={12} />}
                      {video.status === 'published' && <Youtube size={12} />}
                      {video.status === 'clipped' && <CheckCircle size={12} />}
                      {statusStyle.label}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => setEditingVideo(video)}
                        style={{
                          background: 'rgba(124, 58, 237, 0.1)',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        <Edit2 size={16} color="#7C3AED" />
                      </button>
                      <button
                        onClick={() => handleDeleteVideo(video.id)}
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
                    </div>
                  </div>

                  {/* Title */}
                  <h3 style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#1F2937',
                    marginBottom: '8px',
                    lineHeight: '1.3'
                  }}>
                    {video.title}
                  </h3>

                  {/* Description */}
                  {video.description && (
                    <p style={{
                      fontSize: '14px',
                      color: '#6B7280',
                      marginBottom: '16px',
                      lineHeight: '1.5'
                    }}>
                      {video.description}
                    </p>
                  )}

                  {/* Meta Info */}
                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    marginBottom: '16px',
                    fontSize: '13px',
                    color: '#9CA3AF'
                  }}>
                    {video.duration_formatted && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={14} />
                        {video.duration_formatted}
                      </span>
                    )}
                    {video.recorded_date && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={14} />
                        {new Date(video.recorded_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Tags */}
                  {video.tags && video.tags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                      {video.tags.map((tag, i) => (
                        <span
                          key={i}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            background: 'rgba(124, 58, 237, 0.1)',
                            color: '#7C3AED',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Clips Progress */}
                  {video.clips_extracted > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '6px',
                        fontSize: '12px'
                      }}>
                        <span style={{ color: '#6B7280', fontWeight: '600' }}>
                          <Scissors size={12} style={{ display: 'inline', marginRight: '4px' }} />
                          Clips Used
                        </span>
                        <span style={{ color: '#7C3AED', fontWeight: '700' }}>
                          {video.clips_used}/{video.clips_extracted} ({clipProgress}%)
                        </span>
                      </div>
                      <div style={{
                        height: '6px',
                        borderRadius: '3px',
                        background: 'rgba(124, 58, 237, 0.1)'
                      }}>
                        <div style={{
                          height: '100%',
                          borderRadius: '3px',
                          background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
                          width: `${clipProgress}%`,
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {video.notes && (
                    <div style={{
                      padding: '12px',
                      borderRadius: '10px',
                      background: 'rgba(124, 58, 237, 0.05)',
                      fontSize: '13px',
                      color: '#6B7280',
                      marginBottom: '16px'
                    }}>
                      💡 {video.notes}
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {video.youtube_url && (
                      <a
                        href={video.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '10px',
                          borderRadius: '10px',
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: '#DC2626',
                          textDecoration: 'none',
                          fontWeight: '600',
                          fontSize: '13px'
                        }}
                      >
                        <Youtube size={16} />
                        YouTube
                      </a>
                    )}
                    <button
                      onClick={() => {
                        setViewingClips(video);
                        fetchClips(video.id);
                      }}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '10px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
                        color: 'white',
                        border: 'none',
                        fontWeight: '600',
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      <Scissors size={16} />
                      Clips ({video.clips_extracted})
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '60px',
            color: '#6B7280',
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '20px'
          }}>
            <Video size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
              {searchTerm || filterStatus !== 'all' || selectedTags.length > 0 ? 'No videos match your filters' : 'No videos yet'}
            </p>
            <p style={{ fontSize: '14px', marginBottom: '20px' }}>
              {searchTerm || filterStatus !== 'all' || selectedTags.length > 0 
                ? 'Try adjusting your search or filters' 
                : 'Click "Add Video" to start building your library'}
            </p>
            {!searchTerm && filterStatus === 'all' && selectedTags.length === 0 && (
              <button
                onClick={() => setShowAddModal(true)}
                style={{
                  padding: '12px 24px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
                  color: 'white',
                  border: 'none',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Add Your First Video
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {(showAddModal || editingVideo) && (
        <VideoModal
          video={editingVideo}
          onSave={editingVideo ? handleUpdateVideo : handleAddVideo}
          onClose={() => {
            setShowAddModal(false);
            setEditingVideo(null);
          }}
        />
      )}

      {viewingClips && (
        <ClipsModal
          video={viewingClips}
          clips={clips}
          onClose={() => {
            setViewingClips(null);
            setClips([]);
            fetchVideos(); // Refresh to update clip counts
          }}
          onAddClip={(clipData) => handleAddClip(viewingClips.id, clipData)}
          onUpdateClipStatus={handleUpdateClipStatus}
          formatTime={formatTime}
        />
      )}
    </div>
  );
};

// ============================================
// VIDEO MODAL COMPONENT
// ============================================

interface VideoModalProps {
  video: VideoItem | null;
  onSave: (video: any) => void;
  onClose: () => void;
}

const VideoModal: React.FC<VideoModalProps> = ({ video, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    title: video?.title || '',
    description: video?.description || '',
    youtube_url: video?.youtube_url || '',
    duration_formatted: video?.duration_formatted || '',
    recorded_date: video?.recorded_date || new Date().toISOString().split('T')[0],
    status: video?.status || 'raw',
    tags: video?.tags?.join(', ') || '',
    clips_extracted: video?.clips_extracted || 0,
    clips_used: video?.clips_used || 0,
    notes: video?.notes || ''
  });

  const handleSubmit = () => {
    if (!formData.title) {
      alert('Please enter a title');
      return;
    }

    onSave({
      ...video,
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
    });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '32px',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <h2 style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: '24px',
          fontWeight: '700',
          marginBottom: '24px'
        }}>
          {video ? 'Edit Video' : 'Add New Video'}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Gut Health Masterclass with Dr. Sarah"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid #E5E7EB',
                fontSize: '15px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Brief description of the video content..."
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid #E5E7EB',
                fontSize: '15px',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>YouTube URL</label>
              <input
                type="text"
                value={formData.youtube_url}
                onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid #E5E7EB',
                  fontSize: '15px'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>Duration</label>
              <input
                type="text"
                value={formData.duration_formatted}
                onChange={(e) => setFormData({ ...formData, duration_formatted: e.target.value })}
                placeholder="45:32"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid #E5E7EB',
                  fontSize: '15px'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>Recorded Date</label>
              <input
                type="date"
                value={formData.recorded_date}
                onChange={(e) => setFormData({ ...formData, recorded_date: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid #E5E7EB',
                  fontSize: '15px'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid #E5E7EB',
                  fontSize: '15px'
                }}
              >
                <option value="raw">Raw Footage</option>
                <option value="edited">Edited</option>
                <option value="published">Published</option>
                <option value="clipped">Fully Clipped</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="gut health, probiotics, wellness, women's health"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid #E5E7EB',
                fontSize: '15px'
              }}
            />
          </div>

          {video && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>Clips Extracted</label>
                <input
                  type="number"
                  value={formData.clips_extracted}
                  onChange={(e) => setFormData({ ...formData, clips_extracted: parseInt(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid #E5E7EB',
                    fontSize: '15px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>Clips Used</label>
                <input
                  type="number"
                  value={formData.clips_used}
                  onChange={(e) => setFormData({ ...formData, clips_used: parseInt(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid #E5E7EB',
                    fontSize: '15px'
                  }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              placeholder="e.g., Great soundbite at 12:30, good for Shorts"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid #E5E7EB',
                fontSize: '15px',
                resize: 'vertical'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px',
              borderRadius: '10px',
              border: '1px solid #E5E7EB',
              background: 'white',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            style={{
              padding: '12px 24px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            {video ? 'Save Changes' : 'Add Video'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// CLIPS MODAL COMPONENT
// ============================================

interface ClipsModalProps {
  video: VideoItem;
  clips: VideoClip[];
  onClose: () => void;
  onAddClip: (clipData: Partial<VideoClip>) => void;
  onUpdateClipStatus: (clipId: string, status: string) => void;
  formatTime: (seconds: number) => string;
}

const ClipsModal: React.FC<ClipsModalProps> = ({ video, clips, onClose, onAddClip, onUpdateClipStatus, formatTime }) => {
  const [showAddClip, setShowAddClip] = useState(false);
  const [clipForm, setClipForm] = useState({
    title: '',
    start_time: 0,
    end_time: 0,
    hook: '',
    platform: '',
    notes: ''
  });

  const handleAddClip = () => {
    if (!clipForm.title || clipForm.end_time <= clipForm.start_time) {
      alert('Please fill in required fields with valid times');
      return;
    }

    onAddClip(clipForm);
    setShowAddClip(false);
    setClipForm({ title: '', start_time: 0, end_time: 0, hook: '', platform: '', notes: '' });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '32px',
        width: '100%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '24px',
              fontWeight: '700',
              marginBottom: '8px'
            }}>
              Clips from: {video.title}
            </h2>
            <p style={{ color: '#6B7280', fontSize: '14px' }}>
              {clips.length} clips • {clips.filter(c => c.status === 'posted').length} posted
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setShowAddClip(!showAddClip)}
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Plus size={16} />
              Add Clip
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                border: '1px solid #E5E7EB',
                background: 'white',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>

        {/* Add Clip Form */}
        {showAddClip && (
          <div style={{
            background: '#F9FAFB',
            padding: '20px',
            borderRadius: '16px',
            marginBottom: '24px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Add New Clip</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <input
                type="text"
                placeholder="Clip title *"
                value={clipForm.title}
                onChange={(e) => setClipForm({ ...clipForm, title: e.target.value })}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  fontSize: '14px'
                }}
              />
              <input
                type="number"
                placeholder="Start (seconds)"
                value={clipForm.start_time}
                onChange={(e) => setClipForm({ ...clipForm, start_time: parseInt(e.target.value) || 0 })}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  fontSize: '14px'
                }}
              />
              <input
                type="number"
                placeholder="End (seconds)"
                value={clipForm.end_time}
                onChange={(e) => setClipForm({ ...clipForm, end_time: parseInt(e.target.value) || 0 })}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  fontSize: '14px'
                }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <input
                type="text"
                placeholder="Hook/CTA"
                value={clipForm.hook}
                onChange={(e) => setClipForm({ ...clipForm, hook: e.target.value })}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  fontSize: '14px'
                }}
              />
              <select
                value={clipForm.platform}
                onChange={(e) => setClipForm({ ...clipForm, platform: e.target.value })}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  fontSize: '14px'
                }}
              >
                <option value="">Select platform</option>
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="youtube_shorts">YouTube Shorts</option>
                <option value="facebook">Facebook</option>
                <option value="twitter">Twitter/X</option>
              </select>
            </div>
            <textarea
              placeholder="Notes (optional)"
              value={clipForm.notes}
              onChange={(e) => setClipForm({ ...clipForm, notes: e.target.value })}
              rows={2}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                fontSize: '14px',
                marginBottom: '12px',
                resize: 'vertical'
              }}
            />
            <button
              onClick={handleAddClip}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Save Clip
            </button>
          </div>
        )}

        {/* Clips List */}
        {clips.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {clips.map(clip => (
              <div
                key={clip.id}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: '#F9FAFB',
                  border: '1px solid #E5E7EB'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>{clip.title}</h4>
                    <div style={{ fontSize: '13px', color: '#6B7280' }}>
                      {formatTime(clip.start_time)} - {formatTime(clip.end_time)} 
                      <span style={{ marginLeft: '12px', fontWeight: '600', color: '#7C3AED' }}>
                        Duration: {formatTime(clip.end_time - clip.start_time)}
                      </span>
                    </div>
                    {clip.hook && (
                      <p style={{ fontSize: '13px', color: '#374151', marginTop: '8px' }}>
                        💬 {clip.hook}
                      </p>
                    )}
                  </div>
                  <select
                    value={clip.status}
                    onChange={(e) => onUpdateClipStatus(clip.id, e.target.value)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="extracted">Extracted</option>
                    <option value="edited">Edited</option>
                    <option value="posted">Posted</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
                  {clip.platform && (
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      background: 'rgba(124, 58, 237, 0.1)',
                      color: '#7C3AED',
                      fontWeight: '600'
                    }}>
                      {clip.platform}
                    </span>
                  )}
                  {clip.posted_date && (
                    <span style={{ color: '#6B7280' }}>
                      Posted: {new Date(clip.posted_date).toLocaleDateString()}
                    </span>
                  )}
                  {clip.views > 0 && (
                    <span style={{ color: '#6B7280' }}>
                      {clip.views.toLocaleString()} views
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
            <Scissors size={40} style={{ marginBottom: '12px', opacity: 0.5 }} />
            <p>No clips yet. Click "Add Clip" to start tracking.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoLibrary;
