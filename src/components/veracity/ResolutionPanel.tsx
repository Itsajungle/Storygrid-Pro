
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, RefreshCw } from 'lucide-react';
import { FactCheckResult, VeracityStatus } from '@/types/veracity';

interface ResolutionPanelProps {
  results: FactCheckResult[];
  onStatusChange: (flagId: string, status: VeracityStatus, comment?: string) => void;
}

const ResolutionPanel: React.FC<ResolutionPanelProps> = ({ results, onStatusChange }) => {
  const [comments, setComments] = useState<Record<string, string>>({});

  const handleCommentChange = (id: string, comment: string) => {
    setComments(prev => ({ ...prev, [id]: comment }));
  };

  const handleSaveComment = (id: string) => {
    const result = results.find(r => r.id === id);
    if (result) {
      onStatusChange(id, result.status, comments[id] || '');
    }
  };

  const getStatusLabel = (status: VeracityStatus) => {
    switch(status) {
      case 'accepted': return 'Accepted';
      case 'dismissed': return 'Dismissed';
      case 'needs-rewrite': return 'Needs Rewrite';
      default: return 'Pending';
    }
  };

  const getStatusColor = (status: VeracityStatus) => {
    switch(status) {
      case 'accepted': return 'bg-green-100 text-green-800 border-green-300';
      case 'dismissed': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'needs-rewrite': return 'bg-amber-100 text-amber-800 border-amber-300';
      default: return 'bg-red-100 text-red-800 border-red-300';
    }
  };

  // Group by status
  const resultsByStatus: Record<VeracityStatus | 'pending', FactCheckResult[]> = {
    'accepted': [],
    'dismissed': [],
    'needs-rewrite': [],
    'pending': []
  };

  results.forEach(result => {
    const status = result.status || 'pending';
    resultsByStatus[status].push(result);
  });

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Check className="h-12 w-12 text-green-500 mb-4" />
        <p className="text-gray-600">No issues to resolve.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(resultsByStatus).map(([status, statusResults]) => {
        if (statusResults.length === 0) return null;
        
        return (
          <div key={status} className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className={`${getStatusColor(status as VeracityStatus)}`}>
                {getStatusLabel(status as VeracityStatus)}
              </Badge>
              <span className="text-sm text-gray-600">{statusResults.length} issues</span>
            </div>
            
            {statusResults.map((result) => (
              <Card key={result.id} className="p-4">
                <div className="mb-2">
                  <h3 className="font-medium text-gray-900">{result.issue}</h3>
                  <p className="text-sm text-gray-600 mt-1">"{result.flaggedText}"</p>
                </div>
                
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reviewer Comments:
                  </label>
                  <Textarea
                    placeholder="Add your comments or reasoning here..."
                    value={comments[result.id] || result.comment || ''}
                    onChange={(e) => handleCommentChange(result.id, e.target.value)}
                    className="mb-2 h-20"
                  />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant={result.status === 'accepted' ? 'default' : 'outline'}
                        onClick={() => onStatusChange(result.id, 'accepted', comments[result.id])}
                        className={result.status === 'accepted' ? 'bg-green-600 hover:bg-green-700' : ''}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                      <Button 
                        size="sm" 
                        variant={result.status === 'dismissed' ? 'default' : 'outline'}
                        onClick={() => onStatusChange(result.id, 'dismissed', comments[result.id])}
                        className={result.status === 'dismissed' ? 'bg-gray-600 hover:bg-gray-700' : ''}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Dismiss
                      </Button>
                      <Button 
                        size="sm" 
                        variant={result.status === 'needs-rewrite' ? 'default' : 'outline'}
                        onClick={() => onStatusChange(result.id, 'needs-rewrite', comments[result.id])}
                        className={result.status === 'needs-rewrite' ? 'bg-amber-600 hover:bg-amber-700' : ''}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Needs Rewrite
                      </Button>
                    </div>
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleSaveComment(result.id)}
                    >
                      Save Comment
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default ResolutionPanel;
