
import React, { useState, useEffect } from 'react';
import { useContentBlocks, ContentBlock, ScriptBlock } from '@/contexts/ContentBlocksContext';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FactCheckResult, VeracityStatus, CitationStyle } from '@/types/veracity';
import { performFactCheck } from '@/utils/veracity';
import HeaderControls from '@/components/veracity/HeaderControls';
import ScriptContentPanel from '@/components/veracity/ScriptContentPanel';
import FactCheckPanel from '@/components/veracity/FactCheckPanel';
import ResolutionPanel from '@/components/veracity/ResolutionPanel';
import ExportPanel from '@/components/veracity/ExportPanel';

// Type guards
const isContentBlock = (block: ContentBlock | ScriptBlock): block is ContentBlock => {
  return 'type' in block;
};

const isScriptBlock = (block: ContentBlock | ScriptBlock): block is ScriptBlock => {
  return 'ears' in block;
};

const VeracityStage = () => {
  const { contentBlocks, scriptBlocks } = useContentBlocks();
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [factCheckResults, setFactCheckResults] = useState<FactCheckResult[]>([]);
  const [isToneCheckEnabled, setIsToneCheckEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'script' | 'flags' | 'export'>('script');
  const [citationStyle, setCitationStyle] = useState<CitationStyle>(
    () => (localStorage.getItem('preferredCitationStyle') as CitationStyle) || 'inline'
  );

  // Use the scriptBlocks directly from context or filter contentBlocks for blocks with notes or description
  const verifiableBlocks = scriptBlocks.length > 0 
    ? scriptBlocks 
    : contentBlocks.filter(block => {
        if (isContentBlock(block)) {
          return block.description || block.notes;
        }
        return false;
      });
  
  const currentBlock = verifiableBlocks[currentBlockIndex];

  const getBlockContent = (block: ContentBlock | ScriptBlock | undefined): string => {
    if (!block) return "";
    
    if (isScriptBlock(block)) {
      return block.ears || "";
    }
    
    if (isContentBlock(block)) {
      return block.description || block.notes || "";
    }
    
    return "";
  };

  const currentContent = getBlockContent(currentBlock);
  
  // Get episode title and version if available
  const getEpisodeTitle = (): string => {
    if (isScriptBlock(currentBlock) && currentBlock.title) {
      return currentBlock.title;
    }
    return '';
  };

  const getScriptVersion = (): string => {
    if (isScriptBlock(currentBlock) && currentBlock.version) {
      return currentBlock.version;
    }
    return '';
  };

  useEffect(() => {
    // Load initial fact check data when component mounts
    if (currentContent) {
      handleFactCheck();
    }
  }, []);

  // Add effect to re-check facts when tone check is toggled
  useEffect(() => {
    if (currentContent) {
      handleFactCheck();
    }
  }, [isToneCheckEnabled]);
  
  // Save citation style preference when it changes
  useEffect(() => {
    localStorage.setItem('preferredCitationStyle', citationStyle);
  }, [citationStyle]);

  const handleFactCheck = async () => {
    if (!currentContent) return;
    
    setIsLoading(true);
    
    try {
      // In a real implementation, this would connect to Perplexity API
      // For now we'll use our local mock function
      const results = await performFactCheck(currentContent, isToneCheckEnabled);
      setFactCheckResults(results);
    } catch (error) {
      console.error("Error performing fact check:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFlagStatusChange = (flagId: string, status: VeracityStatus, comment?: string) => {
    setFactCheckResults(prevResults => 
      prevResults.map(result => 
        result.id === flagId 
          ? { ...result, status, comment: comment || result.comment } 
          : result
      )
    );
  };

  const handleNextBlock = () => {
    if (currentBlockIndex < verifiableBlocks.length - 1) {
      setCurrentBlockIndex(prevIndex => prevIndex + 1);
      handleFactCheck();
    }
  };

  const handlePrevBlock = () => {
    if (currentBlockIndex > 0) {
      setCurrentBlockIndex(prevIndex => prevIndex - 1);
      handleFactCheck();
    }
  };

  return (
    <div className="flex-1 bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Fact Check</h2>
          <p className="text-gray-600">Verify facts and analyze tone in your script content.</p>
        </div>

        <HeaderControls
          isToneCheckEnabled={isToneCheckEnabled}
          onToneCheckChange={setIsToneCheckEnabled}
          onFactCheck={handleFactCheck}
          isLoading={isLoading}
          hasContent={!!currentContent}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left side - Script Panel */}
          <ScriptContentPanel
            currentContent={currentContent}
            factCheckResults={factCheckResults}
            currentBlockIndex={currentBlockIndex}
            totalBlocks={verifiableBlocks.length}
            onPrevBlock={handlePrevBlock}
            onNextBlock={handleNextBlock}
          />

          {/* Right side - Veracity Panel */}
          <Card className="p-4 bg-white shadow-sm border border-gray-300 h-[calc(100vh-12rem)]">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
              <div className="flex items-center justify-between mb-4">
                <TabsList className="bg-gray-100">
                  <TabsTrigger value="script" className="text-gray-800 data-[state=active]:bg-white data-[state=active]:text-gray-900">Results</TabsTrigger>
                  <TabsTrigger value="flags" className="text-gray-800 data-[state=active]:bg-white data-[state=active]:text-gray-900">Resolutions</TabsTrigger>
                  <TabsTrigger value="export" className="text-gray-800 data-[state=active]:bg-white data-[state=active]:text-gray-900">Export</TabsTrigger>
                </TabsList>
                
                <Badge variant={isLoading ? "outline" : "default"} className="ml-2 text-gray-800 border-gray-400">
                  {factCheckResults.length} issues found
                </Badge>
              </div>
              
              <TabsContent value="script" className="m-0">
                <ScrollArea className="h-[calc(100vh-14rem)]">
                  <FactCheckPanel 
                    results={factCheckResults}
                    onStatusChange={handleFlagStatusChange}
                    isLoading={isLoading}
                    citationStyle={citationStyle}
                  />
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="flags" className="m-0">
                <ScrollArea className="h-[calc(100vh-14rem)]">
                  <ResolutionPanel 
                    results={factCheckResults}
                    onStatusChange={handleFlagStatusChange}
                  />
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="export" className="m-0">
                <ExportPanel 
                  results={factCheckResults} 
                  scriptContent={currentContent} 
                  episodeTitle={getEpisodeTitle()}
                  scriptVersion={getScriptVersion()}
                />
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VeracityStage;
