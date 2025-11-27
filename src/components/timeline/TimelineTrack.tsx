
import React from 'react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Video } from 'lucide-react';
import { ContentBlock } from '@/contexts/ContentBlocksContext';
import TimelineBlock from './TimelineBlock';

interface TimelineTrackProps {
  episodeBlocks: ContentBlock[];
  timelineWidth: number;
  timeMarkers: number[];
  pixelsPerMinute: number;
  draggedBlockId: string | null;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetIndex: number) => void;
  onDragStart: (e: React.DragEvent, blockId: string) => void;
  getBlockStyles: (block: ContentBlock, index: number) => React.CSSProperties;
  getTimelineItem: (blockId: string) => any;
  getCrewNames: (timelineItem?: any) => string[];
  getEquipmentNames: (timelineItem?: any) => string[];
  getLocationName: (timelineItem?: any) => string;
  getBlockColor: (type: string) => string;
}

const TimelineTrack: React.FC<TimelineTrackProps> = ({
  episodeBlocks,
  timelineWidth,
  timeMarkers,
  pixelsPerMinute,
  draggedBlockId,
  onDragOver,
  onDrop,
  onDragStart,
  getBlockStyles,
  getTimelineItem,
  getCrewNames,
  getEquipmentNames,
  getLocationName,
  getBlockColor
}) => {
  return (
    <div className="space-y-4">
      {/* Sticky Time Scale Header */}
      <div className="sticky top-0 z-10 bg-white pb-2 border-b">
        <div className="relative h-8" style={{ width: `${timelineWidth}px` }}>
          {timeMarkers.map(time => (
            <div
              key={time}
              className="absolute top-0 h-full flex items-center"
              style={{ left: `${time * pixelsPerMinute}px` }}
            >
              <div className="border-l border-gray-300 h-6"></div>
              <span className="text-xs text-gray-500 ml-1 bg-white px-1">
                {time}m
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Scrollable Timeline Track */}
      <ScrollArea className="w-full">
        <div 
          className="relative h-32 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 overflow-visible"
          style={{ width: `${timelineWidth}px` }}
          onDragOver={onDragOver}
          onDrop={(e) => onDrop(e, episodeBlocks.length)}
        >
          {/* Render Timeline Blocks */}
          {episodeBlocks.map((block, index) => {
            const timelineItem = getTimelineItem(block.id);
            const crewNames = getCrewNames(timelineItem);
            const equipmentNames = getEquipmentNames(timelineItem);
            const locationName = getLocationName(timelineItem);
            const isDragging = draggedBlockId === block.id;
            const blockStyles = getBlockStyles(block, index);
            
            return (
              <TimelineBlock
                key={block.id}
                block={block}
                index={index}
                blockStyles={blockStyles}
                timelineItem={timelineItem}
                crewNames={crewNames}
                equipmentNames={equipmentNames}
                locationName={locationName}
                isDragging={isDragging}
                onDragStart={onDragStart}
                getBlockColor={getBlockColor}
              />
            );
          })}
          
          {/* Empty state */}
          {episodeBlocks.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Video className="w-8 h-8 mx-auto mb-2" />
                <p>No blocks in Story Arc</p>
                <p className="text-sm">Add blocks to Story Arc to see timeline</p>
              </div>
            </div>
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default TimelineTrack;
