import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Toggle } from '@/components/ui/toggle';
import { Clock, BookOpen, Sparkles, Compass, Award, Mountain, Repeat } from 'lucide-react';
import { StructureType } from '@/types/story-arc';

interface EnhancedStructureSelectorProps {
  structure: StructureType;
  onStructureChange: (value: StructureType) => void;
  totalDuration: number;
  showAISuggestions: boolean;
  onToggleAI: (enabled: boolean) => void;
}

const EnhancedStructureSelector: React.FC<EnhancedStructureSelectorProps> = ({
  structure,
  onStructureChange,
  totalDuration,
  showAISuggestions,
  onToggleAI,
}) => {
  return (
    <div className="bg-white rounded-lg border shadow-sm p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Total: {totalDuration} min</span>
          </div>
          
          <Toggle
            pressed={showAISuggestions}
            onPressedChange={onToggleAI}
            className="text-xs"
            variant="outline"
          >
            <Sparkles className="w-3 h-3 mr-1" />
            AI Suggestions
          </Toggle>
        </div>
        
        <Select value={structure} onValueChange={(value) => onStructureChange(value as StructureType)}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase">Main Structures</div>
            <SelectItem value="3-act">
              <div className="flex items-center gap-2">
                <BookOpen className="w-3 h-3" />
                3-Act Structure
              </div>
            </SelectItem>
            <SelectItem value="aristotelian">
              <div className="flex items-center gap-2">
                <BookOpen className="w-3 h-3" />
                Aristotelian (7 stages)
              </div>
            </SelectItem>
            <SelectItem value="heros-journey">
              <div className="flex items-center gap-2">
                <Compass className="w-3 h-3" />
                Hero's Journey (12 stages)
              </div>
            </SelectItem>
            <SelectItem value="4-act">
              <div className="flex items-center gap-2">
                <BookOpen className="w-3 h-3" />
                4-Act Structure
              </div>
            </SelectItem>
            
            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase mt-2">Advanced Structures</div>
            <SelectItem value="save-the-cat">
              <div className="flex items-center gap-2">
                <Award className="w-3 h-3" />
                Save the Cat (15 beats)
              </div>
            </SelectItem>
            <SelectItem value="freytag">
              <div className="flex items-center gap-2">
                <Mountain className="w-3 h-3" />
                Freytag's Pyramid
              </div>
            </SelectItem>
            <SelectItem value="story-circle">
              <div className="flex items-center gap-2">
                <Repeat className="w-3 h-3" />
                Story Circle (8 steps)
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default EnhancedStructureSelector;
