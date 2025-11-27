import React, { useState } from 'react';
import { Brain, RefreshCw, Bot, Sparkles, Search, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

interface Insight {
  type: 'warning' | 'success' | 'info';
  message: string;
  aiSource?: 'chatgpt' | 'claude' | 'gemini' | 'perplexity';
}

interface AIInsightsProps {
  storyBlocks: any[];
  aiInsights: Insight[];
  runningAnalysis: boolean;
  onRunAnalysis: (selectedAIs: string[]) => void;
}

const AIInsights: React.FC<AIInsightsProps> = ({
  storyBlocks,
  aiInsights,
  runningAnalysis,
  onRunAnalysis,
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
      setSelectedAIs([aiOptions[0].id]); // Keep at least one selected
    } else {
      setSelectedAIs(aiOptions.map(ai => ai.id));
    }
  };

  const getAIBadge = (aiSource?: string) => {
    const ai = aiOptions.find(a => a.id === aiSource);
    if (!ai) return null;
    const Icon = ai.icon;
    return (
      <Badge variant="outline" className="text-xs">
        <Icon className={`w-3 h-3 mr-1 ${ai.color}`} />
        {ai.name}
      </Badge>
    );
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Brain className="w-5 h-5" />
          AI Insights
        </h3>
      </div>

      {/* AI Selection */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Select AI(s) for Analysis:</span>
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
        <div className="grid grid-cols-2 gap-2">
          {aiOptions.map((ai) => {
            const Icon = ai.icon;
            return (
              <div key={ai.id} className="flex items-center gap-2">
                <Checkbox
                  id={ai.id}
                  checked={selectedAIs.includes(ai.id)}
                  onCheckedChange={() => handleAIToggle(ai.id)}
                />
                <label
                  htmlFor={ai.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1 cursor-pointer"
                >
                  <Icon className={`w-3 h-3 ${ai.color}`} />
                  {ai.name}
                </label>
              </div>
            );
          })}
        </div>
      </div>

      <Button 
        onClick={() => onRunAnalysis(selectedAIs)}
        disabled={storyBlocks.length === 0 || runningAnalysis || selectedAIs.length === 0} 
        size="sm"
        className="w-full mb-4"
      >
        {runningAnalysis ? (
          <>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Analyzing with {selectedAIs.length} AI{selectedAIs.length > 1 ? 's' : ''}...
          </>
        ) : (
          <>
            <Brain className="w-4 h-4 mr-2" />
            Analyze with {selectedAIs.length} AI{selectedAIs.length > 1 ? 's' : ''}
          </>
        )}
      </Button>

      <div className="space-y-3">
        {storyBlocks.length === 0 ? (
          <div className="p-3 rounded-lg border bg-gray-50 text-gray-500">
            <p className="text-sm">Add content blocks to the Story Arc to see AI insights</p>
          </div>
        ) : aiInsights.length === 0 ? (
          <div className="p-3 rounded-lg border bg-gray-50 text-gray-500">
            <p className="text-sm">Select AI(s) and click "Analyze" for narrative insights</p>
          </div>
        ) : (
          aiInsights.map((insight, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border ${
                insight.type === 'warning'
                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                  : insight.type === 'success'
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-sm flex-1">{insight.message}</p>
                {insight.aiSource && getAIBadge(insight.aiSource)}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default AIInsights;
