
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, RefreshCw, X } from 'lucide-react';
import { AIDraft } from './types';

interface AIDraftPreviewsProps {
  aiDrafts: AIDraft[];
  generatingDrafts: { chatgpt: boolean; claude: boolean };
  onUseDraft: (draftId: string) => void;
  onRegenerateDraft: (model: 'chatgpt' | 'claude') => void;
  onDismissDraft: (draftId: string) => void;
}

const AIDraftPreviews: React.FC<AIDraftPreviewsProps> = ({
  aiDrafts,
  generatingDrafts,
  onUseDraft,
  onRegenerateDraft,
  onDismissDraft
}) => {
  if (aiDrafts.length === 0) return null;

  return (
    <div className="mt-4 space-y-4 w-full">
      {aiDrafts.map((draft) => (
        <Card 
          key={draft.id} 
          className="border-2 w-full"
        >
          <div className="p-4 flex items-start justify-between gap-3 border-b border-gray-200">
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge 
                variant="outline" 
                className={draft.model === 'chatgpt' 
                  ? 'bg-green-50 text-green-800 border-green-300' 
                  : 'bg-blue-50 text-blue-800 border-blue-300'
                }
              >
                {draft.model === 'chatgpt' ? 'ChatGPT Draft' : 'Claude Draft'}
              </Badge>
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {draft.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                size="sm"
                onClick={() => onUseDraft(draft.id)}
                className="h-8 px-3 text-xs whitespace-nowrap"
              >
                <Check className="w-3 h-3 mr-1" />
                Use This
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onRegenerateDraft(draft.model)}
                className="h-8 px-3 text-xs whitespace-nowrap"
                disabled={generatingDrafts[draft.model]}
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Regenerate
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDismissDraft(draft.id)}
                className="h-8 px-3 text-xs hover:bg-gray-100 whitespace-nowrap"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <div className="p-4 text-sm text-gray-700 bg-gray-50 w-full">
            <div className="min-h-[120px] max-h-[400px] overflow-y-auto w-full">
              {draft.content.split('\n').map((line, index) => (
                <p 
                  key={index} 
                  className="mb-2 last:mb-0 leading-relaxed break-words whitespace-pre-wrap w-full"
                >
                  {line || <br />}
                </p>
              ))}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default AIDraftPreviews;
