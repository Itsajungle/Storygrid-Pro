
import { useState, useCallback, useEffect } from 'react';
import { StoryBlock, StoryMetrics as StoryMetricsType } from '@/types/story-arc';

const useStoryMetrics = (storyBlocks: StoryBlock[], structure: string, structures: any) => {
  const [storyMetrics, setStoryMetrics] = useState<StoryMetricsType>({
    pacing: 0,
    balance: 0,
    engagement: 0,
    actDistribution: {},
    contentTypeCount: {}
  });

  const calculateStoryMetrics = useCallback(() => {
    if (storyBlocks.length === 0) return;

    // Calculate type distribution
    const typeCount: Record<string, number> = {};
    storyBlocks.forEach(block => {
      const type = block.type;
      typeCount[type] = (typeCount[type] || 0) + 1;
    });

    // Calculate act distribution based on position
    const actDistribution: Record<string, number> = {};
    const acts = structures[structure];
    
    storyBlocks.forEach(block => {
      const position = block.position;
      const act = acts.find((a: any) => position >= a.start && position <= a.end);
      if (act) {
        actDistribution[act.name] = (actDistribution[act.name] || 0) + (block.duration || 3);
      }
    });

    // Calculate metrics
    const totalDuration = storyBlocks.reduce((sum, block) => sum + (block.duration || 0), 0);
    
    // Basic scoring metrics
    let pacing = 8.2;  // Default value
    let balance = 7.5;  // Default value
    let engagement = 9.1;  // Default value

    // Adjust scores based on block distribution
    const actKeys = Object.keys(actDistribution);
    if (actKeys.length < acts.length) {
      // Penalize if some acts have no content
      pacing = Math.max(5, pacing - 1.5);
      engagement = Math.max(5, engagement - 1);
    }

    // If most blocks are of the same type, reduce balance score
    const maxTypeCount = Math.max(...Object.values(typeCount));
    if (maxTypeCount > storyBlocks.length * 0.6) {
      balance = Math.max(5, balance - 2);
    }

    setStoryMetrics({
      pacing,
      balance,
      engagement,
      actDistribution,
      contentTypeCount: typeCount
    });
  }, [storyBlocks, structure, structures]);

  useEffect(() => {
    calculateStoryMetrics();
  }, [calculateStoryMetrics]);

  return storyMetrics;
};

export default useStoryMetrics;
