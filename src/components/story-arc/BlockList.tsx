import React from 'react';
import { Video, Circle, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StoryBlock } from '@/types/story-arc';
import DragReorderContainer from '@/components/common/DragReorderContainer';
import { useContentBlocks } from '@/contexts/ContentBlocksContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface BlockListProps {
  storyBlocks: StoryBlock[];
  contentBlockTypes: any[];
  onBlockClick: (block: StoryBlock) => void;
}

const BlockList: React.FC<BlockListProps> = ({
  storyBlocks,
  contentBlockTypes,
  onBlockClick,
}) => {
  const { updateContentBlock } = useContentBlocks();
  const [removeDialogOpen, setRemoveDialogOpen] = React.useState(false);
  const [blockToRemove, setBlockToRemove] = React.useState<StoryBlock | null>(null);

  const getBlockColor = (type: string) => {
    const blockType = contentBlockTypes.find(t => t.type === type);
    return blockType?.color || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'needs-review': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAIBadgeColor = (aiSource?: string) => {
    switch (aiSource) {
      case 'chatgpt': return 'bg-green-50 text-green-700 border-green-200';
      case 'claude': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'gemini': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'perplexity': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getAIName = (aiSource?: string) => {
    switch (aiSource) {
      case 'chatgpt': return 'ChatGPT';
      case 'claude': return 'Claude';
      case 'gemini': return 'Gemini';
      case 'perplexity': return 'Perplexity';
      default: return 'AI';
    }
  };

  const handleRemoveClick = (e: React.MouseEvent, block: StoryBlock) => {
    e.stopPropagation();
    setBlockToRemove(block);
    setRemoveDialogOpen(true);
  };

  const handleConfirmRemove = async () => {
    if (blockToRemove) {
      await updateContentBlock(blockToRemove.id, { inStoryArc: false });
      setRemoveDialogOpen(false);
      setBlockToRemove(null);
    }
  };

  return (
    <>
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
          <Video className="w-5 h-5" />
          Content Blocks
        </h3>
        
        {storyBlocks.length === 0 ? (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-8 text-center border-2 border-dashed border-amber-200">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Blocks in Story Arc</h3>
              <p className="text-gray-600 mb-4">
                Add content blocks from the Ideas Lab to start building your episode timeline.
              </p>
              <div className="text-sm text-gray-500 mb-4">
                <p>🎬 Tip: Select blocks in Ideas Lab and click "Send to Story Arc"</p>
              </div>
              <Button 
                variant="outline"
                className="mt-2"
                onClick={() => window.location.href="/"}
              >
                Go to Ideas Lab
              </Button>
            </div>
          </div>
        ) : (
          <DragReorderContainer
            items={storyBlocks}
            className="space-y-3"
          >
            {(block: StoryBlock, index: number, isDragging: boolean) => {
              const blockType = contentBlockTypes.find(t => t.type === block.type);
              const Icon = blockType?.icon || Circle;
              
              return (
                <div 
                  className={`flex items-center justify-between p-4 rounded-lg transition-all cursor-pointer border-2 ${
                    block.type === "interview" ? "bg-blue-50 border-blue-200 hover:bg-blue-100" :
                    block.type === "piece-to-camera" ? "bg-purple-50 border-purple-200 hover:bg-purple-100" :
                    block.type === "b-roll" ? "bg-cyan-50 border-cyan-200 hover:bg-cyan-100" :
                    block.type === "demo" ? "bg-amber-50 border-amber-200 hover:bg-amber-100" :
                    block.type === "location" ? "bg-rose-50 border-rose-200 hover:bg-rose-100" :
                    block.type === "narration" ? "bg-lime-50 border-lime-200 hover:bg-lime-100" :
                    "bg-gray-50 border-gray-200 hover:bg-gray-100"
                  } ${
                    isDragging 
                      ? 'ring-2 ring-blue-300 bg-white shadow-lg' 
                      : ''
                  }`}
                  onClick={() => !isDragging && onBlockClick(block)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-jungle-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      {isDragging && (
                        <div className="w-1 h-6 bg-blue-400 rounded-full animate-pulse" />
                      )}
                    </div>
                    <Icon className="w-5 h-5 text-gray-600" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-base mb-2 truncate">
                        {block.title}
                      </h4>
                      <div className="flex items-center gap-2 flex-wrap">
                        {block.aiSource && (
                          <Badge variant="outline" className={getAIBadgeColor(block.aiSource)}>
                            {getAIName(block.aiSource)}
                          </Badge>
                        )}
                        <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-300 font-medium">
                          {blockType?.label || block.type}
                        </Badge>
                        {block.status && (
                          <Badge variant="outline" className={`${getStatusColor(block.status)} font-medium`}>
                            {block.status}
                          </Badge>
                        )}
                        <span className="text-sm text-gray-600 font-medium bg-gray-100 px-2 py-1 rounded">
                          {block.duration} minutes
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-2 rounded-lg">
                      {Math.round(block.position)}% mark
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => handleRemoveClick(e, block)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            }}
          </DragReorderContainer>
        )}
      </Card>

      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from Story Arc?</AlertDialogTitle>
            <AlertDialogDescription>
              Remove "{blockToRemove?.title}" from the Story Arc? The block will return to Ideas Lab and won't be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRemove}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Remove from Story Arc
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BlockList;
