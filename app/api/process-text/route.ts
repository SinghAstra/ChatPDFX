import { data } from "@/lib/constants";
import { ChunkNode } from "@/lib/generated/prisma";
import { prisma } from "@/lib/prisma";
import { chunkTextWithMetadata } from "@/lib/utils";
import { GoogleGenAI } from "@google/genai";
import { Mistral } from "@mistralai/mistralai";
import keyword_extractor from "keyword-extractor";

const generateSummarySystemPrompt =
  "You are an expert summarizer. Summarize the following content clearly and concisely in 1-2 sentences. Capture the main ideas. Summary Should be plain text without any formatting. Do not include any code blocks or markdown formatting.";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const model = "gemini-1.5-flash";

if (!GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY environment variable.");
}

const geminiClient = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export function sleep(times: number) {
  return new Promise((resolve) => setTimeout(resolve, 2000 * times));
}

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

if (!MISTRAL_API_KEY) {
  throw new Error("MISTRAL_API_KEY is not set in the environment variables.");
}

const mistralClient = new Mistral({ apiKey: MISTRAL_API_KEY });

function extractKeywords(text: string): string[] {
  const keywords = keyword_extractor.extract(text, {
    language: "english",
    remove_digits: true,
    return_changed_case: true,
    remove_duplicates: true,
  });

  return keywords;
}

function toPgvectorString(arr: number[]): string {
  return "[" + arr.join(",") + "]";
}

export async function generateSummary(texts: string[]) {
  const prompt = texts.map((t, i) => `Chunk ${i + 1}:\n${t}`).join("\n\n");
  for (let i = 0; i < 100; i++) {
    try {
      const response = await geminiClient.models.generateContent({
        model,
        contents: prompt,
        config: {
          temperature: 0.1,
          systemInstruction: generateSummarySystemPrompt,
        },
      });

      if (!response || !response.text) {
        throw new Error("Invalid Summary format");
      }
      const summary = response.text;

      console.log("summary is ", summary);

      return summary;
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
        console.log(`Trying again for ${i + 1} time --generateSummary`);
        sleep(i + 1);
        continue;
      }

      if (
        error instanceof Error &&
        error.message.includes("429 Too Many Requests")
      ) {
        console.log(`Trying again for ${i + 1} time --generateSummary`);
        sleep(i + 1);
        continue;
      }

      if (
        error instanceof Error &&
        error.message.includes("Invalid Summary format")
      ) {
        console.log(`Trying again for ${i + 1} time --generateSummary`);
        sleep(i + 1);
        continue;
      }
      continue;
    }
  }
  return "Could Not generate Summary.";
}

async function buildSummaryTree(summaryNodesId: string[], currentLevel = 1) {
  const nodes = await prisma.summaryNode.findMany({
    where: { id: { in: summaryNodesId } },
  });

  if (nodes.length <= 1) return;

  const parentNodesId: string[] = [];

  for (let i = 0; i < nodes.length; i += 5) {
    const group = nodes.slice(i, i + 5);
    const summary = await generateSummary(group.map((n) => n.summary));
    console.log("currentLevel is ", currentLevel);

    const summaryEmbedding = await generateEmbedding(summary);

    if (!summaryEmbedding || summaryEmbedding.length === 0) {
      throw new Error("Empty summaryEmbedding returned from the API");
    }

    console.log(
      "summaryEmbedding generated  with length: ",
      summaryEmbedding.length
    );

    await sleep(1);

    const parentNodeId = crypto.randomUUID();

    await prisma.$executeRaw`
        INSERT INTO "SummaryNode" ("id","summary", "level", "parentId", "embedding")
        VALUES (${parentNodeId},${summary}, ${currentLevel}, ${null}, ${toPgvectorString(
      summaryEmbedding
    )}::vector)
        `;

    parentNodesId.push(parentNodeId);

    // update children with parentId
    await prisma.summaryNode.updateMany({
      where: { id: { in: group.map((n) => n.id) } },
      data: { parentId: parentNodeId },
    });

    await sleep(1); // throttle
  }

  await buildSummaryTree(parentNodesId, currentLevel + 1);
}

export async function generateEmbedding(text: string) {
  for (let i = 0; i < 100; i++) {
    try {
      const embeddingsResponse = await mistralClient.embeddings.create({
        model: "mistral-embed",
        inputs: [text],
      });

      return embeddingsResponse.data?.[0]?.embedding;
    } catch (error) {
      if (error instanceof Error) {
        console.log("--------------------------------");
        console.log("text is ", text);
        console.log("error.stack is ", error.stack);
        console.log("error.message is ", error.message);
        console.log("--------------------------------");
      }

      if (
        error instanceof Error &&
        error.message.includes("Requests rate limit exceeded")
      ) {
        sleep(1);
        continue; // Retry after a short delay if rate limit exceeded
      }

      continue;
    }
  }

  throw new Error("Failed to generate embedding after multiple attempts");
}

export async function GET() {
  try {
    const chunks = chunkTextWithMetadata(data);
    const summaryNodesId: string[] = [];

    const formattedChunkNodes: ChunkNode[] = chunks.map((chunk) => {
      return {
        id: chunk.id,
        text: chunk.text,
        chunkIndex: chunk.metadata.chunk_index,
        startChar: chunk.metadata.start_char,
        endChar: chunk.metadata.end_char,
        summaryId: "",
        keywords: extractKeywords(chunk.text),
        createdAt: new Date(),
      };
    });

    for (let i = 0; i < formattedChunkNodes.length; i++) {
      const chunk = formattedChunkNodes[i];
      for (let i = 0; i < 100; i++) {
        const chunkTextEmbedding = await generateEmbedding(chunk.text);

        if (!chunkTextEmbedding || chunkTextEmbedding.length === 0) {
          throw new Error("Empty chunkTextEmbedding returned from the API");
        }
        console.log(
          "chunkTextEmbedding generated  with length: ",
          chunkTextEmbedding.length
        );

        await sleep(1);
        const summary = await generateSummary([chunk.text]);

        const summaryEmbedding = await generateEmbedding(summary);

        if (!summaryEmbedding || summaryEmbedding.length === 0) {
          throw new Error("Empty summaryEmbedding returned from the API");
        }

        console.log(
          "summaryEmbedding generated  with length: ",
          summaryEmbedding.length
        );

        await sleep(1);

        const parentNodeId = crypto.randomUUID();

        await prisma.$executeRaw`
        INSERT INTO "SummaryNode" ("id","summary", "level", "parentId", "embedding")
        VALUES (${parentNodeId},${summary}, ${0}, ${null}, ${toPgvectorString(
          summaryEmbedding
        )}::vector)
        `;

        await prisma.$executeRaw`
        INSERT INTO "ChunkNode" ("id", "text", "chunkIndex", "startChar", "endChar", "embedding","keywords","summaryId")
        VALUES (${chunk.id}, ${chunk.text}, ${chunk.chunkIndex}, ${
          chunk.startChar
        }, ${chunk.endChar}, ${toPgvectorString(chunkTextEmbedding)}::vector,${
          chunk.keywords
        },${parentNodeId})
        `;

        summaryNodesId.push(parentNodeId);

        await sleep(1);

        break;
      }
    }

    await buildSummaryTree(summaryNodesId);

    return Response.json({ success: true, count: formattedChunkNodes.length });
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
        : "Unexpected error occurred while generating embedding."
    );
  }
}
