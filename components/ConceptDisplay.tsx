import React, { useState } from 'react';
import { Concept } from '../types';

interface ConceptDisplayProps {
  concept: Concept;
  onNext: () => void;
  aspectRatio: string;
  onAspectRatioChange: (ratio: string) => void;
  onStoryArcChange: (newStory: string) => void;
}

const AspectRatioButton: React.FC<{
  ratio: string;
  label: string;
  currentRatio: string;
  onClick: (ratio: string) => void;
}> = ({ ratio, label, currentRatio, onClick }) => (
  <button
    onClick={() => onClick(ratio)}
    className={`px-4 py-2 rounded-md transition-all duration-200 font-semibold border-2 ${
      currentRatio === ratio
        ? 'bg-cyan-500 text-white border-cyan-500'
        : 'bg-slate-700/50 hover:bg-slate-600/50 border-slate-600 text-slate-300'
    }`}
  >
    <div className="text-sm">{label}</div>
    <div className="text-xs text-slate-400">{ratio}</div>
  </button>
);


const ConceptDisplay: React.FC<ConceptDisplayProps> = ({ concept, onNext, aspectRatio, onAspectRatioChange, onStoryArcChange }) => {
  const [isEditingStory, setIsEditingStory] = useState(false);
  const [editedStory, setEditedStory] = useState(concept.story);

  const handleSaveStory = () => {
    if (editedStory.trim()) {
      onStoryArcChange(editedStory.trim());
      setIsEditingStory(false);
    }
  };

  const handleCancelEditStory = () => {
    setEditedStory(concept.story);
    setIsEditingStory(false);
  };


  return (
    <div className="bg-slate-800/50 rounded-lg p-8 animate-fade-in max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-purple-400 to-cyan-400 text-transparent bg-clip-text">
        Music Video Concept
      </h2>
      <div className="space-y-8">
        <div>
          <h3 className="text-xl font-semibold text-purple-400 mb-2 border-b-2 border-purple-800 pb-2">Aesthetic</h3>
          <p className="text-slate-300 leading-relaxed">{concept.aesthetic}</p>
        </div>
        <div>
          <div className="flex justify-between items-center mb-2 border-b-2 border-cyan-800 pb-2">
            <h3 className="text-xl font-semibold text-cyan-400">Story Arc</h3>
            {!isEditingStory && (
               <button onClick={() => setIsEditingStory(true)} className="text-slate-500 hover:text-cyan-400 transition-colors" title="Edit story arc">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                    <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                </svg>
            </button>
            )}
          </div>
           {isEditingStory ? (
              <div className="space-y-2">
                  <textarea
                      value={editedStory}
                      onChange={(e) => setEditedStory(e.target.value)}
                      rows={5}
                      className="w-full text-sm text-slate-300 bg-slate-700/50 rounded-md p-2 focus:ring-2 focus:ring-cyan-500 border-transparent focus:border-cyan-500 transition resize-y"
                      aria-label="Edit story arc"
                  />
                  <div className="flex items-center gap-2">
                      <button onClick={handleSaveStory} className="text-xs bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-1 px-3 rounded-md transition-colors">Save</button>
                      <button onClick={handleCancelEditStory} className="text-xs bg-slate-600 hover:bg-slate-500 text-white font-semibold py-1 px-3 rounded-md transition-colors">Cancel</button>
                  </div>
              </div>
          ) : (
            <p className="text-slate-300 leading-relaxed">{concept.story}</p>
          )}
        </div>
        <div>
          <h3 className="text-xl font-semibold text-slate-300 mb-2 border-b-2 border-slate-700 pb-2">Relation to Song</h3>
          <p className="text-slate-300 leading-relaxed">{concept.songRelation}</p>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-purple-400 mb-4 border-b-2 border-purple-800 pb-2">Storyboard Aspect Ratio</h3>
           <div className="flex flex-wrap items-center gap-4">
            <AspectRatioButton ratio="16:9" label="Widescreen" currentRatio={aspectRatio} onClick={onAspectRatioChange} />
            <AspectRatioButton ratio="9:16" label="Vertical" currentRatio={aspectRatio} onClick={onAspectRatioChange} />
            <AspectRatioButton ratio="4:3" label="Landscape" currentRatio={aspectRatio} onClick={onAspectRatioChange} />
            <AspectRatioButton ratio="3:4" label="Portrait" currentRatio={aspectRatio} onClick={onAspectRatioChange} />
            <AspectRatioButton ratio="1:1" label="Square" currentRatio={aspectRatio} onClick={onAspectRatioChange} />
          </div>
        </div>
      </div>
      <div className="text-center pt-8 mt-8 border-t border-slate-700">
        <button
          onClick={onNext}
          className="bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold py-3 px-6 rounded-md hover:from-purple-700 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-slate-900 transition-all duration-300 transform hover:scale-105"
        >
          Generate Storyboard Scenes
        </button>
      </div>
    </div>
  );
};

export default ConceptDisplay;