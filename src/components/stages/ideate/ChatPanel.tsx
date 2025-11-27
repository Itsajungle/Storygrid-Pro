
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Send, Loader2 } from 'lucide-react';
import { ChatMessage, LoadingStates } from './types';
import AddToBoard from '@/components/AddToBoard';

interface ChatPanelProps {
  title: string;
  subtitle: string;
  source: 'chatgpt' | 'claude';
  messages: ChatMessage[];
  input: string;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  isKeySet: boolean;
  isLoading: boolean;
  gradientColors: string;
  placeholder: string;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  title,
  subtitle,
  source,
  messages,
  input,
  onInputChange,
  onSendMessage,
  isKeySet,
  isLoading,
  gradientColors,
  placeholder
}) => {
  const filteredMessages = messages.filter(msg => msg.source === source);

  return (
    <Card className="ai-chat-panel flex flex-col">
      <div className={`p-4 border-b ${gradientColors} text-white rounded-t-xl`}>
        <h3 className="font-semibold flex items-center gap-2">
          <div className="w-3 h-3 bg-white rounded-full"></div>
          {title}
          {!isKeySet && (
            <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
              No API Key
            </Badge>
          )}
        </h3>
        <p className={`text-sm ${source === 'chatgpt' ? 'text-green-100' : 'text-orange-100'}`}>
          {subtitle}
        </p>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {filteredMessages.map((message) => (
            <div
              key={message.id}
              className={`p-3 rounded-lg ${
                message.role === 'user'
                  ? source === 'chatgpt' 
                    ? 'bg-green-100 text-green-900 ml-4'
                    : 'bg-orange-100 text-orange-900 ml-4'
                  : 'bg-white border text-gray-900 mr-4'
              }`}
            >
              {message.content}
              {message.role === 'assistant' && (
                <div className="mt-2 flex justify-end">
                  <AddToBoard 
                    content={message.content} 
                    source={source} 
                  />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="bg-white border text-gray-900 mr-4 p-3 rounded-lg flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {title} is thinking...
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            placeholder={placeholder}
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            className="resize-none"
            rows={2}
            disabled={!isKeySet || isLoading}
          />
          <Button 
            onClick={onSendMessage} 
            size="sm"
            disabled={!isKeySet || !input.trim() || isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ChatPanel;
