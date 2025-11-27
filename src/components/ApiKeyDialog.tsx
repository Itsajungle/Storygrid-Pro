
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Key } from 'lucide-react';
import { useApiKeyManager } from '@/hooks/useApiKeyManager';
import { Tabs, TabsContent, TabsList, TabsItem } from '@/components/ui/tabs';
import ApiKeyTab from './api-key/ApiKeyTab';

interface ApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ApiKeyDialog: React.FC<ApiKeyDialogProps> = ({ open, onOpenChange }) => {
  const { 
    openaiApiKey,
    isOpenaiKeySet, 
    saveOpenaiApiKey, 
    clearOpenaiApiKey,
    claudeApiKey,
    isClaudeKeySet,
    saveClaudeApiKey,
    clearClaudeApiKey,
    geminiApiKey,
    isGeminiKeySet,
    saveGeminiApiKey,
    clearGeminiApiKey,
    perplexityApiKey,
    isPerplexityKeySet,
    savePerplexityApiKey,
    clearPerplexityApiKey,
    refreshKeyStatus
  } = useApiKeyManager();
  
  const [openaiInputKey, setOpenaiInputKey] = useState('');
  const [claudeInputKey, setClaudeInputKey] = useState('');
  const [geminiInputKey, setGeminiInputKey] = useState('');
  const [perplexityInputKey, setPerplexityInputKey] = useState('');
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [showClaudeKey, setShowClaudeKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showPerplexityKey, setShowPerplexityKey] = useState(false);
  const [editingOpenai, setEditingOpenai] = useState(false);
  const [editingClaude, setEditingClaude] = useState(false);
  const [editingGemini, setEditingGemini] = useState(false);
  const [editingPerplexity, setEditingPerplexity] = useState(false);

  useEffect(() => {
    if (open) {
      refreshKeyStatus();
    }
  }, [open, refreshKeyStatus]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-white text-gray-900">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            API Key Settings
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="openai" className="w-full flex gap-4">
          <TabsList className="flex flex-col h-fit bg-gray-50 p-2 gap-1 rounded-lg w-40">
            <TabsItem value="openai" className="w-full justify-start data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 font-medium text-sm rounded-md px-3 py-2">OpenAI</TabsItem>
            <TabsItem value="claude" className="w-full justify-start data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 font-medium text-sm rounded-md px-3 py-2">Claude</TabsItem>
            <TabsItem value="gemini" className="w-full justify-start data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 font-medium text-sm rounded-md px-3 py-2">Gemini</TabsItem>
            <TabsItem value="perplexity" className="w-full justify-start data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 font-medium text-sm rounded-md px-3 py-2">Perplexity</TabsItem>
          </TabsList>
          
          <div className="flex-1">
          
          <TabsContent value="openai">
            <ApiKeyTab
              apiKey={openaiApiKey}
              isKeySet={isOpenaiKeySet}
              onSave={saveOpenaiApiKey}
              onClear={clearOpenaiApiKey}
              onStartEdit={() => setEditingOpenai(true)}
              editing={editingOpenai}
              onCancelEdit={() => {
                setOpenaiInputKey('');
                setEditingOpenai(false);
              }}
              inputKey={openaiInputKey}
              onInputChange={setOpenaiInputKey}
              showKey={showOpenaiKey}
              onToggleShow={() => setShowOpenaiKey(!showOpenaiKey)}
              keyPlaceholder="sk-..."
              keyLabel="OpenAI"
              saveButtonText="Save OpenAI Key"
              docsUrl="https://platform.openai.com/api-keys"
              docsText="OpenAI Platform"
            />
          </TabsContent>
          
          <TabsContent value="claude">
            <ApiKeyTab
              apiKey={claudeApiKey}
              isKeySet={isClaudeKeySet}
              onSave={saveClaudeApiKey}
              onClear={clearClaudeApiKey}
              onStartEdit={() => setEditingClaude(true)}
              editing={editingClaude}
              onCancelEdit={() => {
                setClaudeInputKey('');
                setEditingClaude(false);
              }}
              inputKey={claudeInputKey}
              onInputChange={setClaudeInputKey}
              showKey={showClaudeKey}
              onToggleShow={() => setShowClaudeKey(!showClaudeKey)}
              keyPlaceholder="sk-ant-..."
              keyLabel="Claude"
              saveButtonText="Save Claude Key"
              docsUrl="https://console.anthropic.com/"
              docsText="Anthropic Console"
            />
          </TabsContent>
          
          <TabsContent value="gemini">
            <ApiKeyTab
              apiKey={geminiApiKey}
              isKeySet={isGeminiKeySet}
              onSave={saveGeminiApiKey}
              onClear={clearGeminiApiKey}
              onStartEdit={() => setEditingGemini(true)}
              editing={editingGemini}
              onCancelEdit={() => {
                setGeminiInputKey('');
                setEditingGemini(false);
              }}
              inputKey={geminiInputKey}
              onInputChange={setGeminiInputKey}
              showKey={showGeminiKey}
              onToggleShow={() => setShowGeminiKey(!showGeminiKey)}
              keyPlaceholder="AIza..."
              keyLabel="Gemini"
              saveButtonText="Save Gemini Key"
              docsUrl="https://aistudio.google.com/app/apikey"
              docsText="Google AI Studio"
            />
          </TabsContent>
          
          <TabsContent value="perplexity">
            <ApiKeyTab
              apiKey={perplexityApiKey}
              isKeySet={isPerplexityKeySet}
              onSave={savePerplexityApiKey}
              onClear={clearPerplexityApiKey}
              onStartEdit={() => setEditingPerplexity(true)}
              editing={editingPerplexity}
              onCancelEdit={() => {
                setPerplexityInputKey('');
                setEditingPerplexity(false);
              }}
              inputKey={perplexityInputKey}
              onInputChange={setPerplexityInputKey}
              showKey={showPerplexityKey}
              onToggleShow={() => setShowPerplexityKey(!showPerplexityKey)}
              keyPlaceholder="pplx-..."
              keyLabel="Perplexity"
              saveButtonText="Save Perplexity Key"
              docsUrl="https://www.perplexity.ai/settings/api"
              docsText="Perplexity Settings"
            />
          </TabsContent>
          </div>
        </Tabs>
        
        <div className="text-xs text-gray-700 pt-2">
          <p>• Clear your browser data to remove stored keys</p>
          <p>• Keys persist across page reloads and browser sessions</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyDialog;
