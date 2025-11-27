
import React from 'react';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import { useContentBlocks } from '@/contexts/ContentBlocksContext';

interface VerticalDragContainerProps {
  items: Array<{
    id: string;
    title: string;
    [key: string]: any;
  }>;
  children: (item: any, index: number, isDragging: boolean, isDropZoneActive: boolean) => React.ReactNode;
  onReorder?: (draggedId: string, targetIndex: number) => void;
  className?: string;
}

const VerticalDragContainer: React.FC<VerticalDragContainerProps> = ({
  items,
  children,
  onReorder,
  className = ''
}) => {
  const {
    draggedBlockId,
    handleDragStart,
    handleVerticalDragOver,
    handleDragLeave,
    handleVerticalDrop,
    isDropZoneActive
  } = useDragAndDrop();

  const { updateContentBlockOrder } = useContentBlocks();

  const handleItemDrop = (e: React.DragEvent, targetIndex: number) => {
    if (!draggedBlockId) return;
    
    const draggedItem = items.find(item => item.id === draggedBlockId);
    if (draggedItem) {
      console.log('VerticalDragContainer - Dropping item:', draggedBlockId, 'at index:', targetIndex);
      
      if (onReorder) {
        // Use custom reorder function if provided
        onReorder(draggedBlockId, targetIndex);
      } else {
        // Fall back to the context's updateContentBlockOrder
        updateContentBlockOrder(draggedBlockId, targetIndex);
      }
      
      // Also call the hook's drop handler for visual feedback
      handleVerticalDrop(e, targetIndex, draggedItem.title);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Drop zone at the top */}
      <div
        className={`h-2 transition-all duration-200 rounded-md ${
          isDropZoneActive(-1) 
            ? 'bg-blue-200 border-2 border-dashed border-blue-400 scale-y-150' 
            : draggedBlockId 
              ? 'bg-blue-50 border border-dashed border-blue-200' 
              : 'bg-transparent'
        }`}
        onDragOver={(e) => handleVerticalDragOver(e, 0)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleItemDrop(e, 0)}
      />

      {items.map((item, index) => {
        const isDragging = draggedBlockId === item.id;
        const isNextDropZoneActive = isDropZoneActive(index + 1);

        return (
          <div key={item.id}>
            {/* Draggable item */}
            <div
              draggable
              onDragStart={(e) => handleDragStart(e, item.id)}
              className={`transition-all duration-200 ${
                isDragging 
                  ? 'opacity-50 scale-95 rotate-2 shadow-lg' 
                  : 'opacity-100 scale-100 hover:scale-102'
              }`}
            >
              {children(item, index, isDragging, isNextDropZoneActive)}
            </div>

            {/* Drop zone after each item */}
            <div
              className={`h-2 transition-all duration-200 rounded-md ${
                isDropZoneActive(index + 1) 
                  ? 'bg-blue-200 border-2 border-dashed border-blue-400 scale-y-150' 
                  : draggedBlockId 
                    ? 'bg-blue-50 border border-dashed border-blue-200' 
                    : 'bg-transparent'
              }`}
              onDragOver={(e) => handleVerticalDragOver(e, index + 1)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleItemDrop(e, index + 1)}
            />
          </div>
        );
      })}
    </div>
  );
};

export default VerticalDragContainer;
