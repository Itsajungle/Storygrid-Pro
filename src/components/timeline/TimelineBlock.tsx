
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Clock, Users, Video, MapPin, GripHorizontal } from 'lucide-react';
import { ContentBlock, TimelineItem } from '@/contexts/ContentBlocksContext';

interface TimelineBlockProps {
  block: ContentBlock;
  index: number;
  blockStyles: React.CSSProperties;
  timelineItem?: TimelineItem;
  crewNames: string[];
  equipmentNames: string[];
  locationName: string;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent, blockId: string) => void;
  getBlockColor: (type: string) => string;
}

const TimelineBlock: React.FC<TimelineBlockProps> = ({
  block,
  index,
  blockStyles,
  timelineItem,
  crewNames,
  equipmentNames,
  locationName,
  isDragging,
  onDragStart,
  getBlockColor
}) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'planned': return 'bg-blue-600 text-white border-blue-600';
      case 'filmed': return 'bg-amber-600 text-white border-amber-600';
      case 'in-edit': return 'bg-purple-600 text-white border-purple-600';
      case 'approved': return 'bg-green-600 text-white border-green-600';
      default: return 'bg-gray-600 text-white border-gray-600';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            draggable
            onDragStart={(e) => onDragStart(e, block.id)}
            className={`absolute top-2 h-28 rounded-lg border-2 p-3 cursor-move transition-all duration-200 shadow-sm bg-white/95 backdrop-blur-sm border-gray-400 ${
              isDragging ? 'opacity-60 scale-105 rotate-1 z-20 shadow-lg' : 'hover:shadow-md hover:scale-105 hover:bg-white hover:border-gray-500'
            }`}
            style={blockStyles}
          >
            {/* Block Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-1">
                <GripHorizontal className="w-3 h-3 text-gray-600" />
                <span className="text-xs font-bold text-gray-900">#{index + 1}</span>
              </div>
              <Badge variant="outline" className="text-xs bg-gray-100 border-gray-600 text-gray-900">
                {block.type}
              </Badge>
            </div>
            
            {/* Block Title */}
            <h4 className="font-semibold text-sm mb-2 line-clamp-2 text-gray-900">
              {block.title}
            </h4>
            
            {/* Block Footer */}
            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-1 text-xs text-gray-700 font-medium">
                <Clock className="w-3 h-3" />
                {block.duration || 5}m
              </div>
              <Badge className={`text-xs ${getStatusColor(timelineItem?.status)}`}>
                {timelineItem?.status || 'Planned'}
              </Badge>
            </div>
          </div>
        </TooltipTrigger>
        
        <TooltipContent className="max-w-sm p-4 bg-white/95 backdrop-blur-sm border border-gray-400 shadow-xl">
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold mb-1 text-gray-900">{block.title}</h4>
              <p className="text-sm text-gray-700">{block.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="font-bold flex items-center gap-1 mb-1 text-gray-900">
                  <Users className="w-3 h-3" />
                  Crew ({crewNames.length})
                </div>
                {crewNames.length > 0 ? (
                  <ul className="text-xs space-y-1">
                    {crewNames.slice(0, 3).map(name => (
                      <li key={name} className="text-gray-700">• {name}</li>
                    ))}
                    {crewNames.length > 3 && (
                      <li className="text-gray-600">+{crewNames.length - 3} more</li>
                    )}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-600">None assigned</p>
                )}
              </div>
              
              <div>
                <div className="font-bold flex items-center gap-1 mb-1 text-gray-900">
                  <Video className="w-3 h-3" />
                  Equipment ({equipmentNames.length})
                </div>
                {equipmentNames.length > 0 ? (
                  <ul className="text-xs space-y-1">
                    {equipmentNames.slice(0, 3).map(name => (
                      <li key={name} className="text-gray-700">• {name}</li>
                    ))}
                    {equipmentNames.length > 3 && (
                      <li className="text-gray-600">+{equipmentNames.length - 3} more</li>
                    )}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-600">None assigned</p>
                )}
              </div>
            </div>
            
            <div>
              <div className="font-bold flex items-center gap-1 mb-1 text-gray-900">
                <MapPin className="w-3 h-3" />
                Location
              </div>
              <p className="text-xs text-gray-700">{locationName}</p>
            </div>
            
            {timelineItem && (
              <div className="pt-2 border-t text-xs">
                <p className="text-gray-700"><span className="font-bold text-gray-900">Date:</span> {timelineItem.date}</p>
                <p className="text-gray-700"><span className="font-bold text-gray-900">Time:</span> {timelineItem.startTime} - {timelineItem.endTime}</p>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TimelineBlock;
