import { toast } from 'sonner';

export type AIProvider = 'chatgpt' | 'claude' | 'gemini' | 'perplexity';

// ChatGPT/OpenAI
export const callChatGPT = async (prompt: string, conversationHistory: Array<{role: string, content: string}> = []): Promise<string> => {
  const apiKey = localStorage.getItem('VITE_OPENAI_API_KEY');
  
  if (!apiKey || apiKey === 'null' || apiKey === 'undefined') {
    toast.error('OpenAI API key not configured. Please set it up in settings.');
    throw new Error('OpenAI API key not configured');
  }

  try {
    const messages = [
      {
        role: 'system',
        content: 'You are a creative brainstorming assistant for "It\'s a Jungle", a health-focused video series. Help users develop compelling story ideas, interview subjects, visual concepts, and narrative structures. Be conversational, creative, and actionable.'
      },
      ...conversationHistory,
      {
        role: 'user',
        content: prompt
      }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages,
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    toast.error('Failed to get response from ChatGPT. Please check your API key.');
    throw error;
  }
};

// Claude/Anthropic (via Supabase proxy to avoid CORS)
export const callClaude = async (prompt: string, conversationHistory: Array<{role: string, content: string}> = []): Promise<string> => {
  const apiKey = localStorage.getItem('VITE_ANTHROPIC_API_KEY');
  
  if (!apiKey || apiKey === 'null' || apiKey === 'undefined') {
    toast.error('Claude API key not configured. Please set it up in settings.');
    throw new Error('Claude API key not configured');
  }

  try {
    // Use Supabase Edge Function proxy
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yljdgsywqombavyzxhqj.supabase.co';
    const proxyUrl = `${supabaseUrl}/functions/v1/claude-proxy`;
    
    console.log('Claude: ENV VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('Claude: Constructed supabaseUrl:', supabaseUrl);
    console.log('Claude: Calling proxy at:', proxyUrl);
    console.log('Claude: API key format check:', {
      exists: !!apiKey,
      startsWithSkAnt: apiKey?.startsWith('sk-ant-'),
      length: apiKey?.length,
      firstChars: apiKey?.substring(0, 15)
    });

    const requestBody = {
      prompt,
      apiKey,
      conversationHistory
    };
    console.log('Claude: Request body:', { ...requestBody, apiKey: apiKey?.substring(0, 15) + '...' });

    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsamRnc3l3cW9tYmF2eXp4aHFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5OTI3MDgsImV4cCI6MjA3OTU2ODcwOH0.w43aH-aO0CJ7k-niuRNzlx-tV-FhXYaUCMqMLqJLM9k';

    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'apikey': supabaseAnonKey,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Claude: Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Claude proxy error:', { status: response.status, errorData });
      const errorMessage = errorData.error?.message || errorData.error || `Proxy returned status ${response.status}`;
      toast.error(`Claude error: ${errorMessage}`);
      throw new Error(`Claude API error: ${response.status} - ${errorMessage}`);
    }

    const data = await response.json();
    if (!data.content) {
      console.error('Unexpected Claude response format:', data);
      toast.error('Claude returned an unexpected response format');
      throw new Error('Invalid response format from Claude');
    }
    return data.content;
  } catch (error: any) {
    console.error('Claude API error:', error);
    if (!error.message?.includes('Claude')) {
      toast.error('Failed to get response from Claude. Please check your API key.');
    }
    throw error;
  }
};

// Google Gemini
export const callGemini = async (prompt: string, conversationHistory: Array<{role: string, content: string}> = []): Promise<string> => {
  const apiKey = localStorage.getItem('VITE_GEMINI_API_KEY');
  
  if (!apiKey || apiKey === 'null' || apiKey === 'undefined') {
    toast.error('Gemini API key not configured. Please set it up in settings.');
    throw new Error('Gemini API key not configured');
  }

  try {
    const contents = [
      ...conversationHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      })),
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ];

    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1500,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Gemini API error:', { status: response.status, errorData });
      const errorMessage = errorData.error?.message || `API returned status ${response.status}`;
      toast.error(`Gemini error: ${errorMessage}`);
      throw new Error(`Gemini API error: ${response.status} - ${errorMessage}`);
    }

    const data = await response.json();
    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      console.error('Unexpected Gemini response format:', data);
      toast.error('Gemini returned an unexpected response format');
      throw new Error('Invalid response format from Gemini');
    }
    return data.candidates[0].content.parts[0].text;
  } catch (error: any) {
    console.error('Gemini API error:', error);
    if (!error.message?.includes('Gemini')) {
      toast.error('Failed to get response from Gemini. Please check your API key.');
    }
    throw error;
  }
};

// Perplexity
export const callPerplexity = async (prompt: string, conversationHistory: Array<{role: string, content: string}> = []): Promise<string> => {
  const apiKey = localStorage.getItem('VITE_PERPLEXITY_API_KEY');
  
  if (!apiKey || apiKey === 'null' || apiKey === 'undefined') {
    toast.error('Perplexity API key not configured. Please set it up in settings.');
    throw new Error('Perplexity API key not configured');
  }

  try {
    const messages = [
      {
        role: 'system',
        content: 'You are a real-time research assistant for "It\'s a Jungle", a health-focused video series. Search for the latest information, trends, and credible sources. Provide up-to-date insights with citations when possible.'
      },
      ...conversationHistory,
      {
        role: 'user',
        content: prompt
      }
    ];

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages,
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Perplexity API error:', { status: response.status, errorData });
      const errorMessage = errorData.error?.message || errorData.message || `API returned status ${response.status}`;
      toast.error(`Perplexity error: ${errorMessage}`);
      throw new Error(`Perplexity API error: ${response.status} - ${errorMessage}`);
    }

    const data = await response.json();
    if (!data.choices || !data.choices[0]?.message?.content) {
      console.error('Unexpected Perplexity response format:', data);
      toast.error('Perplexity returned an unexpected response format');
      throw new Error('Invalid response format from Perplexity');
    }
    return data.choices[0].message.content;
  } catch (error: any) {
    console.error('Perplexity API error:', error);
    if (!error.message?.includes('Perplexity')) {
      toast.error('Failed to get response from Perplexity. Please check your API key.');
    }
    throw error;
  }
};

// Unified call function
export const callAI = async (
  provider: AIProvider,
  prompt: string,
  conversationHistory: Array<{role: string, content: string}> = []
): Promise<string> => {
  switch (provider) {
    case 'chatgpt':
      return callChatGPT(prompt, conversationHistory);
    case 'claude':
      return callClaude(prompt, conversationHistory);
    case 'gemini':
      return callGemini(prompt, conversationHistory);
    case 'perplexity':
      return callPerplexity(prompt, conversationHistory);
    default:
      throw new Error(`Unknown AI provider: ${provider}`);
  }
};
