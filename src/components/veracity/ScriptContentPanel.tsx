
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText } from 'lucide-react';
import ScriptViewer from './ScriptViewer';
import { FactCheckResult } from '@/types/veracity';

interface ScriptContentPanelProps {
  currentContent: string;
  factCheckResults: FactCheckResult[];
  currentBlockIndex: number;
  totalBlocks: number;
  onPrevBlock: () => void;
  onNextBlock: () => void;
}

const ScriptContentPanel: React.FC<ScriptContentPanelProps> = ({
  currentContent,
  factCheckResults,
  currentBlockIndex,
  totalBlocks,
  onPrevBlock,
  onNextBlock
}) => {
  return (
    <Card className="p-4 bg-white shadow-sm border border-gray-300 h-[calc(100vh-12rem)]">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-5 w-5 text-gray-700" />
        <h2 className="font-semibold text-lg text-gray-900">Script Content</h2>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onPrevBlock}
          disabled={currentBlockIndex === 0}
          className="text-gray-800 border-gray-300 hover:bg-gray-50"
        >
          Previous
        </Button>
        
        <span className="text-sm text-gray-700">
          Block {currentBlockIndex + 1} of {totalBlocks}
        </span>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onNextBlock}
          disabled={currentBlockIndex === totalBlocks - 1}
          className="text-gray-800 border-gray-300 hover:bg-gray-50"
        >
          Next
        </Button>
      </div>

      <ScrollArea className="h-[calc(100%-5rem)]">
        {currentContent ? (
          <ScriptViewer 
            content={currentContent} 
            flags={factCheckResults}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-600">No script content available.</p>
          </div>
        )}
      </ScrollArea>
    </Card>
  );
};

export default ScriptContentPanel;
