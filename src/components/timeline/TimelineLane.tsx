import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Calendar, Clock, CheckSquare, Video } from 'lucide-react';
import { ContentBlock, TimelineItem, CrewMember, Equipment, Location } from '@/contexts/ContentBlocksContext';
import { statusColors, typeColors } from './ProductionTimelineTypes';

interface TimelineLaneProps {
  laneType: 'content' | 'crew' | 'equipment' | 'locations' | 'milestones';
  episodeBlocks: ContentBlock[];
  calculateBlockPosition: (blockIndex: number, blocks: ContentBlock[]) => string;
  calculateWidth: (durationMins: number) => string;
  getTimelineItem: (blockId: string) => TimelineItem | undefined;
  getCrewForTimelineItem: (timelineItem?: TimelineItem) => CrewMember[];
  getEquipmentForTimelineItem: (timelineItem?: TimelineItem) => Equipment[];
  getLocationForTimelineItem: (timelineItem?: TimelineItem) => Location | null;
  getBlockColor: (blockType: string) => string;
  draggedItemId: string | null;
  onDragStart: (e: React.DragEvent, itemId: string) => void;
  onTimelineDropEvent: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent, targetIndex: number) => void;
}

const TimelineLane: React.FC<TimelineLaneProps> = ({
  laneType,
  episodeBlocks,
  calculateBlockPosition,
  calculateWidth,
  getTimelineItem,
  getCrewForTimelineItem,
  getEquipmentForTimelineItem,
  getLocationForTimelineItem,
  getBlockColor,
  draggedItemId,
  onDragStart,
  onTimelineDropEvent,
  onDragOver
}) => {
  // Debug logging to see what we're getting
  console.log(`🔍 TimelineLane [${laneType}] - Episode blocks:`, episodeBlocks?.length || 0);
  console.log(`🔍 TimelineLane [${laneType}] - Blocks array:`, episodeBlocks);

  // Hardcoded test block to verify rendering works
  const testBlock = {
    id: 'test-block',
    title: 'TEST BLOCK - Should be visible',
    type: 'test',
    duration: 10,
    description: 'This is a test block to verify rendering'
  };
  
  const renderContentBlocks = () => {
    console.log(`🎬 CONTENT LANE: Rendering ${episodeBlocks.length} blocks`);
    
    // Early return for empty blocks - but show a message
    if (!episodeBlocks || episodeBlocks.length === 0) {
      console.log('❌ No blocks to render - showing empty state');
      return (
        <div className="relative h-[120px] border-b bg-gray-50">
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <Video className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>No content blocks in Story Arc</p>
              <p className="text-xs mt-1">Add blocks to Story Arc to see them here</p>
            </div>
          </div>
          
          {/* Test block to verify rendering capability */}
          <div className="absolute top-2 left-4 bg-red-200 border-2 border-red-400 p-2 rounded text-sm z-20">
            TEST RENDER: {testBlock.title}
          </div>
        </div>
      );
    }

    return (
      <div 
        className={`relative h-[120px] border-b transition-all duration-300 bg-white ${
          draggedItemId ? 'bg-blue-50 ring-2 ring-blue-300' : ''
        }`} 
        onDragOver={(e) => onDragOver(e, 0)}
        onDrop={onTimelineDropEvent}
      >
        {/* Enhanced drop zone indicator */}
        {draggedItemId && (
          <div className="absolute inset-0 border-4 border-dashed border-blue-400 rounded-lg flex items-center justify-center bg-blue-100 bg-opacity-90 z-10">
            <div className="flex items-center gap-2 text-blue-700 font-semibold">
              <CheckSquare className="w-5 h-5" />
              <span>Drop Here to Reposition Block</span>
            </div>
          </div>
        )}
        
        {/* CRITICAL: Blocks container - this MUST render blocks */}
        <div className="absolute inset-0 p-2 bg-yellow-50">
          {/* Debug info bar */}
          <div className="absolute top-1 left-2 text-xs bg-green-100 px-2 py-1 rounded border z-30 font-mono">
            RENDERING: {episodeBlocks.length} blocks | Lane: {laneType}
          </div>
          
          {/* MAIN RENDER LOOP - This is where blocks MUST appear */}
          {episodeBlocks.map((block, index) => {
            console.log(`🌟 RENDERING BLOCK ${index + 1}/${episodeBlocks.length}:`, {
              id: block.id,
              title: block.title,
              type: block.type,
              duration: block.duration,
              sequence: block.sequence
            });
            
            const timelineItem = getTimelineItem(block.id);
            const duration = block.duration || 5;
            const position = calculateBlockPosition(index, episodeBlocks);
            const width = calculateWidth(duration);
            const isDragging = draggedItemId === block.id;
            
            console.log(`📍 Block ${index} positioning:`, { position, width, duration });
            
            return (
              <TooltipProvider key={block.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div 
                      draggable
                      onDragStart={(e) => onDragStart(e, block.id)}
                      className={`absolute rounded-lg border-2 p-3 cursor-move transition-all shadow-lg ${getBlockColor(block.type)} ${
                        isDragging 
                          ? 'opacity-60 scale-110 rotate-2 shadow-2xl ring-4 ring-yellow-400 z-20' 
                          : 'hover:scale-105 hover:shadow-xl hover:z-10 hover:border-blue-400'
                      }`}
                      style={{ 
                        left: position, 
                        width: width, 
                        top: '20px', 
                        height: '80px',
                        minWidth: '150px',
                        maxWidth: '300px'
                      }}
                    >
                      <div className="flex flex-col h-full">
                        <div className="font-semibold text-sm truncate mb-1 text-gray-800">
                          {block.title}
                        </div>
                        <div className="flex items-center gap-1 mb-2 flex-wrap">
                          <Badge variant="outline" className="text-xs capitalize bg-white">
                            {block.type}
                          </Badge>
                          <Badge className={`text-xs ${timelineItem ? statusColors[timelineItem.status] || statusColors['planned'] : statusColors['planned']}`}>
                            {timelineItem?.status || 'Planned'}
                          </Badge>
                        </div>
                        <div className="mt-auto text-xs text-gray-600 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {duration} min
                        </div>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="w-64 p-3">
                    <div className="space-y-2">
                      <h4 className="font-semibold">{block.title}</h4>
                      <p className="text-sm">{block.description}</p>
                      <div className="text-sm">
                        <div>Type: {block.type}</div>
                        <div>Duration: {duration} min</div>
                        <div>Status: {timelineItem?.status || 'Planned'}</div>
                        <div>Sequence: #{typeof block.sequence === 'number' ? block.sequence + 1 : index + 1}</div>
                        {timelineItem?.date && (
                          <div>Scheduled: {timelineItem.date}, {timelineItem.startTime} - {timelineItem.endTime}</div>
                        )}
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
          
          {/* Additional test render to verify container works */}
          <div className="absolute bottom-2 right-2 text-xs bg-blue-100 px-2 py-1 rounded border z-30">
            Map executed: {episodeBlocks.length} times
          </div>
        </div>
      </div>
    );
  };

  const renderCrewLane = () => (
    <div className="relative h-[120px] border-b bg-white">
      <div className="absolute inset-0 p-2">
        {/* Debug header for crew lane */}
        <div className="absolute top-1 left-2 text-xs bg-orange-100 px-2 py-1 rounded border z-30">
          CREW: {episodeBlocks.length} blocks
        </div>
        
        {episodeBlocks.map((block, index) => {
          const timelineItem = getTimelineItem(block.id);
          const duration = block.duration || 5;
          const position = calculateBlockPosition(index, episodeBlocks);
          const width = calculateWidth(duration);
          const crew = getCrewForTimelineItem(timelineItem);
          
          return (
            <TooltipProvider key={block.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className="absolute rounded-md bg-orange-100 border-orange-200 border-2 p-3 shadow-sm hover:shadow-lg transition-all"
                    style={{ 
                      left: position, 
                      width: width, 
                      top: '20px', 
                      height: '80px',
                      minWidth: '120px'
                    }}
                  >
                    <div className="flex flex-col h-full">
                      <div className="font-medium text-sm truncate mb-1">
                        {crew.length > 0 ? `${crew.length} crew members` : 'No crew assigned'}
                      </div>
                      <div className="text-xs overflow-hidden flex-1">
                        {crew.slice(0, 2).map(member => (
                          <div key={member.id} className="truncate">
                            {member.name} ({member.role})
                          </div>
                        ))}
                        {crew.length > 2 && (
                          <div className="text-xs text-gray-500">+{crew.length - 2} more</div>
                        )}
                      </div>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="w-64 p-3">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Crew for: {block.title}</h4>
                    <div className="text-sm space-y-1">
                      {crew.length > 0 ? (
                        crew.map(member => (
                          <div key={member.id} className="flex justify-between">
                            <span>{member.name}</span>
                            <Badge variant="outline" className="text-xs">{member.role}</Badge>
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-500">No crew assigned</div>
                      )}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    </div>
  );

  const renderEquipmentLane = () => (
    <div className="relative h-[120px] border-b bg-white">
      <div className="absolute inset-0 p-2">
        <div className="absolute top-1 left-2 text-xs bg-purple-100 px-2 py-1 rounded border z-30">
          EQUIPMENT: {episodeBlocks.length} blocks
        </div>
        
        {episodeBlocks.map((block, index) => {
          const timelineItem = getTimelineItem(block.id);
          const duration = block.duration || 5;
          const position = calculateBlockPosition(index, episodeBlocks);
          const width = calculateWidth(duration);
          const equipment = getEquipmentForTimelineItem(timelineItem);
          
          return (
            <TooltipProvider key={block.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className="absolute rounded-md bg-purple-100 border-purple-200 border-2 p-3 shadow-sm hover:shadow-lg transition-all"
                    style={{ 
                      left: position, 
                      width: width, 
                      top: '20px', 
                      height: '80px',
                      minWidth: '120px'
                    }}
                  >
                    <div className="flex flex-col h-full">
                      <div className="font-medium text-sm truncate mb-1">
                        {equipment.length > 0 ? `${equipment.length} items` : 'No equipment'}
                      </div>
                      <div className="text-xs overflow-hidden flex-1">
                        {equipment.slice(0, 2).map(item => (
                          <div key={item.id} className="truncate">
                            {item.name} ({item.quantity})
                          </div>
                        ))}
                        {equipment.length > 2 && (
                          <div className="text-xs text-gray-500">+{equipment.length - 2} more</div>
                        )}
                      </div>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="w-64 p-3">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Equipment for: {block.title}</h4>
                    <div className="text-sm space-y-1">
                      {equipment.length > 0 ? (
                        equipment.map(item => (
                          <div key={item.id} className="flex justify-between">
                            <span>{item.name}</span>
                            <Badge variant="outline" className="text-xs">{item.category} ({item.quantity})</Badge>
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-500">No equipment assigned</div>
                      )}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    </div>
  );

  const renderLocationsLane = () => (
    <div className="relative h-[120px] border-b bg-white">
      <div className="absolute inset-0 p-2">
        <div className="absolute top-1 left-2 text-xs bg-green-100 px-2 py-1 rounded border z-30">
          LOCATIONS: {episodeBlocks.length} blocks
        </div>
        
        {episodeBlocks.map((block, index) => {
          const timelineItem = getTimelineItem(block.id);
          const duration = block.duration || 5;
          const position = calculateBlockPosition(index, episodeBlocks);
          const width = calculateWidth(duration);
          const location = getLocationForTimelineItem(timelineItem);
          
          return (
            <TooltipProvider key={block.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className="absolute rounded-md bg-green-100 border-green-200 border-2 p-3 shadow-sm hover:shadow-lg transition-all"
                    style={{ 
                      left: position, 
                      width: width, 
                      top: '20px', 
                      height: '80px',
                      minWidth: '120px'
                    }}
                  >
                    <div className="flex flex-col h-full">
                      <div className="font-medium text-sm truncate mb-1">
                        {location ? location.name : 'No location'}
                      </div>
                      {location && location.address && (
                        <div className="text-xs text-gray-600 truncate">
                          {location.address}
                        </div>
                      )}
                      {!location && (
                        <div className="text-xs text-gray-500">Location not specified</div>
                      )}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="w-64 p-3">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Location for: {block.title}</h4>
                    {location ? (
                      <div className="text-sm space-y-1">
                        <div><span className="font-medium">Name:</span> {location.name}</div>
                        {location.address && (
                          <div><span className="font-medium">Address:</span> {location.address}</div>
                        )}
                        {location.contactName && (
                          <div><span className="font-medium">Contact:</span> {location.contactName} {location.contactInfo && `(${location.contactInfo})`}</div>
                        )}
                        {location.notes && (
                          <div><span className="font-medium">Notes:</span> {location.notes}</div>
                        )}
                      </div>
                    ) : (
                      <div className="text-gray-500">No location assigned</div>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    </div>
  );

  const renderMilestonesLane = () => (
    <div className="relative h-[120px] bg-white">
      <div className="absolute inset-0 p-2">
        <div className="absolute top-1 left-2 text-xs bg-gray-100 px-2 py-1 rounded border z-30">
          MILESTONES: {episodeBlocks.length} blocks
        </div>
        
        {episodeBlocks.map((block, index) => {
          const timelineItem = getTimelineItem(block.id);
          const duration = block.duration || 5;
          const position = calculateBlockPosition(index, episodeBlocks);
          const width = calculateWidth(duration);
          
          return (
            <div 
              key={block.id}
              className="absolute flex flex-col items-center"
              style={{ 
                left: position, 
                width: width,
                top: '20px',
                height: '80px',
                minWidth: '120px'
              }}
            >
              <div className="h-full relative w-full border-2 border-gray-200 rounded-md p-2 bg-gray-50 shadow-sm hover:shadow-lg transition-all">
                {/* Status milestones */}
                <div className="absolute top-2 left-2 right-2 flex justify-center">
                  <Badge className={`text-xs ${timelineItem ? statusColors[timelineItem.status] : 'bg-gray-100'}`}>
                    {timelineItem?.status || 'Planned'}
                  </Badge>
                </div>
                
                {/* Date milestone */}
                {timelineItem?.date && (
                  <div className="absolute bottom-2 left-2 right-2 flex justify-center">
                    <div className="px-2 py-1 bg-white border rounded-md text-xs flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {timelineItem.date}
                    </div>
                  </div>
                )}
                
                {/* Block title for context */}
                <div className="absolute inset-x-2 top-8 bottom-8 flex items-center justify-center">
                  <span className="text-xs text-gray-600 truncate text-center">{block.title}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Return the appropriate lane content based on type
  switch (laneType) {
    case 'content':
      return renderContentBlocks();
    case 'crew':
      return renderCrewLane();
    case 'equipment':
      return renderEquipmentLane();
    case 'locations':
      return renderLocationsLane();
    case 'milestones':
      return renderMilestonesLane();
    default:
      return (
        <div className="flex items-center justify-center h-[120px] text-red-500 bg-red-50 border border-red-200 rounded">
          <span className="text-sm">Unknown lane type: {laneType}</span>
        </div>
      );
  }
};

export default TimelineLane;
