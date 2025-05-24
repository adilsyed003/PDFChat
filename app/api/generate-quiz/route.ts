import { GoogleGenAI } from "@google/genai";

export const maxDuration = 60;

const GEMINI_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY!; // Set in .env.local

export async function POST(req: Request) {
  const { text } = await req.json();

  const prompt = `
You are a teacher. Read the following text and create a multiple choice test with 4 questions based on its content.
Each question should be an object with:
- "question": string,
- "options": array of 4 strings,
- "answer": "A", "B", "C", or "D" (the correct option).
Return a JSON array of 4 such objects, and nothing else.

Text Content: ${text}
`;

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  let geminiText = "";
  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
    });
    geminiText = response.text ?? "";
  } catch (e) {
    console.error("Gemini API error:", e);
    return new Response(JSON.stringify([]), { status: 500 });
  }

  let questions = [];
  try {
    let cleaned = geminiText.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```$/, "");
      // Remove any trailing triple backticks
      cleaned = cleaned.replace(/```$/, "");
    }
    questions = JSON.parse(cleaned);
  } catch (e) {
    console.error("Failed to parse Gemini response as JSON:", geminiText);
    return new Response(JSON.stringify([]), { status: 500 });
  }

  return new Response(JSON.stringify(questions), {
    headers: { "Content-Type": "application/json" },
  });
}
