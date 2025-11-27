import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Bot, Sparkles, Brain, Zap } from 'lucide-react';

interface HeaderControlsProps {
  isToneCheckEnabled: boolean;
  onToneCheckChange: (enabled: boolean) => void;
  onFactCheck: (selectedAIs: string[]) => void;
  isLoading: boolean;
  hasContent: boolean;
}

const HeaderControls: React.FC<HeaderControlsProps> = ({
  isToneCheckEnabled,
  onToneCheckChange,
  onFactCheck,
  isLoading,
  hasContent
}) => {
  const [selectedAIs, setSelectedAIs] = useState<string[]>(['perplexity']);
  
  const aiOptions = [
    { id: 'chatgpt', name: 'ChatGPT', icon: Bot, color: 'text-green-600' },
    { id: 'claude', name: 'Claude', icon: Sparkles, color: 'text-orange-600' },
    { id: 'gemini', name: 'Gemini', icon: Brain, color: 'text-blue-600' },
    { id: 'perplexity', name: 'Perplexity', icon: Search, color: 'text-purple-600' },
  ];

  const handleAIToggle = (aiId: string) => {
    setSelectedAIs(prev => 
      prev.includes(aiId) 
        ? prev.filter(id => id !== aiId)
        : [...prev, aiId]
    );
  };

  const handleSelectAll = () => {
    if (selectedAIs.length === aiOptions.length) {
      setSelectedAIs([aiOptions[3].id]); // Keep Perplexity selected
    } else {
      setSelectedAIs(aiOptions.map(ai => ai.id));
    }
  };

  return (
    <div className="mb-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-jungle-600" />
          <h1 className="text-2xl font-bold text-gray-900">Fact Check</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Switch 
            checked={isToneCheckEnabled} 
            onCheckedChange={onToneCheckChange} 
            id="tone-check" 
          />
          <Label htmlFor="tone-check" className="text-sm text-gray-800">Tone Check</Label>
        </div>
      </div>

      {/* AI Selection Panel */}
      <div className="p-4 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Select AI(s) for Fact Checking:</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSelectAll}
            className="text-xs h-7"
          >
            <Zap className="w-3 h-3 mr-1" />
            {selectedAIs.length === aiOptions.length ? 'Deselect All' : 'Compare All'}
          </Button>
        </div>
        
        <div className="grid grid-cols-4 gap-3 mb-3">
          {aiOptions.map((ai) => {
            const Icon = ai.icon;
            return (
              <div key={ai.id} className="flex items-center gap-2">
                <Checkbox
                  id={`fact-${ai.id}`}
                  checked={selectedAIs.includes(ai.id)}
                  onCheckedChange={() => handleAIToggle(ai.id)}
                />
                <label
                  htmlFor={`fact-${ai.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1 cursor-pointer"
                >
                  <Icon className={`w-3 h-3 ${ai.color}`} />
                  {ai.name}
                </label>
              </div>
            );
          })}
        </div>

        <Button 
          onClick={() => onFactCheck(selectedAIs)} 
          disabled={isLoading || !hasContent || selectedAIs.length === 0}
          className="w-full bg-jungle-600 hover:bg-jungle-700 text-white"
        >
          {isLoading ? (
            <>Analyzing with {selectedAIs.length} AI{selectedAIs.length > 1 ? 's' : ''}...</>
          ) : (
            <>Check Facts with {selectedAIs.length} AI{selectedAIs.length > 1 ? 's' : ''}</>
          )}
        </Button>
      </div>
    </div>
  );
};

export default HeaderControls;
