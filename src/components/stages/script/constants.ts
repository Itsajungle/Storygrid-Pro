
import React from 'react';
import { Camera, Film } from 'lucide-react';
import { ShotTemplate, VisualSequence, LocationTemplate } from './types';

export const shotTemplates: ShotTemplate[] = [
  { id: 'cam1-solo', name: 'Camera 1: Solo', description: 'Single camera shot focused on the subject', icon: React.createElement(Camera, { className: "w-4 h-4" }) },
  { id: 'cam2-split', name: 'Camera 2: Split Screen', description: 'Split screen with two subjects', icon: React.createElement(Film, { className: "w-4 h-4" }) },
  { id: 'b-roll-full', name: 'B-Roll: Fullscreen', description: 'Fullscreen B-roll footage overlay', icon: React.createElement(Film, { className: "w-4 h-4" }) },
  { id: 'animation', name: 'Animation Overlay', description: 'Animated graphic overlay', icon: React.createElement(Film, { className: "w-4 h-4" }) },
];

export const locationTemplates: LocationTemplate[] = [
  {
    id: 'iaj-studio',
    name: 'IAJ Studio',
    description: 'Main set with TV screen backdrop. Susan seated on chair facing Camera 1, wide shot and close-up alternating.'
  },
  {
    id: 'susans-room',
    name: 'Susan\'s Room',
    description: 'Casual interview setup in Susan\'s office. Warm lighting, bookshelf backdrop, neutral colors.'
  },
  {
    id: 'remote-interview',
    name: 'Remote Interview (Zoom-style)',
    description: 'Guest appears on screen via Zoom-style call. Susan filmed separately reacting to conversation. Graphics added in post.'
  },
  {
    id: 'street-vox',
    name: 'Street Vox Pops',
    description: 'Outdoor setup with handheld mic. Susan approaches people casually. Use gimbal or Osmo Pocket 3. Ambient sound present.'
  },
  {
    id: 'clinic-expert',
    name: 'Clinic/Expert Location',
    description: 'On-location interview in medical, tech, or studio environment. Use branded backdrop if possible. Susan on Cam 1, Expert on Cam 2.'
  },
];

export const visualSequences: VisualSequence[] = [
  {
    id: 'susan-tv',
    name: 'Susan + TV Screen + B-Roll',
    description: 'Host in front of screen with cutaways',
    template: `CAM 1: Medium shot of Susan in front of TV screen
CAM 2: Close-up of Susan for reactions
TV SCREEN: Graphics display on screen behind host
B-ROLL: Cut to relevant footage during explanations
RETURN: Back to Susan for conclusion`
  },
  {
    id: 'vox-pop',
    name: 'Street Vox Pop Montage',
    description: 'Quick cuts between different people answering same question',
    template: `ESTABLISHING: Wide shot of street location
INTERVIEW 1: Close-up of first person responding
INTERVIEW 2: Cut to second person mid-answer
INTERVIEW 3: Cut to third person with different background
MONTAGE: Quick cuts between all subjects for variety of answers
RETURN: Back to wide shot or host`
  },
  {
    id: 'infographic',
    name: 'Animated Infographic',
    description: 'Full screen data visualization with voiceover',
    template: `FULLSCREEN: Animated infographic takes entire frame
LOWER THIRD: Title appears to identify topic
ANIMATION: Data points appear sequentially with emphasis
HIGHLIGHT: Key statistics grow/pulse for emphasis
TRANSITION: Smooth dissolve back to host or next segment`
  },
  {
    id: 'expert-desk',
    name: 'Expert at Desk with Graphics',
    description: 'Professional interview with supporting graphics',
    template: `CAM 1: Medium shot of expert seated at desk
GRAPHICS: Lower third credentials for introduction
CUTAWAY: Supporting charts or images as referenced
CAM 2: Close-up for emotional points or key statements
WIDE: Return to wider shot showing environment for conclusion`
  }
];

export const toneTemplates = [
  "Make this more conversational",
  "Punch up the energy",
  "Shorten for TikTok",
  "Add a metaphor",
  "Professional and authoritative",
  "Friendly and approachable",
  "Data-driven and analytical",
  "Storytelling with emotional appeal"
];
