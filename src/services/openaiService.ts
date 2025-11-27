
import { toast } from 'sonner';

export const callOpenAI = async (prompt: string, model: 'chatgpt' | 'claude' = 'chatgpt') => {
  if (model === 'claude') {
    return callClaude(prompt);
  }

  // Get the API key fresh from localStorage at the moment of call
  const apiKey = localStorage.getItem('VITE_OPENAI_API_KEY');
  console.log('🔑 callOpenAI - Fresh API Key check:', {
    apiKey: apiKey ? `${apiKey.substring(0, 10)}...` : 'null',
    hasKey: !!apiKey,
    keyLength: apiKey?.length,
    keyType: typeof apiKey,
    isNull: apiKey === null,
    isUndefined: apiKey === undefined
  });
  
  if (!apiKey || apiKey === 'null' || apiKey === 'undefined') {
    console.error('❌ OpenAI API Key validation failed:', { apiKey, type: typeof apiKey });
    toast.error('OpenAI API key not configured. Please set it up in settings.');
    throw new Error('OpenAI API key not configured');
  }

  console.log('✅ OpenAI API Key validated, making OpenAI request');

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a professional scriptwriter who creates engaging, well-structured scripts for video content. Write scripts in a three-column format: WHERE (location/setting), EARS (dialogue/narration), and EYES (visual direction). Be creative, engaging, and professional.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API error:', response.status, errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    toast.error('Failed to generate script with OpenAI. Please check your API key.');
    throw error;
  }
};

const callClaude = async (prompt: string) => {
  console.log('🔧 callClaude - Starting Claude request process');
  
  // Get the Claude API key fresh from localStorage at the moment of call
  const apiKey = localStorage.getItem('VITE_ANTHROPIC_API_KEY');
  console.log('🔑 callClaude - Fresh API Key check:', {
    apiKey: apiKey ? `${apiKey.substring(0, 15)}...` : 'null',
    hasKey: !!apiKey,
    keyLength: apiKey?.length,
    keyType: typeof apiKey,
    isNull: apiKey === null,
    isUndefined: apiKey === undefined,
    keyStartsWith: apiKey ? apiKey.substring(0, 7) : 'N/A'
  });
  
  if (!apiKey || apiKey === 'null' || apiKey === 'undefined') {
    console.error('❌ Claude API Key validation failed:', { apiKey, type: typeof apiKey });
    toast.error('Claude API key not configured. Please set it up in settings.');
    throw new Error('Claude API key not configured');
  }

  console.log('🎭 Calling Claude via Supabase proxy');
  
  const requestUrl = 'https://kisndlflmxuovdfqkmoh.supabase.co/functions/v1/claude-proxy';
  const requestBody = {
    prompt: prompt,
    apiKey: apiKey
  };
  
  console.log('🔧 Claude request details:', {
    url: requestUrl,
    method: 'POST',
    hasPrompt: !!prompt,
    promptLength: prompt?.length,
    hasApiKey: !!apiKey,
    requestBodyStringified: JSON.stringify(requestBody).substring(0, 100) + '...'
  });
  
  try {
    console.log('🚀 About to make fetch request to Claude proxy...');
    console.log('🌐 Environment check:', {
      userAgent: navigator.userAgent,
      online: navigator.onLine,
      location: window.location.href
    });
    
    // Test basic fetch capability first
    console.log('🧪 Testing basic fetch capability...');
    
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    }).catch((fetchError) => {
      console.error('💥 Fetch threw an error:', {
        name: fetchError.name,
        message: fetchError.message,
        stack: fetchError.stack,
        cause: fetchError.cause
      });
      throw fetchError;
    });

    console.log('📡 Claude proxy response received:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries()),
      type: response.type,
      url: response.url
    });

    if (!response.ok) {
      let errorText = 'Unknown error';
      try {
        errorText = await response.text();
      } catch (textError) {
        console.error('❌ Failed to read error response text:', textError);
      }
      
      console.error('❌ Claude Proxy API error:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText,
        headers: Object.fromEntries(response.headers.entries())
      });
      throw new Error(`Claude Proxy API error: ${response.status} - ${errorText}`);
    }

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error('❌ Failed to parse JSON response:', jsonError);
      const responseText = await response.text().catch(() => 'Could not read response');
      console.error('❌ Raw response text:', responseText);
      throw new Error('Invalid JSON response from Claude proxy');
    }
    
    console.log('✅ Claude Proxy Response parsed successfully:', {
      hasContent: !!(data.content || data.message || data.response),
      dataKeys: Object.keys(data),
      dataType: typeof data,
      dataString: JSON.stringify(data).substring(0, 200) + '...'
    });
    
    toast.success('Claude content generated successfully');
    
    return data.content || data.message || data.response;
    
  } catch (error) {
    console.error('❌ Claude Proxy Error Details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause,
      errorType: typeof error,
      isNetworkError: error.name === 'TypeError' && error.message.includes('Failed to fetch'),
      isLoadError: error.name === 'TypeError' && error.message === 'Load failed'
    });
    
    // More specific error messages based on error type
    if (error.name === 'TypeError') {
      if (error.message === 'Load failed' || error.message.includes('Failed to fetch')) {
        console.error('❌ Network error - possible CORS, connectivity, or browser security issue');
        toast.error('Network error connecting to Claude proxy. Check your connection and try again.');
      } else {
        console.error('❌ Type error in fetch request');
        toast.error('Request error when calling Claude proxy. Please try again.');
      }
    } else if (error.message.includes('Claude Proxy API error')) {
      toast.error('Claude proxy returned an error. Please check your API key.');
    } else {
      toast.error('Failed to generate content with Claude. Please try again.');
    }
    
    throw error;
  }
};
