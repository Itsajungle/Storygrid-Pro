
import React from 'react';
import { Textarea } from '@/components/ui/textarea';

interface SuggestedFixInputProps {
  suggestion?: string;
  onChange?: (value: string) => void;
}

const SuggestedFixInput: React.FC<SuggestedFixInputProps> = ({
  suggestion,
  onChange
}) => {
  return (
    <div className="bg-white p-3 rounded border border-gray-200">
      <Textarea 
        className="text-sm text-gray-900 bg-white border-gray-300 resize-none min-h-[60px] text-gray-900" 
        defaultValue={suggestion}
        placeholder="Enter your suggested fix..."
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  );
};

export default SuggestedFixInput;
