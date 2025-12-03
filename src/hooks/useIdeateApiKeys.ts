
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useIdeateApiKeys = () => {
  const [isOpenaiKeySet, setIsOpenaiKeySet] = useState(false);
  const [isClaudeKeySet, setIsClaudeKeySet] = useState(false);
  const [isGeminiKeySet, setIsGeminiKeySet] = useState(false);
  const [isPerplexityKeySet, setIsPerplexityKeySet] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

  const checkApiKeys = useCallback(async () => {
    try {
      console.log('🔧 useIdeateApiKeys - Starting API Key Check');
      
      // First try to load from Supabase
      const { data, error } = await supabase
        .from('api_keys')
        .select('*');
      
      if (!error && data && data.length > 0) {
        console.log('✅ Loaded keys from Supabase:', data.map(k => k.provider));
        
        // Sync to localStorage
        data.forEach(row => {
          switch (row.provider) {
            case 'openai':
              if (isValidOpenAIKey(row.api_key)) {
                localStorage.setItem('VITE_OPENAI_API_KEY', row.api_key);
              }
              break;
            case 'claude':
              if (isValidClaudeKey(row.api_key)) {
                localStorage.setItem('VITE_ANTHROPIC_API_KEY', row.api_key);
              }
              break;
            case 'gemini':
              if (isValidGeminiKey(row.api_key)) {
                localStorage.setItem('VITE_GEMINI_API_KEY', row.api_key);
              }
              break;
            case 'perplexity':
              if (isValidPerplexityKey(row.api_key)) {
                localStorage.setItem('VITE_PERPLEXITY_API_KEY', row.api_key);
              }
              break;
          }
        });
      } else if (error) {
        console.warn('⚠️ Supabase query error, falling back to localStorage:', error);
      }
      
      // Get API keys from localStorage (either synced from Supabase or already there)
      const openaiKey = localStorage.getItem('VITE_OPENAI_API_KEY');
      const claudeKey = localStorage.getItem('VITE_ANTHROPIC_API_KEY');
      const geminiKey = localStorage.getItem('VITE_GEMINI_API_KEY');
      const perplexityKey = localStorage.getItem('VITE_PERPLEXITY_API_KEY');
      
      console.log('🔧 useIdeateApiKeys - Fresh API Key Check:', {
        openaiKey: openaiKey ? `${openaiKey.substring(0, 10)}...` : 'null',
        claudeKey: claudeKey ? `${claudeKey.substring(0, 10)}...` : 'null',
        geminiKey: geminiKey ? `${geminiKey.substring(0, 10)}...` : 'null',
        perplexityKey: perplexityKey ? `${perplexityKey.substring(0, 10)}...` : 'null',
      });
      
      const openaiKeyValid = isValidOpenAIKey(openaiKey);
      const claudeKeyValid = isValidClaudeKey(claudeKey);
      const geminiKeyValid = isValidGeminiKey(geminiKey);
      const perplexityKeyValid = isValidPerplexityKey(perplexityKey);
      
      console.log('🔧 useIdeateApiKeys - Key Validation Results:', {
        openaiKeyValid,
        claudeKeyValid,
        geminiKeyValid,
        perplexityKeyValid
      });
      
      setIsOpenaiKeySet(openaiKeyValid);
      setIsClaudeKeySet(claudeKeyValid);
      setIsGeminiKeySet(geminiKeyValid);
      setIsPerplexityKeySet(perplexityKeyValid);
      setIsLoading(false);
    } catch (error) {
      console.error('❌ Error checking API keys:', error);
      setIsOpenaiKeySet(false);
      setIsClaudeKeySet(false);
      setIsGeminiKeySet(false);
      setIsPerplexityKeySet(false);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial check with Supabase load
    checkApiKeys();

    // Listen for storage changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'VITE_OPENAI_API_KEY' || e.key === 'VITE_ANTHROPIC_API_KEY' || 
          e.key === 'VITE_GEMINI_API_KEY' || e.key === 'VITE_PERPLEXITY_API_KEY') {
        console.log('🔧 Storage change detected for API keys');
        checkApiKeys();
      }
    };
    
    // Listen for custom events from same tab
    const handleApiKeyUpdate = () => {
      console.log('🔧 API key update event received');
      checkApiKeys();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('apiKeyUpdated', handleApiKeyUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('apiKeyUpdated', handleApiKeyUpdate);
    };
  }, [checkApiKeys]);

  return {
    isOpenaiKeySet,
    isClaudeKeySet,
    isGeminiKeySet,
    isPerplexityKeySet,
    isLoading,
    refreshKeys: checkApiKeys
  };
};
