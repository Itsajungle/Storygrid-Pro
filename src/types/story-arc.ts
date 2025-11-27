
import { ContentBlock } from '@/contexts/ContentBlocksContext';

export interface ActStructure {
  name: string;
  start: number;
  end: number;
  color: string;
  description?: string;
}

export interface StoryBlock extends ContentBlock {
  position: number;
  suggestedSegment?: string;
}

export interface StoryMetrics {
  pacing: number;
  balance: number;
  engagement: number;
  actDistribution: Record<string, number>;
  contentTypeCount: Record<string, number>;
}

export interface Insight {
  type: 'warning' | 'success' | 'info';
  message: string;
}

export type StructureType = '3-act' | 'aristotelian' | 'heros-journey' | '4-act' | 'save-the-cat' | 'freytag' | 'story-circle';
