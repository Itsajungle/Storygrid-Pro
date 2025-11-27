import { useState } from 'react';
import { callAI, AIProvider } from '@/services/aiService';
import { ChatMessage, LoadingStates } from '@/components/stages/ideate/types';

export const useAIChat = () => {
  const [inputs, setInputs] = useState<Record<AIProvider, string>>({
    chatgpt: '',
    claude: '',
    gemini: '',
    perplexity: ''
  });

  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    chatgpt: false,
    claude: false,
    gemini: false,
    perplexity: false
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m here to help you brainstorm ideas for "It\'s a Jungle". What topic would you like to explore today?',
      source: 'chatgpt'
    },
    {
      id: '2',
      role: 'assistant',
      content: 'Hi there! Ready to dive deep into some creative storytelling? I can help you structure compelling narratives around any health topic.',
      source: 'claude'
    },
    {
      id: '3',
      role: 'assistant',
      content: 'Greetings! I specialize in comprehensive research and multi-perspective analysis. What health topic shall we explore?',
      source: 'gemini'
    },
    {
      id: '4',
      role: 'assistant',
      content: 'Hey! I can search the latest information and trends. What current health topic would you like me to research?',
      source: 'perplexity'
    }
  ]);

  const setInput = (provider: AIProvider, value: string) => {
    setInputs(prev => ({ ...prev, [provider]: value }));
  };

  const sendMessage = async (provider: AIProvider) => {
    const input = inputs[provider];
    if (!input.trim()) return;

    // Check API key
    const keyMap = {
      chatgpt: 'VITE_OPENAI_API_KEY',
      claude: 'VITE_ANTHROPIC_API_KEY',
      gemini: 'VITE_GEMINI_API_KEY',
      perplexity: 'VITE_PERPLEXITY_API_KEY'
    };

    const apiKey = localStorage.getItem(keyMap[provider]);
    if (!apiKey || apiKey === 'null' || apiKey === 'undefined') {
      return; // Error will be shown by the service
    }

    // Add user message
    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      source: provider
    };
    setChatMessages(prev => [...prev, newUserMessage]);

    // Clear input and set loading
    setInput(provider, '');
    setLoadingStates(prev => ({ ...prev, [provider]: true }));

    try {
      // Get conversation history for this provider
      const history = chatMessages
        .filter(msg => msg.source === provider)
        .map(msg => ({ role: msg.role, content: msg.content }));

      const response = await callAI(provider, input, history);

      const newAiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        source: provider
      };
      setChatMessages(prev => [...prev, newAiMessage]);
    } catch (error) {
      console.error(`Error getting ${provider} response:`, error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [provider]: false }));
    }
  };

  const sendToAll = async (prompt: string) => {
    if (!prompt.trim()) return;

    const providers: AIProvider[] = ['chatgpt', 'claude', 'gemini', 'perplexity'];
    
    // Add user messages for all providers
    const timestamp = Date.now();
    const userMessages: ChatMessage[] = providers.map((provider, index) => ({
      id: `${timestamp}-${index}`,
      role: 'user',
      content: prompt,
      source: provider
    }));
    setChatMessages(prev => [...prev, ...userMessages]);

    // Set all as loading
    setLoadingStates({
      chatgpt: true,
      claude: true,
      gemini: true,
      perplexity: true
    });

    // Call all AIs in parallel
    const promises = providers.map(async (provider) => {
      const keyMap = {
        chatgpt: 'VITE_OPENAI_API_KEY',
        claude: 'VITE_ANTHROPIC_API_KEY',
        gemini: 'VITE_GEMINI_API_KEY',
        perplexity: 'VITE_PERPLEXITY_API_KEY'
      };

      const apiKey = localStorage.getItem(keyMap[provider]);
      if (!apiKey || apiKey === 'null' || apiKey === 'undefined') {
        setLoadingStates(prev => ({ ...prev, [provider]: false }));
        return null;
      }

      try {
        const history = chatMessages
          .filter(msg => msg.source === provider)
          .map(msg => ({ role: msg.role, content: msg.content }));

        const response = await callAI(provider, prompt, history);

        const newAiMessage: ChatMessage = {
          id: `${Date.now()}-${provider}`,
          role: 'assistant',
          content: response,
          source: provider
        };
        setChatMessages(prev => [...prev, newAiMessage]);
        return newAiMessage;
      } catch (error) {
        console.error(`Error getting ${provider} response:`, error);
        return null;
      } finally {
        setLoadingStates(prev => ({ ...prev, [provider]: false }));
      }
    });

    await Promise.allSettled(promises);
  };

  return {
    inputs,
    setInput,
    chatMessages,
    loadingStates,
    sendMessage,
    sendToAll
  };
};
