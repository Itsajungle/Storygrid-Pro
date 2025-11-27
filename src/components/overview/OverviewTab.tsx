
import React from 'react';
import { Input } from '@/components/ui/input';
import { ProjectOverview } from './types';
import PresenterSection from './PresenterSection';
import RecurringSetsSection from './RecurringSetsSection';
import ProductionDefaultsSection from './ProductionDefaultsSection';

interface OverviewTabProps {
  overview: ProjectOverview;
  isEditing: boolean;
  newPresenter: string;
  newSet: string;
  onShowTitleChange: (value: string) => void;
  onAddPresenter: () => void;
  onRemovePresenter: (index: number) => void;
  onNewPresenterChange: (value: string) => void;
  onAddSet: () => void;
  onRemoveSet: (index: number) => void;
  onNewSetChange: (value: string) => void;
  onProductionDefaultsUpdate: (field: keyof ProjectOverview['productionDefaults'], value: string) => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  overview,
  isEditing,
  newPresenter,
  newSet,
  onShowTitleChange,
  onAddPresenter,
  onRemovePresenter,
  onNewPresenterChange,
  onAddSet,
  onRemoveSet,
  onNewSetChange,
  onProductionDefaultsUpdate
}) => {
  return (
    <div className="space-y-6">
      {/* Show Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Show Title</label>
        {isEditing ? (
          <Input
            value={overview.showTitle}
            onChange={(e) => onShowTitleChange(e.target.value)}
            className="text-lg font-semibold"
          />
        ) : (
          <h3 className="text-xl font-semibold text-jungle-700">{overview.showTitle}</h3>
        )}
      </div>

      {/* Presenters */}
      <PresenterSection
        presenters={overview.presenters}
        newPresenter={newPresenter}
        isEditing={isEditing}
        onAddPresenter={onAddPresenter}
        onRemovePresenter={onRemovePresenter}
        onNewPresenterChange={onNewPresenterChange}
      />

      {/* Recurring Sets */}
      <RecurringSetsSection
        recurringSets={overview.recurringSets}
        newSet={newSet}
        isEditing={isEditing}
        onAddSet={onAddSet}
        onRemoveSet={onRemoveSet}
        onNewSetChange={onNewSetChange}
      />

      {/* Production Defaults */}
      <ProductionDefaultsSection
        productionDefaults={overview.productionDefaults}
        isEditing={isEditing}
        onUpdate={onProductionDefaultsUpdate}
      />
    </div>
  );
};

export default OverviewTab;
