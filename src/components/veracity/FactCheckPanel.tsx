
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, ExternalLink, Check } from 'lucide-react';
import { FactCheckResult, VeracityStatus, CitationStyle } from '@/types/veracity';
import { getConfidenceLabel } from '@/utils/veracity';
import SuggestedFixInput from './SuggestedFixInput';
import ActionButtons from './ActionButtons';

interface FactCheckPanelProps {
  results: FactCheckResult[];
  onStatusChange: (flagId: string, status: VeracityStatus, comment?: string) => void;
  isLoading: boolean;
  citationStyle: CitationStyle;
}

const FactCheckPanel: React.FC<FactCheckPanelProps> = ({ 
  results, 
  onStatusChange,
  isLoading,
  citationStyle = 'inline'
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-jungle-600 mb-4"></div>
        <p className="text-gray-700">Analyzing script for factual accuracy and tone...</p>
      </div>
    );
  }
  
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Check className="h-12 w-12 text-green-500 mb-4" />
        <p className="text-gray-700">No issues found in the current script.</p>
      </div>
    );
  }

  const renderSourceReference = (source: any, index: number) => {
    switch (citationStyle) {
      case 'apa':
        return (
          <li key={index} className="text-xs text-gray-800">
            {source.source}. ({new Date().getFullYear()}). <em>{source.title}</em>. 
            Retrieved from <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{source.url}</a>
          </li>
        );
      case 'mla':
        return (
          <li key={index} className="text-xs text-gray-800">
            "{source.title}." <em>{source.source}</em>, {new Date().toLocaleDateString()}. 
            <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">{source.url}</a>
          </li>
        );
      case 'endnote':
        return (
          <li key={index} className="text-xs flex items-start text-gray-800">
            <span className="mr-2">[{index + 1}]</span>
            <span>
              {source.title}. {source.source}. 
              <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                Link
              </a>
            </span>
          </li>
        );
      case 'inline':
      default:
        return (
          <li key={index} className="text-xs flex items-center text-gray-800">
            <a 
              href={source.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline flex items-center"
            >
              {source.title}
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
            <span className="ml-2 text-gray-600">({source.source})</span>
          </li>
        );
    }
  };

  return (
    <div className="space-y-4">
      {results.map((result) => (
        <Card key={result.id} className="p-4 bg-white border border-gray-300 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              {result.type === 'fact' ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-amber-500" />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <Badge variant={result.type === 'fact' ? 'destructive' : 'outline'} className="mb-2">
                  {result.type === 'fact' ? 'Fact Check' : 'Tone Issue'}
                </Badge>
                
                {result.confidenceRating !== undefined && (
                  <div className="flex flex-col items-end">
                    <Badge variant="outline" className="mb-1 text-gray-800 border-gray-400">
                      {getConfidenceLabel(result.confidenceRating)}
                    </Badge>
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          result.confidenceRating >= 90 ? 'bg-red-500' : 
                          result.confidenceRating >= 70 ? 'bg-orange-500' :
                          result.confidenceRating >= 50 ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`}
                        style={{ width: `${result.confidenceRating}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <h3 className="font-medium text-gray-900 mb-1">{result.issue}</h3>
              <p className="text-sm text-gray-900 mb-3 bg-gray-50 p-2 rounded border">"{result.flaggedText}"</p>
              
              {result.citationSummary && (
                <div className="mb-3 bg-blue-50 p-3 rounded-md border border-blue-200">
                  <h4 className="text-xs font-medium text-blue-900 mb-1">Citation Summary:</h4>
                  <p className="text-sm text-blue-800">{result.citationSummary}</p>
                </div>
              )}
              
              {result.sources && result.sources.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-xs font-medium text-gray-800 mb-1">Sources:</h4>
                  <ul className="space-y-1">
                    {result.sources.map((source, idx) => renderSourceReference(source, idx))}
                  </ul>
                </div>
              )}
              
              {result.suggestion && (
                <div className="mb-3">
                  <h4 className="text-xs font-medium text-gray-800 mb-1">Suggested Fix:</h4>
                  <SuggestedFixInput suggestion={result.suggestion} />
                </div>
              )}
              
              <ActionButtons 
                currentStatus={result.status}
                onStatusChange={(status) => onStatusChange(result.id, status)}
              />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default FactCheckPanel;
