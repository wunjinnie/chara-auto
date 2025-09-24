
import React from 'react';
import { Character } from '../types';
import CharacterCard from './CharacterCard';

interface CharacterSheetDisplayProps {
  characters: Character[];
  onNext: () => void;
  onAddCharacter: () => void;
  onDeleteCharacter: (id: string) => void;
  onGenerateSheet: (id: string, images: { b64: string, mimeType: string }[]) => Promise<boolean>;
  onCharacterDescriptionChange: (id: string, newDescription: string) => void;
  onDeleteReferenceImage: (characterId: string, imageIndex: number) => void;
  generatingCharacterId: string | null;
  error: string | null;
}

const CharacterSheetDisplay: React.FC<CharacterSheetDisplayProps> = ({ 
    characters, 
    onNext, 
    onAddCharacter,
    onDeleteCharacter,
    onGenerateSheet,
    onCharacterDescriptionChange,
    onDeleteReferenceImage,
    generatingCharacterId,
    error
}) => {
  
  const canProceed = characters.length > 0 && characters.some(c => c.sheetImages.length > 0);

  return (
    <div className="animate-fade-in">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 text-transparent bg-clip-text">
                Character Roster
            </h2>
            <p className="text-slate-400 mt-2 max-w-2xl mx-auto">
                Your cast has been generated. Upload reference images for each character to create their visual style guide. You can add, delete, or regenerate characters as needed.
            </p>
        </div>

        {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md mb-6 max-w-4xl mx-auto" role="alert">
                <p className="font-bold">An error occurred</p>
                <p>{error}</p>
            </div>
        )}

        <div className="space-y-8">
            {characters.map((character) => (
                <CharacterCard 
                    key={character.id}
                    character={character}
                    onDelete={onDeleteCharacter}
                    onGenerateSheet={onGenerateSheet}
                    onDescriptionChange={onCharacterDescriptionChange}
                    onDeleteReferenceImage={onDeleteReferenceImage}
                    isGenerating={generatingCharacterId === character.id}
                />
            ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-8 mt-12 border-t border-slate-700">
            <button
              onClick={onAddCharacter}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-md transition-colors duration-200 w-full sm:w-auto"
            >
              Add Another Character
            </button>
            <button
              onClick={onNext}
              disabled={!canProceed}
              className="bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold py-3 px-6 rounded-md hover:from-purple-700 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-slate-900 transition-all duration-300 transform hover:scale-105 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
              title={!canProceed ? 'Generate a sheet for at least one character to continue.' : ''}
            >
              Create Video Concept
            </button>
        </div>
    </div>
  );
};

export default CharacterSheetDisplay;
