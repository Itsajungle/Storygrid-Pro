
import { LucideIcon } from 'lucide-react';

export type AIProvider = 'chatgpt' | 'claude' | 'gemini' | 'perplexity';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  source: AIProvider;
  id: string;
}

export interface ContentBlockType {
  type: 'interview' | 'piece-to-camera' | 'b-roll' | 'demo' | 'location' | 'narration';
  icon: LucideIcon;
  label: string;
  color: string;
  shape: string;
}

export interface LoadingStates {
  chatgpt: boolean;
  claude: boolean;
  gemini: boolean;
  perplexity: boolean;
}
