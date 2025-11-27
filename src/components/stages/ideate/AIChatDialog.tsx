import React, { useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Send, Loader2, LucideIcon } from 'lucide-react';
import { ChatMessage, AIProvider } from './types';
import AddToBoard from '@/components/AddToBoard';

interface AIChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: AIProvider;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  color: string;
  messages: ChatMessage[];
  input: string;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  isKeySet: boolean;
  isLoading: boolean;
}

const AIChatDialog: React.FC<AIChatDialogProps> = ({
  open,
  onOpenChange,
  provider,
  title,
  subtitle,
  icon: Icon,
  color,
  messages,
  input,
  onInputChange,
  onSendMessage,
  isKeySet,
  isLoading
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const filteredMessages = messages.filter(msg => msg.source === provider);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [filteredMessages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-gray-900">
            <div className={`w-10 h-10 ${color} rounded-full flex items-center justify-center`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                {title}
                {!isKeySet && (
                  <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                    No API Key
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 font-normal">{subtitle}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-lg">
          {filteredMessages.map((message) => (
            <div
              key={message.id}
              className={`p-4 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-100 text-blue-900 ml-8'
                  : 'bg-white border text-gray-900 mr-8 shadow-sm'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              {message.role === 'assistant' && (
                <div className="mt-3 flex justify-end">
                  <AddToBoard 
                    content={message.content} 
                    source={provider} 
                  />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="bg-white border text-gray-900 mr-8 p-4 rounded-lg flex items-center gap-2 shadow-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              {title} is thinking...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Textarea
            placeholder={`Ask ${title} anything...`}
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            className="resize-none bg-white text-gray-900"
            rows={3}
            disabled={!isKeySet || isLoading}
          />
          <Button 
            onClick={onSendMessage} 
            disabled={!isKeySet || !input.trim() || isLoading}
            className={color}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIChatDialog;
