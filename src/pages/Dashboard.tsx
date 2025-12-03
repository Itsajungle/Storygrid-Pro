import { useStore } from '../stores/useStore';
import { Plus } from 'lucide-react';
import { generateId } from '../lib/utils';

// Apple Blue Glassmorphism Styles
const styles = {
  gradientBg: {
    background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 30%, #e0f2fe 60%, #f0f9ff 100%)',
    minHeight: '100vh',
  },
  glassCard: {
    background: 'rgba(255, 255, 255, 0.75)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
  },
  projectCard: {
    background: 'rgba(255, 255, 255, 0.6)',
    backdropFilter: 'blur(10px) saturate(150%)',
    WebkitBackdropFilter: 'blur(10px) saturate(150%)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  },
  blueButton: {
    background: 'rgba(0, 122, 255, 0.9)',
    border: '1px solid rgba(0, 122, 255, 0.3)',
    boxShadow: '0 4px 20px rgba(0, 122, 255, 0.25)',
  },
};

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
    <div className="p-8" style={styles.gradientBg}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div 
          className="flex items-center justify-between rounded-[20px] p-6"
          style={styles.glassCard}
        >
          <h1 
            className="text-3xl font-bold"
            style={{ color: '#1D1D1F' }}
          >
            Projects
          </h1>
          <button
            onClick={handleCreateProject}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-full text-white font-semibold transition-all hover:scale-[1.02]"
            style={styles.blueButton}
          >
            <Plus className="w-5 h-5" />
            <span>New Project</span>
          </button>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div 
            className="text-center py-16 rounded-[20px]"
            style={styles.glassCard}
          >
            <p 
              className="mb-4"
              style={{ color: '#6B7280' }}
            >
              No projects yet
            </p>
            <button
              onClick={handleCreateProject}
              className="font-medium transition-colors"
              style={{ color: '#007AFF' }}
            >
              Create your first project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project) => (
              <div
                key={project.id}
                className="rounded-2xl p-6 hover:shadow-lg transition-all cursor-pointer hover:scale-[1.02]"
                style={styles.projectCard}
                onClick={() => setCurrentProject(project)}
              >
                <h3 
                  className="text-xl font-semibold mb-2"
                  style={{ color: '#1D1D1F' }}
                >
                  {project.title}
                </h3>
                <p 
                  className="text-sm mb-4"
                  style={{ color: '#6B7280' }}
                >
                  {project.description}
                </p>
                <div className="flex items-center justify-between">
                  <span 
                    className="text-xs px-3 py-1 rounded-full font-medium"
                    style={{ 
                      background: 'rgba(0, 122, 255, 0.1)',
                      color: '#007AFF',
                    }}
                  >
                    {project.status}
                  </span>
                  <span 
                    className="text-xs"
                    style={{ color: '#9CA3AF' }}
                  >
                    {project.updatedAt.toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
