
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock } from 'lucide-react';

interface StoryStructureSelectorProps {
  structure: '3-act' | '5-act' | '7-act';
  onStructureChange: (value: '3-act' | '5-act' | '7-act') => void;
  totalDuration: number;
}

const StoryStructureSelector: React.FC<StoryStructureSelectorProps> = ({
  structure,
  onStructureChange,
  totalDuration,
}) => {
  return (
    <div className="flex items-center justify-between mb-2">
      <h2 className="text-2xl font-bold text-gray-900">Story Arc</h2>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">Total: {totalDuration} min</span>
        </div>
        <Select value={structure} onValueChange={(value) => onStructureChange(value as any)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3-act">3-Act Structure</SelectItem>
            <SelectItem value="5-act">5-Act Structure</SelectItem>
            <SelectItem value="7-act">7-Act Structure</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default StoryStructureSelector;
