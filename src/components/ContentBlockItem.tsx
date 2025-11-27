
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { contentBlockTypes } from '@/components/stages/ideate/constants';
import { ContentBlock, useContentBlocks } from '@/contexts/ContentBlocksContext';
import { MessageCircle, Pencil, X, Check, Pin, Radio, Circle, Send, RefreshCcw, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface ContentBlockItemProps {
  block: ContentBlock;
  onRemove: () => void;
  showSelection?: boolean;
}

const ContentBlockItem: React.FC<ContentBlockItemProps> = ({ block, onRemove, showSelection = false }) => {
  const { updateContentBlock } = useContentBlocks();
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(block.notes || '');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showStoryArcDialog, setShowStoryArcDialog] = useState(false);
  
  const blockType = contentBlockTypes.find(t => t.type === block.type);
  const Icon = blockType?.icon || Circle;
  
  const handleNotesChange = (newNotes: string) => {
    setNotes(newNotes);
    updateContentBlock(block.id, { notes: newNotes });
  };

  const handleStatusChange = (status: 'draft' | 'needs-review' | 'approved') => {
    updateContentBlock(block.id, { status });
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-200 text-gray-800';
      case 'needs-review': return 'bg-amber-100 text-amber-800';
      case 'approved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  const getShapeClass = (type: string) => {
    const blockType = contentBlockTypes.find(t => t.type === type);
    return blockType?.shape || '';
  };

  const getSourceBadge = (source?: 'chatgpt' | 'claude') => {
    if (!source) return null;
    
    return (
      <Badge 
        className={`absolute top-2 right-2 text-xs ${
          source === 'chatgpt' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-orange-100 text-orange-800 border border-orange-200'
        }`}
      >
        {source === 'chatgpt' ? 'ChatGPT' : 'Claude'}
      </Badge>
    );
  };

  const handleSendToStoryArc = () => {
    updateContentBlock(block.id, { inStoryArc: true });
    setShowStoryArcDialog(true);
    setTimeout(() => setShowStoryArcDialog(false), 1500);
  };

  const handleAiRefine = () => {
    setIsLoading(true);
    // Simulate AI response for demo purposes
    setTimeout(() => {
      // Create a refined version based on the prompt and original content
      let refinedContent = '';
      
      if (aiPrompt.toLowerCase().includes('shorter') || aiPrompt.toLowerCase().includes('shorten')) {
        refinedContent = `${block.title} (Shortened)\n${block.description.split(' ').slice(0, 5).join(' ')}...`;
      } else if (aiPrompt.toLowerCase().includes('playful')) {
        refinedContent = `${block.title} 🎭\n${block.description} (with a playful twist!) 😊`;
      } else if (aiPrompt.toLowerCase().includes('formal')) {
        refinedContent = `${block.title}\nProfessional perspective: ${block.description}`;
      } else {
        refinedContent = `${block.title} (Refined)\n${block.description} [Modified with ${aiPrompt}]`;
      }
      
      setAiResponse(refinedContent);
      setIsLoading(false);
    }, 1500);
  };

  const applyRefinement = () => {
    const [title, ...description] = aiResponse.split('\n');
    updateContentBlock(block.id, { 
      title: title, 
      description: description.join('\n') 
    });
    setIsRefining(false);
    setAiResponse('');
    setAiPrompt('');
  };

  return (
    <div className={`content-block group relative ${getShapeClass(block.type)} ${showSelection ? 'ml-8' : ''}`}>
      {/* AI Source Badge */}
      {getSourceBadge(block.aiSource)}
      
      {/* Story Arc Status */}
      {block.inStoryArc && (
        <Badge className="absolute top-2 right-8 bg-green-100 text-green-800 border border-green-200 text-xs">
          In Story Arc
        </Badge>
      )}
      
      {/* Content Block Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-gray-600" />
          <Badge className={blockType?.color}>{blockType?.label}</Badge>
          <Badge className={getStatusColor(block.status)}>{block.status || 'Draft'}</Badge>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsRefining(true)}
            className="text-purple-500 hover:text-purple-700"
            title="Refine with AI"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
          </button>
          {!block.inStoryArc && (
            <button
              onClick={handleSendToStoryArc}
              className="text-blue-500 hover:text-blue-700"
              title="Send to Story Arc"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-gray-500 hover:text-gray-700"
            title="Edit"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRemove}
            className="text-red-500 hover:text-red-700"
            title="Remove"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Content Block Body */}
      <h4 className="font-medium text-gray-900 mb-1">{block.title}</h4>
      <p className="text-sm text-gray-600 mb-2">{block.description}</p>
      
      {/* Send to Story Arc Button - More Prominent */}
      {!block.inStoryArc && (
        <div className="mb-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleSendToStoryArc}
            className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            <ArrowRight className="w-3 h-3 mr-1" />
            Send to Story Arc
          </Button>
        </div>
      )}
      
      {/* Notes Section */}
      {block.notes && (
        <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600 border border-gray-100">
          <p className="italic">{block.notes.includes('@Susan') ? 
            <>
              {block.notes.split('@Susan').shift()}
              <span className="font-medium text-blue-600">@Susan</span>
              {block.notes.split('@Susan').pop()}
            </> : 
            block.notes
          }</p>
        </div>
      )}
      
      {/* Block Footer */}
      <div className="flex items-center justify-between mt-2">
        {block.duration && (
          <span className="text-xs text-gray-500">{block.duration} min</span>
        )}
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="text-xs py-0 px-2 h-6">
              <MessageCircle className="w-3 h-3 mr-1" />
              {block.notes ? 'Edit Notes' : 'Add Notes'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Notes & Comments</h4>
              <Textarea 
                placeholder="Add notes or @mention team members..." 
                className="h-24 text-sm"
                value={notes}
                onChange={(e) => handleNotesChange(e.target.value)}
              />
              <div className="flex items-center justify-between">
                <Select 
                  defaultValue={block.status || 'draft'}
                  onValueChange={(value) => handleStatusChange(value as any)}
                >
                  <SelectTrigger className="w-32 h-8 text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="needs-review">Needs Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" className="h-8" onClick={() => setIsEditing(false)}>
                  <Check className="w-3.5 h-3.5 mr-1" /> Save
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* AI Refinement Dialog */}
      <Dialog open={isRefining} onOpenChange={setIsRefining}>
        <DialogContent className="sm:max-w-md bg-white text-gray-900">
          <DialogHeader>
            <DialogTitle>Refine with AI</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <h4 className="text-sm font-medium mb-2">Original Content</h4>
              <div className="p-3 bg-gray-50 rounded text-sm mb-4">
                <p className="font-medium">{block.title}</p>
                <p className="text-gray-600">{block.description}</p>
              </div>
            </div>
            
            <div>
              <label htmlFor="refinePrompt" className="text-sm font-medium mb-1 block">
                How would you like to refine this content?
              </label>
              <Textarea
                id="refinePrompt"
                placeholder="e.g., 'make more playful', 'shorten for social', 'make more formal'"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              />
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={handleAiRefine} 
                disabled={!aiPrompt || isLoading}
                className="mr-2"
              >
                {isLoading ? 'Processing...' : 'Generate'}
              </Button>
              <Button variant="outline" onClick={() => setIsRefining(false)}>
                Cancel
              </Button>
            </div>
            
            {aiResponse && (
              <div>
                <h4 className="text-sm font-medium mb-2">AI Suggestion</h4>
                <div className="p-3 bg-green-50 border border-green-100 rounded text-sm">
                  <p className="whitespace-pre-line">{aiResponse}</p>
                </div>
                <div className="flex justify-end mt-4">
                  <Button onClick={applyRefinement}>
                    Apply Changes
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Send to Story Arc Confirmation */}
      <Dialog open={showStoryArcDialog} onOpenChange={setShowStoryArcDialog}>
        <DialogContent className="sm:max-w-xs bg-white text-gray-900">
          <div className="text-center py-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-medium text-lg">Sent to Story Arc!</h3>
            <p className="text-gray-600 text-sm mt-1">
              This block will appear in the Story Arc timeline.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentBlockItem;
