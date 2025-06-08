import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log("params.id is ", params.id);
    const chunkNode = await prisma.chunkNode.findUnique({
      where: {
        id: params.id,
      },
    });
    if (!chunkNode) {
      return new Response("Chunk Node not found", { status: 404 });
    }
    return Response.json({
      success: true,
      summary: chunkNode,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.log("error.stack is ", error.stack);
      console.log("error.message is ", error.message);
    }

    return new Response("Error processing request", { status: 500 });
  }
}
