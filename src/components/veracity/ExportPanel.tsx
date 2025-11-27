
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FileDown, FileText, FileOutput } from 'lucide-react';
import { FactCheckResult, CitationStyle, ExportOptions } from '@/types/veracity';
import { toast } from '@/hooks/use-toast';
import CitationStyleSelector from './CitationStyleSelector';

interface ExportPanelProps {
  results: FactCheckResult[];
  scriptContent: string;
  episodeTitle?: string;
  scriptVersion?: string;
}

const ExportPanel: React.FC<ExportPanelProps> = ({ 
  results, 
  scriptContent,
  episodeTitle,
  scriptVersion
}) => {
  // Use localStorage to persist citation style preference
  const savedCitationStyle = localStorage.getItem('preferredCitationStyle') as CitationStyle | null;
  
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includeScriptText: true,
    includeSourceLinks: true,
    includeComments: true,
    citationStyle: savedCitationStyle || 'inline',
    episodeTitle: episodeTitle || '',
    scriptVersion: scriptVersion || '',
    reviewerName: ''
  });

  // Save citation style preference when it changes
  useEffect(() => {
    localStorage.setItem('preferredCitationStyle', exportOptions.citationStyle);
  }, [exportOptions.citationStyle]);

  const handleExport = (format: 'pdf' | 'docx' | 'pages') => {
    // In a real implementation, this would generate and download the file
    // For now, we'll just show a toast notification
    toast({
      title: "Report Export Started",
      description: `Your ${format.toUpperCase()} report is being generated and will download shortly.`,
      duration: 3000,
    });
    
    // Simulate download delay
    setTimeout(() => {
      toast({
        title: "Report Export Complete",
        description: `Your veracity report has been downloaded in ${format.toUpperCase()} format.`,
        duration: 3000,
      });
    }, 2000);
  };

  const getSummaryStats = () => {
    const totalIssues = results.length;
    const accepted = results.filter(r => r.status === 'accepted').length;
    const dismissed = results.filter(r => r.status === 'dismissed').length;
    const needsRewrite = results.filter(r => r.status === 'needs-rewrite').length;
    const pending = results.filter(r => !r.status).length;
    
    return { totalIssues, accepted, dismissed, needsRewrite, pending };
  };

  const stats = getSummaryStats();

  const updateExportOption = <K extends keyof ExportOptions>(key: K, value: ExportOptions[K]) => {
    setExportOptions(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Veracity Report Summary</h3>
        
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold">{stats.totalIssues}</div>
            <div className="text-xs text-gray-600">Total Issues</div>
          </Card>
          <Card className="p-3 text-center bg-green-50">
            <div className="text-2xl font-bold text-green-700">{stats.accepted}</div>
            <div className="text-xs text-gray-600">Accepted</div>
          </Card>
          <Card className="p-3 text-center bg-gray-50">
            <div className="text-2xl font-bold text-gray-700">{stats.dismissed}</div>
            <div className="text-xs text-gray-600">Dismissed</div>
          </Card>
          <Card className="p-3 text-center bg-amber-50">
            <div className="text-2xl font-bold text-amber-700">{stats.needsRewrite}</div>
            <div className="text-xs text-gray-600">Needs Rewrite</div>
          </Card>
          <Card className="p-3 text-center bg-red-50">
            <div className="text-2xl font-bold text-red-700">{stats.pending}</div>
            <div className="text-xs text-gray-600">Pending</div>
          </Card>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Report Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="episode-title">Episode Title</Label>
            <Input 
              id="episode-title" 
              value={exportOptions.episodeTitle} 
              onChange={(e) => updateExportOption('episodeTitle', e.target.value)}
              placeholder="Enter episode title"
              className="mt-1" 
            />
          </div>
          
          <div>
            <Label htmlFor="script-version">Script Version</Label>
            <Input 
              id="script-version" 
              value={exportOptions.scriptVersion} 
              onChange={(e) => updateExportOption('scriptVersion', e.target.value)}
              placeholder="e.g., v1.2"
              className="mt-1" 
            />
          </div>
          
          <div className="md:col-span-2">
            <Label htmlFor="reviewer-name">Reviewer Name</Label>
            <Input 
              id="reviewer-name" 
              value={exportOptions.reviewerName} 
              onChange={(e) => updateExportOption('reviewerName', e.target.value)}
              placeholder="Optional"
              className="mt-1" 
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Content Options</h3>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="include-script" 
              checked={exportOptions.includeScriptText} 
              onCheckedChange={(checked) => updateExportOption('includeScriptText', !!checked)} 
            />
            <Label htmlFor="include-script">Include full script text</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="include-sources" 
              checked={exportOptions.includeSourceLinks} 
              onCheckedChange={(checked) => updateExportOption('includeSourceLinks', !!checked)} 
            />
            <Label htmlFor="include-sources">Include source URLs</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="include-comments" 
              checked={exportOptions.includeComments} 
              onCheckedChange={(checked) => updateExportOption('includeComments', !!checked)} 
            />
            <Label htmlFor="include-comments">Include reviewer comments</Label>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <CitationStyleSelector 
          value={exportOptions.citationStyle}
          onChange={(style) => updateExportOption('citationStyle', style)}
        />
      </div>
      
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-gray-900">Export Format</h3>
        
        <div className="flex flex-wrap items-center gap-3">
          <Button 
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-2"
          >
            <FileDown className="h-4 w-4" />
            Export as PDF
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => handleExport('docx')}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Export as DOCX
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => handleExport('pages')}
            className="flex items-center gap-2"
          >
            <FileOutput className="h-4 w-4" />
            Export as Pages
          </Button>
        </div>
        
        <p className="text-xs text-gray-500 mt-2">
          Reports include all flagged statements, resolution status, and source links
          based on your selected options.
        </p>
      </div>
    </div>
  );
};

export default ExportPanel;
