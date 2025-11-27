
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const OPENAI_API_KEY_STORAGE_KEY = 'VITE_OPENAI_API_KEY';
const CLAUDE_API_KEY_STORAGE_KEY = 'VITE_ANTHROPIC_API_KEY';
const GEMINI_API_KEY_STORAGE_KEY = 'VITE_GEMINI_API_KEY';
const PERPLEXITY_API_KEY_STORAGE_KEY = 'VITE_PERPLEXITY_API_KEY';

export const useApiKeyManager = () => {
  const [openaiApiKey, setOpenaiApiKey] = useState<string>('');
  const [claudeApiKey, setClaudeApiKey] = useState<string>('');
  const [geminiApiKey, setGeminiApiKey] = useState<string>('');
  const [perplexityApiKey, setPerplexityApiKey] = useState<string>('');
  const [isOpenaiKeySet, setIsOpenaiKeySet] = useState(false);
  const [isClaudeKeySet, setIsClaudeKeySet] = useState(false);
  const [isGeminiKeySet, setIsGeminiKeySet] = useState(false);
  const [isPerplexityKeySet, setIsPerplexityKeySet] = useState(false);

  useEffect(() => {
    // Load API keys from Supabase on mount
    const loadApiKeys = async () => {
      try {
        console.log('🔧 useApiKeyManager - Loading keys from Supabase');
        
        const { data, error } = await supabase
          .from('api_keys')
          .select('*');
        
        if (error) {
          console.error('❌ Error loading keys from Supabase:', error);
          // Fall back to localStorage
          loadFromLocalStorage();
          return;
        }
        
        if (data && data.length > 0) {
          console.log('✅ Loaded keys from Supabase:', data.map(k => k.provider));
          
          data.forEach(row => {
            switch (row.provider) {
              case 'openai':
                if (isValidOpenAIKey(row.api_key)) {
                  setOpenaiApiKey(row.api_key);
                  setIsOpenaiKeySet(true);
                  // Sync to localStorage for offline access
                  localStorage.setItem(OPENAI_API_KEY_STORAGE_KEY, row.api_key);
                }
                break;
              case 'claude':
                if (isValidClaudeKey(row.api_key)) {
                  setClaudeApiKey(row.api_key);
                  setIsClaudeKeySet(true);
                  localStorage.setItem(CLAUDE_API_KEY_STORAGE_KEY, row.api_key);
                }
                break;
              case 'gemini':
                if (isValidGeminiKey(row.api_key)) {
                  setGeminiApiKey(row.api_key);
                  setIsGeminiKeySet(true);
                  localStorage.setItem(GEMINI_API_KEY_STORAGE_KEY, row.api_key);
                }
                break;
              case 'perplexity':
                if (isValidPerplexityKey(row.api_key)) {
                  setPerplexityApiKey(row.api_key);
                  setIsPerplexityKeySet(true);
                  localStorage.setItem(PERPLEXITY_API_KEY_STORAGE_KEY, row.api_key);
                }
                break;
            }
          });
        } else {
          // No keys in Supabase, check localStorage
          loadFromLocalStorage();
        }
      } catch (error) {
        console.error('❌ Error loading API keys:', error);
        loadFromLocalStorage();
      }
    };
    
    const loadFromLocalStorage = () => {
      const storedOpenaiKey = localStorage.getItem(OPENAI_API_KEY_STORAGE_KEY);
      const storedClaudeKey = localStorage.getItem(CLAUDE_API_KEY_STORAGE_KEY);
      const storedGeminiKey = localStorage.getItem(GEMINI_API_KEY_STORAGE_KEY);
      const storedPerplexityKey = localStorage.getItem(PERPLEXITY_API_KEY_STORAGE_KEY);
      
      console.log('🔧 useApiKeyManager - Loading from localStorage');
      
      if (isValidOpenAIKey(storedOpenaiKey)) {
        setOpenaiApiKey(storedOpenaiKey!);
        setIsOpenaiKeySet(true);
      }
      
      if (isValidClaudeKey(storedClaudeKey)) {
        setClaudeApiKey(storedClaudeKey!);
        setIsClaudeKeySet(true);
      }
      
      if (isValidGeminiKey(storedGeminiKey)) {
        setGeminiApiKey(storedGeminiKey!);
        setIsGeminiKeySet(true);
      }
      
      if (isValidPerplexityKey(storedPerplexityKey)) {
        setPerplexityApiKey(storedPerplexityKey!);
        setIsPerplexityKeySet(true);
      }
    };

    loadApiKeys();
  }, []);

  const isValidOpenAIKey = (key: string | null): boolean => {
    return !!(key && typeof key === 'string' && key.trim() !== '' && key !== 'null' && key !== 'undefined' && key.startsWith('sk-'));
  };

  const isValidClaudeKey = (key: string | null): boolean => {
    return !!(key && typeof key === 'string' && key.trim() !== '' && key !== 'null' && key !== 'undefined' && key.startsWith('sk-ant-'));
  };

  const isValidGeminiKey = (key: string | null): boolean => {
    return !!(key && typeof key === 'string' && key.trim() !== '' && key !== 'null' && key !== 'undefined');
  };

  const isValidPerplexityKey = (key: string | null): boolean => {
    return !!(key && typeof key === 'string' && key.trim() !== '' && key !== 'null' && key !== 'undefined' && key.startsWith('pplx-'));
  };

  const saveOpenaiApiKey = async (key: string) => {
    const trimmedKey = key.trim();
    if (!trimmedKey || !trimmedKey.startsWith('sk-')) {
      toast.error('Please enter a valid OpenAI API key (starts with sk-)');
      return false;
    }
    
    try {
      console.log('💾 Saving OpenAI API key to Supabase:', `${trimmedKey.substring(0, 10)}...`);
      
      // Save to Supabase
      const { error } = await supabase
        .from('api_keys')
        .upsert({ provider: 'openai', api_key: trimmedKey }, { onConflict: 'provider' });
      
      if (error) {
        console.error('❌ Error saving to Supabase:', error);
        toast.error('Failed to save OpenAI API key to database');
        return false;
      }
      
      // Also save to localStorage for offline access
      localStorage.setItem(OPENAI_API_KEY_STORAGE_KEY, trimmedKey);
      setOpenaiApiKey(trimmedKey);
      setIsOpenaiKeySet(true);
      toast.success('OpenAI API key saved and synced across devices');
      
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('apiKeyUpdated'));
      return true;
    } catch (error) {
      console.error('❌ Error saving OpenAI API key:', error);
      toast.error('Failed to save OpenAI API key');
      return false;
    }
  };

  const saveClaudeApiKey = async (key: string) => {
    const trimmedKey = key.trim();
    if (!trimmedKey || !trimmedKey.startsWith('sk-ant-')) {
      toast.error('Please enter a valid Claude API key (starts with sk-ant-)');
      return false;
    }
    
    try {
      console.log('💾 Saving Claude API key to Supabase:', `${trimmedKey.substring(0, 10)}...`);
      
      const { error } = await supabase
        .from('api_keys')
        .upsert({ provider: 'claude', api_key: trimmedKey }, { onConflict: 'provider' });
      
      if (error) {
        console.error('❌ Error saving to Supabase:', error);
        toast.error('Failed to save Claude API key to database');
        return false;
      }
      
      localStorage.setItem(CLAUDE_API_KEY_STORAGE_KEY, trimmedKey);
      setClaudeApiKey(trimmedKey);
      setIsClaudeKeySet(true);
      toast.success('Claude API key saved and synced across devices');
      
      window.dispatchEvent(new CustomEvent('apiKeyUpdated'));
      return true;
    } catch (error) {
      console.error('❌ Error saving Claude API key:', error);
      toast.error('Failed to save Claude API key');
      return false;
    }
  };

  const clearOpenaiApiKey = () => {
    try {
      console.log('🗑️ Clearing OpenAI API key from localStorage');
      localStorage.removeItem(OPENAI_API_KEY_STORAGE_KEY);
      setOpenaiApiKey('');
      setIsOpenaiKeySet(false);
      toast.success('OpenAI API key cleared');
      
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('apiKeyUpdated'));
    } catch (error) {
      console.error('❌ Error clearing OpenAI API key:', error);
      toast.error('Failed to clear OpenAI API key');
    }
  };

  const clearClaudeApiKey = () => {
    try {
      console.log('🗑️ Clearing Claude API key from localStorage');
      localStorage.removeItem(CLAUDE_API_KEY_STORAGE_KEY);
      setClaudeApiKey('');
      setIsClaudeKeySet(false);
      toast.success('Claude API key cleared');
      
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('apiKeyUpdated'));
    } catch (error) {
      console.error('❌ Error clearing Claude API key:', error);
      toast.error('Failed to clear Claude API key');
    }
  };

  const saveGeminiApiKey = async (key: string) => {
    const trimmedKey = key.trim();
    if (!trimmedKey) {
      toast.error('Please enter a valid Gemini API key');
      return false;
    }
    
    try {
      console.log('💾 Saving Gemini API key to Supabase:', `${trimmedKey.substring(0, 10)}...`);
      
      const { error } = await supabase
        .from('api_keys')
        .upsert({ provider: 'gemini', api_key: trimmedKey }, { onConflict: 'provider' });
      
      if (error) {
        console.error('❌ Error saving to Supabase:', error);
        toast.error('Failed to save Gemini API key to database');
        return false;
      }
      
      localStorage.setItem(GEMINI_API_KEY_STORAGE_KEY, trimmedKey);
      setGeminiApiKey(trimmedKey);
      setIsGeminiKeySet(true);
      toast.success('Gemini API key saved and synced across devices');
      
      window.dispatchEvent(new CustomEvent('apiKeyUpdated'));
      return true;
    } catch (error) {
      console.error('❌ Error saving Gemini API key:', error);
      toast.error('Failed to save Gemini API key');
      return false;
    }
  };

  const clearGeminiApiKey = () => {
    try {
      console.log('🗑️ Clearing Gemini API key from localStorage');
      localStorage.removeItem(GEMINI_API_KEY_STORAGE_KEY);
      setGeminiApiKey('');
      setIsGeminiKeySet(false);
      toast.success('Gemini API key cleared');
      
      window.dispatchEvent(new CustomEvent('apiKeyUpdated'));
    } catch (error) {
      console.error('❌ Error clearing Gemini API key:', error);
      toast.error('Failed to clear Gemini API key');
    }
  };

  const savePerplexityApiKey = async (key: string) => {
    const trimmedKey = key.trim();
    if (!trimmedKey || !trimmedKey.startsWith('pplx-')) {
      toast.error('Please enter a valid Perplexity API key (starts with pplx-)');
      return false;
    }
    
    try {
      console.log('💾 Saving Perplexity API key to Supabase:', `${trimmedKey.substring(0, 10)}...`);
      
      const { error } = await supabase
        .from('api_keys')
        .upsert({ provider: 'perplexity', api_key: trimmedKey }, { onConflict: 'provider' });
      
      if (error) {
        console.error('❌ Error saving to Supabase:', error);
        toast.error('Failed to save Perplexity API key to database');
        return false;
      }
      
      localStorage.setItem(PERPLEXITY_API_KEY_STORAGE_KEY, trimmedKey);
      setPerplexityApiKey(trimmedKey);
      setIsPerplexityKeySet(true);
      toast.success('Perplexity API key saved and synced across devices');
      
      window.dispatchEvent(new CustomEvent('apiKeyUpdated'));
      return true;
    } catch (error) {
      console.error('❌ Error saving Perplexity API key:', error);
      toast.error('Failed to save Perplexity API key');
      return false;
    }
  };

  const clearPerplexityApiKey = () => {
    try {
      console.log('🗑️ Clearing Perplexity API key from localStorage');
      localStorage.removeItem(PERPLEXITY_API_KEY_STORAGE_KEY);
      setPerplexityApiKey('');
      setIsPerplexityKeySet(false);
      toast.success('Perplexity API key cleared');
      
      window.dispatchEvent(new CustomEvent('apiKeyUpdated'));
    } catch (error) {
      console.error('❌ Error clearing Perplexity API key:', error);
      toast.error('Failed to clear Perplexity API key');
    }
  };

  const getOpenaiApiKey = () => {
    try {
      const key = localStorage.getItem(OPENAI_API_KEY_STORAGE_KEY);
      console.log('🔑 Getting OpenAI API key:', key ? `${key.substring(0, 10)}...` : 'null');
      return isValidOpenAIKey(key) ? key : null;
    } catch (error) {
      console.error('❌ Error getting OpenAI API key:', error);
      return null;
    }
  };

  const getClaudeApiKey = () => {
    try {
      const key = localStorage.getItem(CLAUDE_API_KEY_STORAGE_KEY);
      console.log('🔑 Getting Claude API key:', key ? `${key.substring(0, 10)}...` : 'null');
      return isValidClaudeKey(key) ? key : null;
    } catch (error) {
      console.error('❌ Error getting Claude API key:', error);
      return null;
    }
  };

  const getGeminiApiKey = () => {
    try {
      const key = localStorage.getItem(GEMINI_API_KEY_STORAGE_KEY);
      console.log('🔑 Getting Gemini API key:', key ? `${key.substring(0, 10)}...` : 'null');
      return isValidGeminiKey(key) ? key : null;
    } catch (error) {
      console.error('❌ Error getting Gemini API key:', error);
      return null;
    }
  };

  const getPerplexityApiKey = () => {
    try {
      const key = localStorage.getItem(PERPLEXITY_API_KEY_STORAGE_KEY);
      console.log('🔑 Getting Perplexity API key:', key ? `${key.substring(0, 10)}...` : 'null');
      return isValidPerplexityKey(key) ? key : null;
    } catch (error) {
      console.error('❌ Error getting Perplexity API key:', error);
      return null;
    }
  };

  const refreshKeyStatus = () => {
    const openaiKey = getOpenaiApiKey();
    const claudeKey = getClaudeApiKey();
    const geminiKey = getGeminiApiKey();
    const perplexityKey = getPerplexityApiKey();
    
    setIsOpenaiKeySet(!!openaiKey);
    setIsClaudeKeySet(!!claudeKey);
    setIsGeminiKeySet(!!geminiKey);
    setIsPerplexityKeySet(!!perplexityKey);
    
    if (openaiKey) setOpenaiApiKey(openaiKey);
    if (claudeKey) setClaudeApiKey(claudeKey);
    if (geminiKey) setGeminiApiKey(geminiKey);
    if (perplexityKey) setPerplexityApiKey(perplexityKey);
  };

  return {
    // OpenAI
    openaiApiKey,
    isOpenaiKeySet,
    saveOpenaiApiKey,
    clearOpenaiApiKey,
    getOpenaiApiKey,
    
    // Claude
    claudeApiKey,
    isClaudeKeySet,
    saveClaudeApiKey,
    clearClaudeApiKey,
    getClaudeApiKey,
    
    // Gemini
    geminiApiKey,
    isGeminiKeySet,
    saveGeminiApiKey,
    clearGeminiApiKey,
    getGeminiApiKey,
    
    // Perplexity
    perplexityApiKey,
    isPerplexityKeySet,
    savePerplexityApiKey,
    clearPerplexityApiKey,
    getPerplexityApiKey,
    
    // Utility
    refreshKeyStatus,
    
    // Legacy support for existing code
    apiKey: openaiApiKey,
    isKeySet: isOpenaiKeySet,
    saveApiKey: saveOpenaiApiKey,
    clearApiKey: clearOpenaiApiKey,
    getApiKey: getOpenaiApiKey
  };
};
