
import { GoogleGenAI, Modality } from '@google/genai';
import type { UploadedImage } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function generateCreativeImage(images: UploadedImage[], prompt: string): Promise<string> {
  const model = 'gemini-2.5-flash-image';
  
  const imageParts = images.map(image => ({
    inlineData: {
      data: image.base64Data,
      mimeType: image.mimeType,
    },
  }));

  const textPart = { text: prompt };

  const contents = {
    parts: [...imageParts, textPart],
  };

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: contents,
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

    if (imagePart && imagePart.inlineData) {
      return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
    } else {
      throw new Error('No image was generated. The model may have refused the prompt or an unknown error occurred.');
    }
  } catch (error) {
    console.error("Gemini API call failed:", error);
    if (error instanceof Error) {
        throw new Error(`API Error: ${error.message}`);
    }
    throw new Error('An unexpected error occurred while communicating with the Gemini API.');
  }
}
