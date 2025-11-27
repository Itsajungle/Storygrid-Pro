
export interface ScriptBlock {
  id: string;
  contentBlockId: string;
  where: string;
  ears: string;
  eyes: string;
  estimatedRuntime?: number;
  status: 'draft' | 'in-review' | 'approved' | 'ready-to-film';
}

export interface ShotTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

export interface VisualSequence {
  id: string;
  name: string;
  description: string;
  template: string;
}

export interface LocationTemplate {
  id: string;
  name: string;
  description: string;
}

export interface AIDraft {
  id: string;
  model: 'chatgpt' | 'claude';
  content: string;
  timestamp: Date;
}
