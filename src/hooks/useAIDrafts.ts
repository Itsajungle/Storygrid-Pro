
import { useState } from 'react';
import { toast } from 'sonner';
import { AIDraft } from '@/components/stages/script/types';

export const useAIDrafts = () => {
  const [aiDrafts, setAiDrafts] = useState<AIDraft[]>([]);
  const [generatingDrafts, setGeneratingDrafts] = useState<{ chatgpt: boolean; claude: boolean }>({
    chatgpt: false,
    claude: false
  });

  const addDraft = (model: 'chatgpt' | 'claude', content: string) => {
    const newDraft: AIDraft = {
      id: `${model}-${Date.now()}`,
      model,
      content,
      timestamp: new Date()
    };
    
    setAiDrafts(prev => prev.filter(draft => draft.model !== model).concat(newDraft));
    toast.success(`${model === 'chatgpt' ? 'ChatGPT' : 'Claude'} draft generated`);
  };

  const useDraft = (draftId: string, onScriptChange: (field: string, value: string) => void) => {
    const draft = aiDrafts.find(d => d.id === draftId);
    if (draft) {
      onScriptChange('ears', draft.content);
      toast.success(`Applied ${draft.model === 'chatgpt' ? 'ChatGPT' : 'Claude'} draft to script`);
    }
  };

  const dismissDraft = (draftId: string) => {
    setAiDrafts(prev => prev.filter(draft => draft.id !== draftId));
  };

  const setGenerating = (model: 'chatgpt' | 'claude', isGenerating: boolean) => {
    setGeneratingDrafts(prev => ({ ...prev, [model]: isGenerating }));
  };

  return {
    aiDrafts,
    generatingDrafts,
    addDraft,
    useDraft,
    dismissDraft,
    setGenerating
  };
};
