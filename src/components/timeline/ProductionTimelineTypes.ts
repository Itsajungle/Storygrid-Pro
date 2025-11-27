
import { ContentBlock, TimelineItem, CrewMember, Equipment, Location } from '@/contexts/ContentBlocksContext';

export interface Lane {
  id: string;
  name: string;
  color: string;
  icon: React.ElementType;
  visible: boolean;
}

export const statusColors = {
  'planned': 'bg-blue-100 text-blue-800 border-blue-200',
  'confirmed': 'bg-amber-100 text-amber-800 border-amber-200',
  'in-review': 'bg-purple-100 text-purple-800 border-purple-200',
  'filmed': 'bg-amber-100 text-amber-800 border-amber-200', 
  'in-edit': 'bg-purple-100 text-purple-800 border-purple-200',
  'completed': 'bg-green-100 text-green-800 border-green-200',
  'approved': 'bg-green-100 text-green-800 border-green-200'
};

export const typeColors = {
  'interview': 'bg-blue-100 border-blue-200',
  'piece-to-camera': 'bg-yellow-100 border-yellow-200',
  'b-roll': 'bg-purple-100 border-purple-200',
  'demo': 'bg-green-100 border-green-200',
  'location': 'bg-red-100 border-red-200',
  'narration': 'bg-gray-100 border-gray-200'
};
