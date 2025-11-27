
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { ScriptBlock } from './types';

interface TeleprompterDialogProps {
  showTeleprompter: boolean;
  onShowTeleprompterChange: (show: boolean) => void;
  currentScript: ScriptBlock | null;
  teleprompterSpeed: number;
  onTeleprompterSpeedChange: (speed: number) => void;
  showCueMarkers: boolean;
  onShowCueMarkersChange: (show: boolean) => void;
  formatEarsForTeleprompter: (text: string) => React.ReactNode;
}

const TeleprompterDialog: React.FC<TeleprompterDialogProps> = ({
  showTeleprompter,
  onShowTeleprompterChange,
  currentScript,
  teleprompterSpeed,
  onTeleprompterSpeedChange,
  showCueMarkers,
  onShowCueMarkersChange,
  formatEarsForTeleprompter
}) => {
  return (
    <Dialog open={showTeleprompter} onOpenChange={onShowTeleprompterChange}>
      <DialogContent className="sm:max-w-4xl h-[80vh] max-h-[80vh] flex flex-col bg-white text-gray-900">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Teleprompter Preview</DialogTitle>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="show-cues" 
                  checked={showCueMarkers}
                  onCheckedChange={() => onShowCueMarkersChange(!showCueMarkers)} 
                />
                <label htmlFor="show-cues" className="text-sm">Show Camera Cues</label>
              </div>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Scroll Speed</label>
            <Slider 
              value={[teleprompterSpeed]} 
              onValueChange={(value) => onTeleprompterSpeedChange(value[0])}
              min={1}
              max={100}
              step={1}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Slower</span>
              <span>Faster</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto bg-black rounded-lg p-8">
            {currentScript && (
              <div 
                className="text-white font-sans text-2xl leading-relaxed"
                style={{
                  animation: `scroll-teleprompter ${120 - teleprompterSpeed}s linear infinite`,
                  paddingBottom: '50vh'
                }}
              >
                {formatEarsForTeleprompter(currentScript.ears)}
              </div>
            )}
          </div>
        </div>
        
        <style>
          {`
          @keyframes scroll-teleprompter {
            0% { transform: translateY(100%); }
            100% { transform: translateY(-100%); }
          }
          `}
        </style>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onShowTeleprompterChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TeleprompterDialog;
