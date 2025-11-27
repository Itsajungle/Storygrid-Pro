import React from 'react';
import { useNavigate } from 'react-router-dom';

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
      description: 'Process YouTube videos with Vizard AI. Create clips and manage video processing workflows.',
      icon: '🎬',
      link: 'https://web-production-29982.up.railway.app/api/video-dashboard',
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
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12 bg-white/10 backdrop-blur-md rounded-3xl p-12">
          <div className="text-6xl mb-6">🌴</div>
          <h1 className="text-5xl font-bold text-white mb-4">It's a Jungle</h1>
          <p className="text-xl text-white/90">Content Hub - AI-Powered Social Media Automation</p>
        </div>

        {/* App Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {apps.map((app, index) => (
            <button
              key={index}
              onClick={() => handleCardClick(app)}
              className="bg-white/10 backdrop-blur-md hover:bg-white/20 border-2 border-white/20 hover:border-white/40 rounded-2xl p-8 text-left transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-2xl group"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {app.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">{app.title}</h3>
              <p className="text-white/80 leading-relaxed">{app.description}</p>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center text-white/70 space-y-2">
          <p className="text-lg">🌴 It's a Jungle Content Hub • Built with ❤️ • 2025</p>
          <p className="text-sm">AI-powered social media automation for wellness content creators</p>
        </div>
      </div>
    </div>
  );
};

export default ContentHub;
