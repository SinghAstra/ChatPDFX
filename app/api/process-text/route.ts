import { data } from "@/lib/constants";
import { Node } from "@/lib/generated/prisma";
import { prisma } from "@/lib/prisma";
import { chunkTextWithMetadata } from "@/lib/utils";
import { GoogleGenAI } from "@google/genai";

function sleep(times: number) {
  return new Promise((resolve) => setTimeout(resolve, 2000 * times));
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in the environment variables.");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
let requestCount = 0;
let lastResetTime = Date.now();
const REQUEST_LIMIT = 15;
async function handleRequestExceeded() {
  requestCount = 16;
  await handleRateLimit();
}

function checkLimits() {
  const now = Date.now();

  // Reset count every 60 seconds
  if (now - lastResetTime >= 60_000) {
    requestCount = 0;
    lastResetTime = now;
  }

  return {
    requests: requestCount,
    requestsExceeded: requestCount >= REQUEST_LIMIT,
  };
}

function trackRequest() {
  requestCount++;
}

async function handleRateLimit() {
  const limitsResponse = checkLimits();

  if (limitsResponse.requestsExceeded) {
    console.log("Rate limit exceeded, sleeping...");
    await sleep(1);
  }

  trackRequest();
}

async function generateEmbedding(text: string) {
  for (let i = 0; i < 100; i++) {
    try {
      await handleRateLimit();

      const response = await ai.models.embedContent({
        model: "gemini-embedding-exp-03-07",
        contents: text,
      });

      if (!response.embeddings || !response.embeddings.values) {
        throw new Error(
          "GoogleGenerativeAI Error : No embeddings returned from the API"
        );
      }

      return response.embeddings[0].values;
    } catch (error) {
      if (error instanceof Error) {
        console.log("--------------------------------");
        console.log("error.stack is ", error.stack);
        console.log("error.message is ", error.message);
        console.log("--------------------------------");
      }

      if (
        error instanceof Error &&
        error.message.includes("GoogleGenerativeAI Error")
      ) {
        console.log(`Trying again for ${i + 1} time --generateEmbedding`);
        await handleRequestExceeded();
        sleep(i + 1);
        continue;
      }

      if (
        error instanceof Error &&
        error.message.includes("429 Too Many Requests")
      ) {
        console.log(`Trying again for ${i + 1} time --generateEmbedding`);
        await handleRequestExceeded();
        sleep(i + 1);
        continue;
      }

      throw new Error(
        error instanceof Error
          ? error.message
          : "Unexpected error occurred while generating embedding."
      );
    }
  }

  throw new Error("Failed to generate embedding after multiple attempts");
}

export async function GET() {
  const chunks = chunkTextWithMetadata(data);

  const embedding = generateEmbedding(chunks[0].text);

  console.log("embedding is ", embedding);

  const formatted: Node[] = await Promise.all(
    chunks.map((chunk) => {
      return {
        id: chunk.id,
        text: chunk.text,
        chunkIndex: chunk.metadata.chunk_index,
        startChar: chunk.metadata.start_char,
        endChar: chunk.metadata.end_char,
        embedding: [],
        createdAt: new Date(),
      };
    })
  );

  for (let i = 0; i < formatted.length; i++) {
    const chunk = formatted[i];
    try {
      const embedding = await generateEmbedding(chunk.text);

      if (!embedding || embedding.length === 0) {
        throw new Error("Empty embedding returned from the API");
      }
      chunk.embedding = embedding;
    } catch (error) {
      console.error(`Error generating embedding for chunk ${chunk.id}:`, error);
      chunk.embedding = [];
    }
  }

  await prisma.node.createMany({ data: formatted });

  return Response.json({ success: true, count: formatted.length });
}
