import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

interface FactCheckWarning {
  blockId: string;
  issueCount: number;
  severity: 'high' | 'medium' | 'low';
}

interface GlobalFactCheckContextType {
  isGlobalFactCheckEnabled: boolean;
  toggleGlobalFactCheck: () => void;
  warnings: FactCheckWarning[];
  addWarning: (blockId: string, issueCount: number, severity: 'high' | 'medium' | 'low') => void;
  clearWarning: (blockId: string) => void;
  getWarningForBlock: (blockId: string) => FactCheckWarning | undefined;
}

const GlobalFactCheckContext = createContext<GlobalFactCheckContextType | undefined>(undefined);

export const GlobalFactCheckProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isGlobalFactCheckEnabled, setIsGlobalFactCheckEnabled] = useState(() => {
    const saved = localStorage.getItem('globalFactCheckEnabled');
    return saved === 'true';
  });
  const [warnings, setWarnings] = useState<FactCheckWarning[]>([]);

  useEffect(() => {
    localStorage.setItem('globalFactCheckEnabled', isGlobalFactCheckEnabled.toString());
  }, [isGlobalFactCheckEnabled]);

  const toggleGlobalFactCheck = () => {
    setIsGlobalFactCheckEnabled(prev => {
      const newValue = !prev;
      if (newValue) {
        toast.success('Global Fact Check enabled - All content will be verified', {
          description: 'Using Perplexity AI for real-time fact checking',
          duration: 4000
        });
      } else {
        toast.info('Global Fact Check disabled');
      }
      return newValue;
    });
  };

  const addWarning = (blockId: string, issueCount: number, severity: 'high' | 'medium' | 'low') => {
    setWarnings(prev => {
      const existing = prev.find(w => w.blockId === blockId);
      if (existing) {
        return prev.map(w => w.blockId === blockId ? { blockId, issueCount, severity } : w);
      }
      return [...prev, { blockId, issueCount, severity }];
    });
  };

  const clearWarning = (blockId: string) => {
    setWarnings(prev => prev.filter(w => w.blockId !== blockId));
  };

  const getWarningForBlock = (blockId: string) => {
    return warnings.find(w => w.blockId === blockId);
  };

  return (
    <GlobalFactCheckContext.Provider value={{
      isGlobalFactCheckEnabled,
      toggleGlobalFactCheck,
      warnings,
      addWarning,
      clearWarning,
      getWarningForBlock
    }}>
      {children}
    </GlobalFactCheckContext.Provider>
  );
};

export const useGlobalFactCheck = () => {
  const context = useContext(GlobalFactCheckContext);
  if (!context) {
    throw new Error('useGlobalFactCheck must be used within GlobalFactCheckProvider');
  }
  return context;
};
