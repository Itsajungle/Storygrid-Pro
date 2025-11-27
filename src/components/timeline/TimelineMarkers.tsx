
import React from 'react';

interface TimelineMarkersProps {
  timeMarkers: number[];
}

const TimelineMarkers: React.FC<TimelineMarkersProps> = ({ timeMarkers }) => {
  return (
    <div className="bg-gray-50 border-b p-1 relative h-full">
      <div className="flex overflow-x-auto">
        {timeMarkers.map(marker => (
          <div 
            key={marker} 
            className="text-xs text-gray-500 flex-shrink-0 px-2"
            style={{ minWidth: '60px' }}
          >
            {marker} min
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimelineMarkers;
