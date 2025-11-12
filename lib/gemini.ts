import { GoogleGenerativeAI } from "@google/generative-ai";

export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY missing");
  return new GoogleGenerativeAI(apiKey);
}

// Use Gemini 2.5 Pro for production, Flash for development
export const GEMINI_MODEL = process.env.NODE_ENV === "production" 
  ? "gemini-2.5-pro" 
  : "gemini-2.5-flash";

export async function generateWithGemini(
  systemPrompt: string,
  userPrompt: string,
  temperature: number = 0.7
) {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ 
    model: GEMINI_MODEL,
    generationConfig: {
      temperature,
      responseMimeType: "application/json",
    },
  });

  const result = await model.generateContent([
    { text: systemPrompt },
    { text: userPrompt },
  ]);

  const response = result.response;
  return response.text();
}
