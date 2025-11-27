import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, ArrowRight, Circle, Trash2 } from 'lucide-react';
import { useContentBlocks, ContentBlock } from '@/contexts/ContentBlocksContext';
import DragReorderContainer from '@/components/common/DragReorderContainer';
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

interface ContentBlocksPanelProps {
  contentBlockTypes: Array<{
    type: string;
    label: string;
    icon: any;
    color: string;
  }>;
  selectedBlocks: string[];
  onBlockSelect: (blockId: string, selected: boolean) => void;
  onBulkSendToStoryArc: () => void;
  onSelectAll: () => void;
  onBlockClick: (block: ContentBlock) => void;
}

const ContentBlocksPanel: React.FC<ContentBlocksPanelProps> = ({
  contentBlockTypes,
  selectedBlocks,
  onBlockSelect,
  onBulkSendToStoryArc,
  onSelectAll,
  onBlockClick
}) => {
  const { contentBlocks, addContentBlock, updateContentBlock, removeContentBlock } = useContentBlocks();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [blockToDelete, setBlockToDelete] = React.useState<ContentBlock | null>(null);
  
  const unsyncedBlocks = contentBlocks.filter(block => !block.inStoryArc);

  const getBlockColor = (type: string) => {
    const blockType = contentBlockTypes.find(t => t.type === type);
    return blockType?.color || 'bg-gray-100 text-gray-800';
  };

  const getBlockBgColor = (type: string) => {
    switch (type) {
      case 'interview': return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
      case 'piece-to-camera': return 'bg-purple-50 border-purple-200 hover:bg-purple-100';
      case 'b-roll': return 'bg-cyan-50 border-cyan-200 hover:bg-cyan-100';
      case 'demo': return 'bg-amber-50 border-amber-200 hover:bg-amber-100';
      case 'location': return 'bg-rose-50 border-rose-200 hover:bg-rose-100';
      case 'narration': return 'bg-lime-50 border-lime-200 hover:bg-lime-100';
      default: return 'bg-gray-50 border-gray-200 hover:bg-gray-100';
    }
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

  const handleDeleteClick = (e: React.MouseEvent, block: ContentBlock) => {
    e.stopPropagation();
    setBlockToDelete(block);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (blockToDelete) {
      await removeContentBlock(blockToDelete.id);
      setDeleteDialogOpen(false);
      setBlockToDelete(null);
    }
  };

  return (
    <>
      <Card className="flex flex-col">
        <div className="p-4 border-b bg-gradient-to-r from-jungle-500 to-jungle-600 text-white rounded-t-xl">
          <h3 className="font-semibold">Content Blocks</h3>
          <p className="text-sm text-jungle-100">Drag and organize your episode segments</p>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto">
          {unsyncedBlocks.length > 0 && (
            <Alert className="mb-4 border-amber-200 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                You have {unsyncedBlocks.length} blocks not synced to Story Arc. 
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-amber-700 underline ml-1"
                  onClick={async () => {
                    const unsyncedBlocks = contentBlocks.filter(b => !b.inStoryArc);
                    await Promise.all(
                      unsyncedBlocks.map(block => 
                        updateContentBlock(block.id, { inStoryArc: true })
                      )
                    );
                  }}
                >
                  Send all to Story Arc
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {unsyncedBlocks.length > 0 && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    checked={selectedBlocks.length === unsyncedBlocks.length}
                    onCheckedChange={onSelectAll}
                  />
                  <span className="text-sm font-medium text-gray-900">
                    Select All ({selectedBlocks.length}/{unsyncedBlocks.length})
                  </span>
                </div>
                {selectedBlocks.length > 0 && (
                  <Button 
                    size="sm" 
                    onClick={onBulkSendToStoryArc}
                    className="flex items-center gap-1"
                  >
                    <ArrowRight className="w-3 h-3" />
                    Send to Story Arc ({selectedBlocks.length})
                  </Button>
                )}
              </div>
            </div>
          )}

          {contentBlocks.length === 0 ? (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-8 text-center border-2 border-dashed border-blue-200">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Circle className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Content Blocks Yet</h3>
                <p className="text-gray-600 mb-4">
                  Start by chatting with an AI assistant above, then click "Add to Board" on any response to create your first content block.
                </p>
                <div className="text-sm text-gray-500">
                  <p>💡 Tip: Try asking "What are 5 video ideas about [your topic]?"</p>
                </div>
              </div>
            </div>
          ) : (
            <DragReorderContainer
              items={contentBlocks}
              className="space-y-3 mb-4"
            >
              {(block: ContentBlock, index: number, isDragging: boolean) => {
                const blockType = contentBlockTypes.find(t => t.type === block.type);
                const Icon = blockType?.icon || Circle;
                
                return (
                  <div 
                    className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all cursor-pointer ${
                      getBlockBgColor(block.type)
                    } ${
                      isDragging 
                        ? 'ring-2 ring-blue-300 shadow-lg scale-105' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => !isDragging && onBlockClick(block)}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex items-center gap-2">
                        {!block.inStoryArc && (
                          <Checkbox 
                            checked={selectedBlocks.includes(block.id)}
                            onCheckedChange={(checked) => onBlockSelect(block.id, !!checked)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        )}
                        <span className="w-6 h-6 bg-jungle-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </span>
                        {isDragging && (
                          <div className="w-1 h-6 bg-blue-400 rounded-full animate-pulse" />
                        )}
                      </div>
                      <Icon className="w-4 h-4 text-gray-600" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{block.title}</h4>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {block.aiSource && (
                            <Badge variant="outline" className={getAIBadgeColor(block.aiSource)}>
                              {getAIName(block.aiSource)}
                            </Badge>
                          )}
                          <Badge variant="outline" className={getBlockColor(block.type)}>
                            {blockType?.label || block.type}
                          </Badge>
                          {block.status && (
                            <Badge variant="outline" className={getStatusColor(block.status)}>
                              {block.status}
                            </Badge>
                          )}
                          <span className="text-sm text-gray-500">{block.duration || 3} minutes</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {!block.inStoryArc && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateContentBlock(block.id, { inStoryArc: true });
                          }}
                          className="flex items-center gap-1"
                        >
                          <ArrowRight className="w-3 h-3" />
                          To Story Arc
                        </Button>
                      )}
                      {block.inStoryArc && (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          In Story Arc
                        </Badge>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => handleDeleteClick(e, block)}
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
        </div>
        
        <div className="p-4 border-t">
          <div className="grid grid-cols-2 gap-2">
            {contentBlockTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Button
                  key={type.type}
                  variant="outline"
                  size="sm"
                  onClick={() => addContentBlock({
                    type: type.type,
                    title: `New ${type.label}`,
                    description: 'Add description...',
                    duration: 3,
                    status: 'draft',
                    inStoryArc: false
                  })}
                  className="justify-start"
                >
                  <Icon className="w-3 h-3 mr-1" />
                  {type.label}
                </Button>
              );
            })}
          </div>
        </div>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Content Block?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{blockToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ContentBlocksPanel;
