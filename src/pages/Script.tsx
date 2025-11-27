import { useStore } from '../stores/useStore';
import { Plus, Trash2 } from 'lucide-react';
import { generateId } from '../lib/utils';

export function Script() {
  const { currentProject, scenes, scriptLines, addScriptLine, deleteScriptLine } = useStore();

  const projectScenes = scenes.filter((scene) => scene.projectId === currentProject?.id);

  const handleAddLine = (sceneId: string) => {
    if (!currentProject) return;

    const sceneLines = scriptLines.filter((line) => line.sceneId === sceneId);

    const newLine = {
      id: generateId(),
      projectId: currentProject.id,
      sceneId,
      order: sceneLines.length,
      visual: '',
      audio: '',
      notes: '',
      createdAt: new Date(),
    };

    addScriptLine(newLine);
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
        <h1 className="text-3xl font-bold text-gray-900">Script</h1>
      </div>

      {projectScenes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500">Create scenes in the Storyboard first</p>
        </div>
      ) : (
        projectScenes
          .sort((a, b) => {
            if (a.act !== b.act) {
              return a.act.localeCompare(b.act);
            }
            return a.order - b.order;
          })
          .map((scene) => {
            const sceneLines = scriptLines
              .filter((line) => line.sceneId === scene.id)
              .sort((a, b) => a.order - b.order);

            return (
              <div key={scene.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{scene.title}</h3>
                  <button
                    onClick={() => handleAddLine(scene.id)}
                    className="flex items-center space-x-2 px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Line</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {sceneLines.length === 0 ? (
                    <p className="text-gray-500 text-sm">No script lines yet</p>
                  ) : (
                    <>
                      <div className="grid grid-cols-3 gap-4 mb-2">
                        <div className="font-semibold text-sm text-gray-700">Visual</div>
                        <div className="font-semibold text-sm text-gray-700">Audio</div>
                        <div className="font-semibold text-sm text-gray-700">Notes</div>
                      </div>
                      {sceneLines.map((line) => (
                        <div key={line.id} className="grid grid-cols-3 gap-4 items-start">
                          <textarea
                            value={line.visual}
                            placeholder="Visual description..."
                            className="p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                            rows={3}
                            readOnly
                          />
                          <textarea
                            value={line.audio}
                            placeholder="Audio/dialogue..."
                            className="p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                            rows={3}
                            readOnly
                          />
                          <div className="flex space-x-2">
                            <textarea
                              value={line.notes}
                              placeholder="Production notes..."
                              className="flex-1 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                              rows={3}
                              readOnly
                            />
                            <button
                              onClick={() => deleteScriptLine(line.id)}
                              className="p-2 hover:bg-red-50 rounded text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            );
          })
      )}
    </div>
  );
}
