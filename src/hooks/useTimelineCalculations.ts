
import { ContentBlock } from '@/contexts/ContentBlocksContext';

export const useTimelineCalculations = (timeScale: number, totalDuration: number) => {
  const calculateBlockPosition = (blockIndex: number, blocks: ContentBlock[]) => {
    console.log(`Calculating position for block ${blockIndex} of ${blocks.length} blocks`);
    
    // Sort blocks by sequence to ensure proper ordering
    const sortedBlocks = [...blocks].sort((a, b) => {
      const aSeq = typeof a.sequence === 'number' ? a.sequence : 0;
      const bSeq = typeof b.sequence === 'number' ? b.sequence : 0;
      return aSeq - bSeq;
    });
    
    let runningTime = 0;
    for (let i = 0; i < blockIndex; i++) {
      runningTime += sortedBlocks[i]?.duration || 5;
    }
    
    const effectiveTimeScale = Math.max(timeScale, totalDuration, 10); // Minimum 10 minutes
    const percentPerMinute = 100 / effectiveTimeScale;
    const position = runningTime * percentPerMinute;
    
    console.log(`Block ${blockIndex}: runningTime=${runningTime}, position=${position}%`);
    return `${Math.max(position, 0)}%`;
  };
  
  const calculateWidth = (durationMins: number) => {
    const effectiveTimeScale = Math.max(timeScale, totalDuration, 10);
    const percentPerMinute = 100 / effectiveTimeScale;
    const width = Math.max(durationMins * percentPerMinute, 8); // Minimum 8% width
    
    console.log(`Duration ${durationMins}min = ${width}% width`);
    return `${width}%`;
  };

  const getTimeMarkers = () => {
    const effectiveTimeScale = Math.max(timeScale, totalDuration, 10);
    const interval = effectiveTimeScale <= 30 ? 5 : effectiveTimeScale <= 60 ? 10 : 15;
    const markerCount = Math.ceil(effectiveTimeScale / interval) + 1;
    
    const markers = Array.from({ length: markerCount }, (_, i) => i * interval);
    console.log(`Time markers for ${effectiveTimeScale}min scale:`, markers);
    return markers;
  };

  return {
    calculateBlockPosition,
    calculateWidth,
    getTimeMarkers
  };
};
