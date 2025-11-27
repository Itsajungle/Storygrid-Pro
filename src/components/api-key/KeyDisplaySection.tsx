
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';

interface KeyDisplaySectionProps {
  apiKey: string;
  showKey: boolean;
  onToggleShow: () => void;
  keyLabel: string;
}

const KeyDisplaySection: React.FC<KeyDisplaySectionProps> = ({
  apiKey,
  showKey,
  onToggleShow,
  keyLabel
}) => {
  const maskKey = (key: string) => {
    if (!key) return '';
    if (key.length <= 10) return key;
    return key.substring(0, 7) + '•'.repeat(key.length - 10) + key.substring(key.length - 3);
  };

  return (
    <div className="p-3 bg-green-50 border border-green-200 rounded-md">
      <p className="text-sm text-green-800 mb-2">
        ✓ {keyLabel} API key is configured and persisted
      </p>
      <div className="flex items-center gap-2">
        <code className="text-xs bg-white px-2 py-1 rounded border flex-1 overflow-x-auto whitespace-nowrap max-w-full">
          {showKey ? apiKey : maskKey(apiKey)}
        </code>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onToggleShow}
        >
          {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
};

export default KeyDisplaySection;
