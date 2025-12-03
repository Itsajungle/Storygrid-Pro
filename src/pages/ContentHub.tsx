import React from 'react';
import { useNavigate } from 'react-router-dom';
import SystemHealthMonitor from '@/components/SystemHealthMonitor';

// Import IAJ Logo
import logo from '/Assets/IAJ Orange White copy.png';

// Apple Blue Glassmorphism Styles
const styles = {
  // Light blue gradient background
  gradientBg: {
    background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 30%, #e0f2fe 60%, #f0f9ff 100%)',
    minHeight: '100vh',
  },
  
  // Glass card
  glassCard: {
    background: 'rgba(255, 255, 255, 0.75)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
  },
  
  // App card
  appCard: {
    background: 'rgba(255, 255, 255, 0.6)',
    backdropFilter: 'blur(10px) saturate(150%)',
    WebkitBackdropFilter: 'blur(10px) saturate(150%)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  },
  
  // Logo filter: orange to blue
  logoFilter: {
    filter: 'hue-rotate(190deg) saturate(0.8) brightness(1.1)',
    height: '60px',
    width: 'auto',
  },
};

const ContentHub = () => {
  const navigate = useNavigate();

  const apps = [
    {
      title: 'IAJ Social Media',
      description: 'Complete AI-powered social media automation system. Generate, approve, and publish content.',
      icon: '🤖',
      link: 'https://web-production-29982.up.railway.app/dashboard',
      external: true
    },
    {
      title: 'AI Agent Training',
      description: 'Train and configure AI agents for content analysis, research, and strategy optimization.',
      icon: '🧠',
      link: 'https://web-production-29982.up.railway.app/api/agent-training',
      external: true
    },
    {
      title: 'Video Processor',
      description: 'Process YouTube videos with Vizard AI. View latest videos and check processing status.',
      icon: '🎬',
      link: 'https://web-production-29982.up.railway.app/api/video-processor/dashboard',
      external: true
    },
    {
      title: 'Social Studio',
      description: 'AI content generation with GPT-4 and DALL-E. Create beautiful posts with IAJ\'s tropical style.',
      icon: '🎨',
      link: 'https://web-production-29982.up.railway.app/api/social-studio/dashboard',
      external: true
    },
    {
      title: 'Batch Studio',
      description: 'Generate 7 posts at once with AI topic suggestions. Perfect for weekly content planning.',
      icon: '⚡',
      link: 'https://web-production-29982.up.railway.app/api/social-studio/batch',
      external: true
    },
    {
      title: 'Analytics',
      description: 'Track performance across all platforms. Views, engagement, and top performing content.',
      icon: '📊',
      link: 'https://app.metricool.com',
      external: true
    },
    {
      title: 'Story Grid Pro',
      description: 'Content planning and strategy tools. Plan your content calendar and story arcs.',
      icon: '📝',
      link: '/app',
      external: false
    },
    {
      title: 'Main Website',
      description: 'Visit the It\'s a Jungle website for episodes, show information, and more.',
      icon: '🌐',
      link: 'https://itsajungle.tv',
      external: true
    },
    {
      title: 'YouTube Channel',
      description: 'Watch full episodes and clips on the It\'s a Jungle YouTube channel.',
      icon: '📺',
      link: 'https://youtube.com/@ItsAJungle',
      external: true
    },
    {
      title: 'Shopify Store',
      description: 'Shop It\'s a Jungle merchandise, wellness products, and exclusive content.',
      icon: '🛍️',
      link: 'https://its-a-jungle-3.myshopify.com',
      external: true
    },
    {
      title: 'GitHub',
      description: 'View the source code and documentation for the IAJ Social Media system.',
      icon: '💻',
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

  return (
    <div style={styles.gradientBg}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div 
          className="text-center mb-12 rounded-[28px] p-10"
          style={styles.glassCard}
        >
          <img 
            src={logo} 
            alt="It's a Jungle" 
            style={styles.logoFilter}
            className="mx-auto mb-6"
          />
          <h1 className="text-4xl font-bold mb-3" style={{ color: '#1D1D1F' }}>
            Content Hub
          </h1>
          <p className="text-lg" style={{ color: '#6B7280' }}>
            AI-Powered Social Media Automation
          </p>
        </div>

        {/* System Health Monitor */}
        <SystemHealthMonitor />

        {/* App Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {apps.map((app, index) => (
            <button
              key={index}
              onClick={() => handleCardClick(app)}
              className="rounded-2xl p-6 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group"
              style={styles.appCard}
            >
              <div 
                className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300"
              >
                {app.icon}
              </div>
              <h3 
                className="text-xl font-semibold mb-2"
                style={{ color: '#1D1D1F' }}
              >
                {app.title}
              </h3>
              <p 
                className="text-sm leading-relaxed"
                style={{ color: '#6B7280' }}
              >
                {app.description}
              </p>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center space-y-2 pb-8">
          <p className="text-sm" style={{ color: '#007AFF' }}>
            It's a Jungle Content Hub • 2025
          </p>
          <p className="text-xs" style={{ color: '#9CA3AF' }}>
            AI-powered social media automation for wellness content creators
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContentHub;
