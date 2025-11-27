import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProjectTemplate {
  id: string;
  name: string;
  description: string | null;
  default_settings: Record<string, any>;
}

interface Project {
  id: string;
  title: string;
  template_id: string | null;
  tags: string[];
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface ProjectContextType {
  currentProject: Project | null;
  projects: Project[];
  templates: ProjectTemplate[];
  loading: boolean;
  setCurrentProject: (project: Project | null) => void;
  createProject: (title: string, templateId: string, tags?: string[]) => Promise<Project | null>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within ProjectProvider');
  }
  return context;
};

interface ProjectProviderProps {
  children: ReactNode;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
    loadProjects();
  }, []);

  useEffect(() => {
    const savedProjectId = localStorage.getItem('currentProjectId');
    if (savedProjectId && projects.length > 0) {
      const project = projects.find(p => p.id === savedProjectId);
      if (project) {
        setCurrentProject(project);
      }
    }
  }, [projects]);

  useEffect(() => {
    if (currentProject) {
      localStorage.setItem('currentProjectId', currentProject.id);
    } else {
      localStorage.removeItem('currentProjectId');
    }
  }, [currentProject]);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('project_templates')
        .select('*')
        .order('name');

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Failed to load project templates');
    }
  };

  const loadProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (
    title: string,
    templateId: string,
    tags: string[] = []
  ): Promise<Project | null> => {
    try {
      const template = templates.find(t => t.id === templateId);
      const settings = template?.default_settings || {};

      const { data, error } = await supabase
        .from('projects')
        .insert({
          title,
          template_id: templateId,
          tags,
          settings,
        })
        .select()
        .single();

      if (error) throw error;

      await loadProjects();
      setCurrentProject(data);
      toast.success('Project created successfully');
      return data;
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
      return null;
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await loadProjects();
      if (currentProject?.id === id) {
        setCurrentProject({ ...currentProject, ...updates });
      }
      toast.success('Project updated successfully');
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadProjects();
      if (currentProject?.id === id) {
        setCurrentProject(null);
      }
      toast.success('Project deleted successfully');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  const refreshProjects = async () => {
    await loadProjects();
  };

  return (
    <ProjectContext.Provider
      value={{
        currentProject,
        projects,
        templates,
        loading,
        setCurrentProject,
        createProject,
        updateProject,
        deleteProject,
        refreshProjects,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};
