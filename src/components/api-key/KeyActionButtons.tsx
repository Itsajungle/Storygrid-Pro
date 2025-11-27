
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Check, X, Trash2, Zap, Loader2 } from 'lucide-react';

interface KeyActionButtonsProps {
  editing: boolean;
  isKeySet: boolean;
  inputKey: string;
  onSave: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onClear: () => void;
  saveButtonText: string;
  onTestConnection?: () => void;
  testing?: boolean;
}

const KeyActionButtons: React.FC<KeyActionButtonsProps> = ({
  editing,
  isKeySet,
  inputKey,
  onSave,
  onStartEdit,
  onCancelEdit,
  onClear,
  saveButtonText,
  onTestConnection,
  testing = false
}) => {
  return (
    <div className="flex gap-2">
      {!editing && !isKeySet && (
        <Button 
          onClick={onSave} 
          disabled={!inputKey}
          className="flex-1"
        >
          {saveButtonText}
        </Button>
      )}
      
      {!editing && isKeySet && (
        <>
          {onTestConnection && (
            <Button 
              onClick={onTestConnection}
              variant="outline"
              size="sm"
              disabled={testing}
              className="flex items-center gap-1"
            >
              {testing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              Test
            </Button>
          )}
          <Button 
            onClick={onStartEdit}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <Edit className="w-4 h-4" />
            Edit Key
          </Button>
        </>
      )}
      
      {editing && (
        <>
          <Button 
            onClick={onSave} 
            disabled={!inputKey}
            className="flex items-center gap-1"
          >
            <Check className="w-4 h-4" />
            Save
          </Button>
          <Button 
            onClick={onCancelEdit}
            variant="outline"
            className="flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Cancel
          </Button>
        </>
      )}
      
      {isKeySet && (
        <Button 
          onClick={onClear}
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
        >
          <Trash2 className="w-4 h-4" />
          Clear
        </Button>
      )}
    </div>
  );
};

export default KeyActionButtons;
