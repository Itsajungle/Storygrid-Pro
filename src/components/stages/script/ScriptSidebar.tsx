
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MapPin, Mic, Eye } from 'lucide-react';
import { ContentBlock } from '@/contexts/ContentBlocksContext';
import { ScriptBlock } from './types';

interface ScriptSidebarProps {
  storyArcBlocks: ContentBlock[];
  scriptBlocks: ScriptBlock[];
  onScriptSelect: (blockId: string) => void;
  getStatusColor: (status: string) => string;
}

const ScriptSidebar: React.FC<ScriptSidebarProps> = ({
  storyArcBlocks,
  scriptBlocks,
  onScriptSelect,
  getStatusColor
}) => {
  return (
    <Card className="p-5 lg:col-span-1">
      <h3 className="text-lg font-semibold mb-4">Story Blocks</h3>
      <ScrollArea className="h-[600px]">
        <div className="space-y-2">
          {storyArcBlocks.map((block) => {
            const scriptBlock = scriptBlocks.find(sb => sb.contentBlockId === block.id);
            const status = scriptBlock?.status || 'draft';
            
            return (
              <div
                key={block.id}
                onClick={() => onScriptSelect(block.id)}
                className="p-3 rounded-md border cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-gray-900 leading-tight">{block.title}</h4>
                  <Badge variant="outline" className={getStatusColor(status)}>
                    {status.replace('-', ' ')}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 mt-1">{block.type} - {scriptBlock?.estimatedRuntime || block.duration}m</p>
                
                {scriptBlock ? (
                  <div className="mt-2 flex items-center gap-1 flex-wrap">
                    {scriptBlock.where && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 text-xs">
                        <MapPin className="w-3 h-3 mr-1" /> Where
                      </Badge>
                    )}
                    {scriptBlock.ears && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-100 text-xs">
                        <Mic className="w-3 h-3 mr-1" /> Ears
                      </Badge>
                    )}
                    {scriptBlock.eyes && (
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-100 text-xs">
                        <Eye className="w-3 h-3 mr-1" /> Eyes
                      </Badge>
                    )}
                  </div>
                ) : (
                  <div className="mt-2">
                    <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200 text-xs">
                      No script yet
                    </Badge>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default ScriptSidebar;
