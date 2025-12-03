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

// Apple Blue Glassmorphism Styles
const stageStyles = {
  container: {
    background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 30%, #e0f2fe 60%, #f0f9ff 100%)',
    minHeight: '100%',
  },
  glassCard: {
    background: 'rgba(255, 255, 255, 0.75)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
    borderRadius: '20px',
  },
  askAllCard: {
    background: 'rgba(0, 122, 255, 0.08)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(0, 122, 255, 0.15)',
    borderRadius: '20px',
  },
  blueButton: {
    background: 'rgba(0, 122, 255, 0.9)',
    border: 'none',
    boxShadow: '0 4px 15px rgba(0, 122, 255, 0.3)',
  },
};

// AI card colors - Apple-inspired
const aiCardColors: Record<string, React.CSSProperties> = {
  chatgpt: {
    background: 'linear-gradient(135deg, #34C759 0%, #30B350 100%)',
  },
  claude: {
    background: 'linear-gradient(135deg, #FF9500 0%, #FF8000 100%)',
  },
  gemini: {
    background: 'linear-gradient(135deg, #007AFF 0%, #0056CC 100%)',
  },
  perplexity: {
    background: 'linear-gradient(135deg, #5856D6 0%, #4B49C7 100%)',
  },
};

const IdeateStage = () => {
  const { contentBlocks, updateContentBlock } = useContentBlocks();
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>([]);
  const [globalPrompt, setGlobalPrompt] = useState('');
  const [activeChatProvider, setActiveChatProvider] = useState<AIProvider | null>(null);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  
  const { inputs, setInput, chatMessages, loadingStates, sendMessage, sendToAll } = useAIChat();
  const { isOpenaiKeySet, isClaudeKeySet, isGeminiKeySet, isPerplexityKeySet, isLoading, refreshKeys } = useIdeateApiKeys();

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
      color: 'chatgpt',
      description: 'Research & Analysis',
      subtitle: 'Creative brainstorming and idea generation'
    },
    {
      id: 'claude' as AIProvider,
      name: 'Claude',
      icon: Sparkles,
      color: 'claude',
      description: 'Creative & Narrative',
      subtitle: 'Deep narrative insights and storytelling'
    },
    {
      id: 'gemini' as AIProvider,
      name: 'Gemini',
      icon: Brain,
      color: 'gemini',
      description: 'Deep Research & Insights',
      subtitle: 'Comprehensive multi-perspective analysis'
    },
    {
      id: 'perplexity' as AIProvider,
      name: 'Perplexity',
      icon: Search,
      color: 'perplexity',
      description: 'Real-time Web Search',
      subtitle: 'Latest information and trending topics'
    }
  ];

  return (
    <div className="flex-1" style={stageStyles.container}>
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#1D1D1F' }}>Ideas Lab</h2>
          <p style={{ color: '#6B7280' }}>Collaborate with AI assistants to brainstorm and create content blocks for your episode.</p>
          
          {/* Show warning if no API keys are configured */}
          {!isLoading && !isOpenaiKeySet && !isClaudeKeySet && !isGeminiKeySet && !isPerplexityKeySet && (
            <div className="mt-4 p-4 rounded-lg" style={{ background: 'rgba(255, 59, 48, 0.1)', border: '1px solid rgba(255, 59, 48, 0.2)' }}>
              <p className="text-sm font-medium" style={{ color: '#D32F2F' }}>
                ⚠️ No API keys detected. Please configure at least one AI provider to use the Ideas Lab.
              </p>
            </div>
          )}
        </div>

        {/* Ask All AIs Section */}
        <div className="mb-6" style={stageStyles.askAllCard}>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(0, 122, 255, 0.9)' }}
              >
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold" style={{ color: '#1D1D1F' }}>Ask All AIs at Once</h3>
                <p className="text-sm" style={{ color: '#6B7280' }}>Get diverse perspectives from all AI assistants simultaneously</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Input
                placeholder="e.g., What are the latest trends in plant-based nutrition?"
                value={globalPrompt}
                onChange={(e) => setGlobalPrompt(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAskAllAIs()}
                className="flex-1 rounded-xl border-gray-200"
                style={{ background: 'rgba(255, 255, 255, 0.8)' }}
              />
              <button 
                onClick={handleAskAllAIs}
                disabled={!globalPrompt.trim()}
                className="px-5 py-2 rounded-full text-white font-semibold transition-all hover:scale-[1.02] disabled:opacity-50 flex items-center"
                style={stageStyles.blueButton}
              >
                <Send className="w-4 h-4 mr-2" />
                Ask All
              </button>
            </div>
            
            <p className="text-xs mt-2" style={{ color: '#9CA3AF' }}>
              💡 Tip: This will query all configured AI assistants and display their responses side-by-side for comparison
            </p>
          </div>
        </div>

        <div className="mb-6 flex justify-end gap-3">
          <button 
            onClick={() => {
              refreshKeys();
            }}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all hover:scale-[1.02] disabled:opacity-50"
            style={{
              background: 'rgba(255, 255, 255, 0.7)',
              color: '#1D1D1F',
              border: '1px solid rgba(0, 0, 0, 0.06)',
            }}
          >
            <Zap className="w-4 h-4" />
            {isLoading ? 'Loading...' : 'Refresh Keys'}
          </button>
          <button 
            onClick={() => {
              setShowApiKeyDialog(true);
              refreshKeys();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all hover:scale-[1.02]"
            style={{
              background: 'rgba(255, 255, 255, 0.7)',
              color: '#1D1D1F',
              border: '1px solid rgba(0, 0, 0, 0.06)',
            }}
          >
            <Settings className="w-4 h-4" />
            Configure API Keys
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Assistants Panel */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#1D1D1F' }}>AI Assistants</h3>
            
            {aiAssistants.map((assistant) => {
              const Icon = assistant.icon;
              const isKeySet = getKeyStatus(assistant.id);
              const messageCount = chatMessages.filter(m => m.source === assistant.id).length;
              
              return (
                <div 
                  key={assistant.id} 
                  className="text-white overflow-hidden cursor-pointer hover:shadow-lg transition-all hover:scale-[1.01] rounded-2xl"
                  style={aiCardColors[assistant.color]}
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
                      <span 
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{
                          background: isKeySet ? 'rgba(255,255,255,0.25)' : 'rgba(255,59,48,0.3)',
                          color: 'white',
                        }}
                      >
                        {isKeySet ? 'Ready' : 'No API Key'}
                      </span>
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
                      <button 
                        className="flex-1 px-4 py-2 rounded-full text-sm font-medium bg-white/20 hover:bg-white/30 transition-all flex items-center justify-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          openChat(assistant.id);
                        }}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Open Chat
                      </button>
                    </div>
                  </div>
                </div>
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
        onOpenChange={(open) => {
          setShowApiKeyDialog(open);
          if (!open) {
            // Refresh keys when dialog closes
            refreshKeys();
          }
        }}
      />
    </div>
  );
};

export default IdeateStage;
