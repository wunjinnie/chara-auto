import React, { useState } from 'react';
import * as geminiService from '../services/geminiService';
import { Character } from '../types';

interface AddCharacterFormProps {
  onCancel: () => void;
  onCharacterAdded: (character: Omit<Character, 'id'>) => void;
}

const AddCharacterForm: React.FC<AddCharacterFormProps> = ({ onCancel, onCharacterAdded }) => {
  const [description, setDescription] = useState('');
  const [name, setName] = useState('');
  const [referenceImages, setReferenceImages] = useState<{ b64: string; mimeType: string }[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  
  const [isSuggestingName, setIsSuggestingName] = useState(false);
  const [isGeneratingSheet, setIsGeneratingSheet] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSuggestName = async () => {
    if (!description.trim()) {
      setError('Please provide a character description first.');
      return;
    }
    setIsSuggestingName(true);
    setError(null);
    try {
      const suggestedName = await geminiService.generateCharacterName(description);
      setName(suggestedName);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to suggest a name.');
    } finally {
      setIsSuggestingName(false);
    }
  };

  const handleGenerateSheet = async () => {
    if (!name.trim() || !description.trim() || referenceImages.length === 0) {
        setError('Please provide a name, description, and at least one reference image.');
        return;
    }
    setIsGeneratingSheet(true);
    setError(null);
    try {
        const sheetImages = await geminiService.generateCharacterSheet({ name, description }, referenceImages);
        onCharacterAdded({ name, description, sheetImages, referenceImages });
    } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to generate character sheet.');
        setIsGeneratingSheet(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      setPreviews([]);
      setReferenceImages([]);
      return;
    }

    const fileArray = Array.from(files);
    const newPreviews: string[] = [];
    const fileData: { b64: string, mimeType: string }[] = [];
    let filesProcessed = 0;

    fileArray.forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        newPreviews.push(result);
        fileData.push({ b64: result.split(',')[1], mimeType: file.type });
        filesProcessed++;

        if (filesProcessed === fileArray.length) {
          setPreviews(newPreviews);
          setReferenceImages(fileData);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const isFormSubmittable = name.trim() && description.trim() && referenceImages.length > 0;

  return (
    <div className="bg-slate-800/50 rounded-lg p-8 animate-fade-in max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-purple-400 to-cyan-400 text-transparent bg-clip-text">
        Add Secondary Character
      </h2>
      <p className="text-center text-slate-400 mb-8">
        Describe a new character, get a name suggestion, and upload images to create their sheet.
      </p>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md mb-6" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">Character Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., A mysterious stranger who appears in the rain..."
            rows={3}
            className="w-full bg-slate-900 border border-slate-700 rounded-md p-3 text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-full">
            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">Character Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Suggested name will appear here"
              className="w-full bg-slate-900 border border-slate-700 rounded-md p-3 text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
            />
          </div>
          <button 
            onClick={handleSuggestName} 
            disabled={isSuggestingName || !description.trim()}
            className="w-full sm:w-auto mt-2 sm:mt-7 flex-shrink-0 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSuggestingName && <div className="w-4 h-4 border-2 border-dashed rounded-full animate-spin border-white"></div>}
            Suggest Name
          </button>
        </div>

        <div>
            <label htmlFor="referenceImages" className="block text-sm font-medium text-slate-300 mb-2">Upload Reference Images (Required)</label>
            <input
              id="referenceImages"
              type="file"
              multiple
              accept="image/png, image/jpeg, image/webp"
              onChange={handleFileChange}
              className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-600/20 file:text-purple-300 hover:file:bg-purple-600/40 transition-colors cursor-pointer"
            />
        </div>

        {previews.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-slate-300 mb-2">Image Previews:</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {previews.map((src, index) => (
                <img key={index} src={src} alt={`Preview ${index + 1}`} className="rounded-md object-cover aspect-square bg-slate-800" />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row-reverse justify-start items-center gap-4 pt-8 mt-8 border-t border-slate-700">
        <button
          onClick={handleGenerateSheet}
          disabled={!isFormSubmittable || isGeneratingSheet}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold py-3 px-6 rounded-md hover:from-purple-700 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-slate-900 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGeneratingSheet && <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-white"></div>}
          {isGeneratingSheet ? 'Generating...' : 'Generate & Add Character'}
        </button>
        <button
          onClick={onCancel}
          disabled={isGeneratingSheet}
          className="w-full sm:w-auto px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-md transition-colors duration-200 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AddCharacterForm;