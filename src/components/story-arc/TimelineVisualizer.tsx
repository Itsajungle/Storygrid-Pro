
import React from 'react';
import { BarChart3, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StoryBlock, ActStructure } from '@/types/story-arc';
import { useDragReorder } from '@/hooks/useDragReorder';

interface TimelineVisualizerProps {
  storyBlocks: StoryBlock[];
  structures: Record<string, ActStructure[]>;
  structure: '3-act' | '5-act' | '7-act';
  totalDuration: number;
  contentBlockTypes: any[];
  onBlockClick: (block: StoryBlock) => void;
}

const TimelineVisualizer: React.FC<TimelineVisualizerProps> = ({
  storyBlocks,
  structures,
  structure,
  totalDuration,
  contentBlockTypes,
  onBlockClick,
}) => {
  const {
    draggedItemId,
    handleDragStart,
    handleDragOver,
    handleTimelineDrop
  } = useDragReorder();

  const getBlockColor = (type: string) => {
    const blockType = contentBlockTypes.find(t => t.type === type);
    return blockType?.color || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'needs-review': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Handle drop with proper position calculation and enhanced feedback
  const handleTimelineDropEvent = (e: React.DragEvent) => {
    e.preventDefault();
    
    if (!draggedItemId) return;
    
    // Calculate drop position based on mouse position
    const timelineRect = e.currentTarget.getBoundingClientRect();
    const relativeX = e.clientX - timelineRect.left;
    const dropPercentage = (relativeX / timelineRect.width) * 100;
    
    console.log(`Timeline drop at ${dropPercentage}%`);
    handleTimelineDrop(e, dropPercentage, totalDuration, storyBlocks);
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5" />
        Visual Timeline
      </h3>
      
      {/* Structure Overlay */}
      <div className="relative mb-6">
        <div className="flex h-8 rounded-lg overflow-hidden border">
          {structures[structure].map((act, index) => (
            <div
              key={index}
              className={`${act.color} flex items-center justify-center text-white text-xs font-medium transition-all hover:opacity-80`}
              style={{ width: `${act.end - act.start}%` }}
            >
              {act.name}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0 min</span>
          <span>{Math.round(totalDuration * 0.25)} min</span>
          <span>{Math.round(totalDuration * 0.5)} min</span>
          <span>{Math.round(totalDuration * 0.75)} min</span>
          <span>{totalDuration} min</span>
        </div>
      </div>

      {/* Content Blocks on Timeline with Enhanced Drop Zone */}
      <div 
        className={`relative transition-all duration-300 ${
          draggedItemId 
            ? 'ring-4 ring-blue-300 ring-opacity-50 bg-blue-50' 
            : ''
        }`} 
        onDragOver={(e) => handleDragOver(e, 0)}
        onDrop={handleTimelineDropEvent}
      >
        {storyBlocks.length === 0 ? (
          <div className="h-24 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
            <p>No content blocks have been added to the Story Arc yet.<br />
            Use the "Send to Story Arc" button in the Ideation Stage to add blocks here.</p>
          </div>
        ) : (
          <div className={`h-24 bg-gray-100 rounded-lg relative overflow-hidden ${
            draggedItemId ? 'bg-gradient-to-r from-blue-100 to-green-100' : ''
          }`}>
            {/* Enhanced drop zone indicator */}
            {draggedItemId && (
              <div className="absolute inset-0 border-4 border-dashed border-blue-400 rounded-lg flex items-center justify-center bg-blue-50 bg-opacity-90 z-10">
                <div className="flex items-center gap-2 text-blue-700 font-semibold text-lg">
                  <CheckCircle className="w-6 h-6" />
                  <span>Drop Here to Reposition on Timeline</span>
                </div>
              </div>
            )}
            
            {storyBlocks.map((block) => {
              const blockType = contentBlockTypes.find(t => t.type === block.type);
              
              return (
                <div
                  key={block.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, block.id)}
                  onClick={() => onBlockClick(block)}
                  className={`absolute top-2 h-20 rounded border-2 ${getBlockColor(block.type)} cursor-pointer transition-all ${blockType?.shape || ''} ${
                    draggedItemId === block.id 
                      ? 'opacity-60 z-20 scale-110 rotate-2 shadow-2xl ring-4 ring-yellow-400' 
                      : 'z-1 hover:scale-105 hover:shadow-lg hover:z-10'
                  }`}
                  style={{
                    left: `${block.position}%`,
                    width: `${Math.max((block.duration || 3) / totalDuration * 100, 8)}%`,
                    transform: `translateX(-50%)`,
                  }}
                >
                  <div className="p-2 h-full flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-medium truncate">{block.title}</div>
                      <div className="flex items-center gap-1 mt-1">
                        <Badge variant="outline" className="text-xs">{blockType?.label || block.type}</Badge>
                        {block.status && (
                          <Badge variant="outline" className={`text-xs ${getStatusColor(block.status)}`}>
                            {block.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-xs opacity-75">{block.duration}m</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="mt-2 flex justify-center">
        <p className="text-xs text-gray-500">
          {draggedItemId ? (
            <span className="text-blue-600 font-medium">Drag to reposition blocks on the timeline</span>
          ) : (
            "Drag blocks to reposition them on the timeline"
          )}
        </p>
      </div>
    </Card>
  );
};

export default TimelineVisualizer;
