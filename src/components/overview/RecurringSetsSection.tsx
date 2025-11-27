
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Plus, X } from 'lucide-react';

interface RecurringSetsSectionProps {
  recurringSets: string[];
  newSet: string;
  isEditing: boolean;
  onAddSet: () => void;
  onRemoveSet: (index: number) => void;
  onNewSetChange: (value: string) => void;
}

const RecurringSetsSection: React.FC<RecurringSetsSectionProps> = ({
  recurringSets,
  newSet,
  isEditing,
  onAddSet,
  onRemoveSet,
  onNewSetChange
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onAddSet();
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-5 h-5 text-gray-600" />
        <label className="block text-sm font-medium text-gray-700">Recurring Sets</label>
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        {recurringSets.map((set, index) => (
          <Badge key={index} variant="outline" className="border-amber-300 text-amber-700">
            {set}
            {isEditing && (
              <button
                onClick={() => onRemoveSet(index)}
                className="ml-2 text-amber-600 hover:text-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </Badge>
        ))}
      </div>
      {isEditing && (
        <div className="flex gap-2">
          <Input
            placeholder="Add recurring set"
            value={newSet}
            onChange={(e) => onNewSetChange(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <Button onClick={onAddSet} size="sm">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default RecurringSetsSection;
