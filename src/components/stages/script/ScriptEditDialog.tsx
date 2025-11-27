import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ScriptBlock, AIDraft } from './types';
import { ContentBlock } from '@/contexts/ContentBlocksContext';
import { locationTemplates, visualSequences, shotTemplates } from './constants';
import ProductionTools from './ProductionTools';
import AIDraftPreviews from './AIDraftPreviews';
import ScriptHeader from './ScriptHeader';
import ScriptEditor from './ScriptEditor';
import ScriptFooter from './ScriptFooter';

interface ScriptEditDialogProps {
  showScriptDialog: boolean;
  onShowScriptDialogChange: (show: boolean) => void;
  currentScript: ScriptBlock | null;
  selectedBlockId: string | null;
  storyArcBlocks: ContentBlock[];
  tonePrompt: string;
  customTone: string;
  generatingScript: boolean;
  aiDrafts: AIDraft[];
  generatingDrafts: { chatgpt: boolean; claude: boolean };
  onTonePromptChange: (tone: string) => void;
  onCustomToneChange: (tone: string) => void;
  onScriptChange: (field: keyof ScriptBlock, value: string | number) => void;
  onGenerateScriptWithAI: (model?: 'chatgpt' | 'claude') => void;
  onUseDraft: (draftId: string) => void;
  onRegenerateDraft: (model: 'chatgpt' | 'claude') => void;
  onDismissDraft: (draftId: string) => void;
  onApplyLocationTemplate: (locationId: string) => void;
  onApplyVisualSequence: (sequenceId: string) => void;
  onSaveScript: () => void;
  getStatusColor: (status: string) => string;
}

const ScriptEditDialog: React.FC<ScriptEditDialogProps> = ({
  showScriptDialog,
  onShowScriptDialogChange,
  currentScript,
  selectedBlockId,
  storyArcBlocks,
  tonePrompt,
  customTone,
  generatingScript,
  aiDrafts,
  generatingDrafts,
  onTonePromptChange,
  onCustomToneChange,
  onScriptChange,
  onGenerateScriptWithAI,
  onUseDraft,
  onRegenerateDraft,
  onDismissDraft,
  onApplyLocationTemplate,
  onApplyVisualSequence,
  onSaveScript,
  getStatusColor
}) => {
  if (!currentScript) return null;

  const handleApplyShotTemplate = (template: any) => {
    onScriptChange(
      'eyes', 
      currentScript.eyes ? 
      `${currentScript.eyes}\n\n${template.name}: ${template.description}` : 
      `${template.name}: ${template.description}`
    );
  };

  return (
    <Dialog open={showScriptDialog} onOpenChange={onShowScriptDialogChange}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-hidden bg-white">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl font-bold text-gray-900">
            Script Editor: {storyArcBlocks.find(b => b.id === selectedBlockId)?.title}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[75vh] pr-4">
          <div className="grid grid-cols-1 gap-6 py-4">
            <ScriptHeader
              currentScript={currentScript}
              tonePrompt={tonePrompt}
              customTone={customTone}
              generatingScript={generatingScript}
              generatingDrafts={generatingDrafts}
              onTonePromptChange={onTonePromptChange}
              onCustomToneChange={onCustomToneChange}
              onScriptChange={onScriptChange}
              onGenerateScriptWithAI={onGenerateScriptWithAI}
              getStatusColor={getStatusColor}
            />
            
            <ScriptEditor
              currentScript={currentScript}
              onScriptChange={onScriptChange}
            />

            {/* AI Draft Previews - Full Page Width */}
            <div className="w-full max-w-none -mx-4 px-4">
              <AIDraftPreviews
                aiDrafts={aiDrafts}
                generatingDrafts={generatingDrafts}
                onUseDraft={onUseDraft}
                onRegenerateDraft={onRegenerateDraft}
                onDismissDraft={onDismissDraft}
              />
            </div>
            
            {/* Production Tools Section */}
            <ProductionTools
              locationTemplates={locationTemplates}
              visualSequences={visualSequences}
              shotTemplates={shotTemplates}
              currentScript={currentScript}
              onApplyLocationTemplate={onApplyLocationTemplate}
              onApplyVisualSequence={onApplyVisualSequence}
              onApplyShotTemplate={handleApplyShotTemplate}
            />
            
            <ScriptFooter
              currentScript={currentScript}
              onScriptChange={onScriptChange}
              onSaveScript={onSaveScript}
              onShowScriptDialogChange={onShowScriptDialogChange}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ScriptEditDialog;
