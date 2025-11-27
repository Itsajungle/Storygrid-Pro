
import { useState } from 'react';
import { toast } from 'sonner';
import { callOpenAI } from '@/services/openaiService';
import { ChatMessage, LoadingStates } from '@/components/stages/ideate/types';

export const useIdeateChatMessages = () => {
  const [chatGptInput, setChatGptInput] = useState('');
  const [claudeInput, setClaudeInput] = useState('');
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    chatgpt: false,
    claude: false
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
    }
  ]);

  const sendMessage = async (source: 'chatgpt' | 'claude') => {
    const input = source === 'chatgpt' ? chatGptInput : claudeInput;
    if (!input.trim()) return;

    // Check API keys with fresh localStorage access at the moment of use
    const openaiKey = localStorage.getItem('VITE_OPENAI_API_KEY');
    const claudeKey = localStorage.getItem('VITE_ANTHROPIC_API_KEY');
    
    console.log('🔧 sendMessage - Fresh API Key check at send time:', {
      source,
      openaiKey: openaiKey ? `${openaiKey.substring(0, 10)}...` : 'null',
      claudeKey: claudeKey ? `${claudeKey.substring(0, 10)}...` : 'null',
      openaiKeyValid: !!(openaiKey && openaiKey !== 'null' && openaiKey !== 'undefined'),
      claudeKeyValid: !!(claudeKey && claudeKey !== 'null' && claudeKey !== 'undefined')
    });

    if (source === 'chatgpt') {
      if (!openaiKey || openaiKey === 'null' || openaiKey === 'undefined') {
        console.error('❌ ChatGPT blocked - no valid OpenAI API key');
        toast.error('OpenAI API key not configured. Please set it up in settings.');
        return;
      }
    }
    
    if (source === 'claude') {
      if (!claudeKey || claudeKey === 'null' || claudeKey === 'undefined') {
        console.error('❌ Claude blocked - no valid Claude API key');
        toast.error('Claude API key not configured. Please set it up in settings.');
        return;
      }
    }

    const newUserMessage: ChatMessage = { 
      id: Date.now().toString(), 
      role: 'user', 
      content: input, 
      source 
    };
    setChatMessages(prev => [...prev, newUserMessage]);
    
    // Clear input and set loading state
    if (source === 'chatgpt') {
      setChatGptInput('');
    } else {
      setClaudeInput('');
    }
    
    setLoadingStates(prev => ({ ...prev, [source]: true }));

    try {
      const ideationPrompt = `You are a creative brainstorming assistant for "It's a Jungle", a health-focused video series. 

User's request: ${input}

Please provide creative, engaging ideas for video content that could include:
- Compelling story angles
- Interview subjects or experts
- Visual demonstrations
- Key health messages
- Narrative structures

Keep your response conversational, creative, and actionable. Focus on practical ideas that could become content blocks for video production.`;

      console.log(`🔧 About to call ${source} API with fresh key check`);
      
      const response = await callOpenAI(ideationPrompt, source);
      
      const newAiMessage: ChatMessage = { 
        id: Date.now().toString(), 
        role: 'assistant', 
        content: response as string, 
        source 
      };
      setChatMessages(prev => [...prev, newAiMessage]);
      
    } catch (error) {
      console.error(`❌ Error getting ${source} response:`, error);
      // Error handling is done in callOpenAI service
    } finally {
      setLoadingStates(prev => ({ ...prev, [source]: false }));
    }
  };

  return {
    chatGptInput,
    setChatGptInput,
    claudeInput,
    setClaudeInput,
    chatMessages,
    loadingStates,
    sendMessage
  };
};
