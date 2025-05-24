import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";

const GEMINI_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY!;
const ai = new GoogleGenerativeAI(GEMINI_API_KEY);

// In-memory context store (replace with DB for production)
let chatHistory: { role: "user" | "model"; parts: { text: string }[] }[] = [];

export async function POST(req: NextRequest) {
  try {
    const { question, pdfText } = await req.json();
    if (!question) {
      return new Response(JSON.stringify({ error: "No question provided" }), {
        status: 400,
      });
    }

    // Compose the prompt with PDF content if provided
    const prompt = pdfText
      ? `You are an AI assistant. Your job is to take the text input and answer the question based on the content of the text.
Answer it in a light and in less number of words.

PDF Content: ${pdfText}
Question: ${question} `
      : question;

    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessage(prompt);
    const responseText = await result.response.text();

    chatHistory.push({ role: "user", parts: [{ text: prompt }] });
    chatHistory.push({ role: "model", parts: [{ text: responseText }] });

    if (chatHistory.length > 10) {
      chatHistory = chatHistory.slice(-10); // Keep last 5 pairs
    }
    const responseObj = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: responseText,
    };
    return new Response(JSON.stringify(responseObj), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
