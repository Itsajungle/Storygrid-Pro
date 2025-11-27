export type ProjectStatus = 'idea' | 'storyboard' | 'script' | 'fact-check' | 'production';

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Idea {
  id: string;
  projectId: string;
  content: string;
  aiGenerated: boolean;
  votes: number;
  createdAt: Date;
}

export type StoryAct = 'act1' | 'act2' | 'act3';

export interface StoryboardScene {
  id: string;
  projectId: string;
  act: StoryAct;
  order: number;
  title: string;
  description: string;
  duration: number;
  visualNotes: string;
  createdAt: Date;
}

export type ScriptColumn = 'visual' | 'audio' | 'notes';

export interface ScriptLine {
  id: string;
  projectId: string;
  order: number;
  visual: string;
  audio: string;
  notes: string;
  timestamp?: number;
  createdAt: Date;
}

export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'unverified';

export interface FactCheckItem {
  id: string;
  projectId: string;
  claim: string;
  source: string;
  confidence: ConfidenceLevel;
  notes: string;
  verified: boolean;
  createdAt: Date;
}

export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';

export interface TimelineTask {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignee?: string;
  dueDate?: Date;
  createdAt: Date;
}

export interface StoreState {
  projects: Project[];
  currentProject: Project | null;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setCurrentProject: (project: Project | null) => void;
  ideas: Idea[];
  addIdea: (idea: Idea) => void;
  deleteIdea: (id: string) => void;
  voteIdea: (id: string, vote: number) => void;
  scenes: StoryboardScene[];
  addScene: (scene: StoryboardScene) => void;
  updateScene: (id: string, updates: Partial<StoryboardScene>) => void;
  deleteScene: (id: string) => void;
  reorderScenes: (scenes: StoryboardScene[]) => void;
  scriptLines: ScriptLine[];
  addScriptLine: (line: ScriptLine) => void;
  updateScriptLine: (id: string, updates: Partial<ScriptLine>) => void;
  deleteScriptLine: (id: string) => void;
  factChecks: FactCheckItem[];
  addFactCheck: (item: FactCheckItem) => void;
  updateFactCheck: (id: string, updates: Partial<FactCheckItem>) => void;
  deleteFactCheck: (id: string) => void;
  tasks: TimelineTask[];
  addTask: (task: TimelineTask) => void;
  updateTask: (id: string, updates: Partial<TimelineTask>) => void;
  deleteTask: (id: string) => void;
}
