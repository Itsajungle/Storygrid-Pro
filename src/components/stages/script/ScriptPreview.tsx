
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { FileText, PlayCircle, Pencil, Clock } from 'lucide-react';
import { ScriptBlock } from './types';

interface ScriptPreviewProps {
  selectedBlockId: string | null;
  currentScript: ScriptBlock | null;
  onTeleprompterShow: () => void;
  onScriptEdit: () => void;
}

const ScriptPreview: React.FC<ScriptPreviewProps> = ({
  selectedBlockId,
  currentScript,
  onTeleprompterShow,
  onScriptEdit
}) => {
  if (!selectedBlockId) {
    return (
      <Card className="p-5 lg:col-span-3">
        <div className="h-full flex flex-col">
          <h3 className="text-lg font-semibold mb-4">Three-Column Script Format</h3>
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Select a Block to Script</h3>
              <p className="text-gray-500">Click on any story block in the sidebar to create or edit its script</p>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5 lg:col-span-3">
      <div className="h-full flex flex-col">
        <h3 className="text-lg font-semibold mb-4">Three-Column Script Format</h3>
        
        <div>
          <p className="text-gray-600 mb-4">Select a story block from the sidebar to create or edit its script.</p>
        </div>

        {currentScript && (
          <div className="mt-4">
            <div className="flex justify-end mb-2 gap-2">
              <Button
                variant="outline"
                onClick={onTeleprompterShow}
                className="flex items-center gap-2"
              >
                <PlayCircle className="w-4 h-4" />
                Preview as Teleprompter
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/3">Where</TableHead>
                    <TableHead className="w-1/3">Ears</TableHead>
                    <TableHead className="w-1/3">Eyes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="align-top">
                      {currentScript.where || "Not defined yet"}
                    </TableCell>
                    <TableCell className="align-top">
                      {currentScript.ears || "Not defined yet"}
                    </TableCell>
                    <TableCell className="align-top">
                      {currentScript.eyes || "Not defined yet"}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-500">
                  Estimated Runtime: {currentScript.estimatedRuntime || '?'} min
                </span>
              </div>
              <Button 
                variant="ghost"
                onClick={onScriptEdit}
                className="text-sm"
              >
                <Pencil className="w-4 h-4 mr-1" />
                Edit Script
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ScriptPreview;
