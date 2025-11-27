import { useStore } from '../stores/useStore';
import { Plus, ThumbsUp, ThumbsDown, Trash2 } from 'lucide-react';
import { generateId } from '../lib/utils';
import { useState } from 'react';

export function IdeasLab() {
  const { currentProject, ideas, addIdea, voteIdea, deleteIdea } = useStore();
  const [newIdeaContent, setNewIdeaContent] = useState('');

  const projectIdeas = ideas.filter(
    (idea) => idea.projectId === currentProject?.id
  );

  const handleAddIdea = () => {
    if (!currentProject || !newIdeaContent.trim()) return;

    const newIdea = {
      id: generateId(),
      projectId: currentProject.id,
      content: newIdeaContent,
      aiGenerated: false,
      votes: 0,
      createdAt: new Date(),
    };

    addIdea(newIdea);
    setNewIdeaContent('');
  };

  if (!currentProject) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please select a project first</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Ideas Lab</h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newIdeaContent}
            onChange={(e) => setNewIdeaContent(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddIdea()}
            placeholder="Enter your idea..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleAddIdea}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Idea</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {projectIdeas.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500">No ideas yet. Start brainstorming!</p>
          </div>
        ) : (
          projectIdeas
            .sort((a, b) => b.votes - a.votes)
            .map((idea) => (
              <div
                key={idea.id}
                className="bg-white rounded-lg border border-gray-200 p-6 flex items-start space-x-4"
              >
                <div className="flex flex-col items-center space-y-2">
                  <button
                    onClick={() => voteIdea(idea.id, 1)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <ThumbsUp className="w-5 h-5 text-green-600" />
                  </button>
                  <span className="text-lg font-semibold text-gray-900">
                    {idea.votes}
                  </span>
                  <button
                    onClick={() => voteIdea(idea.id, -1)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <ThumbsDown className="w-5 h-5 text-red-600" />
                  </button>
                </div>

                <div className="flex-1">
                  <p className="text-gray-900">{idea.content}</p>
                  {idea.aiGenerated && (
                    <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                      AI Generated
                    </span>
                  )}
                </div>

                <button
                  onClick={() => deleteIdea(idea.id)}
                  className="p-2 hover:bg-red-50 rounded text-red-600"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
