import { prisma } from "@/lib/prisma";

export async function GET() {
  const chunkNode = await prisma.chunkNode.deleteMany();
  const summaryNode = await prisma.summaryNode.deleteMany();

  return Response.json({ success: true, chunkNode, summaryNode });
}
