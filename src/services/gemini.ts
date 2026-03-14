import { GoogleGenAI, Type } from '@google/genai';
import { PersonalRevisionManifest } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const INFLUENCE_NODES = [
  'History', 'Literature', 'Movies', 'Music', 'Culture', 'Traditions',
  'Religion', 'Philosophy', 'Climate', 'Experiences', 'Fashion',
  'Gastronomy', 'Olfactory'
];

const DEFAULT_CITIES = ['Tokyo', 'Paris', 'Marrakech', 'Mexico City', 'Mumbai'];

export async function synthesizeIdentity(
  contextText: string,
  imageFile?: File | null
): Promise<PersonalRevisionManifest> {
  const model = 'gemini-3.1-pro-preview';

  const prompt = `
    You are the "Identity Alchemist" (Transdisciplinary Style Architect).
    Your mission is to disrupt "Personal Brand Saturation" by synthesizing a hyper-individualized lifestyle and fashion archetype.
    You map 13 distinct influences into a singular, cohesive "Human Revision."

    The 13 Influence Nodes:
    ${INFLUENCE_NODES.join(', ')}

    The 5 Cities:
    ${DEFAULT_CITIES.join(', ')}

    OPERATIONAL PIPELINE:
    1. The Irrelevancy Match: Select one random item from each of the 13 nodes across the 5 cities.
    2. The Synthesis Engine: Use "Corroboration Logic" to bridge exactly three disparate nodes (e.g., French Philosophy + Kimchi Gastronomy + 80s Power Shoulders).
    3. The Output: Generate a "Personal Revision Manifest".

    ${contextText ? `User Context (Deep Personal History): ${contextText}` : ''}
    ${imageFile ? 'User Context Image: (Provided as attachment)' : ''}

    Follow the Inverted Capsule Logic: Reject "Quiet Luxury". Suggest 3 "Spectacular Outliers" rotated with radical high-contrast accessories.

    Generate the final Personal Revision Manifest.
  `;

  const parts: any[] = [{ text: prompt }];

  if (imageFile) {
    const base64Data = await fileToBase64(imageFile);
    parts.push({
      inlineData: {
        data: base64Data.split(',')[1],
        mimeType: imageFile.type,
      },
    });
  }

  const response = await ai.models.generateContent({
    model,
    contents: { parts },
    config: {
      temperature: 0.9,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          selectedNodes: {
            type: Type.ARRAY,
            description: 'Exactly 3 nodes selected for synthesis.',
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING, description: 'One of the 13 Influence Nodes' },
                value: { type: Type.STRING, description: 'The specific item/concept selected' },
                city: { type: Type.STRING, description: 'The city it originates from' },
              },
              required: ['category', 'value', 'city'],
            },
          },
          silhouette: { type: Type.STRING, description: 'Physical form and fabric choice.' },
          aura: { type: Type.STRING, description: 'Scent and culinary rituals.' },
          ethos: { type: Type.STRING, description: 'The philosophical justification for this new way of existing.' },
          revampText: { type: Type.STRING, description: 'A cohesive paragraph describing the new persona (e.g., "The Swicy Existentialist").' },
        },
        required: ['selectedNodes', 'silhouette', 'aura', 'ethos', 'revampText'],
      },
    },
  });

  const jsonStr = response.text?.trim() || '{}';
  return JSON.parse(jsonStr) as PersonalRevisionManifest;
}

export async function generatePersonaImage(revampText: string): Promise<string> {
  const prompt = `A high-fashion, editorial style portrait of a person embodying this aesthetic: ${revampText}. Cinematic lighting, avant-garde fashion, hyper-detailed, photorealistic.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: prompt }],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error('Failed to generate image');
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}
