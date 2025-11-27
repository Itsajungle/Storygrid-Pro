
import { useState } from 'react';
import { useContentBlocks, ContentBlock } from '@/contexts/ContentBlocksContext';

export const useIdeateBlockSelection = () => {
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>([]);
  const { contentBlocks, updateContentBlock } = useContentBlocks();

  // Get blocks not in story arc
  const unsyncedBlocks = contentBlocks.filter(block => !block.inStoryArc);
  
  // Handle individual block selection
  const handleBlockSelect = (blockId: string, checked: boolean) => {
    if (checked) {
      setSelectedBlocks(prev => [...prev, blockId]);
    } else {
      setSelectedBlocks(prev => prev.filter(id => id !== blockId));
    }
  };

  // Handle bulk send to story arc
  const handleBulkSendToStoryArc = () => {
    selectedBlocks.forEach(blockId => {
      updateContentBlock(blockId, { inStoryArc: true });
    });
    setSelectedBlocks([]);
  };

  // Handle select all toggle
  const handleSelectAll = () => {
    if (selectedBlocks.length === unsyncedBlocks.length) {
      setSelectedBlocks([]);
    } else {
      setSelectedBlocks(unsyncedBlocks.map(block => block.id));
    }
  };

  // Handle block click for preview/edit
  const handleBlockClick = (block: ContentBlock) => {
    console.log('Block clicked:', block.title);
    // TODO: Open block preview/edit dialog
  };

  return {
    selectedBlocks,
    unsyncedBlocks,
    handleBlockSelect,
    handleBulkSendToStoryArc,
    handleSelectAll,
    handleBlockClick
  };
};
