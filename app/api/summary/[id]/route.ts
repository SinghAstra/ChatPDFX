import { prisma } from "@/lib/prisma";

export async function GET({ params }: { params: { id: string } }) {
  try {
    const summaryNode = await prisma.summaryNode.findUnique({
      where: {
        id: params.id,
      },
    });
    if (!summaryNode) {
      return new Response("Summary not found", { status: 404 });
    }
    return Response.json({
      success: true,
      summary: summaryNode,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.log("error.stack is ", error.stack);
      console.log("error.message is ", error.message);
    }

    return new Response("Error processing request", { status: 500 });
  }
}
