import { create } from 'zustand';
import { StoreState } from '../types';

export const useStore = create<StoreState>((set) => ({
  projects: [],
  currentProject: null,
  
  addProject: (project) =>
    set((state) => ({ projects: [...state.projects, project] })),
  
  updateProject: (id, updates) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
      ),
      currentProject:
        state.currentProject?.id === id
          ? { ...state.currentProject, ...updates, updatedAt: new Date() }
          : state.currentProject,
    })),
  
  deleteProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      currentProject: state.currentProject?.id === id ? null : state.currentProject,
    })),
  
  setCurrentProject: (project) => set({ currentProject: project }),

  ideas: [],
  
  addIdea: (idea) =>
    set((state) => ({ ideas: [...state.ideas, idea] })),
  
  deleteIdea: (id) =>
    set((state) => ({ ideas: state.ideas.filter((i) => i.id !== id) })),
  
  voteIdea: (id, vote) =>
    set((state) => ({
      ideas: state.ideas.map((i) =>
        i.id === id ? { ...i, votes: i.votes + vote } : i
      ),
    })),

  scenes: [],
  
  addScene: (scene) =>
    set((state) => ({ scenes: [...state.scenes, scene] })),
  
  updateScene: (id, updates) =>
    set((state) => ({
      scenes: state.scenes.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    })),
  
  deleteScene: (id) =>
    set((state) => ({ scenes: state.scenes.filter((s) => s.id !== id) })),
  
  reorderScenes: (scenes) => set({ scenes }),

  scriptLines: [],
  
  addScriptLine: (line) =>
    set((state) => ({ scriptLines: [...state.scriptLines, line] })),
  
  updateScriptLine: (id, updates) =>
    set((state) => ({
      scriptLines: state.scriptLines.map((l) =>
        l.id === id ? { ...l, ...updates } : l
      ),
    })),
  
  deleteScriptLine: (id) =>
    set((state) => ({
      scriptLines: state.scriptLines.filter((l) => l.id !== id),
    })),

  factChecks: [],
  
  addFactCheck: (item) =>
    set((state) => ({ factChecks: [...state.factChecks, item] })),
  
  updateFactCheck: (id, updates) =>
    set((state) => ({
      factChecks: state.factChecks.map((f) =>
        f.id === id ? { ...f, ...updates } : f
      ),
    })),
  
  deleteFactCheck: (id) =>
    set((state) => ({
      factChecks: state.factChecks.filter((f) => f.id !== id),
    })),

  tasks: [],
  
  addTask: (task) =>
    set((state) => ({ tasks: [...state.tasks, task] })),
  
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  
  deleteTask: (id) =>
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),
}));
