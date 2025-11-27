
import { useState } from 'react';
import { useContentBlocks } from '@/contexts/ContentBlocksContext';
import { toast } from 'sonner';

export const useDragAndDrop = () => {
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null);
  const { updateContentBlockOrder, contentBlocks } = useContentBlocks();

  const handleDragStart = (e: React.DragEvent | null, blockId: string) => {
    setDraggedBlockId(blockId);
    if (e) {
      e.dataTransfer.setData('text/plain', blockId);
      e.dataTransfer.effectAllowed = 'move';
    }
    console.log('Drag started:', blockId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Enhanced drag over for vertical reordering with visual feedback
  const handleVerticalDragOver = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOverIndex(targetIndex);
  };

  const handleDragLeave = () => {
    setDraggedOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetSequence: number, sourceTitle?: string) => {
    e.preventDefault();
    
    if (!draggedBlockId) return;
    
    console.log('Dropping block:', draggedBlockId, 'at sequence:', targetSequence);
    
    // Update the order in the context
    updateContentBlockOrder(draggedBlockId, targetSequence);
    
    // Show visual confirmation
    toast.success(`Moved "${sourceTitle || 'block'}" to position ${targetSequence + 1}`, {
      duration: 2000,
    });
    
    resetDrag();
  };

  // New function for vertical list reordering
  const handleVerticalDrop = (e: React.DragEvent, targetIndex: number, sourceTitle?: string) => {
    e.preventDefault();
    
    if (!draggedBlockId) return;
    
    console.log('Vertical drop - Moving block:', draggedBlockId, 'to index:', targetIndex);
    
    // Find the dragged block's current position
    const draggedBlock = contentBlocks.find(b => b.id === draggedBlockId);
    if (!draggedBlock) return;
    
    const currentIndex = typeof draggedBlock.sequence === 'number' ? draggedBlock.sequence : 0;
    
    // Only update if the position actually changed
    if (currentIndex !== targetIndex) {
      updateContentBlockOrder(draggedBlockId, targetIndex);
      
      toast.success(`Moved "${sourceTitle || draggedBlock.title}" to position ${targetIndex + 1}`, {
        duration: 2000,
      });
    }
    
    resetDrag();
  };

  // Calculate new position after drop
  const calculateDropPosition = (draggedId: string, targetIndex: number) => {
    const currentBlocks = contentBlocks.filter(b => b.inStoryArc);
    const draggedBlock = currentBlocks.find(b => b.id === draggedId);
    
    if (!draggedBlock) return targetIndex;
    
    const currentIndex = currentBlocks.findIndex(b => b.id === draggedId);
    
    // If dropping in the same position, no change needed
    if (currentIndex === targetIndex) return currentIndex;
    
    return targetIndex;
  };

  const resetDrag = () => {
    setDraggedBlockId(null);
    setDraggedOverIndex(null);
  };

  // Helper function to determine if a drop zone should be highlighted
  const isDropZoneActive = (index: number) => {
    return draggedBlockId !== null && draggedOverIndex === index;
  };

  return {
    draggedBlockId,
    draggedOverIndex,
    handleDragStart,
    handleDragOver,
    handleVerticalDragOver,
    handleDragLeave,
    handleDrop,
    handleVerticalDrop,
    calculateDropPosition,
    resetDrag,
    isDropZoneActive
  };
};
