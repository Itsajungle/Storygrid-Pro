
import React from 'react';
import { Clock, Layers } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface EpisodeStatsProps {
  totalDuration: number;
}

const EpisodeStats: React.FC<EpisodeStatsProps> = ({ totalDuration }) => {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
        <Layers className="w-5 h-5" />
        Episode Overview
      </h3>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-700" />
          <span className="text-sm text-gray-700 font-medium">Total Episode Duration: {totalDuration} min</span>
        </div>
        
        {/* Legend */}
        <div className="flex items-center gap-3">
          <div className="text-xs text-gray-700 font-medium">Status:</div>
          <Badge className="bg-blue-600 text-white border-blue-600">Planned</Badge>
          <Badge className="bg-amber-600 text-white border-amber-600">Filmed</Badge>
          <Badge className="bg-purple-600 text-white border-purple-600">In Edit</Badge>
          <Badge className="bg-green-600 text-white border-green-600">Approved</Badge>
        </div>
      </div>
    </div>
  );
};

export default EpisodeStats;
