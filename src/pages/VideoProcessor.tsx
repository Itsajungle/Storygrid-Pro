/**
 * Video Processor - Find & Process Videos with Vizard AI
 * Search your video library, find relevant clips, and send to Vizard for processing
 * Supports HeyGen avatar integration workflow
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Scissors, 
  Search, 
  ArrowLeft,
  Video,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Clock,
  Calendar,
  Tag,
  Play,
  CheckCircle,
  Circle,
  Youtube,
  Film,
  Wand2,
  MessageSquare,
  Send,
  ChevronRight,
  AlertCircle,
  Lightbulb,
  Users,
  Target
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

interface ProcessingTask {
  id: string;
  videoId: string;
  videoTitle: string;
  prompt: string;
  clipSuggestions: ClipSuggestion[];
  status: 'pending' | 'processing' | 'ready' | 'sent_to_vizard';
  createdAt: string;
}

interface ClipSuggestion {
  id: string;
  title: string;
  estimatedTimestamp: string;
  hook: string;
  duration: string;
  platform: 'youtube' | 'instagram' | 'tiktok' | 'all';
  heygenNote?: string;
}

// ============================================
// SAMPLE CLIP SUGGESTIONS
// ============================================

const generateClipSuggestions = (videoTitle: string, prompt: string): ClipSuggestion[] => {
  const suggestions: ClipSuggestion[] = [
    {
      id: '1',
      title: `Key insight about ${prompt}`,
      estimatedTimestamp: '3:24 - 4:12',
      hook: `"Most people don't realize this about ${prompt}..."`,
      duration: '48 sec',
      platform: 'all',
      heygenNote: 'Susan PIP: Add intro explaining why this matters'
    },
    {
      id: '2',
      title: `The surprising truth`,
      estimatedTimestamp: '8:45 - 9:30',
      hook: `"What your doctor won't tell you..."`,
      duration: '45 sec',
      platform: 'youtube',
      heygenNote: 'Susan PIP: React to the revelation'
    },
    {
      id: '3',
      title: `Quick tip viewers can use today`,
      estimatedTimestamp: '15:20 - 15:55',
      hook: `"Try this tonight and see the difference..."`,
      duration: '35 sec',
      platform: 'tiktok',
      heygenNote: 'Susan PIP: Demonstrate or explain the tip'
    },
    {
      id: '4',
      title: `Myth debunked`,
      estimatedTimestamp: '22:10 - 23:05',
      hook: `"Stop believing this myth about ${prompt}..."`,
      duration: '55 sec',
      platform: 'instagram',
      heygenNote: 'Susan PIP: Express surprise/agreement'
    },
    {
      id: '5',
      title: `Expert recommendation`,
      estimatedTimestamp: '31:40 - 32:20',
      hook: `"The #1 thing I recommend for ${prompt}..."`,
      duration: '40 sec',
      platform: 'all',
      heygenNote: 'Susan PIP: Add personal endorsement'
    }
  ];
  
  return suggestions;
};

// ============================================
// COMPONENT
// ============================================

const VideoProcessor = () => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [promptQuery, setPromptQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<VideoItem[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [clipSuggestions, setClipSuggestions] = useState<ClipSuggestion[]>([]);
  const [processingTasks, setProcessingTasks] = useState<ProcessingTask[]>([]);
  const [activeTab, setActiveTab] = useState<'search' | 'process' | 'history'>('search');

  useEffect(() => {
    setMounted(true);
    loadVideos();
    loadProcessingHistory();
  }, []);

  const loadVideos = () => {
    const savedVideos = localStorage.getItem('iaj_video_library');
    if (savedVideos) {
      const parsed = JSON.parse(savedVideos);
      setVideos(parsed);
      setFilteredVideos(parsed);
    } else {
      // Sample data if no videos in library
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
          notes: 'Great content on fermented foods section'
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
          notes: 'Ready for Vizard processing'
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
          notes: 'Great soundbites at 12:30 and 34:15'
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
          notes: 'All clips used'
        }
      ];
      setVideos(sampleVideos);
      setFilteredVideos(sampleVideos);
    }
  };

  const loadProcessingHistory = () => {
    const saved = localStorage.getItem('iaj_processing_tasks');
    if (saved) {
      setProcessingTasks(JSON.parse(saved));
    }
  };

  const saveProcessingTask = (task: ProcessingTask) => {
    const updated = [task, ...processingTasks];
    setProcessingTasks(updated);
    localStorage.setItem('iaj_processing_tasks', JSON.stringify(updated));
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setFilteredVideos(videos);
      return;
    }
    
    setSearching(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const query = searchQuery.toLowerCase();
    const results = videos.filter(video => 
      video.title.toLowerCase().includes(query) ||
      video.description.toLowerCase().includes(query) ||
      video.tags.some(tag => tag.toLowerCase().includes(query)) ||
      video.notes.toLowerCase().includes(query)
    );
    
    setFilteredVideos(results);
    setSearching(false);
  };

  const handleAnalyzeVideo = async () => {
    if (!selectedVideo || !promptQuery.trim()) return;
    
    setAnalyzing(true);
    setActiveTab('process');
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const suggestions = generateClipSuggestions(selectedVideo.title, promptQuery);
    setClipSuggestions(suggestions);
    setAnalyzing(false);
  };

  const handleSendToVizard = () => {
    if (!selectedVideo) return;
    
    // Create processing task
    const task: ProcessingTask = {
      id: Date.now().toString(),
      videoId: selectedVideo.id,
      videoTitle: selectedVideo.title,
      prompt: promptQuery,
      clipSuggestions: clipSuggestions,
      status: 'sent_to_vizard',
      createdAt: new Date().toISOString()
    };
    
    saveProcessingTask(task);
    
    // Open Vizard in new tab
    window.open('https://vizard.ai', '_blank');
    
    // Show success message
    alert(`✅ Video "${selectedVideo.title}" ready for Vizard!\n\nClip suggestions have been saved to your history.`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'raw': return { bg: '#FEF3C7', text: '#92400E', label: 'Raw' };
      case 'edited': return { bg: '#DBEAFE', text: '#1E40AF', label: 'Edited' };
      case 'published': return { bg: '#D1FAE5', text: '#065F46', label: 'Published' };
      case 'clipped': return { bg: '#E0E7FF', text: '#3730A3', label: 'Clipped' };
      default: return { bg: '#F3F4F6', text: '#374151', label: status };
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'youtube': return '#FF0000';
      case 'instagram': return '#E4405F';
      case 'tiktok': return '#000000';
      default: return '#6B7280';
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(165deg, #fdf4ff 0%, #fae8ff 30%, #f5d0fe 60%, #e879f9 100%)',
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
            color: '#A855F7'
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
                background: 'linear-gradient(135deg, #A855F7 0%, #D946EF 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Scissors size={28} color="white" />
              </div>
              <h1 style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '42px',
                fontWeight: '700',
                color: '#1F2937',
                margin: 0
              }}>
                Video Processor
              </h1>
            </div>
            <p style={{ color: '#6B7280', fontSize: '16px', marginLeft: '72px' }}>
              Find videos in your library, get AI clip suggestions, and process with Vizard + HeyGen
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => navigate('/video-library')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.8)',
                color: '#A855F7',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '12px',
                cursor: 'pointer',
                fontFamily: "'Outfit', sans-serif",
                fontWeight: '600',
                fontSize: '14px'
              }}
            >
              <Film size={18} />
              Video Library
            </button>
            <a
              href="https://vizard.ai"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #A855F7 0%, #D946EF 100%)',
                color: 'white',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '12px',
                textDecoration: 'none',
                fontFamily: "'Outfit', sans-serif",
                fontWeight: '600',
                fontSize: '14px'
              }}
            >
              <ExternalLink size={18} />
              Open Vizard
            </a>
          </div>
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
          {[
            { key: 'search', label: 'Find Video', icon: Search },
            { key: 'process', label: 'Clip Suggestions', icon: Scissors },
            { key: 'history', label: 'Processing History', icon: Clock }
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
                  ? 'linear-gradient(135deg, #A855F7 0%, #D946EF 100%)'
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
        
        {/* SEARCH TAB */}
        {activeTab === 'search' && (
          <div>
            {/* Search Box */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              padding: '24px',
              marginBottom: '24px'
            }}>
              <h2 style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '18px',
                fontWeight: '700',
                marginBottom: '16px',
                color: '#1F2937',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Lightbulb size={20} color="#A855F7" />
                What content are you looking for?
              </h2>
              
              <p style={{ color: '#6B7280', marginBottom: '16px', fontSize: '14px' }}>
                Describe what you're looking for, or search by topic. Example: "Susan read an article about hair loss and thinks we have video about it"
              </p>
              
              <div style={{ display: 'flex', gap: '12px' }}>
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
                    placeholder="Search: hair loss, gut health, menopause, sleep..."
                    style={{
                      width: '100%',
                      padding: '14px 14px 14px 48px',
                      borderRadius: '12px',
                      border: '2px solid rgba(168, 85, 247, 0.2)',
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
                    background: 'linear-gradient(135deg, #A855F7 0%, #D946EF 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '14px 24px',
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
                    <Search size={18} />
                  )}
                  Search Library
                </button>
              </div>
            </div>

            {/* Video Results */}
            <div>
              <h3 style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '16px',
                fontWeight: '700',
                marginBottom: '16px',
                color: '#1F2937'
              }}>
                {searchQuery ? `Results for "${searchQuery}"` : 'All Videos in Library'} ({filteredVideos.length})
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '16px'
              }}>
                {filteredVideos.map((video, idx) => {
                  const statusStyle = getStatusColor(video.status);
                  const isSelected = selectedVideo?.id === video.id;
                  
                  return (
                    <div
                      key={video.id}
                      onClick={() => setSelectedVideo(video)}
                      className={mounted ? 'animate-in' : ''}
                      style={{
                        animationDelay: `${idx * 50}ms`,
                        background: isSelected 
                          ? 'rgba(168, 85, 247, 0.1)'
                          : 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '16px',
                        padding: '20px',
                        border: isSelected 
                          ? '2px solid #A855F7'
                          : '1px solid rgba(255, 255, 255, 0.5)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          background: statusStyle.bg,
                          color: statusStyle.text,
                          fontSize: '11px',
                          fontWeight: '700'
                        }}>
                          {statusStyle.label}
                        </div>
                        
                        {isSelected && (
                          <CheckCircle size={20} color="#A855F7" />
                        )}
                      </div>
                      
                      <h4 style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: '16px',
                        fontWeight: '700',
                        color: '#1F2937',
                        marginBottom: '8px',
                        lineHeight: '1.3'
                      }}>
                        {video.title}
                      </h4>
                      
                      <p style={{
                        fontSize: '13px',
                        color: '#6B7280',
                        marginBottom: '12px',
                        lineHeight: '1.4'
                      }}>
                        {video.description.substring(0, 100)}...
                      </p>
                      
                      <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#9CA3AF', marginBottom: '12px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} />
                          {video.duration}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Scissors size={12} />
                          {video.clipsExtracted} clips
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {video.tags.slice(0, 3).map((tag, i) => (
                          <span
                            key={i}
                            style={{
                              padding: '3px 8px',
                              borderRadius: '4px',
                              background: 'rgba(168, 85, 247, 0.1)',
                              color: '#A855F7',
                              fontSize: '11px',
                              fontWeight: '600'
                            }}
                          >
                            {tag}
                          </span>
                        ))}
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
                  <p>Try a different search term or add videos to your library</p>
                </div>
              )}
            </div>

            {/* Selected Video Action */}
            {selectedVideo && (
              <div style={{
                position: 'fixed',
                bottom: '30px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'linear-gradient(135deg, #A855F7 0%, #D946EF 100%)',
                borderRadius: '20px',
                padding: '20px 32px',
                boxShadow: '0 20px 60px rgba(168, 85, 247, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                zIndex: 100
              }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', marginBottom: '4px' }}>
                    Selected:
                  </div>
                  <div style={{ fontWeight: '700', color: 'white', fontSize: '15px' }}>
                    {selectedVideo.title.substring(0, 40)}...
                  </div>
                </div>
                
                <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.3)' }} />
                
                <div style={{ flex: 1 }}>
                  <input
                    type="text"
                    value={promptQuery}
                    onChange={(e) => setPromptQuery(e.target.value)}
                    placeholder="What clips are you looking for? (e.g., 'hair loss tips')"
                    style={{
                      width: '300px',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: 'none',
                      fontSize: '14px',
                      background: 'rgba(255,255,255,0.9)'
                    }}
                  />
                </div>
                
                <button
                  onClick={handleAnalyzeVideo}
                  disabled={analyzing || !promptQuery.trim()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'white',
                    color: '#A855F7',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: '700',
                    fontSize: '14px'
                  }}
                >
                  {analyzing ? (
                    <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <Wand2 size={18} />
                  )}
                  Find Clips
                </button>
              </div>
            )}
          </div>
        )}

        {/* PROCESS TAB */}
        {activeTab === 'process' && (
          <div>
            {clipSuggestions.length > 0 && selectedVideo ? (
              <>
                {/* Video Info */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '20px',
                  padding: '24px',
                  marginBottom: '24px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>
                        Analyzing video:
                      </div>
                      <h2 style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: '22px',
                        fontWeight: '700',
                        color: '#1F2937',
                        marginBottom: '8px'
                      }}>
                        {selectedVideo.title}
                      </h2>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        borderRadius: '10px',
                        background: 'rgba(168, 85, 247, 0.1)',
                        width: 'fit-content'
                      }}>
                        <Target size={16} color="#A855F7" />
                        <span style={{ fontSize: '14px', color: '#A855F7', fontWeight: '600' }}>
                          Looking for: "{promptQuery}"
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleSendToVizard}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'linear-gradient(135deg, #A855F7 0%, #D946EF 100%)',
                        color: 'white',
                        border: 'none',
                        padding: '14px 28px',
                        borderRadius: '14px',
                        cursor: 'pointer',
                        fontFamily: "'Outfit', sans-serif",
                        fontWeight: '700',
                        fontSize: '15px',
                        boxShadow: '0 8px 24px rgba(168, 85, 247, 0.3)'
                      }}
                    >
                      <Send size={18} />
                      Send to Vizard
                    </button>
                  </div>
                </div>

                {/* Clip Suggestions */}
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
                  <Sparkles size={20} color="#A855F7" />
                  AI Clip Suggestions ({clipSuggestions.length})
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {clipSuggestions.map((clip, idx) => (
                    <div
                      key={clip.id}
                      className={mounted ? 'animate-in' : ''}
                      style={{
                        animationDelay: `${idx * 100}ms`,
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '16px',
                        padding: '24px',
                        border: '1px solid rgba(255, 255, 255, 0.5)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <span style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '8px',
                              background: 'linear-gradient(135deg, #A855F7 0%, #D946EF 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: '700',
                              fontSize: '14px'
                            }}>
                              {idx + 1}
                            </span>
                            <h4 style={{
                              fontFamily: "'Outfit', sans-serif",
                              fontSize: '17px',
                              fontWeight: '700',
                              color: '#1F2937',
                              margin: 0
                            }}>
                              {clip.title}
                            </h4>
                          </div>
                          
                          {/* Hook */}
                          <div style={{
                            padding: '12px 16px',
                            borderRadius: '10px',
                            background: 'rgba(168, 85, 247, 0.05)',
                            marginBottom: '16px',
                            borderLeft: '3px solid #A855F7'
                          }}>
                            <div style={{ fontSize: '11px', fontWeight: '700', color: '#A855F7', marginBottom: '4px' }}>
                              HOOK
                            </div>
                            <p style={{ fontSize: '14px', color: '#374151', margin: 0, fontStyle: 'italic' }}>
                              {clip.hook}
                            </p>
                          </div>
                          
                          {/* Details Row */}
                          <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#6B7280', marginBottom: '12px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Clock size={14} />
                              {clip.estimatedTimestamp}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Play size={14} />
                              {clip.duration}
                            </span>
                            <span style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background: clip.platform === 'youtube' ? 'rgba(255, 0, 0, 0.1)' :
                                         clip.platform === 'instagram' ? 'rgba(228, 64, 95, 0.1)' :
                                         clip.platform === 'tiktok' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                              color: getPlatformColor(clip.platform),
                              fontWeight: '600'
                            }}>
                              {clip.platform === 'all' ? 'All Platforms' : clip.platform}
                            </span>
                          </div>
                          
                          {/* HeyGen Note */}
                          {clip.heygenNote && (
                            <div style={{
                              padding: '12px 16px',
                              borderRadius: '10px',
                              background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
                              border: '1px solid rgba(34, 211, 238, 0.2)'
                            }}>
                              <div style={{ fontSize: '11px', fontWeight: '700', color: '#0891B2', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Users size={12} />
                                HEYGEN AVATAR NOTE
                              </div>
                              <p style={{ fontSize: '13px', color: '#374151', margin: 0 }}>
                                {clip.heygenNote}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Workflow Reminder */}
                <div style={{
                  marginTop: '32px',
                  padding: '24px',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(217, 70, 239, 0.1) 100%)',
                  border: '1px solid rgba(168, 85, 247, 0.2)'
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
                    <AlertCircle size={18} color="#A855F7" />
                    Next Steps After Vizard
                  </h3>
                  
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{
                      flex: 1,
                      padding: '16px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.8)'
                    }}>
                      <div style={{ fontWeight: '700', color: '#1F2937', marginBottom: '4px' }}>
                        1. Extract clips in Vizard
                      </div>
                      <div style={{ fontSize: '13px', color: '#6B7280' }}>
                        Use timestamps above to find and extract the suggested clips
                      </div>
                    </div>
                    <div style={{
                      flex: 1,
                      padding: '16px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.8)'
                    }}>
                      <div style={{ fontWeight: '700', color: '#1F2937', marginBottom: '4px' }}>
                        2. Add Susan Avatar (HeyGen)
                      </div>
                      <div style={{ fontSize: '13px', color: '#6B7280' }}>
                        Create PIP commentary using HeyGen or film in person
                      </div>
                    </div>
                    <div style={{
                      flex: 1,
                      padding: '16px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.8)'
                    }}>
                      <div style={{ fontWeight: '700', color: '#1F2937', marginBottom: '4px' }}>
                        3. Final edit in CapCut
                      </div>
                      <div style={{ fontSize: '13px', color: '#6B7280' }}>
                        Combine clip + avatar, add captions, and finalize
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '80px',
                color: '#6B7280'
              }}>
                <Scissors size={64} style={{ marginBottom: '20px', opacity: 0.3 }} />
                <p style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>No clip suggestions yet</p>
                <p style={{ marginBottom: '24px' }}>Select a video and describe what clips you're looking for</p>
                <button
                  onClick={() => setActiveTab('search')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'linear-gradient(135deg, #A855F7 0%, #D946EF 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '14px 28px',
                    borderRadius: '14px',
                    cursor: 'pointer',
                    fontWeight: '700',
                    fontSize: '15px'
                  }}
                >
                  <Search size={18} />
                  Find a Video
                </button>
              </div>
            )}
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <div>
            <h2 style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '20px',
              fontWeight: '700',
              marginBottom: '20px',
              color: '#1F2937'
            }}>
              Processing History
            </h2>
            
            {processingTasks.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {processingTasks.map((task, idx) => (
                  <div
                    key={task.id}
                    className={mounted ? 'animate-in' : ''}
                    style={{
                      animationDelay: `${idx * 50}ms`,
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(20px)',
                      borderRadius: '16px',
                      padding: '20px',
                      border: '1px solid rgba(255, 255, 255, 0.5)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{
                          fontFamily: "'Outfit', sans-serif",
                          fontSize: '16px',
                          fontWeight: '700',
                          color: '#1F2937',
                          marginBottom: '4px'
                        }}>
                          {task.videoTitle}
                        </h4>
                        <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>
                          Search: "{task.prompt}" • {task.clipSuggestions.length} clips suggested
                        </p>
                        <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                          {new Date(task.createdAt).toLocaleString()}
                        </div>
                      </div>
                      
                      <div style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        background: 'rgba(16, 185, 129, 0.1)',
                        color: '#10B981',
                        fontSize: '12px',
                        fontWeight: '700'
                      }}>
                        Sent to Vizard
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '60px',
                color: '#6B7280'
              }}>
                <Clock size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <p style={{ fontSize: '18px', fontWeight: '600' }}>No processing history yet</p>
                <p>Your processed videos will appear here</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoProcessor;
