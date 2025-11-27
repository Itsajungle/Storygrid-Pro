import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Mic, Eye } from 'lucide-react';
import { ScriptBlock } from './types';

interface ScriptEditorProps {
  currentScript: ScriptBlock;
  onScriptChange: (field: keyof ScriptBlock, value: string | number) => void;
}

const ScriptEditor: React.FC<ScriptEditorProps> = ({
  currentScript,
  onScriptChange
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">Three-Column Script Format</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* WHERE Column */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <label className="text-sm font-semibold text-gray-900">Where</label>
          </div>
          <p className="text-xs text-gray-600 mb-2">Location and setup details</p>
          <Textarea
            value={currentScript.where}
            onChange={(e) => onScriptChange('where', e.target.value)}
            placeholder="Describe the location, setting, and visual environment..."
            className="min-h-[300px] bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* EARS Column */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Mic className="w-4 h-4 text-green-600" />
            <label className="text-sm font-semibold text-gray-900">Ears</label>
          </div>
          <p className="text-xs text-gray-600 mb-2">Spoken script and dialogue</p>
          <Textarea
            value={currentScript.ears}
            onChange={(e) => onScriptChange('ears', e.target.value)}
            placeholder="Write the spoken script, dialogue, or voiceover text..."
            className="min-h-[300px] bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:ring-green-500"
          />
        </div>

        {/* EYES Column */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-purple-600" />
            <label className="text-sm font-semibold text-gray-900">Eyes</label>
          </div>
          <p className="text-xs text-gray-600 mb-2">Visual direction and camera shots</p>
          <Textarea
            value={currentScript.eyes}
            onChange={(e) => onScriptChange('eyes', e.target.value)}
            placeholder="Describe camera angles, shots, visuals, and on-screen elements..."
            className="min-h-[300px] bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500"
          />
        </div>
      </div>
    </div>
  );
};

export default ScriptEditor;
