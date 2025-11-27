import { useStore } from '../stores/useStore';
import { Plus, Trash2, Calendar } from 'lucide-react';
import { generateId, formatDate, getStatusColor } from '../lib/utils';
import { useState } from 'react';
import { TaskStatus, TaskPriority } from '../types';

export function Timeline() {
  const { currentProject, tasks, addTask, deleteTask } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newAssignee, setNewAssignee] = useState('');
  const [newStatus, setNewStatus] = useState<TaskStatus>('todo');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [newDueDate, setNewDueDate] = useState('');
  const [newEstimatedHours, setNewEstimatedHours] = useState('8');

  const projectTasks = tasks.filter((task) => task.projectId === currentProject?.id);

  const handleAddTask = () => {
    if (!currentProject || !newTitle.trim()) return;

    const newTask = {
      id: generateId(),
      projectId: currentProject.id,
      title: newTitle,
      description: newDescription,
      assignee: newAssignee,
      status: newStatus,
      priority: newPriority,
      dueDate: newDueDate ? new Date(newDueDate) : new Date(),
      estimatedHours: parseInt(newEstimatedHours) || 8,
      dependencies: [],
      createdAt: new Date(),
    };

    addTask(newTask);
    setNewTitle('');
    setNewDescription('');
    setNewAssignee('');
    setNewStatus('todo');
    setNewPriority('medium');
    setNewDueDate('');
    setNewEstimatedHours('8');
    setShowForm(false);
  };

  if (!currentProject) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please select a project first</p>
      </div>
    );
  }

  const tasksByStatus = {
    todo: projectTasks.filter((t) => t.status === 'todo'),
    'in-progress': projectTasks.filter((t) => t.status === 'in-progress'),
    review: projectTasks.filter((t) => t.status === 'review'),
    done: projectTasks.filter((t) => t.status === 'done'),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Production Timeline</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Task</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Title
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Enter task title..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assignee
              </label>
              <input
                type="text"
                value={newAssignee}
                onChange={(e) => setNewAssignee(e.target.value)}
                placeholder="Assign to..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Task description..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as TaskStatus)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Est. Hours
              </label>
              <input
                type="number"
                value={newEstimatedHours}
                onChange={(e) => setNewEstimatedHours(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleAddTask}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Add Task
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        {(['todo', 'in-progress', 'review', 'done'] as TaskStatus[]).map((status) => (
          <div key={status} className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-4 capitalize">
              {status === 'in-progress' ? 'In Progress' : status}
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({tasksByStatus[status].length})
              </span>
            </h3>

            <div className="space-y-3">
              {tasksByStatus[status].length === 0 ? (
                <p className="text-sm text-gray-500">No tasks</p>
              ) : (
                tasksByStatus[status].map((task) => (
                  <div
                    key={task.id}
                    className="bg-white rounded-lg border border-gray-200 p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{task.title}</h4>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1 hover:bg-red-50 rounded text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {task.description && (
                      <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                    )}

                    <div className="flex items-center justify-between text-xs">
                      <span className={`px-2 py-1 rounded-full ${
                        task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                        task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.priority}
                      </span>
                      <div className="flex items-center text-gray-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(task.dueDate)}
                      </div>
                    </div>

                    {task.assignee && (
                      <p className="text-xs text-gray-500 mt-2">
                        Assigned to: {task.assignee}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
