
import React from 'react';
import { MessageSquare } from 'lucide-react';

const ToneGuideTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="w-5 h-5 text-jungle-600" />
          <h3 className="text-xl font-semibold text-jungle-700">🎙️ It's a Jungle – Tone & Voice Guide</h3>
        </div>
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-700 mb-4">
            This guide serves as a reference for AI generation and collaborators to maintain a consistent scripting tone and production voice.
          </p>
          
          <div className="my-6 border-t border-b border-gray-200 py-4">
            <h4 className="text-lg font-medium text-gray-900 mb-3">Tone & Style Summary:</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>Friendly, curious, and human-first</li>
              <li>Smart without being preachy</li>
              <li>Playful, bold, and visually expressive</li>
              <li>Grounded in science, open to storytelling</li>
            </ul>
            
            <p className="mt-4 text-gray-700">
              Scripts should feel like a clever, confident guide through complex ideas — using humor, analogies, 
              and emotional cues where appropriate. The host is not just informing, but engaging, surprising, and entertaining.
            </p>
          </div>
          
          <div className="my-6">
            <h4 className="text-lg font-medium text-gray-900 mb-3">Sample Prompts for AI Scripting:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                "Make this more conversational",
                "Punch this up for TikTok",
                "Soften this to sound more empathetic",
                "Add a fun metaphor",
                "Keep it smart, but playful"
              ].map((prompt, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-md border border-gray-200">
                  <p className="text-gray-700">"{prompt}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToneGuideTab;
