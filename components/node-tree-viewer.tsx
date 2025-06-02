import { prisma } from "@/lib/prisma";
// import { TreeNode } from "./tree-node";

async function getNodeTree() {
  const rootNode = await prisma.summaryNode.findFirst({
    where: { parentId: null },
    include: {
      children: true,
    },
  });

  if (!rootNode) return [];
  console.log("rootNode is ", rootNode);
}

export async function NodeTreeViewer() {
  const nodes = await getNodeTree();

  if (!nodes || nodes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground">
          <p className="text-lg">No nodes found</p>
          <p className="text-sm mt-1">
            Create some summary nodes to see the tree structure
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* {nodes.map((node) => (
        <TreeNode key={node.id} node={node} level={0} />
      ))} */}
    </div>
  );
}
