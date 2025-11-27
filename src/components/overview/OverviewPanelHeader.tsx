
import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings, Edit2, X, Check } from 'lucide-react';

interface OverviewPanelHeaderProps {
  isEditing: boolean;
  hasChanges: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onClose: () => void;
}

const OverviewPanelHeader: React.FC<OverviewPanelHeaderProps> = ({
  isEditing,
  hasChanges,
  onEdit,
  onSave,
  onCancel,
  onClose
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <Settings className="w-6 h-6 text-jungle-600" />
        <h2 className="text-2xl font-bold text-gray-900">Project Overview</h2>
      </div>
      <div className="flex items-center gap-2">
        {isEditing ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={onSave}
              disabled={!hasChanges}
              className={hasChanges ? "bg-green-600 hover:bg-green-700" : ""}
            >
              <Check className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </Button>
        )}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClose}
          className="text-gray-700 hover:text-pink-600 hover:scale-105 transition-all duration-200"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default OverviewPanelHeader;
