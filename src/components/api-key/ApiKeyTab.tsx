
import React, { useState } from 'react';
import { ApiKeyTabProps } from './types';
import KeyDisplaySection from './KeyDisplaySection';
import KeyInputSection from './KeyInputSection';
import KeyActionButtons from './KeyActionButtons';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const ApiKeyTab: React.FC<ApiKeyTabProps> = ({
  apiKey,
  isKeySet,
  onSave,
  onClear,
  onStartEdit,
  editing,
  onCancelEdit,
  inputKey,
  onInputChange,
  showKey,
  onToggleShow,
  keyPlaceholder,
  keyLabel,
  saveButtonText,
  docsUrl,
  docsText
}) => {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const testConnection = async () => {
    if (!isKeySet) {
      toast.error('Please save an API key first');
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      // Determine which AI provider based on keyLabel
      const provider = keyLabel.toLowerCase().includes('openai') ? 'chatgpt' :
                      keyLabel.toLowerCase().includes('claude') ? 'claude' :
                      keyLabel.toLowerCase().includes('gemini') ? 'gemini' :
                      keyLabel.toLowerCase().includes('perplexity') ? 'perplexity' : null;

      if (!provider) {
        throw new Error('Unknown provider');
      }

      // Import the AI service
      const { callAI } = await import('@/services/aiService');
      
      // Log what we're about to test
      console.log('Testing connection for provider:', provider);
      console.log('API key exists:', !!apiKey);
      console.log('API key starts with:', apiKey?.substring(0, 10));
      
      // Test with a simple prompt
      const response = await callAI(provider as any, 'Say "test successful" if you can read this.', []);
      
      console.log('Response received:', response);
      
      setTestResult({
        success: true,
        message: 'Connection successful! API key is working.'
      });
      toast.success(`${keyLabel} API key is working!`);
    } catch (error: any) {
      console.error('Test connection error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      const errorMessage = error.message || 'Unknown error';
      setTestResult({
        success: false,
        message: errorMessage
      });
      toast.error(`Test failed: ${errorMessage}`);
    } finally {
      setTesting(false);
    }
  };
  const handleSave = () => {
    if (onSave(inputKey)) {
      onCancelEdit();
      window.dispatchEvent(new CustomEvent('apiKeyUpdated'));
    }
  };

  const handleClear = () => {
    onClear();
    onCancelEdit();
    window.dispatchEvent(new CustomEvent('apiKeyUpdated'));
  };

  const handleStartEdit = () => {
    onInputChange(apiKey);
    onStartEdit();
  };

  return (
    <div className="space-y-4">
      {isKeySet && !editing && (
        <KeyDisplaySection
          apiKey={apiKey}
          showKey={showKey}
          onToggleShow={onToggleShow}
          keyLabel={keyLabel}
        />
      )}
      
      {(!isKeySet || editing) && (
        <KeyInputSection
          keyId={`${keyLabel.toLowerCase()}-api-key${editing ? '-edit' : ''}`}
          keyLabel={isKeySet && !editing ? `${keyLabel} API Key (Current)` : `${keyLabel} API Key`}
          keyPlaceholder={keyPlaceholder}
          inputKey={inputKey}
          onInputChange={onInputChange}
          showKey={showKey}
          onToggleShow={onToggleShow}
          isEditing={editing}
        />
      )}
      
      <KeyActionButtons
        editing={editing}
        isKeySet={isKeySet}
        inputKey={inputKey}
        onSave={handleSave}
        onStartEdit={handleStartEdit}
        onCancelEdit={onCancelEdit}
        onClear={handleClear}
        saveButtonText={saveButtonText}
        onTestConnection={testConnection}
        testing={testing}
      />
      
      {testResult && (
        <div className={`p-3 rounded-lg border-2 ${testResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-start gap-2">
            {testResult.success ? (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className={`text-sm font-medium ${testResult.success ? 'text-green-900' : 'text-red-900'}`}>
                {testResult.success ? 'Success!' : 'Failed'}
              </p>
              <p className={`text-xs mt-1 ${testResult.success ? 'text-green-700' : 'text-red-700'}`}>
                {testResult.message}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="text-xs text-gray-700 space-y-1">
        <p>• Get your API key from <a href={docsUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">{docsText}</a></p>
        <p>• Keys are stored locally and persist across sessions</p>
      </div>
    </div>
  );
};

export default ApiKeyTab;
