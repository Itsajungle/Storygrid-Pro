
import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Download } from 'lucide-react';
import { Lane } from './ProductionTimelineTypes';

interface TimelineHeaderProps {
  totalDuration: number;
  episodeBlocksCount: number;
  timeScale: number;
  onTimeScaleChange: (value: number) => void;
  lanes: Lane[];
  onToggleLane: (laneId: string) => void;
  onExport: (format: 'pdf' | 'image' | 'csv') => void;
}

const TimelineHeader: React.FC<TimelineHeaderProps> = ({
  totalDuration,
  episodeBlocksCount,
  timeScale,
  onTimeScaleChange,
  lanes,
  onToggleLane,
  onExport
}) => {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-medium">Production Timeline</h3>
          <p className="text-sm text-gray-500">Visualize all aspects of production on a unified timeline</p>
          {episodeBlocksCount > 0 && (
            <p className="text-xs text-blue-600 mt-1">
              Showing {episodeBlocksCount} blocks from Story Arc ({totalDuration} min total)
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {/* Export options */}
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600 mr-1">Export:</span>
            <button 
              onClick={() => onExport('pdf')} 
              className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              PDF
            </button>
            <button 
              onClick={() => onExport('image')} 
              className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Image
            </button>
            <button 
              onClick={() => onExport('csv')} 
              className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              CSV
            </button>
          </div>
          
          {/* Time scale slider */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 whitespace-nowrap">Timeline scale:</span>
            <div className="w-32">
              <Slider
                defaultValue={[timeScale]}
                min={15}
                max={120}
                step={15}
                onValueChange={(value) => onTimeScaleChange(value[0])}
              />
            </div>
            <span className="text-xs text-gray-500 whitespace-nowrap">{timeScale} min</span>
          </div>
        </div>
      </div>
      
      {/* Lane toggles */}
      <div className="flex flex-wrap gap-4 mb-4">
        {lanes.map(lane => (
          <div key={lane.id} className="flex items-center space-x-2">
            <Switch 
              id={`toggle-${lane.id}`} 
              checked={lane.visible} 
              onCheckedChange={() => onToggleLane(lane.id)} 
            />
            <Label htmlFor={`toggle-${lane.id}`} className="flex items-center gap-1">
              <lane.icon className="h-4 w-4" />
              <span>{lane.name}</span>
            </Label>
          </div>
        ))}
      </div>
    </>
  );
};

export default TimelineHeader;
