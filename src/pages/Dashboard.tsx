import { useStore } from '../stores/useStore';
import { Plus } from 'lucide-react';
import { generateId } from '../lib/utils';

export function Dashboard() {
  const { projects, addProject, setCurrentProject } = useStore();

  const handleCreateProject = () => {
    const newProject = {
      id: generateId(),
      title: 'New Project',
      description: 'Enter project description...',
      status: 'idea' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    addProject(newProject);
    setCurrentProject(newProject);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
        <button
          onClick={handleCreateProject}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>New Project</span>
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500 mb-4">No projects yet</p>
          <button
            onClick={handleCreateProject}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Create your first project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setCurrentProject(project)}
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {project.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4">{project.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">
                  {project.status}
                </span>
                <span className="text-xs text-gray-500">
                  {project.updatedAt.toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
