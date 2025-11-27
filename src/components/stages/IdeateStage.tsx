import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Bot, Sparkles, Brain, Search, Send, Zap, MessageSquare, Settings } from 'lucide-react';
import ContentBlocksPanel from './ideate/ContentBlocksPanel';
import { contentBlockTypes } from './ideate/constants';
import { useContentBlocks, ContentBlock } from '@/contexts/ContentBlocksContext';
import { useAIChat } from '@/hooks/useAIChat';
import { useIdeateApiKeys } from '@/hooks/useIdeateApiKeys';
import { AIProvider } from './ideate/types';
import AIChatDialog from './ideate/AIChatDialog';
import ApiKeyDialog from '@/components/ApiKeyDialog';

const IdeateStage = () => {
  const { contentBlocks, updateContentBlock } = useContentBlocks();
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>([]);
  const [globalPrompt, setGlobalPrompt] = useState('');
  const [activeChatProvider, setActiveChatProvider] = useState<AIProvider | null>(null);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  
  const { inputs, setInput, chatMessages, loadingStates, sendMessage, sendToAll } = useAIChat();
  const { isOpenaiKeySet, isClaudeKeySet, isGeminiKeySet, isPerplexityKeySet } = useIdeateApiKeys();

  const handleBlockSelect = (blockId: string, selected: boolean) => {
    setSelectedBlocks(prev => 
      selected ? [...prev, blockId] : prev.filter(id => id !== blockId)
    );
  };

  const handleSelectAll = () => {
    const unsyncedBlocks = contentBlocks.filter(b => !b.inStoryArc);
    if (selectedBlocks.length === unsyncedBlocks.length) {
      setSelectedBlocks([]);
    } else {
      setSelectedBlocks(unsyncedBlocks.map(b => b.id));
    }
  };


  const handleBulkSendToStoryArc = async () => {
    console.log("Bulk sending blocks:", selectedBlocks);
    await Promise.all(
      selectedBlocks.map(blockId => 
        updateContentBlock(blockId, { inStoryArc: true })
      )
    );
    setSelectedBlocks([]);
  };

  const handleBlockClick = (block: ContentBlock) => {
    console.log('Block clicked:', block);
  };

  const handleAskAllAIs = async () => {
    if (!globalPrompt.trim()) return;
    await sendToAll(globalPrompt);
    setGlobalPrompt('');
  };

  const openChat = (provider: AIProvider) => {
    setActiveChatProvider(provider);
  };

  const getKeyStatus = (provider: AIProvider) => {
    const keyMap = {
      chatgpt: isOpenaiKeySet,
      claude: isClaudeKeySet,
      gemini: isGeminiKeySet,
      perplexity: isPerplexityKeySet
    };
    return keyMap[provider];
  };

  const aiAssistants = [
    {
      id: 'chatgpt' as AIProvider,
      name: 'ChatGPT',
      icon: Bot,
      color: 'bg-green-500',
      description: 'Research & Analysis',
      subtitle: 'Creative brainstorming and idea generation'
    },
    {
      id: 'claude' as AIProvider,
      name: 'Claude',
      icon: Sparkles,
      color: 'bg-orange-500',
      description: 'Creative & Narrative',
      subtitle: 'Deep narrative insights and storytelling'
    },
    {
      id: 'gemini' as AIProvider,
      name: 'Gemini',
      icon: Brain,
      color: 'bg-blue-500',
      description: 'Deep Research & Insights',
      subtitle: 'Comprehensive multi-perspective analysis'
    },
    {
      id: 'perplexity' as AIProvider,
      name: 'Perplexity',
      icon: Search,
      color: 'bg-purple-500',
      description: 'Real-time Web Search',
      subtitle: 'Latest information and trending topics'
    }
  ];

  return (
    <div className="flex-1 bg-white">
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ideas Lab</h2>
          <p className="text-gray-600">Collaborate with AI assistants to brainstorm and create content blocks for your episode.</p>
        </div>

        {/* Ask All AIs Section */}
        <Card className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Ask All AIs at Once</h3>
                <p className="text-sm text-gray-600">Get diverse perspectives from all AI assistants simultaneously</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Input
                placeholder="e.g., What are the latest trends in plant-based nutrition?"
                value={globalPrompt}
                onChange={(e) => setGlobalPrompt(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAskAllAIs()}
                className="flex-1 bg-white"
              />
              <Button 
                onClick={handleAskAllAIs}
                disabled={!globalPrompt.trim()}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Ask All
              </Button>
            </div>
            
            <p className="text-xs text-gray-500 mt-2">
              💡 Tip: This will query all configured AI assistants and display their responses side-by-side for comparison
            </p>
          </div>
        </Card>

        <div className="mb-6 flex justify-end">
          <Button 
            variant="outline"
            onClick={() => setShowApiKeyDialog(true)}
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Configure API Keys
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Assistants Panel */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Assistants</h3>
            
            {aiAssistants.map((assistant) => {
              const Icon = assistant.icon;
              const isKeySet = getKeyStatus(assistant.id);
              const messageCount = chatMessages.filter(m => m.source === assistant.id).length;
              
              return (
                <Card 
                  key={assistant.id} 
                  className={`${assistant.color} text-white overflow-hidden cursor-pointer hover:shadow-lg transition-shadow`}
                  onClick={() => openChat(assistant.id)}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg">{assistant.name}</h4>
                          <p className="text-sm opacity-90">{assistant.description}</p>
                        </div>
                      </div>
                      <Badge className={isKeySet ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                        {isKeySet ? 'Ready' : 'No API Key'}
                      </Badge>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-3">
                      <p className="text-sm leading-relaxed">{assistant.subtitle}</p>
                      {messageCount > 0 && (
                        <p className="text-xs mt-2 opacity-75">
                          {messageCount} message{messageCount !== 1 ? 's' : ''} in conversation
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="secondary" 
                        size="sm"
                        className="flex-1 bg-white/20 hover:bg-white/30 text-white border-white/30"
                        onClick={(e) => {
                          e.stopPropagation();
                          openChat(assistant.id);
                        }}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Open Chat
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Content Blocks Panel */}
          <ContentBlocksPanel
            contentBlockTypes={contentBlockTypes}
            selectedBlocks={selectedBlocks}
            onBlockSelect={handleBlockSelect}
            onBulkSendToStoryArc={handleBulkSendToStoryArc}
            onSelectAll={handleSelectAll}
            onBlockClick={handleBlockClick}
          />
        </div>
      </div>

      {/* AI Chat Dialogs */}
      {aiAssistants.map((assistant) => (
        <AIChatDialog
          key={assistant.id}
          open={activeChatProvider === assistant.id}
          onOpenChange={(open) => !open && setActiveChatProvider(null)}
          provider={assistant.id}
          title={assistant.name}
          subtitle={assistant.subtitle}
          icon={assistant.icon}
          color={assistant.color}
          messages={chatMessages}
          input={inputs[assistant.id]}
          onInputChange={(value) => setInput(assistant.id, value)}
          onSendMessage={() => sendMessage(assistant.id)}
          isKeySet={getKeyStatus(assistant.id)}
          isLoading={loadingStates[assistant.id]}
        />
      ))}

      {/* API Key Configuration Dialog */}
      <ApiKeyDialog
        open={showApiKeyDialog}
        onOpenChange={setShowApiKeyDialog}
      />
    </div>
  );
};

export default IdeateStage;
