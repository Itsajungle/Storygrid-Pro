
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, X, RefreshCw } from 'lucide-react';
import { VeracityStatus } from '@/types/veracity';

interface ActionButtonsProps {
  currentStatus?: VeracityStatus;
  onStatusChange: (status: VeracityStatus) => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  currentStatus,
  onStatusChange
}) => {
  return (
    <div className="flex items-center gap-2 mt-2">
      <Button 
        size="sm" 
        variant={currentStatus === 'accepted' ? 'default' : 'outline'}
        onClick={() => onStatusChange('accepted')}
        className={
          currentStatus === 'accepted' 
            ? 'bg-green-600 hover:bg-green-700 text-white border-green-600' 
            : 'bg-white hover:bg-green-50 text-green-700 border-green-300 hover:border-green-400'
        }
      >
        <Check className="h-4 w-4 mr-1" />
        Accept
      </Button>
      <Button 
        size="sm" 
        variant={currentStatus === 'dismissed' ? 'default' : 'outline'}
        onClick={() => onStatusChange('dismissed')}
        className={
          currentStatus === 'dismissed' 
            ? 'bg-red-600 hover:bg-red-700 text-white border-red-600' 
            : 'bg-white hover:bg-red-50 text-red-700 border-red-300 hover:border-red-400'
        }
      >
        <X className="h-4 w-4 mr-1" />
        Dismiss
      </Button>
      <Button 
        size="sm" 
        variant={currentStatus === 'needs-rewrite' ? 'default' : 'outline'}
        onClick={() => onStatusChange('needs-rewrite')}
        className={
          currentStatus === 'needs-rewrite' 
            ? 'bg-orange-600 hover:bg-orange-700 text-white border-orange-600' 
            : 'bg-white hover:bg-orange-50 text-orange-700 border-orange-300 hover:border-orange-400'
        }
      >
        <RefreshCw className="h-4 w-4 mr-1" />
        Needs Rewrite
      </Button>
    </div>
  );
};

export default ActionButtons;
