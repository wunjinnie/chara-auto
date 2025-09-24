
import React, { useState, useCallback, useEffect } from 'react';
import { Character, Concept, Scene, AppStep, Project } from './types';
import * as geminiService from './services/geminiService';
import * as projectService from './services/projectService';
import SongInputForm from './components/SongInputForm';
import CharacterSheetDisplay from './components/CharacterSheetDisplay';
import ConceptDisplay from './components/ConceptDisplay';
import SceneGrid from './components/SceneGrid';
import LoadingSpinner from './components/LoadingSpinner';
import ProgressBar from './components/ProgressBar';
import { LogoIcon, SaveIcon, FolderIcon, CheckIcon } from './components/icons';
import AddCharacterForm from './components/AddCharacterForm';
import ProjectsList from './components/ProjectsList';

const App: React.FC = () => {
  const [view, setView] = useState<'projects' | 'editor'>('projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  const [step, setStep] = useState<AppStep>(AppStep.INPUT);
  const [songTitle, setSongTitle] = useState('');
  const [lyrics, setLyrics] = useState('');

  const [characters, setCharacters] = useState<Character[]>([]);
  const [concept, setConcept] = useState<Concept | null>(null);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [aspectRatio, setAspectRatio] = useState('16:9');

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const [isAddingCharacter, setIsAddingCharacter] = useState(false);
  const [generatingSceneIndex, setGeneratingSceneIndex] = useState<number | null>(null);
  const [generatingCharacterId, setGeneratingCharacterId] = useState<string|null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    setProjects(projectService.getProjects());
  }, []);
  
  const resetEditorState = useCallback(() => {
    setStep(AppStep.INPUT);
    setSongTitle('');
    setLyrics('');
    setCharacters([]);
    setConcept(null);
    setScenes([]);
    setError(null);
    setIsLoading(false);
    setGeneratingSceneIndex(null);
    setIsAddingCharacter(false);
    setGeneratingCharacterId(null);
    setAspectRatio('16:9');
    setCurrentProjectId(null);
  }, []);

  const handleCreateNewProject = () => {
    resetEditorState();
    setCurrentProjectId(`${Date.now()}-${Math.random()}`);
    setView('editor');
  };

  const handleLoadProject = (id: string) => {
    const projectToLoad = projects.find(p => p.id === id);
    if (projectToLoad) {
      setSongTitle(projectToLoad.songTitle);
      setLyrics(projectToLoad.lyrics);
      setCharacters(projectToLoad.characters);
      setConcept(projectToLoad.concept);
      setScenes(projectToLoad.scenes);
      setAspectRatio(projectToLoad.aspectRatio);
      setStep(projectToLoad.step);
      setCurrentProjectId(projectToLoad.id);
      
      setError(null);
      setIsLoading(false);
      setGeneratingSceneIndex(null);
      setIsAddingCharacter(false);
      setGeneratingCharacterId(null);
      setSaveStatus('idle');
      
      setView('editor');
    }
  };

  const handleDeleteProject = (id: string) => {
    const updatedProjects = projects.filter(p => p.id !== id);
    setProjects(updatedProjects);
    projectService.saveProjects(updatedProjects);
  };
  
  const handleSaveProject = useCallback(() => {
    if (!currentProjectId || !songTitle.trim()) {
      alert("Please enter a song title before saving.");
      return;
    }
    setSaveStatus('saving');
    const projectData: Project = {
      id: currentProjectId,
      songTitle,
      lyrics,
      characters,
      concept,
      scenes,
      aspectRatio,
      step,
      lastSaved: Date.now()
    };

    const existingIndex = projects.findIndex(p => p.id === currentProjectId);
    let updatedProjects;
    if (existingIndex > -1) {
      updatedProjects = [...projects];
      updatedProjects[existingIndex] = projectData;
    } else {
      updatedProjects = [...projects, projectData];
    }
    
    updatedProjects.sort((a, b) => b.lastSaved - a.lastSaved);
    
    setProjects(updatedProjects);
    projectService.saveProjects(updatedProjects);
    
    setTimeout(() => {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
    }, 500);
  }, [currentProjectId, songTitle, lyrics, characters, concept, scenes, aspectRatio, step, projects]);

  const handleGoToProjects = () => {
    resetEditorState();
    setView('projects');
  };

  const handleInitialCharacters = async (title: string, lyricsText: string) => {
    setSongTitle(title);
    setLyrics(lyricsText);
    setIsLoading(true);
    setLoadingMessage('Dreaming up your characters...');
    setError(null);
    try {
      const initialChars = await geminiService.generateInitialCharacters(title, lyricsText);
      const newCharacters = initialChars.map(char => ({
        ...char,
        id: `${Date.now()}-${Math.random()}`,
        sheetImages: [],
      }));
      setCharacters(newCharacters);
      setStep(AppStep.CHARACTER_SHEET);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
      setStep(AppStep.INPUT);
    } finally {
      setIsLoading(false);
    }
  };

 const handleGenerateOrUpdateSheet = async (characterId: string, referenceImages: { b64: string; mimeType: string }[]): Promise<boolean> => {
    const characterToUpdate = characters.find(c => c.id === characterId);
    if (!characterToUpdate || referenceImages.length === 0) {
        setError("Please upload at least one reference image.");
        return false;
    }
    setGeneratingCharacterId(characterId);
    setError(null);
    try {
        const sheetImages = await geminiService.generateCharacterSheet(characterToUpdate, referenceImages);
        setCharacters(prev => prev.map(c => 
            c.id === characterId ? { ...c, sheetImages, referenceImages } : c
        ));
        return true;
    } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to generate character sheet.');
        return false;
    } finally {
        setGeneratingCharacterId(null);
    }
 };

  const handleDeleteCharacter = (characterId: string) => {
    setCharacters(prev => prev.filter(c => c.id !== characterId));
  };

  const handleSecondaryCharacterAdded = (character: Omit<Character, 'id'>) => {
    const newCharacter: Character = {
        ...character,
        id: `${Date.now()}-${Math.random()}`,
    };
    setCharacters(prev => [...prev, newCharacter]);
    setIsAddingCharacter(false);
  };

  const handleCharacterDescriptionChange = (characterId: string, newDescription: string) => {
    setCharacters(prev => prev.map(c => 
        c.id === characterId ? { ...c, description: newDescription } : c
    ));
  };

  const handleDeleteReferenceImage = (characterId: string, imageIndex: number) => {
    setCharacters(prev => prev.map(c => {
        if (c.id === characterId && c.referenceImages) {
            const updatedImages = [...c.referenceImages];
            updatedImages.splice(imageIndex, 1);
            return { ...c, referenceImages: updatedImages };
        }
        return c;
    }));
  };

  const handleGenerateConcept = async () => {
    const charactersWithSheets = characters.filter(c => c.sheetImages.length > 0);
    if (charactersWithSheets.length === 0) {
        setError("Please generate a character sheet for at least one character before proceeding.");
        return;
    }
    setIsLoading(true);
    setLoadingMessage('Developing the video concept...');
    setError(null);
    try {
        const result = await geminiService.generateConcept(songTitle, lyrics, charactersWithSheets);
        setConcept(result);
        setStep(AppStep.CONCEPT);
    } catch (e) {
        setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleStoryArcChange = (newStory: string) => {
    setConcept(prevConcept => {
        if (prevConcept) {
            return { ...prevConcept, story: newStory };
        }
        return null;
    });
  };

  const handleGenerateScenes = async () => {
    const charactersWithSheets = characters.filter(c => c.sheetImages.length > 0);
    if (charactersWithSheets.length === 0 || !concept) return;
    setIsLoading(true);
    setLoadingMessage('Generating scene prompts...');
    setError(null);
    try {
      const prompts = await geminiService.generateScenePrompts(songTitle, charactersWithSheets, concept);
      setScenes(prompts.map(p => ({ prompt: p, image: null })));
      setStep(AppStep.SCENES);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateThumbnail = async (index: number) => {
    const charactersWithSheets = characters.filter(c => c.sheetImages.length > 0);
    if (generatingSceneIndex !== null || !concept || !scenes[index] || charactersWithSheets.length === 0) return;

    setGeneratingSceneIndex(index);
    setError(null);
    try {
        const imageB64 = await geminiService.generateSceneImage(scenes[index].prompt, concept, charactersWithSheets, aspectRatio);
        const updatedScenes = [...scenes];
        updatedScenes[index] = { ...updatedScenes[index], image: imageB64 };
        setScenes(updatedScenes);
    } catch (e) {
        setError(e instanceof Error ? e.message : 'An unknown error occurred. Please try again.');
    } finally {
        setGeneratingSceneIndex(null);
    }
  };
  
  const handleScenePromptChange = (index: number, newPrompt: string) => {
    const updatedScenes = [...scenes];
    updatedScenes[index] = { ...updatedScenes[index], prompt: newPrompt };
    setScenes(updatedScenes);
  };

  const handleBackToConcept = () => {
    setStep(AppStep.CONCEPT);
    // Clearing scenes prevents seeing old scenes if you regenerate them
    setScenes([]);
  };

  const renderContent = () => {
    switch (step) {
      case AppStep.INPUT:
        return <SongInputForm onGenerate={handleInitialCharacters} error={error} />;
      case AppStep.CHARACTER_SHEET:
        if (isAddingCharacter) {
            return <AddCharacterForm 
                onCancel={() => setIsAddingCharacter(false)} 
                onCharacterAdded={handleSecondaryCharacterAdded}
            />;
        }
        return <CharacterSheetDisplay 
            characters={characters} 
            onNext={handleGenerateConcept}
            onAddCharacter={() => setIsAddingCharacter(true)}
            onDeleteCharacter={handleDeleteCharacter}
            onGenerateSheet={handleGenerateOrUpdateSheet}
            generatingCharacterId={generatingCharacterId}
            onCharacterDescriptionChange={handleCharacterDescriptionChange}
            onDeleteReferenceImage={handleDeleteReferenceImage}
            error={error}
        />;
      case AppStep.CONCEPT:
        return concept && <ConceptDisplay 
          concept={concept} 
          onNext={handleGenerateScenes} 
          aspectRatio={aspectRatio}
          onAspectRatioChange={setAspectRatio}
          onStoryArcChange={handleStoryArcChange}
        />;
      case AppStep.SCENES:
        return scenes.length > 0 && (
          <SceneGrid
            scenes={scenes}
            onGenerateThumbnail={handleGenerateThumbnail}
            generatingIndex={generatingSceneIndex}
            error={error}
            onPromptChange={handleScenePromptChange}
            onBack={handleBackToConcept}
          />
        );
      default:
        return <SongInputForm onGenerate={handleInitialCharacters} error={error} />;
    }
  };
  
  if (view === 'projects') {
    return (
      <ProjectsList
        projects={projects}
        onCreateNew={handleCreateNewProject}
        onLoadProject={handleLoadProject}
        onDeleteProject={handleDeleteProject}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 sm:p-6 lg:p-8">
      {isLoading && <LoadingSpinner message={loadingMessage} />}
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <div className="flex items-center gap-3 mb-4 sm:mb-0">
            <LogoIcon />
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-cyan-400 text-transparent bg-clip-text">
              MV Director AI
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
              <button
                  onClick={handleSaveProject}
                  disabled={!songTitle.trim() || saveStatus !== 'idle'}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  {saveStatus === 'saved' ? <CheckIcon /> : <SaveIcon />}
                  <span className="hidden sm:inline">
                      {saveStatus === 'idle' && 'Save Project'}
                      {saveStatus === 'saving' && 'Saving...'}
                      {saveStatus === 'saved' && 'Saved!'}
                  </span>
              </button>
              <button
                  onClick={handleGoToProjects}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md transition-colors duration-200"
              >
                  <FolderIcon />
                  <span className="hidden sm:inline">My Projects</span>
              </button>
          </div>
        </header>

        {step > AppStep.INPUT && <ProgressBar currentStep={step} />}

        <main className="mt-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
