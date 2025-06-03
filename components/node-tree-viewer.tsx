import { ChunkNode, SummaryNode } from "@/lib/generated/prisma";
import { prisma } from "@/lib/prisma";
import { TreeNode } from "./tree-node";

export interface SummaryNodeWithChildren extends SummaryNode {
  children: SummaryNodeWithChildren[];
  chunks: ChunkNode[];
}

async function getNodeTree() {
  // Step 1: Fetch all summary nodes (flat list)
  const allNodes = await prisma.summaryNode.findMany({
    include: {
      chunks: true,
    },
  });

  // Step 2: Create a map of id → node
  const nodeMap = new Map<string, SummaryNodeWithChildren>();

  // Add a `children` array manually to each node
  for (const node of allNodes) {
    nodeMap.set(node.id, { ...node, children: [] });
  }

  let rootNode: SummaryNodeWithChildren | null = null;

  // Step 3: Link children to parents
  for (const node of allNodes) {
    if (node.parentId) {
      const parent = nodeMap.get(node.parentId);
      const childNode = nodeMap.get(node.id);
      if (childNode && parent) {
        parent.children.push(childNode);
      }
    } else {
      rootNode = nodeMap.get(node.id) ?? null;
    }
  }

  return rootNode;
}

export async function NodeTreeViewer() {
  const rootNode = await getNodeTree();

  if (!rootNode) {
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
      <TreeNode node={rootNode} level={0} />
    </div>
  );
}
