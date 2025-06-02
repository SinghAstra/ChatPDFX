import { prisma } from "@/lib/prisma";

export async function GET() {
  const nodes = await prisma.node.deleteMany();

  return Response.json({ success: true, nodes });
}
