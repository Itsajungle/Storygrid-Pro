/**
 * Video Library - Track and manage all video content
 * Catalog existing footage, track what's been used, manage the backlog
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Scissors
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface VideoItem {
  id: string;
  title: string;
  description: string;
  youtubeUrl?: string;
  duration: string;
  recordedDate: string;
  status: 'raw' | 'edited' | 'published' | 'clipped';
  tags: string[];
  clipsExtracted: number;
  clipsUsed: number;
  notes: string;
}

// ============================================
// SAMPLE DATA
// ============================================

const sampleVideos: VideoItem[] = [
  {
    id: '1',
    title: 'Gut Health Masterclass with Dr. Sarah',
    description: 'Deep dive into gut microbiome, probiotics, and digestive health for women over 40',
    youtubeUrl: 'https://youtube.com/watch?v=example1',
    duration: '45:32',
    recordedDate: '2024-11-15',
    status: 'published',
    tags: ['gut health', 'probiotics', 'digestion', 'women\'s health'],
    clipsExtracted: 18,
    clipsUsed: 12,
    notes: 'Great content on fermented foods section - good for Shorts'
  },
  {
    id: '2',
    title: 'Hair Loss Solutions - What Actually Works',
    description: 'Evidence-based approaches to hair loss prevention and regrowth',
    youtubeUrl: 'https://youtube.com/watch?v=example2',
    duration: '38:45',
    recordedDate: '2024-12-01',
    status: 'edited',
    tags: ['hair loss', 'hair health', 'supplements', 'hormones'],
    clipsExtracted: 0,
    clipsUsed: 0,
    notes: 'Ready for Vizard processing - lots of before/after potential'
  },
  {
    id: '3',
    title: 'Sleep Optimization Interview',
    description: 'Interview with sleep specialist on improving sleep quality naturally',
    youtubeUrl: '',
    duration: '52:10',
    recordedDate: '2024-12-10',
    status: 'raw',
    tags: ['sleep', 'interview', 'wellness'],
    clipsExtracted: 0,
    clipsUsed: 0,
    notes: 'Needs editing - great soundbites at 12:30 and 34:15'
  },
  {
    id: '4',
    title: 'Menopause Myths Debunked',
    description: 'Separating fact from fiction about menopause and HRT',
    youtubeUrl: 'https://youtube.com/watch?v=example4',
    duration: '41:20',
    recordedDate: '2024-10-20',
    status: 'clipped',
    tags: ['menopause', 'HRT', 'hormones', 'myths'],
    clipsExtracted: 22,
    clipsUsed: 22,
    notes: 'All clips used - very successful content'
  }
];

// ============================================
// COMPONENT
// ============================================

const VideoLibrary = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<VideoItem[]>(sampleVideos);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load videos from localStorage if available
    const savedVideos = localStorage.getItem('iaj_video_library');
    if (savedVideos) {
      setVideos(JSON.parse(savedVideos));
    }
  }, []);

  // Save to localStorage when videos change
  useEffect(() => {
    if (videos !== sampleVideos) {
      localStorage.setItem('iaj_video_library', JSON.stringify(videos));
    }
  }, [videos]);

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterStatus === 'all' || video.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'raw': return { bg: '#FEF3C7', text: '#92400E', label: 'Raw Footage' };
      case 'edited': return { bg: '#DBEAFE', text: '#1E40AF', label: 'Edited' };
      case 'published': return { bg: '#D1FAE5', text: '#065F46', label: 'Published' };
      case 'clipped': return { bg: '#E0E7FF', text: '#3730A3', label: 'Fully Clipped' };
      default: return { bg: '#F3F4F6', text: '#374151', label: status };
    }
  };

  const getClipProgress = (video: VideoItem) => {
    if (video.clipsExtracted === 0) return 0;
    return Math.round((video.clipsUsed / video.clipsExtracted) * 100);
  };

  const stats = {
    total: videos.length,
    raw: videos.filter(v => v.status === 'raw').length,
    edited: videos.filter(v => v.status === 'edited').length,
    published: videos.filter(v => v.status === 'published').length,
    clipped: videos.filter(v => v.status === 'clipped').length,
    totalClips: videos.reduce((sum, v) => sum + v.clipsExtracted, 0),
    usedClips: videos.reduce((sum, v) => sum + v.clipsUsed, 0)
  };

  const handleAddVideo = (newVideo: Partial<VideoItem>) => {
    const video: VideoItem = {
      id: Date.now().toString(),
      title: newVideo.title || '',
      description: newVideo.description || '',
      youtubeUrl: newVideo.youtubeUrl || '',
      duration: newVideo.duration || '00:00',
      recordedDate: newVideo.recordedDate || new Date().toISOString().split('T')[0],
      status: newVideo.status || 'raw',
      tags: newVideo.tags || [],
      clipsExtracted: 0,
      clipsUsed: 0,
      notes: newVideo.notes || ''
    };
    setVideos([video, ...videos]);
    setShowAddModal(false);
  };

  const handleUpdateVideo = (updatedVideo: VideoItem) => {
    setVideos(videos.map(v => v.id === updatedVideo.id ? updatedVideo : v));
    setEditingVideo(null);
  };

  const handleDeleteVideo = (id: string) => {
    if (confirm('Are you sure you want to delete this video from the library?')) {
      setVideos(videos.filter(v => v.id !== id));
    }
  };

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
              Track and manage all your video content • {stats.total} videos • {stats.totalClips} clips extracted
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
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '16px'
        }}>
          {[
            { label: 'Raw Footage', value: stats.raw, color: '#F59E0B' },
            { label: 'Edited', value: stats.edited, color: '#3B82F6' },
            { label: 'Published', value: stats.published, color: '#10B981' },
            { label: 'Fully Clipped', value: stats.clipped, color: '#6366F1' },
            { label: 'Clips Used', value: `${stats.usedClips}/${stats.totalClips}`, color: '#8B5CF6' }
          ].map((stat, idx) => (
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
              <div style={{
                fontSize: '32px',
                fontWeight: '700',
                fontFamily: "'Outfit', sans-serif",
                color: stat.color
              }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '13px', color: '#6B7280', fontWeight: '600' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <div style={{ padding: '0 60px 30px' }}>
        <div style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center'
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
              placeholder="Search videos by title, description, or tags..."
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
      </div>

      {/* Video Grid */}
      <div style={{ padding: '0 60px 60px' }}>
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
                  animationDelay: `${300 + idx * 100}ms`,
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
                <p style={{
                  fontSize: '14px',
                  color: '#6B7280',
                  marginBottom: '16px',
                  lineHeight: '1.5'
                }}>
                  {video.description}
                </p>

                {/* Meta Info */}
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  marginBottom: '16px',
                  fontSize: '13px',
                  color: '#9CA3AF'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={14} />
                    {video.duration}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={14} />
                    {new Date(video.recordedDate).toLocaleDateString()}
                  </span>
                </div>

                {/* Tags */}
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

                {/* Clips Progress */}
                {video.clipsExtracted > 0 && (
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
                        {video.clipsUsed}/{video.clipsExtracted} ({clipProgress}%)
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
                  {video.youtubeUrl && (
                    <a
                      href={video.youtubeUrl}
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
                      Watch on YouTube
                    </a>
                  )}
                  <button
                    onClick={() => window.open('https://web-production-29982.up.railway.app/api/video-processor/dashboard', '_blank')}
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
                    Process in Vizard
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredVideos.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px',
            color: '#6B7280'
          }}>
            <Video size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p style={{ fontSize: '18px', fontWeight: '600' }}>No videos found</p>
            <p>Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
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
    </div>
  );
};

// ============================================
// MODAL COMPONENT
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
    youtubeUrl: video?.youtubeUrl || '',
    duration: video?.duration || '',
    recordedDate: video?.recordedDate || new Date().toISOString().split('T')[0],
    status: video?.status || 'raw',
    tags: video?.tags.join(', ') || '',
    clipsExtracted: video?.clipsExtracted || 0,
    clipsUsed: video?.clipsUsed || 0,
    notes: video?.notes || ''
  });

  const handleSubmit = () => {
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
      zIndex: 1000
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
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                value={formData.youtubeUrl}
                onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
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
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="45:30"
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
                value={formData.recordedDate}
                onChange={(e) => setFormData({ ...formData, recordedDate: e.target.value })}
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
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>Tags (comma separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="gut health, probiotics, wellness"
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
                  value={formData.clipsExtracted}
                  onChange={(e) => setFormData({ ...formData, clipsExtracted: parseInt(e.target.value) || 0 })}
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
                  value={formData.clipsUsed}
                  onChange={(e) => setFormData({ ...formData, clipsUsed: parseInt(e.target.value) || 0 })}
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

export default VideoLibrary;
