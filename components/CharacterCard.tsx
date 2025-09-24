
import React, { useState } from 'react';
import { Character } from '../types';

interface CharacterCardProps {
    character: Character;
    onDelete: (id: string) => void;
    onGenerateSheet: (id: string, images: { b64: string, mimeType: string }[]) => Promise<boolean>;
    onDescriptionChange: (id: string, newDescription: string) => void;
    onDeleteReferenceImage: (characterId: string, imageIndex: number) => void;
    isGenerating: boolean;
}

const CharacterCard: React.FC<CharacterCardProps> = ({ character, onDelete, onGenerateSheet, onDescriptionChange, onDeleteReferenceImage, isGenerating }) => {
    const [localReferenceImages, setLocalReferenceImages] = useState<{ b64: string; mimeType: string }[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [showUploader, setShowUploader] = useState(character.sheetImages.length === 0);
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [editedDescription, setEditedDescription] = useState(character.description);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) {
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
                    setPreviews(prev => [...prev, ...newPreviews]);
                    setLocalReferenceImages(prev => [...prev, ...fileData]);
                }
            };
            reader.readAsDataURL(file);
        });
    };
    
    const handleDeleteLocalReferenceImage = (indexToRemove: number) => {
        setLocalReferenceImages(prev => prev.filter((_, index) => index !== indexToRemove));
        setPreviews(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleGenerateClick = async () => {
        const imagesToUse = [...(character.referenceImages || []), ...localReferenceImages];
        if (imagesToUse && imagesToUse.length > 0) {
            const success = await onGenerateSheet(character.id, imagesToUse);
            if (success) {
                setShowUploader(false);
                setLocalReferenceImages([]);
                setPreviews([]);
            }
        }
    };
    
    const handleRegenerateToggle = () => {
        const willShow = !showUploader;
        setShowUploader(willShow);
        if (!willShow) {
            // If we are hiding the uploader, clear any staged images
            setLocalReferenceImages([]);
            setPreviews([]);
        }
    };
    
    const handleSaveDescription = () => {
        if (editedDescription.trim()) {
            onDescriptionChange(character.id, editedDescription.trim());
            setIsEditingDescription(false);
        }
    };

    const handleCancelEditDescription = () => {
        setEditedDescription(character.description);
        setIsEditingDescription(false);
    };

    const hasSheet = character.sheetImages.length > 0;
    const hasImagesReady = [...(character.referenceImages || []), ...localReferenceImages].length > 0;

    return (
        <div className="bg-slate-800/50 rounded-lg p-6 shadow-lg transition-all duration-300">
            <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                    <h3 className="text-2xl font-bold text-slate-100">{character.name}</h3>
                     {isEditingDescription ? (
                        <div className="mt-2 space-y-2">
                            <textarea
                                value={editedDescription}
                                onChange={(e) => setEditedDescription(e.target.value)}
                                rows={3}
                                className="w-full text-sm text-slate-300 bg-slate-700/50 rounded-md p-2 focus:ring-2 focus:ring-purple-500 border-transparent focus:border-purple-500 transition resize-y"
                                aria-label={`Edit description for ${character.name}`}
                            />
                            <div className="flex items-center gap-2">
                                <button onClick={handleSaveDescription} className="text-xs bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-1 px-3 rounded-md transition-colors">Save</button>
                                <button onClick={handleCancelEditDescription} className="text-xs bg-slate-600 hover:bg-slate-500 text-white font-semibold py-1 px-3 rounded-md transition-colors">Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-start gap-2 mt-1">
                            <p className="text-slate-400 flex-1">{character.description}</p>
                            <button onClick={() => setIsEditingDescription(true)} className="text-slate-500 hover:text-cyan-400 transition-colors flex-shrink-0" title="Edit description">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                                    <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
                <button
                    onClick={() => onDelete(character.id)}
                    className="ml-4 text-slate-500 hover:text-red-400 transition-colors"
                    title="Delete Character"
                    aria-label={`Delete character ${character.name}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>

            {hasSheet && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {character.sheetImages.map((imageB64, index) => (
                        <div key={index} className="bg-slate-900 rounded-lg p-1">
                            <img
                                src={`data:image/jpeg;base64,${imageB64}`}
                                alt={`${character.name} - Pose ${index + 1}`}
                                className="rounded-md object-cover w-full aspect-[3/4]"
                            />
                        </div>
                    ))}
                </div>
            )}

            {showUploader && (
                <div className="mt-6 bg-slate-900/40 p-4 rounded-lg space-y-4">
                    <div>
                        <label htmlFor={`ref-images-${character.id}`} className="block text-sm font-medium text-slate-300 mb-2">
                           {hasSheet ? 'Upload New Reference Images to Regenerate' : 'Upload Reference Images'}
                        </label>
                        <input
                            id={`ref-images-${character.id}`}
                            type="file"
                            multiple
                            accept="image/png, image/jpeg, image/webp"
                            onChange={handleFileChange}
                            disabled={isGenerating}
                            className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-600/20 file:text-purple-300 hover:file:bg-purple-600/40 transition-colors cursor-pointer"
                        />
                         <p className="text-xs text-slate-500 mt-2">Select one or more images that define this character's appearance.</p>
                    </div>
                    
                    {character.referenceImages && character.referenceImages.length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium text-slate-300 mb-2">Current Reference Images:</h4>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                {character.referenceImages.map((img, index) => (
                                    <div key={`saved-${index}`} className="relative group">
                                        <img src={`data:${img.mimeType};base64,${img.b64}`} alt={`Reference ${index + 1}`} className="rounded-md object-cover aspect-square bg-slate-800" />
                                        <button
                                            onClick={() => onDeleteReferenceImage(character.id, index)}
                                            className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                                            aria-label="Delete reference image"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {previews.length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium text-slate-300 mb-2">New Images to Add:</h4>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                {previews.map((src, index) => (
                                    <div key={`new-${index}`} className="relative group">
                                        <img src={src} alt={`New Preview ${index + 1}`} className="rounded-md object-cover aspect-square bg-slate-800" />
                                         <button
                                            onClick={() => handleDeleteLocalReferenceImage(index)}
                                            className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                                            aria-label="Delete new image"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
            
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <button
                    onClick={handleGenerateClick}
                    disabled={!hasImagesReady || isGenerating}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-cyan-600 text-white font-bold py-2 px-4 rounded-md hover:bg-cyan-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isGenerating && <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-white"></div>}
                    {isGenerating ? 'Generating...' : (hasSheet ? 'Regenerate Sheet' : 'Generate Character Sheet')}
                </button>
                {hasSheet && (
                     <button
                        onClick={handleRegenerateToggle}
                        disabled={isGenerating}
                        className="w-full sm:w-auto bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-md transition-colors"
                     >
                         {showUploader ? 'Cancel Regeneration' : 'Regenerate'}
                     </button>
                )}
            </div>
        </div>
    );
};

export default CharacterCard;
