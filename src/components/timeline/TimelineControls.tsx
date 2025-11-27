
import React from 'react';

interface TimelineControlsProps {
  snapToGrid: boolean;
  onSnapToGridChange: (value: boolean) => void;
  totalDuration: number;
  blockCount: number;
}

const TimelineControls: React.FC<TimelineControlsProps> = ({
  snapToGrid,
  onSnapToGridChange,
  totalDuration,
  blockCount
}) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">Production Timeline (Fixed)</h2>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={snapToGrid}
            onChange={(e) => onSnapToGridChange(e.target.checked)}
            className="rounded"
          />
          Snap to Grid
        </label>
        <div className="text-sm text-gray-600">
          Total Duration: {totalDuration} minutes | {blockCount} blocks
        </div>
      </div>
    </div>
  );
};

export default TimelineControls;
