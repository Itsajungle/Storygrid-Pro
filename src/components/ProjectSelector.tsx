import React, { useState } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FolderOpen, Plus, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const ProjectSelector: React.FC = () => {
  const { currentProject, projects, templates, setCurrentProject, createProject } = useProject();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [newTags, setNewTags] = useState('');

  const handleCreateProject = async () => {
    if (!newProjectTitle || !selectedTemplateId) {
      return;
    }

    const tags = newTags.split(',').map(t => t.trim()).filter(Boolean);
    await createProject(newProjectTitle, selectedTemplateId, tags);
    
    setIsCreateDialogOpen(false);
    setNewProjectTitle('');
    setSelectedTemplateId('');
    setNewTags('');
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        value={currentProject?.id || ''}
        onValueChange={(value) => {
          const project = projects.find(p => p.id === value);
          setCurrentProject(project || null);
        }}
      >
        <SelectTrigger className="w-[250px] !bg-white !text-gray-900 border-border">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4" />
            <SelectValue placeholder="Select a project" />
          </div>
        </SelectTrigger>
        <SelectContent className="!bg-white !text-gray-900">
          {projects.map((project) => {
            const template = templates.find(t => t.id === project.template_id);
            return (
              <SelectItem key={project.id} value={project.id}>
                <div className="flex flex-col">
                  <span>{project.title}</span>
                  {template && (
                    <span className="text-xs text-muted-foreground">{template.name}</span>
                  )}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      {currentProject && (
        <div className="flex gap-1">
          {currentProject.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="text-white border-white/50 hover:bg-white/10">
            <Plus className="w-4 h-4 mr-1" />
            New Project
          </Button>
        </DialogTrigger>
        <DialogContent className="!bg-white !text-gray-900">
          <DialogHeader>
            <DialogTitle className="!text-gray-900">Create New Project</DialogTitle>
            <DialogDescription className="!text-gray-600">
              Create a new project from a template
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="!text-gray-900">Project Title</Label>
              <Input
                id="title"
                placeholder="e.g., Episode 1: Sugar & Brain Health"
                value={newProjectTitle}
                onChange={(e) => setNewProjectTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template" className="!text-gray-900">Template</Label>
              <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                <SelectTrigger id="template" className="!bg-white !text-gray-900">
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex flex-col">
                        <span>{template.name}</span>
                        {template.description && (
                          <span className="text-xs text-muted-foreground">
                            {template.description}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags" className="!text-gray-900">Tags (comma-separated)</Label>
              <Input
                id="tags"
                placeholder="e.g., health, nutrition, science"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateProject} disabled={!newProjectTitle || !selectedTemplateId}>
              Create Project
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
