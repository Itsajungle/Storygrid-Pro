
import { useState } from 'react';
import { StoryBlock, StructureType } from '@/types/story-arc';
import { toast } from 'sonner';

export const useAISuggestions = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateSegmentSuggestions = async (blocks: StoryBlock[], structure: StructureType): Promise<StoryBlock[]> => {
    setIsGenerating(true);
    
    try {
      // Simulate AI analysis - in a real app, this would call an AI service
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const updatedBlocks = blocks.map((block, index) => {
        let suggestedSegment = '';
        
        if (structure === 'aristotelian') {
          // Aristotelian arc suggestions based on content type and position
          const position = block.position || (index / blocks.length) * 100;
          
          if (block.type === 'interview' && position < 20) {
            suggestedSegment = 'Setup';
          } else if (block.type === 'demo' && position > 20 && position < 40) {
            suggestedSegment = 'Inciting Incident';
          } else if (block.type === 'b-roll' && position > 40 && position < 60) {
            suggestedSegment = 'Rising Action';
          } else if (position > 60 && position < 80) {
            suggestedSegment = 'Crisis';
          } else if (position > 80) {
            suggestedSegment = 'Resolution';
          } else {
            suggestedSegment = 'Rising Action';
          }
        } else {
          // Simple 3-act suggestions
          const position = block.position || (index / blocks.length) * 100;
          if (position < 25) {
            suggestedSegment = 'Setup';
          } else if (position < 75) {
            suggestedSegment = 'Confrontation';
          } else {
            suggestedSegment = 'Resolution';
          }
        }
        
        return {
          ...block,
          suggestedSegment
        };
      });
      
      toast.success(`Generated AI suggestions for ${blocks.length} blocks`, {
        description: `Based on ${structure === 'aristotelian' ? 'Aristotelian' : '3-act'} structure analysis`
      });
      
      return updatedBlocks;
    } catch (error) {
      toast.error('Failed to generate AI suggestions');
      return blocks;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateSegmentSuggestions,
    isGenerating
  };
};
