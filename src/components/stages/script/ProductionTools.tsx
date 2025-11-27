
import React from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Presentation, Camera } from 'lucide-react';
import { ScriptBlock, LocationTemplate, VisualSequence, ShotTemplate } from './types';

interface ProductionToolsProps {
  locationTemplates: LocationTemplate[];
  visualSequences: VisualSequence[];
  shotTemplates: ShotTemplate[];
  currentScript: ScriptBlock | null;
  onApplyLocationTemplate: (locationId: string) => void;
  onApplyVisualSequence: (sequenceId: string) => void;
  onApplyShotTemplate: (template: ShotTemplate) => void;
}

const ProductionTools: React.FC<ProductionToolsProps> = ({
  locationTemplates,
  visualSequences,
  shotTemplates,
  currentScript,
  onApplyLocationTemplate,
  onApplyVisualSequence,
  onApplyShotTemplate
}) => {
  return (
    <div className="grid grid-cols-1 gap-4">
      {/* Location Template Selector */}
      <div>
        <label className="block text-sm font-medium mb-2">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>Location Templates</span>
          </div>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {locationTemplates.map((location) => (
            <Button
              key={location.id}
              variant="outline"
              className="flex flex-col h-auto py-3 text-left items-start min-h-[80px] text-wrap"
              onClick={() => onApplyLocationTemplate(location.id)}
            >
              <span className="font-medium text-sm leading-tight break-words whitespace-normal">{location.name}</span>
              <span className="text-xs text-gray-500 mt-1 line-clamp-2 break-words whitespace-normal">{location.description.substring(0, 50)}...</span>
            </Button>
          ))}
        </div>
      </div>
      
      {/* Visual Sequence Library */}
      <div>
        <label className="block text-sm font-medium mb-2">
          <div className="flex items-center gap-1">
            <Presentation className="w-4 h-4" />
            <span>Visual Sequence Library</span>
          </div>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {visualSequences.map((sequence) => (
            <Button
              key={sequence.id}
              variant="outline"
              className="flex flex-col h-auto py-3 text-left items-start min-h-[80px] text-wrap"
              onClick={() => onApplyVisualSequence(sequence.id)}
            >
              <span className="font-medium text-sm leading-tight break-words whitespace-normal">{sequence.name}</span>
              <span className="text-xs text-gray-500 mt-1 break-words whitespace-normal">{sequence.description}</span>
            </Button>
          ))}
        </div>
      </div>
      
      {/* Shot Templates */}
      <div>
        <label className="block text-sm font-medium mb-2">
          <div className="flex items-center gap-1">
            <Camera className="w-4 h-4" />
            <span>Shot Templates</span>
          </div>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {shotTemplates.map((template) => (
            <Button
              key={template.id}
              variant="outline"
              className="flex flex-col h-auto py-3 min-h-[80px] text-wrap"
              onClick={() => onApplyShotTemplate(template)}
            >
              {template.icon}
              <span className="text-xs mt-1 text-center break-words whitespace-normal">{template.name}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductionTools;
