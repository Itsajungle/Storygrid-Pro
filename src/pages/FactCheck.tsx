import { useStore } from '../stores/useStore';
import { Plus, Trash2 } from 'lucide-react';
import { generateId, getConfidenceColor } from '../lib/utils';
import { useState } from 'react';
import { ConfidenceLevel } from '../types';

export function FactCheck() {
  const { currentProject, factChecks, addFactCheck, deleteFactCheck } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [newClaim, setNewClaim] = useState('');
  const [newSource, setNewSource] = useState('');
  const [newConfidence, setNewConfidence] = useState<ConfidenceLevel>('unverified');
  const [newNotes, setNewNotes] = useState('');

  const projectFactChecks = factChecks.filter(
    (fc) => fc.projectId === currentProject?.id
  );

  const handleAddFactCheck = () => {
    if (!currentProject || !newClaim.trim()) return;

    const newFactCheck = {
      id: generateId(),
      projectId: currentProject.id,
      claim: newClaim,
      source: newSource,
      confidence: newConfidence,
      notes: newNotes,
      verified: false,
      createdAt: new Date(),
    };

    addFactCheck(newFactCheck);
    setNewClaim('');
    setNewSource('');
    setNewConfidence('unverified');
    setNewNotes('');
    setShowForm(false);
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
        <h1 className="text-3xl font-bold text-gray-900">Fact Check</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Fact Check</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Claim
            </label>
            <textarea
              value={newClaim}
              onChange={(e) => setNewClaim(e.target.value)}
              placeholder="Enter the claim to verify..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Source
            </label>
            <input
              type="text"
              value={newSource}
              onChange={(e) => setNewSource(e.target.value)}
              placeholder="URL or reference..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confidence Level
            </label>
            <select
              value={newConfidence}
              onChange={(e) => setNewConfidence(e.target.value as ConfidenceLevel)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="unverified">Unverified</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              placeholder="Additional notes..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              rows={2}
            />
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleAddFactCheck}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Add Fact Check
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

      <div className="space-y-4">
        {projectFactChecks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500">No fact checks yet</p>
          </div>
        ) : (
          projectFactChecks.map((factCheck) => (
            <div
              key={factCheck.id}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-gray-900 mb-2">{factCheck.claim}</p>
                  {factCheck.source && (
                    <a
                      href={factCheck.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-600 hover:underline"
                    >
                      {factCheck.source}
                    </a>
                  )}
                </div>
                <button
                  onClick={() => deleteFactCheck(factCheck.id)}
                  className="p-2 hover:bg-red-50 rounded text-red-600"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center space-x-4 text-sm">
                <span className={`px-2 py-1 rounded-full ${getConfidenceColor(factCheck.confidence)}`}>
                  {factCheck.confidence}
                </span>
                <span className="text-gray-500">
                  {factCheck.verified ? 'Verified' : 'Not verified'}
                </span>
              </div>

              {factCheck.notes && (
                <p className="mt-3 text-sm text-gray-600">{factCheck.notes}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
