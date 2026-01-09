
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';

interface KeyInputSectionProps {
  keyId: string;
  keyLabel: string;
  keyPlaceholder: string;
  inputKey: string;
  onInputChange: (key: string) => void;
  showKey: boolean;
  onToggleShow: () => void;
  isEditing?: boolean;
}

const KeyInputSection: React.FC<KeyInputSectionProps> = ({
  keyId,
  keyLabel,
  keyPlaceholder,
  inputKey,
  onInputChange,
  showKey,
  onToggleShow,
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={keyId} className="text-gray-900 font-medium">
        {keyLabel}
      </Label>
      <div className="relative">
        <Input
          id={keyId}
          type={showKey ? "text" : "password"}
          value={inputKey}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={keyPlaceholder}
          className="pr-10 bg-white text-gray-900 placeholder:text-gray-400"
          style={{ backgroundColor: 'white !important', color: '#111827 !important' }}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3"
          onClick={onToggleShow}
        >
          {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
};

export default KeyInputSection;
