import React from 'react';
import { useDragReorder } from '@/hooks/useDragReorder';
import { GripVertical } from 'lucide-react';

interface DragReorderContainerProps {
  items: Array<{
    id: string;
    title: string;
    sequence?: number;
    [key: string]: any;
  }>;
  children: (item: any, index: number, isDragging: boolean) => React.ReactNode;
  className?: string;
}

const DragReorderContainer: React.FC<DragReorderContainerProps> = ({
  items,
  children,
  className = ''
}) => {
  const {
    draggedItemId,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd
  } = useDragReorder();

  const sortedItems = [...items].sort((a, b) => {
    const aSeq = typeof a.sequence === 'number' ? a.sequence : 0;
    const bSeq = typeof b.sequence === 'number' ? b.sequence : 0;
    return aSeq - bSeq;
  });

  const handleItemDrop = (e: React.DragEvent, targetIndex: number) => {
    handleDrop(e, targetIndex, sortedItems);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {sortedItems.map((item, index) => {
        const isDragging = draggedItemId === item.id;

        return (
          <div 
            key={item.id}
            draggable
            onDragStart={(e) => handleDragStart(e, item.id)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleItemDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`transition-all duration-150 ease-out cursor-move ${
              isDragging 
                ? 'opacity-50 scale-[0.98] shadow-2xl z-50' 
                : 'opacity-100 scale-100 hover:shadow-lg hover:scale-[1.01]'
            }`}
            style={{
              transformOrigin: 'center',
              willChange: 'transform, opacity, box-shadow'
            }}
          >
            <div className="flex items-center gap-2 bg-white rounded-lg">
              <div className={`flex-shrink-0 p-2 transition-colors ${
                isDragging ? 'text-blue-500' : 'text-gray-400 hover:text-gray-600'
              }`}>
                <GripVertical className="w-5 h-5" />
              </div>
              <div className="flex-1 pr-2">
                {children(item, index, isDragging)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DragReorderContainer;
