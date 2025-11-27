
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FactCheckResult } from '@/types/veracity';

interface ScriptViewerProps {
  content: string;
  flags: FactCheckResult[];
}

const ScriptViewer: React.FC<ScriptViewerProps> = ({ content, flags }) => {
  // Function to highlight text with flags
  const highlightFlaggedText = () => {
    if (!flags.length) return <p className="whitespace-pre-wrap text-gray-900">{content}</p>;
    
    let lastIndex = 0;
    const elements: JSX.Element[] = [];
    const sortedFlags = [...flags].sort((a, b) => a.position.start - b.position.start);
    
    sortedFlags.forEach((flag, idx) => {
      // Text before the flag
      if (flag.position.start > lastIndex) {
        elements.push(
          <span key={`text-${idx}`} className="text-gray-900">{content.slice(lastIndex, flag.position.start)}</span>
        );
      }
      
      // The flagged text with appropriate styling
      const flaggedText = content.slice(flag.position.start, flag.position.end);
      const getStatusColor = () => {
        switch (flag.status) {
          case 'accepted': return 'bg-green-100 border-green-500 text-green-800';
          case 'dismissed': return 'bg-gray-100 border-gray-400 text-gray-600 line-through';
          case 'needs-rewrite': return 'bg-yellow-200 border-amber-500 text-amber-900';
          default: return 'bg-yellow-200 border-red-500 text-red-800';
        }
      };
      
      elements.push(
        <span 
          key={`flag-${idx}`}
          className={`border-b-2 px-1 rounded font-medium ${getStatusColor()}`}
          title={flag.issue}
          data-flag-id={flag.id}
        >
          {flaggedText}
        </span>
      );
      
      lastIndex = flag.position.end;
    });
    
    // Text after the last flag
    if (lastIndex < content.length) {
      elements.push(
        <span key="text-end" className="text-gray-900">{content.slice(lastIndex)}</span>
      );
    }
    
    return <p className="whitespace-pre-wrap text-gray-900 leading-relaxed">{elements}</p>;
  };

  return (
    <div className="prose prose-sm max-w-none bg-white rounded-lg p-4">
      {highlightFlaggedText()}
    </div>
  );
};

export default ScriptViewer;
