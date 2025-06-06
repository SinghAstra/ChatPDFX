import { ChunkNode } from "@/lib/generated/prisma";
import { prisma } from "@/lib/prisma";

interface ChunkNodeWithEmbedding extends ChunkNode {
  embedding: number[];
}

export default async function HomePage() {
  const chunks = await prisma.$queryRaw<
    ChunkNodeWithEmbedding[]
  >`SELECT id, text, "chunkIndex", "startChar", "endChar", embedding::text as embedding, keywords, "createdAt", "summaryId"
  FROM "ChunkNode"
  ORDER BY "chunkIndex" ASC;`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {chunks.length === 0 && (
        <div className="text-center text-gray-500">
          No chunks available. Please process text to generate chunks.
        </div>
      )}
      {chunks.map((chunk) => (
        <div
          key={chunk.id}
          className="p-4 border rounded mb-2 max-w-3xl w-full"
        >
          <h3 className="font-bold">Chunk {chunk.chunkIndex + 1}</h3>
          <p>{chunk.text.substring(0, 100)}</p>
          <p className="text-sm text-gray-600">
            Embedding:{" "}
            {chunk.embedding.length > 0 ? (
              <span className="text-green-400">Available</span>
            ) : (
              <span className="text-red-400">Not available</span>
            )}
          </p>
          {chunk.keywords.map((keyword, index) => {
            return (
              <span key={index} className="inline-block mr-2 text-xs">
                {keyword}
              </span>
            );
          })}
          <p className="text-gray-500">
            Start: {chunk.startChar}, End: {chunk.endChar}
          </p>
        </div>
      ))}
    </div>
  );
}
