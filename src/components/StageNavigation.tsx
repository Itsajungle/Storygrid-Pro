import React from 'react';
import { Button } from '@/components/ui/button';
import { Lightbulb, BarChart, FileText, Search, Calendar, Settings, LogOut } from 'lucide-react';
import GlobalFactCheckToggle from './GlobalFactCheckToggle';
import { ProjectSelector } from './ProjectSelector';
import { useAuth } from '@/contexts/AuthContext';

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
    <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 backdrop-blur-md border-b border-green-500/20 px-6 py-4 shadow-lg">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-500 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">SG</span>
            </div>
            <h1 className="text-xl font-bold text-white font-poppins drop-shadow-md">StoryGridPro</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {stages.map((stage) => {
              const Icon = stage.icon;
              const isActive = currentStage === stage.id;
              
              return (
                <Button
                  key={stage.id}
                  variant="ghost"
                  className={`px-6 py-3 rounded-full font-medium transition-all duration-200 hover:scale-105 ${
                    isActive 
                      ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/50'
                      : 'bg-blue-950/50 text-white border border-green-400/30 hover:bg-green-500/20 hover:border-green-400/50'
                  }`}
                  onClick={() => onStageChange(stage.id)}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {stage.name}
                </Button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ProjectSelector />
          <GlobalFactCheckToggle />
          
          <Button
            variant="outline"
            onClick={onOverviewToggle}
            className="border-junglePink/50 text-junglePink hover:bg-junglePink/10 hover:border-junglePink bg-card/80 backdrop-blur-sm"
          >
            <Settings className="w-4 h-4 mr-2" />
            Project Hub
          </Button>

          <Button
            variant="outline"
            onClick={signOut}
            className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500 bg-card/80 backdrop-blur-sm"
            title={`Signed in as ${user?.email}`}
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StageNavigation;
