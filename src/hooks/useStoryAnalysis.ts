
import { useState, useCallback } from 'react';
import { StoryBlock, ActStructure, Insight } from '@/types/story-arc';

const useStoryAnalysis = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [runningAnalysis, setRunningAnalysis] = useState(false);

  const runAIAnalysis = useCallback((storyBlocks: StoryBlock[], structure: string, acts: ActStructure[]) => {
    setRunningAnalysis(true);
    
    // Simulate AI processing
    setTimeout(() => {
      // Generate insights based on story structure
      const generatedInsights: Insight[] = [];
      
      const blocksByAct: Record<string, StoryBlock[]> = {};
      
      storyBlocks.forEach(block => {
        const position = block.position;
        const act = acts.find(a => position >= a.start && position <= a.end);
        if (act) {
          if (!blocksByAct[act.name]) {
            blocksByAct[act.name] = [];
          }
          blocksByAct[act.name].push(block);
        }
      });
      
      // Check for empty acts
      acts.forEach(act => {
        if (!blocksByAct[act.name] || blocksByAct[act.name].length === 0) {
          generatedInsights.push({
            type: 'warning',
            message: `The ${act.name} act is currently empty. Consider adding content to maintain narrative flow.`
          });
        }
      });
      
      // Check for act balance
      const actDurations: Record<string, number> = {};
      acts.forEach(act => {
        actDurations[act.name] = blocksByAct[act.name]?.reduce((sum, block) => sum + (block.duration || 3), 0) || 0;
      });
      
      // Calculate expected durations based on act length
      const totalDuration = storyBlocks.reduce((sum, block) => sum + (block.duration || 0), 0);
      
      let hasImbalance = false;
      acts.forEach(act => {
        const expectedDuration = totalDuration * ((act.end - act.start) / 100);
        const actualDuration = actDurations[act.name] || 0;
        
        if (actualDuration < expectedDuration * 0.5 && actualDuration > 0) {
          hasImbalance = true;
          generatedInsights.push({
            type: 'info',
            message: `The ${act.name} act seems short relative to its importance. Consider expanding content here.`
          });
        } else if (actualDuration > expectedDuration * 1.5) {
          hasImbalance = true;
          generatedInsights.push({
            type: 'info',
            message: `The ${act.name} act is much longer than typical. Consider tightening content or moving some to adjacent acts.`
          });
        }
      });
      
      if (!hasImbalance && storyBlocks.length > 2) {
        generatedInsights.push({
          type: 'success',
          message: 'Act structure is well-balanced! The content distribution across your story follows recommended patterns.'
        });
      }
      
      // Check for content type diversity
      const contentTypes = storyBlocks.reduce((counts: Record<string, number>, block) => {
        counts[block.type] = (counts[block.type] || 0) + 1;
        return counts;
      }, {});
      
      const typeCount = Object.keys(contentTypes).length;
      
      if (typeCount <= 2 && storyBlocks.length > 3) {
        generatedInsights.push({
          type: 'warning', 
          message: 'Consider adding more variety in content types. Using multiple formats keeps viewers engaged.'
        });
      } else if (typeCount >= 4) {
        generatedInsights.push({
          type: 'success',
          message: 'Good content variety! Using multiple formats creates a dynamic viewing experience.'
        });
      }
      
      // Specific block type suggestions
      if (!contentTypes['interview'] && storyBlocks.length > 2) {
        generatedInsights.push({
          type: 'info',
          message: 'Adding expert interviews could strengthen credibility and provide authoritative perspectives.'
        });
      }
      
      if (!contentTypes['b-roll'] && storyBlocks.length > 2) {
        generatedInsights.push({
          type: 'info',
          message: 'Consider adding B-roll footage to create visual interest and context for your narrative.'
        });
      }
      
      // Update AI insights
      setInsights(generatedInsights);
      setRunningAnalysis(false);
    }, 1500);
  }, []);

  return { insights, runningAnalysis, runAIAnalysis, setInsights };
};

export default useStoryAnalysis;
