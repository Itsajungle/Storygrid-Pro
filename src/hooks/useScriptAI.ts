
import { useState } from 'react';
import { toast } from 'sonner';
import { useApiKeyManager } from './useApiKeyManager';
import { useAIDrafts } from './useAIDrafts';
import { callOpenAI } from '@/services/openaiService';
import { parseGeneratedContent } from '@/utils/scriptContentParser';

export const useScriptAI = () => {
  const [generatingScript, setGeneratingScript] = useState(false);
  const { isOpenaiKeySet, isClaudeKeySet } = useApiKeyManager();
  const {
    aiDrafts,
    generatingDrafts,
    addDraft,
    useDraft,
    dismissDraft,
    setGenerating
  } = useAIDrafts();

  const regenerateDraft = (model: 'chatgpt' | 'claude', prompt: string) => {
    generateScriptWithAI(prompt, model);
  };

  const generateScriptWithAI = async (prompt: string, model?: 'chatgpt' | 'claude') => {
    console.log('🚀 generateScriptWithAI called with:', { prompt: prompt.substring(0, 50) + '...', model });
    
    if (model === 'chatgpt') {
      // Get fresh API key at the moment of use
      const apiKey = localStorage.getItem('VITE_OPENAI_API_KEY');
      console.log('🔑 Script AI - OpenAI key check:', apiKey ? `${apiKey.substring(0, 10)}...` : 'null');
      
      if (!apiKey || apiKey === 'null' || apiKey === 'undefined') {
        console.error('❌ ChatGPT generation blocked - no valid API key');
        toast.error('OpenAI API key not configured. Please set it up in settings.');
        return;
      }
    }

    if (model === 'claude') {
      // Get fresh API key at the moment of use
      const apiKey = localStorage.getItem('VITE_ANTHROPIC_API_KEY');
      console.log('🔑 Script AI - Claude key check:', apiKey ? `${apiKey.substring(0, 10)}...` : 'null');
      
      if (!apiKey || apiKey === 'null' || apiKey === 'undefined') {
        console.error('❌ Claude generation blocked - no valid API key');
        toast.error('Claude API key not configured. Please set it up in settings.');
        return;
      }
    }

    if (model) {
      console.log(`🤖 Starting ${model} generation`);
      setGenerating(model, true);
      
      try {
        const generatedContent = await callOpenAI(prompt, model);
        addDraft(model, generatedContent as string);
      } catch (error) {
        console.error(`❌ Error generating ${model} draft:`, error);
        // Error handling is done in callOpenAI
      } finally {
        setGenerating(model, false);
      }
    } else {
      // Get fresh API key at the moment of use for default script generation
      const apiKey = localStorage.getItem('VITE_OPENAI_API_KEY');
      
      if (!apiKey || apiKey === 'null' || apiKey === 'undefined') {
        console.error('❌ Script generation blocked - no valid API key');
        toast.error('OpenAI API key not configured. Please set it up in settings.');
        return;
      }

      console.log('📝 Starting full script generation');
      setGeneratingScript(true);
      
      try {
        const generatedContent = await callOpenAI(prompt);
        return parseGeneratedContent(generatedContent as string);
      } catch (error) {
        console.error('❌ Error in full script generation:', error);
        // Error handling is done in callOpenAI
        throw error;
      } finally {
        setGeneratingScript(false);
      }
    }
  };

  return {
    generatingScript,
    aiDrafts,
    generatingDrafts,
    generateScriptWithAI,
    useDraft,
    regenerateDraft,
    dismissDraft,
    isKeySet: isOpenaiKeySet,
    isOpenaiKeySet,
    isClaudeKeySet
  };
};
