import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { contentBlockTypes } from '@/components/stages/ideate/constants';
import { useContentBlocks } from '@/contexts/ContentBlocksContext';

interface AddToBoardProps {
  content: string;
  source: 'chatgpt' | 'claude' | 'gemini' | 'perplexity';
}

const AddToBoard: React.FC<AddToBoardProps> = ({ content, source }) => {
  const { addContentBlock } = useContentBlocks();
  const [open, setOpen] = useState(false);
  const [blockType, setBlockType] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(3);

  const handleOpen = () => {
    setOpen(true);
    // Pre-fill with AI content
    const truncatedContent = content.substring(0, 40) + (content.length > 40 ? '...' : '');
    setTitle(truncatedContent);
    setDescription(content);
  };

  const handleAdd = () => {
    addContentBlock({
      type: blockType,
      title,
      description,
      duration,
      aiSource: source,
      status: 'draft'
    });
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setBlockType('');
    setDuration(3);
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        className="text-xs py-1 px-2 h-7 bg-white hover:bg-gray-100 text-gray-900 border-gray-300"
        onClick={handleOpen}
      >
        <Plus className="w-3 h-3 mr-1" />
        Add to Board
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white text-gray-900">
          <DialogHeader>
            <DialogTitle>Add to Content Board</DialogTitle>
            <DialogDescription>
              Create a new content block from this AI suggestion.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Content Type</label>
              <Select 
                onValueChange={setBlockType} 
                value={blockType}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent className="z-[100] bg-white">
                  {contentBlockTypes.map((type) => (
                    <SelectItem 
                      key={type.type} 
                      value={type.type}
                      className="bg-white hover:bg-gray-100 cursor-pointer"
                    >
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                rows={5} 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Duration (minutes)</label>
              <Input 
                type="number" 
                value={duration} 
                onChange={(e) => setDuration(parseInt(e.target.value))}
                min={1}
                max={30}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={!blockType || !title}>
              Add to Board
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddToBoard;
