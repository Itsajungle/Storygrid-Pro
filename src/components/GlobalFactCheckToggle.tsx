import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { useGlobalFactCheck } from '@/contexts/GlobalFactCheckContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const GlobalFactCheckToggle: React.FC = () => {
  const { isGlobalFactCheckEnabled, toggleGlobalFactCheck, warnings } = useGlobalFactCheck();
  
  const totalWarnings = warnings.reduce((sum, w) => sum + w.issueCount, 0);
  const highSeverityCount = warnings.filter(w => w.severity === 'high').length;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border-2 transition-all cursor-pointer ${
              isGlobalFactCheckEnabled 
                ? 'bg-red-50 border-red-500 shadow-lg shadow-red-500/30' 
                : 'bg-gray-50 border-gray-300 hover:border-gray-400'
            }`}
            onClick={toggleGlobalFactCheck}
          >
            {isGlobalFactCheckEnabled ? (
              <ShieldCheck className="w-4 h-4 text-red-600" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-gray-500" />
            )}
            
            <span className={`font-semibold text-xs whitespace-nowrap ${
              isGlobalFactCheckEnabled ? 'text-red-700' : 'text-gray-600'
            }`}>
              {isGlobalFactCheckEnabled ? 'ON' : 'OFF'}
            </span>
            
            <Switch 
              checked={isGlobalFactCheckEnabled}
              onCheckedChange={toggleGlobalFactCheck}
              className={`scale-75 ${
                isGlobalFactCheckEnabled 
                  ? 'data-[state=checked]:bg-red-600' 
                  : ''
              }`}
            />
            
            <span className={`font-semibold text-xs ${
              isGlobalFactCheckEnabled ? 'text-red-700' : 'text-gray-600'
            }`}>
              Fact Check
            </span>
            
            {isGlobalFactCheckEnabled && totalWarnings > 0 && (
              <Badge 
                variant="destructive" 
                className="bg-yellow-500 text-yellow-900 hover:bg-yellow-600 font-bold text-xs px-1.5 py-0 h-5 min-w-5 flex items-center justify-center rounded-full ml-1"
              >
                {totalWarnings}
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="bg-white border-2 border-gray-200">
          <div className="text-sm">
            {isGlobalFactCheckEnabled ? (
              <>
                <p className="font-bold text-red-600 mb-1">🛡️ Global Fact Check: ON</p>
                <p className="text-xs text-gray-700">All content verified with Perplexity AI</p>
                {totalWarnings > 0 && (
                  <p className="text-xs text-amber-600 mt-2 font-semibold">
                    ⚠️ {totalWarnings} issue{totalWarnings > 1 ? 's' : ''} found
                    {highSeverityCount > 0 && ` (${highSeverityCount} high priority)`}
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="font-bold text-gray-700 mb-1">Fact Check: OFF</p>
                <p className="text-xs text-gray-600">Click to enable real-time verification</p>
                <p className="text-xs text-gray-500 mt-1">Perfect for science & history content</p>
              </>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default GlobalFactCheckToggle;
