
import React from 'react';
import { Calendar, Clock, Users, Video } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ContentBlock, TimelineItem } from '@/contexts/ContentBlocksContext';

interface EpisodeBlockCardProps {
  block: ContentBlock;
  index: number;
  blockWidth: number;
  timelineItem?: TimelineItem;
  totalDuration: number;
  isDragging: boolean;
  showEquipment: boolean;
  showCrew: boolean;
  showDateTime: boolean;
}

const EpisodeBlockCard: React.FC<EpisodeBlockCardProps> = ({
  block,
  index,
  blockWidth,
  timelineItem,
  isDragging,
  showEquipment,
  showCrew,
  showDateTime
}) => {
  const getBlockTypeColor = (type: string) => {
    switch (type) {
      case 'interview': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'piece-to-camera': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'b-roll': return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      case 'demo': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'location': return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'narration': return 'bg-lime-100 text-lime-800 border-lime-300';
      case 'graphics': return 'bg-pink-100 text-pink-800 border-pink-300';
      case 'transition': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'title': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'credits': return 'bg-orange-100 text-orange-800 border-orange-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

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
    <div 
      className={`flex flex-col ${getBlockTypeColor(block.type)} border p-3 rounded-lg transition-all duration-200 shadow-sm ${
        isDragging 
          ? 'ring-2 ring-blue-500 shadow-lg scale-105' 
          : 'hover:shadow-md cursor-move'
      }`}
      style={{ width: `${blockWidth}%`, minWidth: '200px' }}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-6 bg-starryBlue text-boldYellow rounded-full flex items-center justify-center text-xs font-bold">
              {index + 1}
            </span>
            <h4 className="font-semibold text-gray-900">{block.title}</h4>
            {isDragging && (
              <div className="w-1 h-4 bg-blue-400 rounded-full animate-pulse" />
            )}
          </div>
          <div className="flex items-center gap-1 mt-1 flex-wrap">
            <Badge className={`text-xs ${getBlockTypeColor(block.type)}`}>{block.type}</Badge>
            <Badge className={`text-xs ${getStatusColor(timelineItem?.status || 'planned')}`}>
              {timelineItem?.status || 'Planned'}
            </Badge>
            <Badge variant="outline" className="text-xs border-gray-600 text-gray-900 bg-gray-100">#{typeof block.sequence === 'number' ? block.sequence + 1 : index + 1}</Badge>
          </div>
        </div>
        <div className="text-sm font-bold ml-2 text-gray-900">{block.duration || 5} min</div>
      </div>
      
      {/* Conditional content based on toggles */}
      {(showEquipment || showCrew || showDateTime) && (
        <div className="mt-2 pt-2 border-t border-gray-300 space-y-2 text-xs">
          {showDateTime && timelineItem && (
            <div className="flex items-center gap-1 text-gray-700">
              <Calendar className="w-3 h-3 text-gray-600" />
              <span className="font-medium">{timelineItem.date}, {timelineItem.startTime} - {timelineItem.endTime}</span>
            </div>
          )}
          
          {showCrew && timelineItem?.crewIds.length > 0 && (
            <div className="flex items-start gap-1 text-gray-700">
              <Users className="w-3 h-3 text-gray-600" />
              <div>
                <span className="font-bold">Crew:</span> {timelineItem.crewIds.length} assigned
              </div>
            </div>
          )}
          
          {showEquipment && timelineItem?.equipmentIds.length > 0 && (
            <div className="flex items-start gap-1 text-gray-700">
              <Video className="w-3 h-3 text-gray-600" />
              <div>
                <span className="font-bold">Equipment:</span> {timelineItem.equipmentIds.length} items
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EpisodeBlockCard;
