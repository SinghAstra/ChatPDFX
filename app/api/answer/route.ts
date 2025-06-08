import { ChunkNode } from "@/lib/generated/prisma";
import { prisma } from "@/lib/prisma";
import { classifyQuery } from "@/lib/query-classifier";
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
  You are an expert QA assistant specialized in answering questions based on technical documents.

  Your task is to:
  1. First, attempt to answer using only the provided "Context". Be accurate, concise, and factual.
  2. If the context does not provide enough information to fully answer the question:
    - Then, use your own knowledge to infer or provide a helpful response.
    - Clearly indicate when you're going beyond the context.
    - Prefer real-world best practices, logic, or definitions relevant to the topic.

  Guidelines:
  - Keep your answer clear and direct. Use bullet points or step-by-step formatting if helpful.
  - Never hallucinate when context is sufficient.
  - Prioritize the context first, but don't leave the user without a helpful answer if it's incomplete.

  Now read the context and answer the question.

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
    const query = "What is operating system?";

    // Step 1: Classify the query
    const classification = await classifyQuery(query);
    console.log("Query classification:", classification);

    // Step 2: Retrieve relevant chunks using intelligent retrieval
    const retrievalEngine = new RetrievalEngine();
    const retrievedChunks = await retrievalEngine.retrieveChunks(
      query,
      classification,
      8
    );

    const embeddedQuery = await generateEmbedding(query);

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
