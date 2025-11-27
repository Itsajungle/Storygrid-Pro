
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Video, Users, MapPin, CheckSquare } from 'lucide-react';
import { ContentBlock, TimelineItem, CrewMember, Equipment, Location } from '@/contexts/ContentBlocksContext';
import { Lane, typeColors } from './ProductionTimelineTypes';
import TimelineMarkers from './TimelineMarkers';
import TimelineLane from './TimelineLane';

interface TimelineGridProps {
  lanes: Lane[];
  episodeBlocks: ContentBlock[];
  timeMarkers: number[];
  calculateBlockPosition: (blockIndex: number, blocks: ContentBlock[]) => string;
  calculateWidth: (durationMins: number) => string;
  getTimelineItem: (blockId: string) => TimelineItem | undefined;
  getCrewForTimelineItem: (timelineItem?: TimelineItem) => CrewMember[];
  getEquipmentForTimelineItem: (timelineItem?: TimelineItem) => Equipment[];
  getLocationForTimelineItem: (timelineItem?: TimelineItem) => Location | null;
  draggedItemId: string | null;
  onDragStart: (e: React.DragEvent, itemId: string) => void;
  onTimelineDropEvent: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent, targetIndex: number) => void;
}

const TimelineGrid: React.FC<TimelineGridProps> = ({
  lanes,
  episodeBlocks,
  timeMarkers,
  calculateBlockPosition,
  calculateWidth,
  getTimelineItem,
  getCrewForTimelineItem,
  getEquipmentForTimelineItem,
  getLocationForTimelineItem,
  draggedItemId,
  onDragStart,
  onTimelineDropEvent,
  onDragOver
}) => {
  const getBlockColor = (blockType: string) => {
    return typeColors[blockType as keyof typeof typeColors] || 'bg-gray-100 border-gray-200';
  };

  const laneConfigs = [
    { id: 'content', name: 'Content', icon: Video, type: 'content' as const },
    { id: 'crew', name: 'Crew', icon: Users, type: 'crew' as const },
    { id: 'equipment', name: 'Equipment', icon: Video, type: 'equipment' as const },
    { id: 'locations', name: 'Locations', icon: MapPin, type: 'locations' as const },
    { id: 'milestones', name: 'Milestones', icon: CheckSquare, type: 'milestones' as const }
  ];

  console.log('TimelineGrid - Episode blocks received:', episodeBlocks?.length || 0);
  console.log('TimelineGrid - Visible lanes:', lanes.filter(l => l.visible).map(l => l.id));

  return (
    <ResizablePanelGroup className="border rounded-lg bg-white" direction="vertical">
      {/* Time markers bar */}
      <ResizablePanel defaultSize={8}>
        <div className="bg-gray-50 border-b">
          <TimelineMarkers timeMarkers={timeMarkers} />
        </div>
      </ResizablePanel>
      
      <ResizableHandle />
      
      {/* Scrollable timeline area */}
      <ResizablePanel defaultSize={92}>
        <ScrollArea className="h-[600px]">
          <div className="min-w-[1000px]">
            {laneConfigs.map((config, index) => {
              const lane = lanes.find(l => l.id === config.id);
              if (!lane?.visible) {
                console.log(`Lane ${config.id} is not visible, skipping`);
                return null;
              }

              console.log(`Rendering lane: ${config.id} with ${episodeBlocks.length} blocks`);

              return (
                <div key={config.id} className="relative flex border-b last:border-b-0">
                  {/* Lane label - fixed width */}
                  <div className="sticky left-0 top-0 z-10 bg-white border-r px-4 py-3 text-sm font-medium flex items-center gap-2 min-w-[140px] max-w-[140px] h-[120px]">
                    <config.icon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{config.name}</span>
                  </div>
                  
                  {/* Lane content - flexible width */}
                  <div className="flex-1 relative">
                    <TimelineLane
                      laneType={config.type}
                      episodeBlocks={episodeBlocks}
                      calculateBlockPosition={calculateBlockPosition}
                      calculateWidth={calculateWidth}
                      getTimelineItem={getTimelineItem}
                      getCrewForTimelineItem={getCrewForTimelineItem}
                      getEquipmentForTimelineItem={getEquipmentForTimelineItem}
                      getLocationForTimelineItem={getLocationForTimelineItem}
                      getBlockColor={getBlockColor}
                      draggedItemId={draggedItemId}
                      onDragStart={onDragStart}
                      onTimelineDropEvent={onTimelineDropEvent}
                      onDragOver={onDragOver}
                    />
                  </div>
                </div>
              );
            })}
            
            {/* Debug information when no lanes are visible */}
            {lanes.filter(l => l.visible).length === 0 && (
              <div className="flex items-center justify-center h-[200px] text-gray-500 bg-gray-50 border rounded-md m-4">
                <div className="text-center">
                  <Video className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>No visible lanes</p>
                  <p className="text-xs mt-1">Enable lanes in the header to see timeline</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default TimelineGrid;
