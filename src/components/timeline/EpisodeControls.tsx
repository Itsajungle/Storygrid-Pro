
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface EpisodeControlsProps {
  showEquipment: boolean;
  setShowEquipment: (value: boolean) => void;
  showCrew: boolean;
  setShowCrew: (value: boolean) => void;
  showDateTime: boolean;
  setShowDateTime: (value: boolean) => void;
}

const EpisodeControls: React.FC<EpisodeControlsProps> = ({
  showEquipment,
  setShowEquipment,
  showCrew,
  setShowCrew,
  showDateTime,
  setShowDateTime
}) => {
  return (
    <div className="flex items-center gap-6">
      <div className="flex items-center space-x-3">
        <Switch 
          id="show-equipment" 
          checked={showEquipment} 
          onCheckedChange={setShowEquipment}
          className={`
            transition-all duration-300 ease-in-out rounded-full
            ${showEquipment 
              ? 'data-[state=checked]:bg-[#00B86B] shadow-md shadow-green-200' 
              : 'bg-[#E5E7EB] border border-gray-300'
            }
            hover:scale-105 h-6 w-11
          `}
        />
        <Label 
          htmlFor="show-equipment" 
          className={`
            text-sm font-medium transition-colors duration-300 cursor-pointer
            ${showEquipment ? 'text-[#00B86B] font-semibold' : 'text-gray-600'}
          `}
        >
          Equipment
          {showEquipment && <span className="ml-2 text-[#00B86B]">✓</span>}
        </Label>
      </div>
      
      <div className="flex items-center space-x-3">
        <Switch 
          id="show-crew" 
          checked={showCrew} 
          onCheckedChange={setShowCrew}
          className={`
            transition-all duration-300 ease-in-out rounded-full
            ${showCrew 
              ? 'data-[state=checked]:bg-[#2563EB] shadow-md shadow-blue-200' 
              : 'bg-[#E5E7EB] border border-gray-300'
            }
            hover:scale-105 h-6 w-11
          `}
        />
        <Label 
          htmlFor="show-crew" 
          className={`
            text-sm font-medium transition-colors duration-300 cursor-pointer
            ${showCrew ? 'text-[#2563EB] font-semibold' : 'text-gray-600'}
          `}
        >
          Crew
          {showCrew && <span className="ml-2 text-[#2563EB]">✓</span>}
        </Label>
      </div>
      
      <div className="flex items-center space-x-3">
        <Switch 
          id="show-datetime" 
          checked={showDateTime} 
          onCheckedChange={setShowDateTime} 
          className={`
            transition-all duration-300 ease-in-out rounded-full
            ${showDateTime 
              ? 'data-[state=checked]:bg-[#FFD700] shadow-md shadow-yellow-200' 
              : 'bg-[#E5E7EB] border border-gray-300'
            }
            hover:scale-105 h-6 w-11
          `}
        />
        <Label 
          htmlFor="show-datetime" 
          className={`
            text-sm font-medium transition-colors duration-300 cursor-pointer
            ${showDateTime ? 'text-[#B8860B] font-semibold' : 'text-gray-600'}
          `}
        >
          Schedule
          {showDateTime && <span className="ml-2 text-[#B8860B]">✓</span>}
        </Label>
      </div>
    </div>
  );
};

export default EpisodeControls;
