
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useContentBlocks } from '@/contexts/ContentBlocksContext';
import { useDragReorder } from '@/hooks/useDragReorder';
import { useTimelineCalculations } from '@/hooks/useTimelineCalculations';
import { Lane } from './ProductionTimelineTypes';
import TimelineHeader from './TimelineHeader';
import TimelineGrid from './TimelineGrid';

const ProductionTimeline: React.FC = () => {
  const { 
    contentBlocks,
    timelineItems,
    crewMembers,
    equipmentList,
    locations
  } = useContentBlocks();
  
  const [timeScale, setTimeScale] = useState<number>(60);
  
  const { 
    draggedItemId, 
    handleDragStart, 
    handleDragOver, 
    handleTimelineDrop 
  } = useDragReorder();
  
  const [lanes, setLanes] = useState<Lane[]>([
    { id: 'content', name: 'Content Blocks', color: 'bg-blue-50 border-blue-200', icon: () => null, visible: true },
    { id: 'crew', name: 'Crew Assignments', color: 'bg-orange-50 border-orange-200', icon: () => null, visible: true },
    { id: 'equipment', name: 'Equipment Needed', color: 'bg-purple-50 border-purple-200', icon: () => null, visible: true },
    { id: 'locations', name: 'Locations', color: 'bg-green-50 border-green-200', icon: () => null, visible: true },
    { id: 'milestones', name: 'Status & Milestones', color: 'bg-gray-50 border-gray-200', icon: () => null, visible: true }
  ]);

  const toggleLaneVisibility = (laneId: string) => {
    setLanes(prevLanes => 
      prevLanes.map(lane => 
        lane.id === laneId ? { ...lane, visible: !lane.visible } : lane
      )
    );
  };
  
  // Get episode blocks from Story Arc - enhanced with better filtering and sorting
  const getEpisodeBlocks = () => {
    console.log('All content blocks:', contentBlocks.length);
    console.log('Content blocks detail:', contentBlocks.map(b => ({
      id: b.id,
      title: b.title,
      inStoryArc: b.inStoryArc,
      sequence: b.sequence
    })));
    
    // Get blocks that are in Story Arc
    const storyArcBlocks = contentBlocks.filter(block => {
      const isInStoryArc = block.inStoryArc === true;
      console.log(`Block ${block.title}: inStoryArc=${block.inStoryArc}, included=${isInStoryArc}`);
      return isInStoryArc;
    });
    
    // Sort by sequence to maintain order
    const sortedBlocks = [...storyArcBlocks].sort((a, b) => {
      const aSeq = typeof a.sequence === 'number' ? a.sequence : 0;
      const bSeq = typeof b.sequence === 'number' ? b.sequence : 0;
      return aSeq - bSeq;
    });
    
    console.log("ProductionTimeline - Story Arc blocks found:", sortedBlocks.length);
    console.log("ProductionTimeline - Sorted block details:", sortedBlocks.map(b => ({ 
      id: b.id, 
      title: b.title, 
      type: b.type, 
      duration: b.duration,
      sequence: b.sequence,
      inStoryArc: b.inStoryArc 
    })));
    
    return sortedBlocks;
  };
  
  const episodeBlocks = getEpisodeBlocks();
  const totalDuration = episodeBlocks.reduce((sum, block) => sum + (block.duration || 5), 0);
  
  console.log("ProductionTimeline - Final episode blocks:", episodeBlocks.length);
  console.log("ProductionTimeline - Total duration:", totalDuration);
  
  const { calculateBlockPosition, calculateWidth, getTimeMarkers } = useTimelineCalculations(timeScale, totalDuration);
  const timeMarkers = getTimeMarkers();
  
  // Get corresponding timeline data for a block
  const getTimelineItem = (blockId: string) => timelineItems.find(item => item.contentBlockId === blockId);
  
  const getCrewForTimelineItem = (timelineItem?: any) => {
    if (!timelineItem) return [];
    return crewMembers.filter(crew => timelineItem.crewIds?.includes(crew.id) || []);
  };
  
  const getEquipmentForTimelineItem = (timelineItem?: any) => {
    if (!timelineItem) return [];
    return equipmentList.filter(item => timelineItem.equipmentIds?.includes(item.id) || []);
  };
  
  const getLocationForTimelineItem = (timelineItem?: any) => {
    if (!timelineItem) return null;
    return locations.find(loc => loc.id === timelineItem.locationId);
  };
  
  const exportTimeline = (format: 'pdf' | 'image' | 'csv') => {
    console.log(`Exporting timeline as ${format.toUpperCase()}`);
  };
  
  const handleTimelineDropEvent = (e: React.DragEvent) => {
    e.preventDefault();
    
    if (!draggedItemId) return;
    
    const timelineRect = e.currentTarget.getBoundingClientRect();
    const relativeX = e.clientX - timelineRect.left;
    const dropPercentage = (relativeX / timelineRect.width) * 100;
    
    console.log(`Production Timeline drop at ${dropPercentage}%`);
    handleTimelineDrop(e, dropPercentage, totalDuration, episodeBlocks);
  };
  
  // Enhanced debug logging
  useEffect(() => {
    const blocks = episodeBlocks;
    console.log("🎬 Production Timeline Render Debug:");
    console.log("- Total content blocks in context:", contentBlocks.length);
    console.log("- Blocks with inStoryArc=true:", contentBlocks.filter(b => b.inStoryArc).length);
    console.log("- Final episode blocks for rendering:", blocks.length);
    console.log("- Episode blocks data:", blocks.map(b => ({
      id: b.id,
      title: b.title,
      type: b.type,
      duration: b.duration,
      sequence: b.sequence
    })));
    console.log("- Lanes configuration:", lanes.map(l => ({ id: l.id, visible: l.visible })));
  }, [contentBlocks, episodeBlocks, lanes]);
  
  return (
    <Card className="p-6">
      <TimelineHeader
        totalDuration={totalDuration}
        episodeBlocksCount={episodeBlocks.length}
        timeScale={timeScale}
        onTimeScaleChange={setTimeScale}
        lanes={lanes}
        onToggleLane={toggleLaneVisibility}
        onExport={exportTimeline}
      />
      
      {/* Debug panel - temporary */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
        <strong>Debug Info:</strong> Found {episodeBlocks.length} blocks in Story Arc | 
        Total Duration: {totalDuration} min | 
        Visible Lanes: {lanes.filter(l => l.visible).length} |
        Time Scale: {timeScale} min
        {episodeBlocks.length > 0 && (
          <div className="mt-1">
            <strong>Blocks:</strong> {episodeBlocks.map(b => `${b.title} (${b.duration}min)`).join(', ')}
          </div>
        )}
      </div>
      
      <TimelineGrid
        lanes={lanes}
        episodeBlocks={episodeBlocks}
        timeMarkers={timeMarkers}
        calculateBlockPosition={calculateBlockPosition}
        calculateWidth={calculateWidth}
        getTimelineItem={getTimelineItem}
        getCrewForTimelineItem={getCrewForTimelineItem}
        getEquipmentForTimelineItem={getEquipmentForTimelineItem}
        getLocationForTimelineItem={getLocationForTimelineItem}
        draggedItemId={draggedItemId}
        onDragStart={handleDragStart}
        onTimelineDropEvent={handleTimelineDropEvent}
        onDragOver={handleDragOver}
      />
      
      <div className="mt-4 text-sm text-gray-500">
        <p>
          {draggedItemId ? (
            <span className="text-blue-600 font-medium">Dragging: Drop to reposition block</span>
          ) : (
            `Drag content blocks to resequence. Hover over any item for details. Found ${episodeBlocks.length} blocks.`
          )}
        </p>
      </div>
    </Card>
  );
};

export default ProductionTimeline;
