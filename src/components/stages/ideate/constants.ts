import { Mic, Video, Film, Lightbulb, MapPin, MessageSquare } from 'lucide-react';

export const contentBlockTypes = [
  {
    type: 'interview',
    label: 'Interview',
    icon: Mic,
    color: 'bg-blue-100 text-blue-800 border-blue-300'
  },
  {
    type: 'piece-to-camera',
    label: 'Piece to Camera',
    icon: Video,
    color: 'bg-purple-100 text-purple-800 border-purple-300'
  },
  {
    type: 'b-roll',
    label: 'B-Roll',
    icon: Film,
    color: 'bg-cyan-100 text-cyan-800 border-cyan-300'
  },
  {
    type: 'demo',
    label: 'Demo',
    icon: Lightbulb,
    color: 'bg-amber-100 text-amber-800 border-amber-300'
  },
  {
    type: 'location',
    label: 'Location',
    icon: MapPin,
    color: 'bg-rose-100 text-rose-800 border-rose-300'
  },
  {
    type: 'narration',
    label: 'Narration',
    icon: MessageSquare,
    color: 'bg-lime-100 text-lime-800 border-lime-300'
  }
];
