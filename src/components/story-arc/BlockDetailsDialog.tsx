
import React from 'react';
import { Clock, Check } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StoryBlock } from '@/types/story-arc';

interface BlockDetailsDialogProps {
  selectedBlock: StoryBlock | null;
  editedBlock: Partial<StoryBlock>;
  showPreviewDialog: boolean;
  contentBlockTypes: any[];
  onClose: () => void;
  onEditChange: (updates: Partial<StoryBlock>) => void;
  onSaveEdit: () => void;
  onGoToScriptStage: () => void;
}

const BlockDetailsDialog: React.FC<BlockDetailsDialogProps> = ({
  selectedBlock,
  editedBlock,
  showPreviewDialog,
  contentBlockTypes,
  onClose,
  onEditChange,
  onSaveEdit,
  onGoToScriptStage
}) => {
  if (!selectedBlock) return null;

  return (
    <Dialog open={showPreviewDialog} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white text-gray-900">
        <DialogHeader>
          <DialogTitle>Content Block Preview</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div>
            <label className="text-sm font-medium mb-1 block">Title</label>
            <Input 
              value={editedBlock.title || ''} 
              onChange={(e) => onEditChange({title: e.target.value})}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Type</label>
            <Select 
              value={editedBlock.type} 
              onValueChange={(value) => onEditChange({type: value as any})}
            >
              <SelectTrigger className="bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[100] bg-white">
                {contentBlockTypes.map(type => (
                  <SelectItem key={type.type} value={type.type} className="bg-white hover:bg-gray-100">
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Description</label>
            <Textarea 
              value={editedBlock.description || ''} 
              onChange={(e) => onEditChange({description: e.target.value})}
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Duration (minutes)</label>
              <Input 
                type="number"
                value={editedBlock.duration || 0} 
                onChange={(e) => onEditChange({duration: Number(e.target.value)})}
                min={1}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Status</label>
              <Select 
                value={editedBlock.status || 'draft'} 
                onValueChange={(value) => onEditChange({status: value as any})}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[100] bg-white">
                  <SelectItem value="draft" className="bg-white hover:bg-gray-100">Draft</SelectItem>
                  <SelectItem value="needs-review" className="bg-white hover:bg-gray-100">Needs Review</SelectItem>
                  <SelectItem value="approved" className="bg-white hover:bg-gray-100">Approved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Notes</label>
            <Textarea 
              value={editedBlock.notes || ''} 
              onChange={(e) => onEditChange({notes: e.target.value})}
              placeholder="Add notes about this block..."
              rows={2}
            />
          </div>
          
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>Position: {Math.round(selectedBlock.position)}% mark</span>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button 
            variant="secondary"
            onClick={onGoToScriptStage}
            className="flex items-center gap-1"
          >
            Open in Script Stage
          </Button>
          <Button onClick={onSaveEdit} className="flex items-center gap-2">
            <Check className="w-4 h-4" /> Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BlockDetailsDialog;
