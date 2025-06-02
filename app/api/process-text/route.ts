import { data } from "@/lib/constants";
import { Node } from "@/lib/generated/prisma";
import { prisma } from "@/lib/prisma";
import { chunkTextWithMetadata } from "@/lib/utils";
import { Mistral } from "@mistralai/mistralai";

function sleep(times: number) {
  return new Promise((resolve) => setTimeout(resolve, 2000 * times));
}

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

if (!MISTRAL_API_KEY) {
  throw new Error("MISTRAL_API_KEY is not set in the environment variables.");
}

const client = new Mistral({ apiKey: MISTRAL_API_KEY });

async function generateEmbedding(text: string) {
  for (let i = 0; i < 100; i++) {
    try {
      const embeddingsResponse = await client.embeddings.create({
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
    for (let i = 0; i < 100; i++) {
      try {
        const embedding = await generateEmbedding(chunk.text);

        if (!embedding || embedding.length === 0) {
          throw new Error("Empty embedding returned from the API");
        }
        console.log("embedding generated  with length: ", embedding.length);
        chunk.embedding = embedding;

        await sleep(1);
        break;
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
  }

  await prisma.node.createMany({ data: formatted });

  return Response.json({ success: true, count: formatted.length });
}
