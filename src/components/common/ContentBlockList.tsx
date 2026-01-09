
import React from 'react';
import { ContentBlock } from '@/contexts/ContentBlocksContext';
import DragReorderContainer from './DragReorderContainer';
import { Badge } from '@/components/ui/badge';

interface ContentBlockListProps {
  blocks: ContentBlock[];
  contentBlockTypes: any[];
  onBlockClick?: (block: ContentBlock) => void;
  showSequenceNumbers?: boolean;
  allowReordering?: boolean;
}

const ContentBlockList: React.FC<ContentBlockListProps> = ({
  blocks,
  contentBlockTypes,
  onBlockClick,
  showSequenceNumbers = true,
  allowReordering = true
}) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-600 text-white border-gray-600';
      case 'needs-review': return 'bg-amber-600 text-white border-amber-600';
      case 'approved': return 'bg-green-600 text-white border-green-600';
      case 'planned': return 'bg-blue-600 text-white border-blue-600';
      case 'in-edit': return 'bg-purple-600 text-white border-purple-600';
      case 'filmed': return 'bg-amber-600 text-white border-amber-600';
      default: return 'bg-gray-600 text-white border-gray-600';
    }
  };

  if (blocks.length === 0) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-lg p-6 text-center border border-gray-400 shadow-sm">
        <p className="text-gray-600">No content blocks available.</p>
      </div>
    );
  }

  if (!allowReordering) {
    return (
      <div className="space-y-3">
        {blocks.map((block, index) => (
          <div 
            key={block.id}
            className="flex items-center justify-between p-4 bg-white/95 backdrop-blur-sm rounded-lg border border-gray-400 shadow-sm hover:shadow-md hover:border-gray-500 cursor-pointer transition-all duration-200"
            onClick={() => onBlockClick?.(block)}
          >
            <div className="flex items-center gap-3">
              {showSequenceNumbers && (
                <span className="w-6 h-6 bg-starryBlue text-boldYellow rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </span>
              )}
              <div>
                <h4 className="font-semibold text-gray-900">{block.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs border-gray-600 text-gray-900 bg-gray-100">
                    {contentBlockTypes.find(t => t.type === block.type)?.label || block.type}
                  </Badge>
                  {block.status && (
                    <Badge className={`text-xs ${getStatusColor(block.status)}`}>
                      {block.status}
                    </Badge>
                  )}
                  <span className="text-sm text-gray-600 font-medium">{block.duration || 0} minutes</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <DragReorderContainer
      items={blocks}
      className="space-y-3"
    >
      {(block: ContentBlock, index: number, isDragging: boolean) => (
        <div 
          className={`flex items-center justify-between p-4 bg-white/95 backdrop-blur-sm rounded-lg border border-gray-400 shadow-sm transition-all duration-200 cursor-move ${
            isDragging 
              ? 'ring-2 ring-blue-500 bg-white shadow-lg scale-105' 
              : 'hover:shadow-md hover:border-gray-500'
          }`}
          onClick={() => !isDragging && onBlockClick?.(block)}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {showSequenceNumbers && (
                <span className="w-6 h-6 bg-starryBlue text-boldYellow rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </span>
              )}
              {isDragging && (
                <div className="w-1 h-6 bg-blue-400 rounded-full animate-pulse" />
              )}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{block.title}</h4>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs border-gray-600 text-gray-900 bg-gray-100">
                  {contentBlockTypes.find(t => t.type === block.type)?.label || block.type}
                </Badge>
                {block.status && (
                  <Badge className={`text-xs ${getStatusColor(block.status)}`}>
                    {block.status}
                  </Badge>
                )}
                <span className="text-sm text-gray-600 font-medium">{block.duration || 0} minutes</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </DragReorderContainer>
  );
};

export default ContentBlockList;
