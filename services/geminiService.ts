import { GoogleGenAI, Modality, Type } from "@google/genai";
import { Character, Concept } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateInitialCharacters = async (songTitle: string, lyrics: string): Promise<{name: string, description: string}[]> => {
    try {
        const characterInfoResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Based on the song '${songTitle}' with lyrics:\n\n${lyrics}\n\nDescribe three distinct and compelling main characters for a music video. For each character, provide a unique name and a brief backstory/description relevant to the song's themes.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        characters: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                },
                                required: ["name", "description"]
                            }
                        }
                    },
                    required: ["characters"]
                },
            },
        });
        
        const result = JSON.parse(characterInfoResponse.text);
        return result.characters.slice(0, 3);

    } catch (error) {
        console.error("Error generating initial characters:", error);
        throw new Error("Failed to generate initial characters.");
    }
};

export const generateCharacterName = async (description: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Based on the following character description, suggest a single, cool, and fitting name. Description: "${description}". Respond with only the name.`,
             config: {
                stopSequences: ["\n"]
            }
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating character name:", error);
        throw new Error("Failed to suggest a character name.");
    }
};

export const generateCharacterSheet = async (
    characterDetails: { name: string; description: string },
    referenceImages: { b64: string; mimeType: string }[]
): Promise<string[]> => {
    try {
        const imageParts = referenceImages.map(img => ({
            inlineData: { data: img.b64, mimeType: img.mimeType }
        }));

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    ...imageParts,
                    { text: `Based on the reference images, create a character sheet for '${characterDetails.name}', described as: "${characterDetails.description}". Generate three cinematic, photorealistic images with consistent appearance: 1. Full-body shot. 2. Medium shot from the waist up. 3. Close-up portrait. Maintain the same character, clothing, and style.` },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.IMAGE, Modality.IMAGE],
            },
        });

        const imageB64s = response.candidates[0].content.parts
            .filter(part => part.inlineData)
            .map(part => part.inlineData!.data);

        if (imageB64s.length < 1) {
             throw new Error("Model did not return any images for the character sheet.");
        }

        return imageB64s;
    } catch (error) {
        console.error("Error generating character sheet:", error);
        throw new Error("Failed to generate the character sheet from reference images.");
    }
};


export const generateConcept = async (
    songTitle: string,
    lyrics: string,
    characters: Character[],
): Promise<Concept> => {
  try {
    const mainCharacter = characters[0];
    const otherCharacters = characters.slice(1);
    let characterDescription = `featuring the main character '${mainCharacter.name}' (${mainCharacter.description})`;
    if (otherCharacters.length > 0) {
        characterDescription += ` and supporting character(s): ${otherCharacters.map(c => `'${c.name}'`).join(', ')}`;
    }

    const conceptResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `For a music video for the song '${songTitle}' ${characterDescription}, create a brief music video concept. Based on their collective appearance, describe the overall aesthetic (e.g., 'gritty urban noir', 'surreal dreamscape'). Also provide a short story arc, and explain how the story connects to the song's lyrics.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            aesthetic: { type: Type.STRING },
            story: { type: Type.STRING },
            songRelation: { type: Type.STRING },
          },
        },
      },
    });

    return JSON.parse(conceptResponse.text);
  } catch (error) {
    console.error("Error generating concept:", error);
    throw new Error("Failed to generate the music video concept.");
  }
};

export const generateScenePrompts = async (
    songTitle: string,
    characters: Character[],
    concept: Concept,
): Promise<string[]> => {
    try {
        const characterNames = characters.map(c => c.name).join(', ');
        const mainCharacterName = characters[0].name;

        const scenePromptsResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Based on the song '${songTitle}', the characters (${characterNames}), and the concept '${concept.aesthetic} - ${concept.story}', generate exactly 20 distinct, chronological scene prompts for a music video. Each prompt should be a concise, visually descriptive sentence suitable for an image generation model. Ensure '${mainCharacterName}' is the primary subject, but include other characters where the story requires.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        scenes: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                        },
                    },
                },
            },
        });

        const { scenes: prompts } = JSON.parse(scenePromptsResponse.text);

        if (!prompts || prompts.length === 0) {
            throw new Error("No scene prompts were generated.");
        }

        return prompts.slice(0, 20);
    } catch (error) {
        console.error("Error generating scene prompts:", error);
        throw new Error("Failed to generate storyboard prompts.");
    }
};

export const generateSceneImage = async (
    prompt: string,
    concept: Concept,
    characters: Character[],
    aspectRatio: string,
): Promise<string> => {
    try {
        const charactersInPrompt = characters.filter(char => prompt.includes(char.name));
        const charactersToUse = charactersInPrompt.length > 0 ? charactersInPrompt : (characters.length > 0 ? [characters[0]] : []);

        if (charactersToUse.length === 0) {
             throw new Error("No characters available to generate the scene.");
        }

        const imageParts = charactersToUse.flatMap(c => 
            c.sheetImages.map(imgB64 => ({
                inlineData: { data: imgB64, mimeType: 'image/jpeg' }
            }))
        );
        
        const characterReferenceText = charactersToUse
            .map(c => `For the character '${c.name}', strictly adhere to their appearance in the provided reference images.`)
            .join(' ');

        let aspectRatioDescription = '';
        switch (aspectRatio) {
            case '16:9':
                aspectRatioDescription = 'a standard widescreen cinematic format (16:9)';
                break;
            case '9:16':
                aspectRatioDescription = 'a tall vertical format, like a smartphone screen (9:16)';
                break;
            case '4:3':
                aspectRatioDescription = 'a classic landscape format (4:3)';
                break;
            case '3:4':
                aspectRatioDescription = 'a standard portrait format (3:4)';
                break;
            case '1:1':
                aspectRatioDescription = 'a perfect square format (1:1)';
                break;
            default:
                aspectRatioDescription = `the format ${aspectRatio}`;
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    ...imageParts,
                    { text: `CRITICAL INSTRUCTION: Generate a single image with an EXACT aspect ratio of ${aspectRatio}. The final image dimensions MUST strictly follow ${aspectRatioDescription}. Do not crop the image or add black bars. This is the most important instruction.
                    
CHARACTER REFERENCE: ${characterReferenceText}
                    
SCENE: "${prompt}"
                    
STYLE: Cinematic music video still, ${concept.aesthetic}, high detail, professional color grading.` },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        const imagePart = response.candidates[0].content.parts.find(part => part.inlineData);
        if (!imagePart || !imagePart.inlineData) {
            throw new Error("Model failed to return an image for the scene.");
        }

        return imagePart.inlineData.data;

    } catch (error) {
        console.error("Error generating scene image:", error);
        throw new Error("Failed to generate scene image.");
    }
};