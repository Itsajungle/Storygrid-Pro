import React from 'react';
import { Card } from '@/components/ui/card';
import { ActStructure, StructureType } from '@/types/story-arc';

interface StoryMetricsType {
  pacing: number;
  balance: number;
  engagement: number;
  actDistribution: Record<string, number>;
  contentTypeCount: Record<string, number>;
}

interface StoryMetricsProps {
  storyBlocks: any[];
  storyMetrics: StoryMetricsType;
  structures: Record<StructureType, ActStructure[]>;
  structure: StructureType;
  totalDuration: number;
  contentBlockTypes: any[];
}

const StoryMetrics: React.FC<StoryMetricsProps> = ({
  storyBlocks,
  storyMetrics,
  structures,
  structure,
  totalDuration,
  contentBlockTypes
}) => {
  const getBlockColor = (type: string) => {
    const blockType = contentBlockTypes.find(t => t.type === type);
    return blockType?.color || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Story Metrics</h3>
      {storyBlocks.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          <p>Add content blocks to see metrics</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Pacing Score</span>
              <span className="font-medium">{storyMetrics.pacing.toFixed(1)}/10</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-jungle-500 h-2 rounded-full" 
                style={{ width: `${storyMetrics.pacing * 10}%` }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Content Balance</span>
              <span className="font-medium">{storyMetrics.balance.toFixed(1)}/10</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-amber-500 h-2 rounded-full" 
                style={{ width: `${storyMetrics.balance * 10}%` }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Engagement Flow</span>
              <span className="font-medium">{storyMetrics.engagement.toFixed(1)}/10</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${storyMetrics.engagement * 10}%` }}
              ></div>
            </div>
          </div>
          
          <div className="border-t pt-4 mt-4">
            <h4 className="text-sm font-medium mb-2">Content Distribution</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(storyMetrics.contentTypeCount).map(([type, count]) => {
                const blockType = contentBlockTypes.find(t => t.type === type);
                return (
                  <div key={type} className="flex items-center gap-1 text-xs">
                    <span className={`w-2 h-2 rounded-full ${getBlockColor(type)}`}></span>
                    <span>{blockType?.label || type}:</span>
                    <span className="font-medium">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-2">Time by Act</h4>
            <div className="space-y-1">
              {structures[structure].map(act => {
                const minutes = storyMetrics.actDistribution[act.name] || 0;
                return (
                  <div key={act.name} className="flex items-center gap-2 text-xs">
                    <span className={`w-2 h-2 rounded-full ${act.color}`}></span>
                    <span className="flex-1">{act.name}:</span>
                    <span className="font-medium">{minutes} min</span>
                    <span className="text-gray-500">
                      ({totalDuration ? Math.round((minutes / totalDuration) * 100) : 0}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default StoryMetrics;
