import { useStore } from '../stores/useStore';
import { Plus, Trash2, Clock } from 'lucide-react';
import { generateId, formatDuration, calculateTotalDuration } from '../lib/utils';
import { useState } from 'react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { StoryboardScene, StoryAct } from '../types';

function SortableScene({ scene, onDelete }: { scene: StoryboardScene; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: scene.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white rounded-lg border border-gray-200 p-4 cursor-move hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-gray-900">{scene.title}</h4>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 hover:bg-red-50 rounded text-red-600"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <p className="text-sm text-gray-600 mb-2">{scene.description}</p>
      <div className="flex items-center text-xs text-gray-500">
        <Clock className="w-4 h-4 mr-1" />
        {formatDuration(scene.duration)}
      </div>
    </div>
  );
}

export function Storyboard() {
  const { currentProject, scenes, addScene, deleteScene, reorderScenes } = useStore();
  const [selectedAct, setSelectedAct] = useState<StoryAct>('act1');

  const projectScenes = scenes.filter((scene) => scene.projectId === currentProject?.id);
  const act1Scenes = projectScenes.filter((s) => s.act === 'act1');
  const act2Scenes = projectScenes.filter((s) => s.act === 'act2');
  const act3Scenes = projectScenes.filter((s) => s.act === 'act3');

  const handleAddScene = () => {
    if (!currentProject) return;

    const newScene = {
      id: generateId(),
      projectId: currentProject.id,
      act: selectedAct,
      order: projectScenes.filter((s) => s.act === selectedAct).length,
      title: 'New Scene',
      description: 'Enter scene description...',
      duration: 30,
      visualNotes: '',
      createdAt: new Date(),
    };

    addScene(newScene);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const actScenes = projectScenes.filter((s) => s.act === selectedAct);
    const oldIndex = actScenes.findIndex((s) => s.id === active.id);
    const newIndex = actScenes.findIndex((s) => s.id === over.id);

    const reordered = [...actScenes];
    const [movedScene] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, movedScene);

    const updatedScenes = reordered.map((scene, index) => ({
      ...scene,
      order: index,
    }));

    const otherScenes = projectScenes.filter((s) => s.act !== selectedAct);
    reorderScenes([...otherScenes, ...updatedScenes]);
  };

  if (!currentProject) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please select a project first</p>
      </div>
    );
  }

  const currentActScenes = projectScenes
    .filter((s) => s.act === selectedAct)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Storyboard</h1>
        <button
          onClick={handleAddScene}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Scene</span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <h3 className="font-semibold text-gray-900 mb-2">Act 1: Setup</h3>
          <p className="text-2xl font-bold text-indigo-600">
            {formatDuration(calculateTotalDuration(act1Scenes))}
          </p>
          <p className="text-sm text-gray-500">{act1Scenes.length} scenes</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <h3 className="font-semibold text-gray-900 mb-2">Act 2: Confrontation</h3>
          <p className="text-2xl font-bold text-indigo-600">
            {formatDuration(calculateTotalDuration(act2Scenes))}
          </p>
          <p className="text-sm text-gray-500">{act2Scenes.length} scenes</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <h3 className="font-semibold text-gray-900 mb-2">Act 3: Resolution</h3>
          <p className="text-2xl font-bold text-indigo-600">
            {formatDuration(calculateTotalDuration(act3Scenes))}
          </p>
          <p className="text-sm text-gray-500">{act3Scenes.length} scenes</p>
        </div>
      </div>

      <div className="flex space-x-2">
        {(['act1', 'act2', 'act3'] as StoryAct[]).map((act) => (
          <button
            key={act}
            onClick={() => setSelectedAct(act)}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              selectedAct === act
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {act === 'act1' ? 'Act 1' : act === 'act2' ? 'Act 2' : 'Act 3'}
          </button>
        ))}
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={currentActScenes.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {currentActScenes.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-500">No scenes in this act yet</p>
              </div>
            ) : (
              currentActScenes.map((scene) => (
                <SortableScene
                  key={scene.id}
                  scene={scene}
                  onDelete={() => deleteScene(scene.id)}
                />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
