
import React from 'react';
import { Input } from '@/components/ui/input';
import { ProjectOverview } from './types';

interface ProductionDefaultsSectionProps {
  productionDefaults: ProjectOverview['productionDefaults'];
  isEditing: boolean;
  onUpdate: (field: keyof ProjectOverview['productionDefaults'], value: string) => void;
}

const ProductionDefaultsSection: React.FC<ProductionDefaultsSectionProps> = ({
  productionDefaults,
  isEditing,
  onUpdate
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">Production Defaults</label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Episode Length</label>
          {isEditing ? (
            <Input
              value={productionDefaults.episodeLength}
              onChange={(e) => onUpdate('episodeLength', e.target.value)}
            />
          ) : (
            <p className="text-sm font-medium">{productionDefaults.episodeLength}</p>
          )}
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Tone</label>
          {isEditing ? (
            <Input
              value={productionDefaults.tone}
              onChange={(e) => onUpdate('tone', e.target.value)}
            />
          ) : (
            <p className="text-sm font-medium">{productionDefaults.tone}</p>
          )}
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Target Audience</label>
          {isEditing ? (
            <Input
              value={productionDefaults.targetAudience}
              onChange={(e) => onUpdate('targetAudience', e.target.value)}
            />
          ) : (
            <p className="text-sm font-medium">{productionDefaults.targetAudience}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductionDefaultsSection;
