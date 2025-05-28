import { data } from "@/lib/constants";
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

export async function checkLimits() {
  const geminiRequestsCountKey = getGeminiRequestsThisMinuteRedisKey();

  const [requests, tokens] = await redisClient.mget(
    geminiRequestsCountKey,
    geminiRequestsTokenConsumedKey
  );

  return {
    requests: parseInt(requests ?? "0"),
    tokens: parseInt(tokens ?? "0"),
    requestsExceeded: parseInt(requests ?? "0") >= REQUEST_LIMIT,
    tokensExceeded: parseInt(tokens ?? "0") >= TOKEN_LIMIT,
  };
}

export async function handleRateLimit() {
  const limitsResponse = await checkLimits();

  console.log("--------------------------------------");
  console.log("limitsResponse:", limitsResponse);
  console.log("--------------------------------------");

  const { requestsExceeded, tokensExceeded } = limitsResponse;

  if (requestsExceeded || tokensExceeded) {
    await sleep(1);
  }

  await trackRequest(tokenCount);
}

async function generateEmbedding(text: string) {
  for (let i = 0; i < 100; i++) {
    try {
      await handleRateLimit();

      const res = await ai.models.embedContent({
        model: "gemini-embedding-exp-03-07",
        contents: chunk.text,
      });
      return ai.embeddings.create({
        model: "gemini-1.5-flash",
        input: text,
      });
    } catch (error) {
      console.error("Error generating embedding:", error);
      sleep(i + 1);
    }
  }
}

export async function GET() {
  const chunks = chunkTextWithMetadata(data);

  const formatted = chunks.map((chunk) => {
    const embedding = generateEmbedding(chunk.text);
    return {
      id: chunk.id,
      text: chunk.text,
      chunkIndex: chunk.metadata.chunk_index,
      startChar: chunk.metadata.start_char,
      endChar: chunk.metadata.end_char,
      embedding: embedding,
    };
  });

  await prisma.node.createMany({ data: formatted });

  return Response.json({ success: true, count: formatted.length });
}

// import { data } from "@/lib/constants";
// import { prisma } from "@/lib/prisma";
// import { chunkTextWithMetadata } from "@/lib/utils";
// import { GoogleGenAI } from "@google/genai";
// import { handleRateLimit, handleRequestExceeded } from "@/lib/rate-limit"; // Make sure these are imported
// import { estimateTokenCount } from "@/lib/tokens"; // Assuming you have a function like this

// function sleep(times: number) {
//   return new Promise((resolve) => setTimeout(resolve, 2000 * times));
// }

// const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// export async function GET() {
//   const chunks = chunkTextWithMetadata(data);

//   for (let i = 0; i < chunks.length; i++) {
//     const chunk = chunks[i];

//     try {
//       const tokenCount = await estimateTokenCount(chunk.text);
//       await handleRateLimit(tokenCount);

//       const res = await ai.models.embedContent({
//         model: "gemini-embedding-exp-03-07",
//         contents: chunk.text,
//       });

//       const embedding = res.embeddings?.values;

//       if (!embedding) throw new Error("No embedding returned");

//       await prisma.node.create({
//         data: {
//           id: chunk.id,
//           text: chunk.text,
//           chunkIndex: chunk.metadata.chunk_index,
//           startChar: chunk.metadata.start_char,
//           endChar: chunk.metadata.end_char,
//           embedding,
//         },
//       });
//     } catch (error) {
//       const message =
//         error instanceof Error ? error.message : "Unknown error";

//       console.log(`Error on chunk ${i}:`, message);

//       if (
//         message.includes("429") ||
//         message.includes("GoogleGenerativeAI")
//       ) {
//         await handleRequestExceeded();
//         await sleep(i + 1);
//         continue;
//       }

//       if (
//         message.includes("Invalid") ||
//         message.includes("SyntaxError")
//       ) {
//         console.log("Retrying due to invalid format or syntax...");
//         continue;
//       }

//       // Skip this chunk on other unknown errors
//       continue;
//     }
//   }

//   return Response.json({ success: true, count: chunks.length });
// }
