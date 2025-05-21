import { NextRequest } from "next/server";
import { google } from "@ai-sdk/google";
import { streamText } from "ai";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { input } = await req.json();

    const result = await streamText({
      model: google("gemini-1.5-pro"),
      messages: [
        {
          role: "system",
          content:
            "You are an AI assistant. Your job is to take the text input and answer the question based on the content of the text.",
        },
        {
          role: "user",
          content: `answer it in a light and in less number of words. PDF Content: ${input}`,
        },
      ],
    });
    const text = await result.text;
    console.log(result.text);
    const response = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: text,
    };

    return new Response(JSON.stringify(response), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch (error) {
    console.error("Error in chat endpoint:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
