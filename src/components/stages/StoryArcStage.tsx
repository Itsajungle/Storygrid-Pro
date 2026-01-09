import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContentBlocks } from '@/contexts/ContentBlocksContext';
import { StoryBlock, StructureType, ActStructure } from '@/types/story-arc';
import { contentBlockTypes } from './ideate/constants';

// Import enhanced components
import EnhancedStructureSelector from '@/components/story-arc/EnhancedStructureSelector';
import EnhancedTimelineVisualizer from '@/components/story-arc/EnhancedTimelineVisualizer';
import BlockList from '@/components/story-arc/BlockList';
import AIInsights from '@/components/story-arc/AIInsights';
import StoryMetrics from '@/components/story-arc/StoryMetrics';
import BlockDetailsDialog from '@/components/story-arc/BlockDetailsDialog';

// Import custom hooks
import useStoryAnalysis from '@/hooks/useStoryAnalysis';
import useStoryMetrics from '@/hooks/useStoryMetrics';
import { useAISuggestions } from '@/hooks/useAISuggestions';

const StoryArcStage: React.FC = () => {
  const [structure, setStructure] = useState<StructureType>('3-act');
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const { contentBlocks, updateContentBlock } = useContentBlocks();
  const [storyBlocks, setStoryBlocks] = useState<StoryBlock[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<StoryBlock | null>(null);
  const [editedBlock, setEditedBlock] = useState<Partial<StoryBlock>>({});
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  
  const navigate = useNavigate();
  
  // Enhanced story structures with more options
  const structures: Record<StructureType, ActStructure[]> = {
    '3-act': [
      { name: 'Setup', start: 0, end: 25, color: 'bg-blue-500', description: 'Introduce characters and world' },
      { name: 'Confrontation', start: 25, end: 75, color: 'bg-amber-500', description: 'Develop conflict and tension' },
      { name: 'Resolution', start: 75, end: 100, color: 'bg-green-500', description: 'Resolve conflict and conclude' }
    ],
    'aristotelian': [
      { name: 'Setup', start: 0, end: 15, color: 'bg-blue-500', description: 'Establish world and characters' },
      { name: 'Inciting Incident', start: 15, end: 25, color: 'bg-purple-500', description: 'Event that starts the story' },
      { name: 'Rising Action', start: 25, end: 50, color: 'bg-yellow-500', description: 'Build tension and complications' },
      { name: 'Midpoint', start: 50, end: 60, color: 'bg-orange-500', description: 'Major revelation or turning point' },
      { name: 'Crisis', start: 60, end: 80, color: 'bg-red-500', description: 'Highest tension, all seems lost' },
      { name: 'Climax', start: 80, end: 90, color: 'bg-pink-500', description: 'Final confrontation' },
      { name: 'Resolution', start: 90, end: 100, color: 'bg-green-500', description: 'Loose ends tied up' }
    ],
    'heros-journey': [
      { name: 'Ordinary World', start: 0, end: 8, color: 'bg-gray-500', description: 'Normal life before adventure' },
      { name: 'Call to Adventure', start: 8, end: 15, color: 'bg-blue-500', description: 'Challenge presented' },
      { name: 'Refusal & Mentor', start: 15, end: 25, color: 'bg-purple-500', description: 'Hesitation and guidance' },
      { name: 'Crossing Threshold', start: 25, end: 35, color: 'bg-indigo-500', description: 'Commit to journey' },
      { name: 'Tests & Allies', start: 35, end: 50, color: 'bg-cyan-500', description: 'Face challenges, build team' },
      { name: 'Approach & Ordeal', start: 50, end: 65, color: 'bg-orange-500', description: 'Prepare for and face biggest fear' },
      { name: 'Reward', start: 65, end: 75, color: 'bg-yellow-500', description: 'Gain knowledge or prize' },
      { name: 'Road Back', start: 75, end: 85, color: 'bg-red-500', description: 'Return with new wisdom' },
      { name: 'Resurrection', start: 85, end: 95, color: 'bg-pink-500', description: 'Final test and transformation' },
      { name: 'Return', start: 95, end: 100, color: 'bg-green-500', description: 'Share wisdom with world' }
    ],
    '4-act': [
      { name: 'Setup', start: 0, end: 25, color: 'bg-blue-500', description: 'Introduce world and conflict' },
      { name: 'Response', start: 25, end: 50, color: 'bg-purple-500', description: 'React to challenges' },
      { name: 'Attack', start: 50, end: 75, color: 'bg-orange-500', description: 'Take action, face obstacles' },
      { name: 'Resolution', start: 75, end: 100, color: 'bg-green-500', description: 'Resolve and conclude' }
    ],
    'save-the-cat': [
      { name: 'Opening Image', start: 0, end: 5, color: 'bg-gray-500', description: 'Snapshot of before' },
      { name: 'Setup', start: 5, end: 15, color: 'bg-blue-500', description: 'Introduce world and hero' },
      { name: 'Catalyst', start: 15, end: 20, color: 'bg-purple-500', description: 'Life-changing event' },
      { name: 'Debate', start: 20, end: 25, color: 'bg-indigo-500', description: 'Should they act?' },
      { name: 'Break into Two', start: 25, end: 30, color: 'bg-cyan-500', description: 'Commit to journey' },
      { name: 'Fun and Games', start: 30, end: 50, color: 'bg-yellow-500', description: 'Promise of premise' },
      { name: 'Midpoint', start: 50, end: 55, color: 'bg-orange-500', description: 'False victory or defeat' },
      { name: 'Bad Guys Close In', start: 55, end: 70, color: 'bg-red-500', description: 'Tension rises' },
      { name: 'All is Lost', start: 70, end: 75, color: 'bg-rose-500', description: 'Lowest point' },
      { name: 'Dark Night', start: 75, end: 80, color: 'bg-gray-700', description: 'Process the loss' },
      { name: 'Break into Three', start: 80, end: 85, color: 'bg-pink-500', description: 'Solution found' },
      { name: 'Finale', start: 85, end: 95, color: 'bg-green-500', description: 'Execute solution' },
      { name: 'Final Image', start: 95, end: 100, color: 'bg-emerald-500', description: 'Snapshot of after' }
    ],
    'freytag': [
      { name: 'Exposition', start: 0, end: 20, color: 'bg-blue-500', description: 'Background and setup' },
      { name: 'Rising Action', start: 20, end: 50, color: 'bg-purple-500', description: 'Build tension' },
      { name: 'Climax', start: 50, end: 60, color: 'bg-red-500', description: 'Turning point' },
      { name: 'Falling Action', start: 60, end: 85, color: 'bg-orange-500', description: 'Consequences unfold' },
      { name: 'Denouement', start: 85, end: 100, color: 'bg-green-500', description: 'Resolution and closure' }
    ],
    'story-circle': [
      { name: 'Comfort Zone', start: 0, end: 12, color: 'bg-gray-500', description: 'You - in familiar situation' },
      { name: 'Need/Want', start: 12, end: 25, color: 'bg-blue-500', description: 'Desire something' },
      { name: 'Unfamiliar Situation', start: 25, end: 37, color: 'bg-purple-500', description: 'Enter new world' },
      { name: 'Adapt', start: 37, end: 50, color: 'bg-indigo-500', description: 'Search and learn' },
      { name: 'Get What They Want', start: 50, end: 62, color: 'bg-yellow-500', description: 'Find what you sought' },
      { name: 'Pay Heavy Price', start: 62, end: 75, color: 'bg-red-500', description: 'Consequences emerge' },
      { name: 'Return', start: 75, end: 87, color: 'bg-orange-500', description: 'Go back to familiar' },
      { name: 'Change', start: 87, end: 100, color: 'bg-green-500', description: 'You - transformed' }
    ]
  };
  
  // Use custom hooks
  const { insights, runningAnalysis, runAIAnalysis } = useStoryAnalysis();
  const storyMetrics = useStoryMetrics(storyBlocks, structure, structures);
  const { generateSegmentSuggestions } = useAISuggestions();
  
  // Load content blocks from context and assign positions
  useEffect(() => {
    const arcBlocks = contentBlocks.filter(block => block.inStoryArc);
    const totalBlocks = arcBlocks.length;
    
    if (totalBlocks === 0) {
      setStoryBlocks([]);
      return;
    }
    
    const sortedBlocks = [...arcBlocks].sort((a, b) => {
      const aSeq = typeof a.sequence === 'number' ? a.sequence : 0;
      const bSeq = typeof b.sequence === 'number' ? b.sequence : 0;
      return aSeq - bSeq;
    });
    
    const blocksList = sortedBlocks.map((block, index) => ({
      ...block,
      position: Math.round(((index + 1) / (totalBlocks + 1)) * 100)
    }));
    
    setStoryBlocks(blocksList);
  }, [contentBlocks]);

  const totalDuration = storyBlocks.reduce((sum, block) => sum + (block.duration || 0), 0);

  const handleBlockClick = (block: StoryBlock) => {
    setSelectedBlock(block);
    setEditedBlock({
      title: block.title,
      description: block.description,
      duration: block.duration,
      type: block.type,
      status: block.status,
      notes: block.notes
    });
    setShowPreviewDialog(true);
  };

  const handleEditChange = (updates: Partial<StoryBlock>) => {
    setEditedBlock(prev => ({...prev, ...updates}));
  };

  const handleSaveEdit = () => {
    if (selectedBlock && editedBlock) {
      updateContentBlock(selectedBlock.id, editedBlock);
      setShowPreviewDialog(false);
      setSelectedBlock(null);
    }
  };

  const goToScriptStage = () => {
    navigate('/');
    setTimeout(() => {
      const scriptButton = document.querySelector('.stage-nav-btn:nth-child(3)') as HTMLButtonElement;
      if (scriptButton) {
        scriptButton.click();
      }
    }, 100);
  };

  const handleRunAnalysis = () => {
    runAIAnalysis(storyBlocks, structure, structures[structure]);
  };

  const handleGenerateAISuggestions = async () => {
    const updatedBlocks = await generateSegmentSuggestions(storyBlocks, structure);
    setStoryBlocks(updatedBlocks);
  };

  return (
    <div className="flex-1 p-6 bg-gray-50 min-h-screen overflow-auto">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Storyboard</h2>
          <p className="text-gray-600">
            Visualize your episode timeline with {structure === 'aristotelian' ? 'Aristotelian dramatic structure' : structure === 'heros-journey' ? "Hero's Journey" : structure === '4-act' ? '4-act structure' : structure === 'save-the-cat' ? 'Save the Cat beats' : structure === 'freytag' ? "Freytag's Pyramid" : structure === 'story-circle' ? 'Story Circle' : 'simple 3-act structure'} and optimize story flow with AI insights.
          </p>
        </div>

        <div className="mb-6">
          <EnhancedStructureSelector 
            structure={structure} 
            onStructureChange={setStructure} 
            totalDuration={totalDuration}
            showAISuggestions={showAISuggestions}
            onToggleAI={setShowAISuggestions}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3 space-y-6">
            <EnhancedTimelineVisualizer 
              storyBlocks={storyBlocks}
              structures={structures}
              structure={structure}
              totalDuration={totalDuration}
              contentBlockTypes={contentBlockTypes}
              showAISuggestions={showAISuggestions}
              onBlockClick={handleBlockClick}
              onGenerateAISuggestions={handleGenerateAISuggestions}
            />

            <div className="bg-white rounded-lg border shadow-sm">
              <div className="p-4 border-b bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900">Content Blocks</h3>
                <p className="text-sm text-gray-600">Click on blocks to view and edit details</p>
              </div>
              <div className="p-4">
                <BlockList 
                  storyBlocks={storyBlocks}
                  contentBlockTypes={contentBlockTypes}
                  onBlockClick={handleBlockClick}
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <AIInsights 
              storyBlocks={storyBlocks}
              aiInsights={insights}
              runningAnalysis={runningAnalysis}
              onRunAnalysis={handleRunAnalysis}
            />

            <StoryMetrics 
              storyBlocks={storyBlocks}
              storyMetrics={storyMetrics}
              structures={structures}
              structure={structure}
              totalDuration={totalDuration}
              contentBlockTypes={contentBlockTypes}
            />
          </div>
        </div>
      </div>
      
      <BlockDetailsDialog 
        selectedBlock={selectedBlock}
        editedBlock={editedBlock}
        showPreviewDialog={showPreviewDialog}
        contentBlockTypes={contentBlockTypes}
        onClose={() => setShowPreviewDialog(false)}
        onEditChange={handleEditChange}
        onSaveEdit={handleSaveEdit}
        onGoToScriptStage={goToScriptStage}
      />
    </div>
  );
};

export default StoryArcStage;
