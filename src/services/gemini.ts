import { GoogleGenAI, Type } from '@google/genai';
import { PersonalRevisionManifest } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

export async function transcribeAudio(audioFile: File): Promise<string> {
  const base64Data = await fileToBase64(audioFile);
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      { inlineData: { data: base64Data.split(',')[1], mimeType: audioFile.type } },
      { text: 'Transcribe this audio accurately. Return only the transcription text without any markdown or extra commentary.' }
    ]
  });
  return response.text?.trim() || '';
}

export async function getEmbedding(text: string): Promise<number[]> {
  const result = await ai.models.embedContent({
    model: 'gemini-embedding-2-preview',
    contents: [text]
  });
  return result.embeddings?.[0]?.values || [];
}

export async function synthesizeIdentity(
  contextText: string,
  selectedCategories: string[],
  cities: string[],
  nodeImages: Record<string, File>,
  vibeImage: File | null,
  bizarreness: number
): Promise<PersonalRevisionManifest> {
  const model = 'gemini-3.1-pro-preview';

  const prompt = `
    You are the "Identity Alchemist" (Transdisciplinary Style Architect).
    Your mission is to disrupt "Personal Brand Saturation" by synthesizing a hyper-individualized lifestyle and fashion archetype.

    The ${selectedCategories.length} Selected Influence Nodes for this synthesis:
    ${selectedCategories.join(', ')}

    Available Cities:
    ${cities.join(', ')}

    User Context (Deep Personal History):
    ${contextText}

    Bizarreness / Avant-Garde Threshold: ${bizarreness}/10
    (1 = Highly realistic, everyday public wear. 10 = Completely bizarre, unwearable conceptual art).

    OPERATIONAL PIPELINE:
    1. The Irrelevancy Match: Select one specific item/concept for EACH of the ${selectedCategories.length} selected nodes, drawing from the available cities.
    2. The Synthesis Engine: Bridge these disparate concepts.
    3. Wearability Review Agent Directive: You MUST review the generated fashion style and ensure its realism and public wearability strictly aligns with the Bizarreness Threshold of ${bizarreness}/10. Adjust the silhouette, aura, ethos, and revampText accordingly.
    4. The Output: Generate a "Personal Revision Manifest".

    Follow the Inverted Capsule Logic: Reject "Quiet Luxury". Suggest 3 "Spectacular Outliers" rotated with radical high-contrast accessories, but scale the extremity based on the Bizarreness Threshold.
  `;

  const parts: any[] = [{ text: prompt }];

  if (vibeImage) {
    const base64Data = await fileToBase64(vibeImage);
    parts.push({ text: `General Vibe-Check Image (Overall Aesthetic Anchor):` });
    parts.push({
      inlineData: {
        data: base64Data.split(',')[1],
        mimeType: vibeImage.type,
      },
    });
  }

  for (const category of selectedCategories) {
    if (nodeImages[category]) {
      const base64Data = await fileToBase64(nodeImages[category]);
      parts.push({ text: `Image context specifically for influence node "${category}":` });
      parts.push({
        inlineData: {
          data: base64Data.split(',')[1],
          mimeType: nodeImages[category].type,
        },
      });
    }
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
            description: `Exactly ${selectedCategories.length} nodes selected for synthesis.`,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                value: { type: Type.STRING, description: 'The specific item/concept selected' },
                city: { type: Type.STRING, description: 'The city it originates from' },
              },
              required: ['category', 'value', 'city'],
            },
          },
          silhouette: { type: Type.STRING, description: 'Physical form and fabric choice.' },
          aura: { type: Type.STRING, description: 'Scent and culinary rituals.' },
          ethos: { type: Type.STRING, description: 'The philosophical justification for this new way of existing.' },
          revampText: { type: Type.STRING, description: 'A cohesive paragraph describing the new persona.' },
        },
        required: ['selectedNodes', 'silhouette', 'aura', 'ethos', 'revampText'],
      },
    },
  });

  const jsonStr = response.text?.trim() || '{}';
  const manifest = JSON.parse(jsonStr) as PersonalRevisionManifest;
  manifest.id = Math.random().toString(36).substring(7);
  manifest.timestamp = Date.now();
  return manifest;
}

export async function generatePersonaImage(revampText: string, userPhoto?: File | null): Promise<string> {
  const prompt = `A high-fashion, editorial style portrait of a person embodying this aesthetic: ${revampText}. Cinematic lighting, avant-garde fashion, hyper-detailed, photorealistic.`;
  
  const parts: any[] = [{ text: prompt }];

  if (userPhoto) {
    const base64Data = await fileToBase64(userPhoto);
    parts.push({
      inlineData: {
        data: base64Data.split(',')[1],
        mimeType: userPhoto.type,
      },
    });
    parts.push({ text: "Apply the described aesthetic to the person in this image. Maintain their core facial features but completely transform their clothing, styling, hair, and environment to match the aesthetic." });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error('Failed to generate image');
}
