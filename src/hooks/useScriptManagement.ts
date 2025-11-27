
import { useState, useEffect } from 'react';
import { ScriptBlock } from '@/components/stages/script/types';
import { ContentBlock } from '@/contexts/ContentBlocksContext';

export const useScriptManagement = (storyArcBlocks: ContentBlock[]) => {
  const [scriptBlocks, setScriptBlocks] = useState<ScriptBlock[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [currentScript, setCurrentScript] = useState<ScriptBlock | null>(null);

  // Initialize script blocks from story arc blocks if none exist
  useEffect(() => {
    if (scriptBlocks.length === 0 && storyArcBlocks.length > 0) {
      const initialScripts = storyArcBlocks.map(block => ({
        id: `script-${block.id}`,
        contentBlockId: block.id,
        where: '',
        ears: '',
        eyes: '',
        estimatedRuntime: block.duration || 0,
        status: 'draft' as const
      }));
      setScriptBlocks(initialScripts);
    }
  }, [storyArcBlocks, scriptBlocks.length]);

  const handleScriptSelect = (blockId: string) => {
    const scriptBlock = scriptBlocks.find(sb => sb.contentBlockId === blockId);
    if (scriptBlock) {
      setCurrentScript(scriptBlock);
      setSelectedBlockId(blockId);
    } else {
      const newScriptBlock: ScriptBlock = {
        id: `script-${blockId}`,
        contentBlockId: blockId,
        where: '',
        ears: '',
        eyes: '',
        estimatedRuntime: storyArcBlocks.find(b => b.id === blockId)?.duration || 0,
        status: 'draft'
      };
      setScriptBlocks(prev => [...prev, newScriptBlock]);
      setCurrentScript(newScriptBlock);
      setSelectedBlockId(blockId);
    }
  };

  const handleScriptChange = (field: keyof ScriptBlock, value: string | number) => {
    if (currentScript) {
      setCurrentScript({ ...currentScript, [field]: value });
    }
  };

  const saveScript = () => {
    if (currentScript) {
      setScriptBlocks(prev => 
        prev.map(script => 
          script.id === currentScript.id ? currentScript : script
        )
      );
    }
  };

  return {
    scriptBlocks,
    selectedBlockId,
    currentScript,
    setSelectedBlockId,
    setCurrentScript,
    handleScriptSelect,
    handleScriptChange,
    saveScript
  };
};
