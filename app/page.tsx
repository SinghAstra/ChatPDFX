import { Node } from "@/lib/generated/prisma";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const chunks: Node[] = await prisma.node.findMany({
    orderBy: { chunkIndex: "asc" },
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {chunks.map((chunk) => (
        <div key={chunk.id} className="p-4 border rounded mb-2">
          <h3 className="font-bold">Chunk {chunk.chunkIndex + 1}</h3>
          <p>{chunk.text}</p>
          <small className="text-gray-500">
            Start: {chunk.startChar}, End: {chunk.endChar}
          </small>
        </div>
      ))}
    </div>
  );
}
