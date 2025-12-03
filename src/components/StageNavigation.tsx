import React from 'react';
import { Button } from '@/components/ui/button';
import { Lightbulb, BarChart, FileText, Search, Calendar, Settings, LogOut } from 'lucide-react';
import GlobalFactCheckToggle from './GlobalFactCheckToggle';
import { ProjectSelector } from './ProjectSelector';
import { useAuth } from '@/contexts/AuthContext';

// Import IAJ Logo
import logo from '/Assets/IAJ Orange White copy.png';

interface Stage {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const stages: Stage[] = [
  { id: 'ideate', name: 'Ideas Lab', icon: Lightbulb, description: 'AI-powered brainstorming' },
  { id: 'story-arc', name: 'Storyboard', icon: BarChart, description: 'Visual timeline & structure' },
  { id: 'script', name: 'Script', icon: FileText, description: 'Detailed production scripts' },
  { id: 'veracity', name: 'Fact Check', icon: Search, description: 'Fact-checking & verification' },
  { id: 'timeline', name: 'Timeline', icon: Calendar, description: 'Production planning' }
];

// Apple Blue Glassmorphism Styles
const navStyles = {
  navbar: {
    background: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05)',
  },
  logoFilter: {
    filter: 'hue-rotate(190deg) saturate(0.8) brightness(1.1)',
    height: '32px',
    width: 'auto',
  },
  activeTab: {
    background: 'rgba(0, 122, 255, 0.9)',
    color: 'white',
    border: 'none',
    boxShadow: '0 4px 15px rgba(0, 122, 255, 0.35)',
  },
  inactiveTab: {
    background: 'rgba(255, 255, 255, 0.6)',
    color: '#1D1D1F',
    border: '1px solid rgba(0, 0, 0, 0.06)',
  },
  settingsBtn: {
    background: 'rgba(0, 122, 255, 0.1)',
    color: '#007AFF',
    border: '1px solid rgba(0, 122, 255, 0.2)',
  },
  logoutBtn: {
    background: 'rgba(255, 59, 48, 0.1)',
    color: '#FF3B30',
    border: '1px solid rgba(255, 59, 48, 0.2)',
  },
};

interface StageNavigationProps {
  currentStage: string;
  onStageChange: (stage: string) => void;
  onOverviewToggle: () => void;
}

const StageNavigation: React.FC<StageNavigationProps> = ({ 
  currentStage, 
  onStageChange, 
  onOverviewToggle 
}) => {
  const { signOut, user } = useAuth();

  return (
    <div className="px-6 py-4" style={navStyles.navbar}>
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img 
              src={logo} 
              alt="It's a Jungle" 
              style={navStyles.logoFilter}
            />
            <h1 
              className="text-lg font-bold"
              style={{ color: '#1D1D1F' }}
            >
              StoryGridPro
            </h1>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex items-center gap-2">
            {stages.map((stage) => {
              const Icon = stage.icon;
              const isActive = currentStage === stage.id;
              
              return (
                <button
                  key={stage.id}
                  className="px-5 py-2.5 rounded-full font-medium transition-all duration-200 hover:scale-[1.02] flex items-center"
                  style={isActive ? navStyles.activeTab : navStyles.inactiveTab}
                  onClick={() => onStageChange(stage.id)}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {stage.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ProjectSelector />
          <GlobalFactCheckToggle />
          
          <button
            onClick={onOverviewToggle}
            className="px-4 py-2 rounded-full font-medium transition-all duration-200 hover:scale-[1.02] flex items-center"
            style={navStyles.settingsBtn}
          >
            <Settings className="w-4 h-4 mr-2" />
            Project Hub
          </button>

          <button
            onClick={signOut}
            className="p-2 rounded-full transition-all duration-200 hover:scale-[1.02]"
            style={navStyles.logoutBtn}
            title={`Signed in as ${user?.email}`}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StageNavigation;
