
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ContentBlock } from '@/contexts/ContentBlocksContext';

interface BlockSummaryGridProps {
  episodeBlocks: ContentBlock[];
  getTimelineItem: (blockId: string) => any;
}

const BlockSummaryGrid: React.FC<BlockSummaryGridProps> = ({
  episodeBlocks,
  getTimelineItem
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {episodeBlocks.map((block, index) => (
        <Card key={block.id} className="p-4 bg-white/95 backdrop-blur-sm border border-gray-400 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-gray-900">#{index + 1} {block.title}</span>
            <Badge variant="outline" className="text-xs border-gray-600 text-gray-900 bg-gray-100">{block.type}</Badge>
          </div>
          <div className="text-xs text-gray-700 space-y-1">
            <p className="font-medium">Duration: {block.duration || 5} minutes</p>
            <div className="flex items-center gap-2">
              <span className="font-medium">Status:</span>
              <Badge className={`text-xs ${getStatusColor(getTimelineItem(block.id)?.status)}`}>
                {getTimelineItem(block.id)?.status || 'Planned'}
              </Badge>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default BlockSummaryGrid;
