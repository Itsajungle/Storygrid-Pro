
import { toast } from 'sonner';
import { locationTemplates, visualSequences } from '@/components/stages/script/constants';

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'in-review': return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'approved': return 'bg-green-100 text-green-800 border-green-200';
    case 'ready-to-film': return 'bg-blue-100 text-blue-800 border-blue-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const applyLocationTemplate = (locationId: string, onScriptChange: (field: string, value: string) => void) => {
  const location = locationTemplates.find(loc => loc.id === locationId);
  if (location) {
    onScriptChange('where', location.description);
    toast.success(`Applied location template: ${location.name}`);
  }
};

export const applyVisualSequence = (sequenceId: string, onScriptChange: (field: string, value: string) => void) => {
  const sequence = visualSequences.find(seq => seq.id === sequenceId);
  if (sequence) {
    onScriptChange('eyes', sequence.template);
  }
};

export const formatEarsForTeleprompter = (text: string, showCueMarkers: boolean): React.ReactNode => {
  if (!text) return <p>No script content</p>;
  
  const lines = text.split('\n');
  return (
    <div>
      {lines.map((line, index) => {
        if (showCueMarkers && (line.includes('CAM') || line.includes('CAMERA'))) {
          return (
            <p key={index} className="text-blue-500 font-bold my-2">
              {line} →
            </p>
          );
        }
        
        if (line.startsWith('Q:')) {
          return <p key={index} className="font-bold my-2">{line}</p>;
        }
        if (line.startsWith('A:')) {
          return <p key={index} className="italic my-2">{line}</p>;
        }
        
        if (line.trim() === '') {
          return <br key={index} />;
        }
        
        return <p key={index} className="my-2">{line}</p>;
      })}
    </div>
  );
};
