
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Plus, X } from 'lucide-react';

interface PresenterSectionProps {
  presenters: string[];
  newPresenter: string;
  isEditing: boolean;
  onAddPresenter: () => void;
  onRemovePresenter: (index: number) => void;
  onNewPresenterChange: (value: string) => void;
}

const PresenterSection: React.FC<PresenterSectionProps> = ({
  presenters,
  newPresenter,
  isEditing,
  onAddPresenter,
  onRemovePresenter,
  onNewPresenterChange
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onAddPresenter();
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-5 h-5 text-gray-600" />
        <label className="block text-sm font-medium text-gray-700">Presenters</label>
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        {presenters.map((presenter, index) => (
          <Badge key={index} variant="secondary" className="bg-jungle-100 text-jungle-800">
            {presenter}
            {isEditing && (
              <button
                onClick={() => onRemovePresenter(index)}
                className="ml-2 text-jungle-600 hover:text-red-600"
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
            placeholder="Add presenter"
            value={newPresenter}
            onChange={(e) => onNewPresenterChange(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <Button onClick={onAddPresenter} size="sm">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default PresenterSection;
