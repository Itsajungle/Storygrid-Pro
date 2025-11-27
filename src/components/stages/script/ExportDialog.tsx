
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { FileDown } from 'lucide-react';
import { ScriptBlock } from './types';
import { ContentBlock } from '@/contexts/ContentBlocksContext';

interface ExportDialogProps {
  showExportDialog: boolean;
  onShowExportDialogChange: (show: boolean) => void;
  exportFormat: 'pdf' | 'csv' | 'docx' | 'pages';
  onExportFormatChange: (format: 'pdf' | 'csv' | 'docx' | 'pages') => void;
  exportView: 'teleprompter' | 'director';
  onExportViewChange: (view: 'teleprompter' | 'director') => void;
  exportMode: 'all' | 'selected' | 'individual';
  onExportModeChange: (mode: 'all' | 'selected' | 'individual') => void;
  selectedScripts: string[];
  onToggleScriptSelection: (scriptId: string) => void;
  scriptBlocks: ScriptBlock[];
  contentBlocks: ContentBlock[];
  onExport: () => void;
}

const ExportDialog: React.FC<ExportDialogProps> = ({
  showExportDialog,
  onShowExportDialogChange,
  exportFormat,
  onExportFormatChange,
  exportView,
  onExportViewChange,
  exportMode,
  onExportModeChange,
  selectedScripts,
  onToggleScriptSelection,
  scriptBlocks,
  contentBlocks,
  onExport
}) => {
  return (
    <Dialog open={showExportDialog} onOpenChange={onShowExportDialogChange}>
      <DialogContent className="sm:max-w-md bg-white text-gray-900">
        <DialogHeader>
          <DialogTitle>Export Scripts</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div>
            <label className="block text-sm font-medium mb-2">Export Mode</label>
            <Select 
              value={exportMode} 
              onValueChange={(value: any) => onExportModeChange(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Scripts</SelectItem>
                <SelectItem value="selected">Selected Scripts Only</SelectItem>
                <SelectItem value="individual">Individual Files (One Per Scene)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {exportMode === 'selected' && (
            <div>
              <label className="block text-sm font-medium mb-2">Select Scripts</label>
              <div className="max-h-40 overflow-y-auto space-y-2 border rounded-md p-2">
                {scriptBlocks.map((script) => {
                  const block = contentBlocks.find(b => b.id === script.contentBlockId);
                  return (
                    <div key={script.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`select-${script.id}`} 
                        checked={selectedScripts.includes(script.id)}
                        onCheckedChange={() => onToggleScriptSelection(script.id)}
                      />
                      <label htmlFor={`select-${script.id}`} className="text-sm cursor-pointer">
                        {block?.title || 'Unknown Block'}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-2">Export Format</label>
            <Select 
              value={exportFormat} 
              onValueChange={(value: any) => onExportFormatChange(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF Document (.pdf)</SelectItem>
                <SelectItem value="csv">CSV Spreadsheet (.csv)</SelectItem>
                <SelectItem value="docx">Microsoft Word (.docx)</SelectItem>
                <SelectItem value="pages">Apple Pages (.pages)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">View Type</label>
            <Select 
              value={exportView} 
              onValueChange={(value: any) => onExportViewChange(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select view" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="director">Director Format (3 columns)</SelectItem>
                <SelectItem value="teleprompter">Teleprompter Format (Ears only)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Button 
              onClick={onExport} 
              className="w-full flex items-center justify-center gap-2"
            >
              <FileDown className="w-4 h-4" />
              Export Scripts
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDialog;
