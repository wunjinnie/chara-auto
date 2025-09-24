export interface Character {
  id: string;
  name: string;
  description: string;
  referenceImages?: { b64: string; mimeType: string }[]; // The user-uploaded source images
  sheetImages: string[]; // array of base64 strings
}

export interface Concept {
  aesthetic: string;
  story: string;
  songRelation: string;
}

export interface Scene {
  prompt: string;
  image: string | null; // base64 string, null if not generated yet
}

export enum AppStep {
  INPUT = 0,
  CHARACTER_SHEET = 1,
  CONCEPT = 2,
  SCENES = 3,
}

export interface Project {
  id: string;
  songTitle: string;
  lyrics: string;
  characters: Character[];
  concept: Concept | null;
  scenes: Scene[];
  aspectRatio: string;
  step: AppStep;
  lastSaved: number;
}