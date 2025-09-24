import React from 'react';
import { Scene } from '../types';
import { DownloadIcon } from './icons';

interface SceneGridProps {
  scenes: Scene[];
  onGenerateThumbnail: (index: number) => void;
  generatingIndex: number | null;
  error: string | null;
  onPromptChange: (index: number, newPrompt: string) => void;
  onBack: () => void;
}

const SceneGrid: React.FC<SceneGridProps> = ({ scenes, onGenerateThumbnail, generatingIndex, error, onPromptChange, onBack }) => {
  
  const handleDownload = (base64Image: string, index: number) => {
    const link = document.createElement('a');
    link.href = `data:image/jpeg;base64,${base64Image}`;
    link.download = `scene_${index + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 text-transparent bg-clip-text">
          Visual Storyboard
        </h2>
        <p className="text-slate-400 mt-2 mb-8 max-w-2xl mx-auto">
          Review the generated scene prompts. You can edit any prompt before generating or regenerating its thumbnail.
        </p>
      </div>
      
      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md mb-6 max-w-4xl mx-auto" role="alert">
            <p className="font-bold">An error occurred during thumbnail generation</p>
            <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {scenes.map((scene, index) => (
          <div
            key={index}
            className="bg-slate-800 rounded-lg overflow-hidden shadow-lg group transition-all duration-300 hover:shadow-cyan-500/20 flex flex-col"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="aspect-video relative overflow-hidden bg-slate-900 flex items-center justify-center">
              {scene.image && (
                <img
                  src={`data:image/jpeg;base64,${scene.image}`}
                  alt={`Scene ${index + 1}`}
                  className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-40"
                />
              )}
              
              {generatingIndex === index ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2 bg-slate-900/50">
                  <div className="w-8 h-8 border-2 border-dashed rounded-full animate-spin border-purple-400"></div>
                  <span className="text-xs text-slate-400">Generating...</span>
                </div>
              ) : (
                <div className={`absolute inset-0 flex items-center justify-center gap-2 transition-opacity ${scene.image ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                    <button
                      onClick={() => onGenerateThumbnail(index)}
                      disabled={generatingIndex !== null}
                      className="bg-cyan-600/50 text-cyan-200 font-semibold py-2 px-4 rounded-md hover:bg-cyan-600/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {scene.image ? 'Regenerate' : 'Generate Thumbnail'}
                    </button>
                    {scene.image && (
                      <button
                        onClick={() => handleDownload(scene.image!, index)}
                        title="Download Image"
                        className="p-2 rounded-full bg-slate-900/50 hover:bg-slate-900/80 transition-colors"
                      >
                        <DownloadIcon />
                      </button>
                    )}
                </div>
              )}
            </div>
            <div className="p-4 flex-grow flex flex-col">
              <label htmlFor={`scene-prompt-${index}`} className="block text-sm font-bold text-purple-400 mb-1">Scene {index + 1}</label>
              <textarea
                id={`scene-prompt-${index}`}
                value={scene.prompt}
                onChange={(e) => onPromptChange(index, e.target.value)}
                rows={4}
                className="w-full text-sm text-slate-300 leading-relaxed bg-slate-700/50 rounded-md p-2 focus:ring-2 focus:ring-purple-500 border-transparent focus:border-purple-500 transition resize-none disabled:opacity-70"
                disabled={generatingIndex !== null}
                aria-label={`Editable prompt for Scene ${index + 1}`}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-12 text-center">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-md transition-colors duration-200"
        >
          &larr; Back to Concept
        </button>
      </div>
    </div>
  );
};

export default SceneGrid;