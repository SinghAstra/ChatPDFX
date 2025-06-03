import { ChunkNode } from "@/lib/generated/prisma";
import { prisma } from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";
import { generateEmbedding, sleep } from "../process-text/route";

export async function generateResponse(prompt: string) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const model = "gemini-1.5-flash";

  if (!GEMINI_API_KEY) {
    throw new Error("Missing GEMINI_API_KEY environment variable.");
  }

  const geminiClient = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  const systemPrompt = `
You are an expert assistant. Use only the provided context to answer the question.
Be concise and accurate. If not found in context, say "I don't know based on the provided information." but based on my knowledge, 
I can say that 
State Your answer
`;

  for (let i = 0; i < 5; i++) {
    try {
      const response = await geminiClient.models.generateContent({
        model,
        contents: prompt,
        config: {
          temperature: 0.3,
          systemInstruction: systemPrompt,
        },
      });

      if (response && response.text) return response.text;
      throw new Error("Invalid response format");
    } catch (error) {
      if (error instanceof Error) {
        console.log("--------------------------------");
        console.log("error.stack is ", error.stack);
        console.log("error.message is ", error.message);
        console.log("--------------------------------");
      }
      if (
        error instanceof Error &&
        (error.message.includes("429") ||
          error.message.includes("GoogleGenerativeAI Error") ||
          error.message.includes("Invalid"))
      ) {
        await sleep(i + 1);
        continue;
      }
      continue;
    }
  }

  return "Could not generate answer.";
}

export async function GET() {
  try {
    const question = "What is operating system?";

    const embeddedQuery = await generateEmbedding(question);

    if (!embeddedQuery) {
      throw new Error("Failed to generate embedding for the query.");
    }

    const embeddedQueryString = `[${embeddedQuery.join(",")}]`;

    const topChunks: ChunkNode[] = await prisma.$queryRawUnsafe(
      `
    SELECT id, text, 1 - (embedding <=> $1::vector) AS similarity
    FROM "ChunkNode"
    ORDER BY embedding <=> $1::vector
    LIMIT 5
    `,
      embeddedQueryString
    );

    const context = topChunks
      .map((c, i) => `Chunk ${i + 1}:\n${c.text}`)
      .join("\n\n");

    const prompt = `Context:\n${context}\n\nQuestion: ${question}\nAnswer:`;

    const answer = await generateResponse(prompt);

    return Response.json({
      success: true,
      question,
      answer,
      chunks: topChunks,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.log("--------------------------------");
      console.log("error.stack is ", error.stack);
      console.log("error.message is ", error.message);
      console.log("--------------------------------");
    }

    throw new Error(
      error instanceof Error
        ? error.message
        : "Unexpected error occurred while generating answer."
    );
  }
}
