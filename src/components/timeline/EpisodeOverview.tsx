
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { useContentBlocks, ContentBlock, TimelineItem } from '@/contexts/ContentBlocksContext';
import DragReorderContainer from '@/components/common/DragReorderContainer';
import EpisodeStats from './EpisodeStats';
import EpisodeControls from './EpisodeControls';
import EpisodeBlockCard from './EpisodeBlockCard';

interface EpisodeOverviewProps {
  contentBlockTypes: {
    type: string;
    label: string;
    color: string;
    shape?: string;
  }[];
}

const EpisodeOverview: React.FC<EpisodeOverviewProps> = ({ contentBlockTypes }) => {
  const { contentBlocks, timelineItems } = useContentBlocks();
  const [showEquipment, setShowEquipment] = useState(false);
  const [showCrew, setShowCrew] = useState(false);
  const [showDateTime, setShowDateTime] = useState(true);
  
  // Get episode blocks - any content block that should appear in the timeline
  const getEpisodeBlocks = (): ContentBlock[] => {
    // Include all content blocks that are marked for story arc or have a type that makes sense for episodes
    const validTypes = ['interview', 'b-roll', 'demo', 'narration', 'graphics', 'transition', 'title', 'credits'];
    
    const episodeBlocks = contentBlocks.filter(block => 
      block.inStoryArc || validTypes.includes(block.type)
    );
    
    console.log('Episode Overview - Available blocks:', episodeBlocks.length);
    console.log('Episode blocks:', episodeBlocks.map(b => ({ 
      id: b.id, 
      title: b.title, 
      type: b.type,
      sequence: b.sequence,
      inStoryArc: b.inStoryArc 
    })));
    
    return episodeBlocks;
  };
  
  const episodeBlocks = getEpisodeBlocks();
  
  // Calculate total episode duration
  const totalDuration = episodeBlocks.reduce((sum, block) => sum + (block.duration || 0), 0);
  
  // Get timeline item by content block ID
  const getTimelineItem = (blockId: string): TimelineItem | undefined => {
    return timelineItems.find(item => item.contentBlockId === blockId);
  };

  return (
    <Card className="p-6 bg-white/95 backdrop-blur-sm border border-gray-400">
      <div className="flex justify-between items-start mb-6">
        <EpisodeStats totalDuration={totalDuration} />
        
        <EpisodeControls
          showEquipment={showEquipment}
          setShowEquipment={setShowEquipment}
          showCrew={showCrew}
          setShowCrew={setShowCrew}
          showDateTime={showDateTime}
          setShowDateTime={setShowDateTime}
        />
      </div>
      
      {/* Episode blocks list with vertical drag-and-drop */}
      <div className="border border-gray-400 rounded-lg p-4 bg-gray-50/90">
        {episodeBlocks.length === 0 ? (
          <div className="flex items-center justify-center h-32 border-2 border-dashed rounded-lg">
            <p className="text-gray-600">No content blocks available. Add blocks from Story Arc or Script.</p>
          </div>
        ) : (
          <DragReorderContainer
            items={episodeBlocks}
            className="space-y-3"
          >
            {(block: ContentBlock, index: number, isDragging: boolean) => {
              const timelineItem = getTimelineItem(block.id);
              const blockWidth = Math.max((block.duration || 5) / (totalDuration || 60) * 80, 15);
              
              return (
                <EpisodeBlockCard
                  key={block.id}
                  block={block}
                  index={index}
                  blockWidth={blockWidth}
                  timelineItem={timelineItem}
                  totalDuration={totalDuration}
                  isDragging={isDragging}
                  showEquipment={showEquipment}
                  showCrew={showCrew}
                  showDateTime={showDateTime}
                />
              );
            }}
          </DragReorderContainer>
        )}
      </div>
      
      <p className="mt-4 text-sm text-gray-600 text-center font-medium">
        Drag and drop blocks to resequence the episode. Toggle switches to show additional details.
      </p>
    </Card>
  );
};

export default EpisodeOverview;
