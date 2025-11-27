
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { useContentBlocks } from '@/contexts/ContentBlocksContext';
import TimelineControls from './TimelineControls';
import TimelineTrack from './TimelineTrack';
import BlockSummaryGrid from './BlockSummaryGrid';

const ProductionTimelineFixed: React.FC = () => {
  const { contentBlocks, timelineItems, crewMembers, equipmentList, locations, updateContentBlockOrder } = useContentBlocks();
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [snapToGrid, setSnapToGrid] = useState(true);
  
  // Get blocks that are in story arc and sort by sequence
  const episodeBlocks = contentBlocks
    .filter(block => block.inStoryArc)
    .sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
  
  console.log('🆕 NEW TIMELINE: Episode blocks found:', episodeBlocks.length);
  
  const totalDuration = episodeBlocks.reduce((sum, block) => sum + (block.duration || 5), 0);
  const pixelsPerMinute = snapToGrid ? 15 : 12; // Slightly larger for better visibility
  const blockPadding = 8; // Padding between blocks
  const timelineWidth = Math.max(totalDuration * pixelsPerMinute + (episodeBlocks.length * blockPadding), 1200);
  
  // Content type colors
  const getBlockColor = (type: string) => {
    const colors = {
      'interview': 'bg-blue-100 border-blue-300 text-blue-800',
      'b-roll': 'bg-green-100 border-green-300 text-green-800',
      'demo': 'bg-purple-100 border-purple-300 text-purple-800',
      'narration': 'bg-yellow-100 border-yellow-300 text-yellow-800',
      'graphics': 'bg-pink-100 border-pink-300 text-pink-800',
      'transition': 'bg-gray-100 border-gray-300 text-gray-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 border-gray-300 text-gray-800';
  };
  
  // Calculate block position and width based on cumulative duration
  const getBlockStyles = (block: any, index: number) => {
    // Calculate cumulative start time by summing all previous block durations
    let startTime = 0;
    for (let i = 0; i < index; i++) {
      startTime += (episodeBlocks[i].duration || 5);
    }
    
    const duration = block.duration || 5;
    const leftPosition = startTime * pixelsPerMinute + (index * blockPadding);
    const width = duration * pixelsPerMinute - blockPadding;
    
    console.log(`Block ${index}: startTime=${startTime}, duration=${duration}, left=${leftPosition}px, width=${width}px`);
    
    return {
      left: `${leftPosition}px`,
      width: `${Math.max(width, 100)}px`, // Minimum width of 100px
      minWidth: '100px'
    };
  };
  
  // Get timeline item for block
  const getTimelineItem = (blockId: string) => {
    return timelineItems.find(item => item.contentBlockId === blockId);
  };
  
  // Get crew names for block
  const getCrewNames = (timelineItem?: any): string[] => {
    if (!timelineItem) return [];
    return timelineItem.crewIds
      .map((id: string) => crewMembers.find(crew => crew.id === id)?.name)
      .filter(Boolean) as string[];
  };
  
  // Get equipment names for block
  const getEquipmentNames = (timelineItem?: any): string[] => {
    if (!timelineItem) return [];
    return timelineItem.equipmentIds
      .map((id: string) => equipmentList.find(eq => eq.id === id)?.name)
      .filter(Boolean) as string[];
  };
  
  // Get location name for block
  const getLocationName = (timelineItem?: any): string => {
    if (!timelineItem) return 'No location';
    const location = locations.find(loc => loc.id === timelineItem.locationId);
    return location?.name || 'Unknown location';
  };
  
  // Drag handlers
  const handleDragStart = (e: React.DragEvent, blockId: string) => {
    setDraggedBlockId(blockId);
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (!draggedBlockId) return;
    
    const draggedBlock = episodeBlocks.find(b => b.id === draggedBlockId);
    if (!draggedBlock) return;
    
    console.log('🔄 Reordering block:', draggedBlockId, 'to position:', targetIndex);
    updateContentBlockOrder(draggedBlockId, targetIndex);
    setDraggedBlockId(null);
  };
  
  // Generate time markers - more frequent markers for better visibility
  const timeMarkers = Array.from({ length: Math.ceil(totalDuration / 2) + 1 }, (_, i) => i * 2);
  
  return (
    <div className="p-6 space-y-6">
      <TimelineControls
        snapToGrid={snapToGrid}
        onSnapToGridChange={setSnapToGrid}
        totalDuration={totalDuration}
        blockCount={episodeBlocks.length}
      />
      
      {/* Timeline Container with Horizontal Scroll */}
      <Card className="p-4">
        <TimelineTrack
          episodeBlocks={episodeBlocks}
          timelineWidth={timelineWidth}
          timeMarkers={timeMarkers}
          pixelsPerMinute={pixelsPerMinute}
          draggedBlockId={draggedBlockId}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragStart={handleDragStart}
          getBlockStyles={getBlockStyles}
          getTimelineItem={getTimelineItem}
          getCrewNames={getCrewNames}
          getEquipmentNames={getEquipmentNames}
          getLocationName={getLocationName}
          getBlockColor={getBlockColor}
        />
      </Card>
      
      {/* Block Summary */}
      <BlockSummaryGrid
        episodeBlocks={episodeBlocks}
        getTimelineItem={getTimelineItem}
      />
    </div>
  );
};

export default ProductionTimelineFixed;
