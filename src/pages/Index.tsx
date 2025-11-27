import React, { useState } from 'react';
import StageNavigation from '@/components/StageNavigation';
import OverviewPanel from '@/components/OverviewPanel';
import IdeateStage from '@/components/stages/IdeateStage';
import StoryArcStage from '@/components/stages/StoryArcStage';
import ScriptStage from '@/components/stages/ScriptStage';
import VeracityStage from '@/components/stages/VeracityStage';
import TimelineStage from '@/components/stages/TimelineStage';
import { ContentBlocksProvider } from '@/contexts/ContentBlocksContext';
import { GlobalFactCheckProvider } from '@/contexts/GlobalFactCheckContext';
import { ProjectProvider } from '@/contexts/ProjectContext';

const Index = () => {
  const [currentStage, setCurrentStage] = useState('ideate');
  const [showOverview, setShowOverview] = useState(false);

  const renderCurrentStage = () => {
    switch (currentStage) {
      case 'ideate':
        return <IdeateStage />;
      case 'story-arc':
        return <StoryArcStage />;
      case 'script':
        return <ScriptStage />;
      case 'veracity':
        return <VeracityStage />;
      case 'timeline':
        return <TimelineStage />;
      default:
        return <IdeateStage />;
    }
  };

  return (
    <ProjectProvider>
      <GlobalFactCheckProvider>
        <ContentBlocksProvider>
          <div className="min-h-screen jungle-background flex flex-col">
            <StageNavigation
              currentStage={currentStage}
              onStageChange={setCurrentStage}
              onOverviewToggle={() => setShowOverview(true)}
            />
            
            <div className="bg-background/95 backdrop-blur-sm">
              {renderCurrentStage()}
            </div>
            
            <OverviewPanel
              isOpen={showOverview}
              onClose={() => setShowOverview(false)}
            />
          </div>
        </ContentBlocksProvider>
      </GlobalFactCheckProvider>
    </ProjectProvider>
  );
};

export default Index;
