
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock, Check } from 'lucide-react';
import { ScriptBlock } from './types';

interface ScriptFooterProps {
  currentScript: ScriptBlock;
  onScriptChange: (field: keyof ScriptBlock, value: string | number) => void;
  onSaveScript: () => void;
  onShowScriptDialogChange: (show: boolean) => void;
}

const ScriptFooter: React.FC<ScriptFooterProps> = ({
  currentScript,
  onScriptChange,
  onSaveScript,
  onShowScriptDialogChange
}) => {
  return (
    <>
      {/* Runtime Estimate */}
      <div>
        <label className="block text-sm font-medium mb-2">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>Estimated Runtime</span>
          </div>
        </label>
        <div className="flex items-center gap-3">
          <Input
            type="number"
            min={0}
            max={60}
            value={currentScript.estimatedRuntime || 0}
            onChange={(e) => onScriptChange('estimatedRuntime', parseInt(e.target.value) || 0)}
            className="w-24"
          />
          <span className="text-sm text-gray-600">minutes</span>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={() => onShowScriptDialogChange(false)}>
          Cancel
        </Button>
        <Button onClick={onSaveScript} className="flex items-center gap-2">
          <Check className="w-4 h-4" />
          Save Script
        </Button>
      </div>
    </>
  );
};

export default ScriptFooter;
