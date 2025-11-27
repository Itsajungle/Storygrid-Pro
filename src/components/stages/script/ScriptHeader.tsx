import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Pencil, Bot, Sparkles, Brain, Search, Zap } from 'lucide-react';
import { ScriptBlock } from './types';
import { toneTemplates } from './constants';

interface ScriptHeaderProps {
  currentScript: ScriptBlock;
  tonePrompt: string;
  customTone: string;
  generatingScript: boolean;
  generatingDrafts: { chatgpt: boolean; claude: boolean; gemini: boolean; perplexity: boolean };
  onTonePromptChange: (tone: string) => void;
  onCustomToneChange: (tone: string) => void;
  onScriptChange: (field: keyof ScriptBlock, value: string | number) => void;
  onGenerateScriptWithAI: (model?: 'chatgpt' | 'claude' | 'gemini' | 'perplexity') => void;
  getStatusColor: (status: string) => string;
}

const ScriptHeader: React.FC<ScriptHeaderProps> = ({
  currentScript,
  tonePrompt,
  customTone,
  generatingScript,
  generatingDrafts,
  onTonePromptChange,
  onCustomToneChange,
  onScriptChange,
  onGenerateScriptWithAI,
  getStatusColor
}) => {
  const [selectedAIs, setSelectedAIs] = useState<string[]>(['chatgpt']);
  
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
      setSelectedAIs([aiOptions[0].id]);
    } else {
      setSelectedAIs(aiOptions.map(ai => ai.id));
    }
  };

  const handleGenerateAll = () => {
    selectedAIs.forEach(aiId => {
      onGenerateScriptWithAI(aiId as any);
    });
  };

  return (
    <>
      {/* Script Status */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Select 
            value={currentScript.status} 
            onValueChange={(value: any) => onScriptChange('status', value)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="in-review">In Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="ready-to-film">Ready to Film</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="outline" className={getStatusColor(currentScript.status)}>
            {currentScript.status.replace('-', ' ')}
          </Badge>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <label className="text-sm text-gray-500 mb-1">Tone / Style Prompt</label>
            <div className="flex gap-2">
              <Select 
                value={tonePrompt} 
                onValueChange={onTonePromptChange}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default-tone">Default Tone</SelectItem>
                  {toneTemplates.map((tone, index) => (
                    <SelectItem key={index} value={tone}>{tone}</SelectItem>
                  ))}
                  <SelectItem value="custom">Custom...</SelectItem>
                </SelectContent>
              </Select>
              {tonePrompt === 'custom' && (
                <Input
                  className="w-48"
                  value={customTone}
                  onChange={(e) => onCustomToneChange(e.target.value)}
                  placeholder="Enter custom tone..."
                />
              )}
            </div>
          </div>
          
          <Button 
            onClick={() => onGenerateScriptWithAI()} 
            className="flex items-center gap-2"
            disabled={generatingScript}
          >
            <Pencil className="w-4 h-4" />
            {generatingScript ? "Generating..." : "Draft Script with AI"}
          </Button>
        </div>
      </div>

      {/* AI Selection Panel */}
      <div className="p-4 bg-gray-50 rounded-lg border">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Select AI(s) for Script Generation:</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSelectAll}
            className="text-xs h-7"
          >
            <Zap className="w-3 h-3 mr-1" />
            {selectedAIs.length === aiOptions.length ? 'Deselect All' : 'Generate with All'}
          </Button>
        </div>
        
        <div className="grid grid-cols-4 gap-3 mb-3">
          {aiOptions.map((ai) => {
            const Icon = ai.icon;
            return (
              <div key={ai.id} className="flex items-center gap-2">
                <Checkbox
                  id={`script-${ai.id}`}
                  checked={selectedAIs.includes(ai.id)}
                  onCheckedChange={() => handleAIToggle(ai.id)}
                />
                <label
                  htmlFor={`script-${ai.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1 cursor-pointer"
                >
                  <Icon className={`w-3 h-3 ${ai.color}`} />
                  {ai.name}
                </label>
              </div>
            );
          })}
        </div>

        {/* Individual AI Generation Buttons */}
        <div className="flex gap-2 flex-wrap">
          {aiOptions.map((ai) => {
            const Icon = ai.icon;
            const isGenerating = generatingDrafts[ai.id as keyof typeof generatingDrafts];
            return (
              <Button
                key={ai.id}
                onClick={() => onGenerateScriptWithAI(ai.id as any)}
                disabled={isGenerating || !selectedAIs.includes(ai.id)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Icon className={`w-4 h-4 ${ai.color}`} />
                {isGenerating ? "Generating..." : `Generate with ${ai.name}`}
              </Button>
            );
          })}
          
          {selectedAIs.length > 1 && (
            <Button
              onClick={handleGenerateAll}
              disabled={Object.values(generatingDrafts).some(v => v)}
              size="sm"
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600"
            >
              <Zap className="w-4 h-4" />
              Generate with {selectedAIs.length} AIs
            </Button>
          )}
        </div>
      </div>
    </>
  );
};

export default ScriptHeader;
