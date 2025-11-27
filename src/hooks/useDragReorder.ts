import { useState, useRef } from 'react';
import { useContentBlocks } from '@/contexts/ContentBlocksContext';
import { toast } from 'sonner';

export const useDragReorder = () => {
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const { updateContentBlockOrder, contentBlocks } = useContentBlocks();
  const lastSwapTime = useRef<number>(0);

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItemId(itemId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', itemId);
  };

  const handleDragOver = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (!draggedItemId) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseY = e.clientY;
    const elementMiddle = rect.top + rect.height / 2;
    const isTopHalf = mouseY < elementMiddle;
    const highlightIndex = isTopHalf ? targetIndex : targetIndex + 1;
    
    setDragOverIndex(highlightIndex);
    
    const now = Date.now();
    if (now - lastSwapTime.current > 150) {
      const items = contentBlocks.sort((a, b) => {
        const aSeq = typeof a.sequence === 'number' ? a.sequence : 0;
        const bSeq = typeof b.sequence === 'number' ? b.sequence : 0;
        return aSeq - bSeq;
      });
      
      const draggedIndex = items.findIndex(item => item.id === draggedItemId);
      
      if (draggedIndex !== -1 && draggedIndex !== highlightIndex) {
        const reorderedItems = [...items];
        const [movedItem] = reorderedItems.splice(draggedIndex, 1);
        reorderedItems.splice(highlightIndex > draggedIndex ? highlightIndex - 1 : highlightIndex, 0, movedItem);
        
        reorderedItems.forEach((item, index) => {
          updateContentBlockOrder(item.id, index);
        });
        
        lastSwapTime.current = now;
      }
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number, items: any[]) => {
    e.preventDefault();
    
    if (!draggedItemId) return;

    const draggedItem = items.find(item => item.id === draggedItemId);
    if (draggedItem) {
      toast.success(`✅ Moved "${draggedItem.title}"`, {
        duration: 2000,
      });
    }
    
    resetDrag();
  };

  const handleDragEnd = () => {
    // Always reset on drag end, even if drop wasn't called
    resetDrag();
  };

  const handleTimelineDrop = (e: React.DragEvent, dropPosition: number, totalDuration: number, items: any[]) => {
    e.preventDefault();
    
    if (!draggedItemId) return;
    
    const sortedBlocks = [...items].sort((a, b) => {
      const aSeq = typeof a.sequence === 'number' ? a.sequence : 0;
      const bSeq = typeof b.sequence === 'number' ? b.sequence : 0;
      return aSeq - bSeq;
    });
    
    let targetSequence = 0;
    for (let i = 0; i < sortedBlocks.length; i++) {
      if (dropPosition < sortedBlocks[i].position) {
        targetSequence = i;
        break;
      }
      targetSequence = i + 1;
    }
    
    const draggedItem = items.find(item => item.id === draggedItemId);
    if (draggedItem) {
      const currentIndex = items.findIndex(item => item.id === draggedItemId);
      const reorderedItems = [...items];
      const [movedItem] = reorderedItems.splice(currentIndex, 1);
      reorderedItems.splice(targetSequence, 0, movedItem);

      reorderedItems.forEach((item, index) => {
        updateContentBlockOrder(item.id, index);
      });

      toast.success(`🎬 Repositioned "${draggedItem.title}"`, {
        duration: 2000,
      });
    }

    resetDrag();
  };

  const resetDrag = () => {
    setDraggedItemId(null);
    setDragOverIndex(null);
    lastSwapTime.current = 0;
  };

  const isDropZoneActive = (index: number) => {
    return draggedItemId !== null && dragOverIndex === index;
  };

  return {
    draggedItemId,
    dragOverIndex,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
    handleTimelineDrop,
    resetDrag,
    isDropZoneActive
  };
};
