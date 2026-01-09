import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Settings } from 'lucide-react';
import { useContentBlocks } from '@/contexts/ContentBlocksContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import ApiKeyDialog from '@/components/ApiKeyDialog';

import { useScriptAI } from '@/hooks/useScriptAI';
import { useScriptManagement } from '@/hooks/useScriptManagement';
import { getStatusColor, applyLocationTemplate, applyVisualSequence, formatEarsForTeleprompter } from '@/utils/scriptUtils';

import ScriptSidebar from './script/ScriptSidebar';
import ScriptPreview from './script/ScriptPreview';
import ScriptEditDialog from './script/ScriptEditDialog';
import ExportDialog from './script/ExportDialog';
import TeleprompterDialog from './script/TeleprompterDialog';

const ScriptStage: React.FC = () => {
  const { contentBlocks } = useContentBlocks();
  
  // Filter blocks marked for Story Arc
  const storyArcBlocks = contentBlocks.filter(block => block.inStoryArc);
  
  // Custom hooks for script management and AI functionality
  const scriptManagement = useScriptManagement(storyArcBlocks);
  const aiGeneration = useScriptAI();
  
  // Dialog and UI state
  const [showScriptDialog, setShowScriptDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv' | 'docx' | 'pages'>('pdf');
  const [exportView, setExportView] = useState<'teleprompter' | 'director'>('director');
  const [exportMode, setExportMode] = useState<'all' | 'selected' | 'individual'>('all');
  const [selectedScripts, setSelectedScripts] = useState<string[]>([]);
  const [tonePrompt, setTonePrompt] = useState("");
  const [customTone, setCustomTone] = useState("");
  const [showTeleprompter, setShowTeleprompter] = useState(false);
  const [teleprompterSpeed, setTeleprompterSpeed] = useState(50);
  const [showCueMarkers, setShowCueMarkers] = useState(true);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);

  const handleScriptSelect = (blockId: string) => {
    scriptManagement.handleScriptSelect(blockId);
    setShowScriptDialog(true);
  };

  const generateScriptWithAI = async (model?: 'chatgpt' | 'claude') => {
    if (!scriptManagement.currentScript || !scriptManagement.selectedBlockId) return;
    
    const selectedBlock = storyArcBlocks.find(block => block.id === scriptManagement.selectedBlockId);
    if (!selectedBlock) return;

    const finalTonePrompt = tonePrompt === 'custom' ? customTone : tonePrompt;
    
    const prompt = `Create a professional script for a ${selectedBlock.type} segment about "${selectedBlock.title}".

Description: ${selectedBlock.description}
Duration: ${selectedBlock.duration || 'Not specified'} minutes
${finalTonePrompt ? `Tone/Style: ${finalTonePrompt}` : ''}

Please structure the response as a script with:
- WHERE: The location/setting description
- EARS: The dialogue, narration, or audio content
- EYES: The visual direction, camera work, and on-screen elements

Make it engaging, professional, and appropriate for the content type.`;

    if (model) {
      await aiGeneration.generateScriptWithAI(prompt, model);
    } else {
      try {
        const parsedContent = await aiGeneration.generateScriptWithAI(prompt);
        if (parsedContent) {
          const updatedScript = {
            ...scriptManagement.currentScript,
            ...parsedContent
          };
          scriptManagement.setCurrentScript(updatedScript);
        }
      } catch (_error) {
        // Error handling is done in the hook
      }
    }
  };

  const handleExport = () => {
    const filename = `storypro_script_export.${exportFormat}`;
    
    console.log(`Exporting in ${exportFormat} format with ${exportView} view as ${filename}`);
    console.log(`Export mode: ${exportMode}`);
    
    if (exportMode === 'selected') {
      console.log(`Selected scripts: ${selectedScripts.join(', ')}`);
    }
    
    setTimeout(() => {
      setShowExportDialog(false);
    }, 1000);
  };

  const toggleScriptSelection = (scriptId: string) => {
    setSelectedScripts(prev => 
      prev.includes(scriptId) 
        ? prev.filter(id => id !== scriptId)
        : [...prev, scriptId]
    );
  };

  const handleApplyLocationTemplate = (locationId: string) => {
    applyLocationTemplate(locationId, scriptManagement.handleScriptChange);
  };

  const handleApplyVisualSequence = (sequenceId: string) => {
    applyVisualSequence(sequenceId, scriptManagement.handleScriptChange);
  };

  const handleUseDraft = (draftId: string) => {
    aiGeneration.useDraft(draftId, scriptManagement.handleScriptChange);
  };

  const handleRegenerateDraft = (model: 'chatgpt' | 'claude') => {
    generateScriptWithAI(model);
  };

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      <ScrollArea className="h-screen">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Script</h2>
                <p className="text-gray-600">Create detailed production scripts with the three-column format</p>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline"
                  onClick={() => setShowApiKeyDialog(true)}
                  className="flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  API Settings
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowExportDialog(true)}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export Scripts
                </Button>
              </div>
            </div>
            
            {storyArcBlocks.length === 0 ? (
              <Card className="p-6 text-center">
                <div className="py-8">
                  <h3 className="text-lg font-medium mb-2">No Story Arc Blocks Found</h3>
                  <p className="text-gray-500 mb-4">Please create content blocks in the Ideas Lab and add them to the Story Arc first.</p>
                  <Button
                    variant="default"
                    onClick={() => window.location.href = "/"}
                  >
                    Go to Ideas Lab
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <ScriptSidebar
                  storyArcBlocks={storyArcBlocks}
                  scriptBlocks={scriptManagement.scriptBlocks}
                  onScriptSelect={handleScriptSelect}
                  getStatusColor={getStatusColor}
                />

                <ScriptPreview
                  selectedBlockId={scriptManagement.selectedBlockId}
                  currentScript={scriptManagement.currentScript}
                  onTeleprompterShow={() => setShowTeleprompter(true)}
                  onScriptEdit={() => handleScriptSelect(scriptManagement.currentScript?.contentBlockId || '')}
                />
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      <ApiKeyDialog
        open={showApiKeyDialog}
        onOpenChange={setShowApiKeyDialog}
      />

      <ScriptEditDialog
        showScriptDialog={showScriptDialog}
        onShowScriptDialogChange={setShowScriptDialog}
        currentScript={scriptManagement.currentScript}
        selectedBlockId={scriptManagement.selectedBlockId}
        storyArcBlocks={storyArcBlocks}
        tonePrompt={tonePrompt}
        customTone={customTone}
        generatingScript={aiGeneration.generatingScript}
        aiDrafts={aiGeneration.aiDrafts}
        generatingDrafts={aiGeneration.generatingDrafts}
        onTonePromptChange={setTonePrompt}
        onCustomToneChange={setCustomTone}
        onScriptChange={scriptManagement.handleScriptChange}
        onGenerateScriptWithAI={generateScriptWithAI}
        onUseDraft={handleUseDraft}
        onRegenerateDraft={handleRegenerateDraft}
        onDismissDraft={aiGeneration.dismissDraft}
        onApplyLocationTemplate={handleApplyLocationTemplate}
        onApplyVisualSequence={handleApplyVisualSequence}
        onSaveScript={scriptManagement.saveScript}
        getStatusColor={getStatusColor}
      />
      
      <ExportDialog
        showExportDialog={showExportDialog}
        onShowExportDialogChange={setShowExportDialog}
        exportFormat={exportFormat}
        onExportFormatChange={setExportFormat}
        exportView={exportView}
        onExportViewChange={setExportView}
        exportMode={exportMode}
        onExportModeChange={setExportMode}
        selectedScripts={selectedScripts}
        onToggleScriptSelection={toggleScriptSelection}
        scriptBlocks={scriptManagement.scriptBlocks}
        contentBlocks={contentBlocks}
        onExport={handleExport}
      />
      
      <TeleprompterDialog
        showTeleprompter={showTeleprompter}
        onShowTeleprompterChange={setShowTeleprompter}
        currentScript={scriptManagement.currentScript}
        teleprompterSpeed={teleprompterSpeed}
        onTeleprompterSpeedChange={setTeleprompterSpeed}
        showCueMarkers={showCueMarkers}
        onShowCueMarkersChange={setShowCueMarkers}
        formatEarsForTeleprompter={(text) => formatEarsForTeleprompter(text, showCueMarkers)}
      />
    </div>
  );
};

export default ScriptStage;
