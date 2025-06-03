import { NodeTreeViewer } from "@/components/node-tree-viewer";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";

export default function NodePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Node Tree Structure
          </h1>
          <p className="text-muted-foreground mt-2">
            Hierarchical view of summary nodes and their associated chunks
          </p>
        </header>

        <Suspense fallback={<TreeSkeleton />}>
          <NodeTreeViewer />
        </Suspense>
      </div>
    </div>
  );
}

function TreeSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <div className="ml-6 space-y-1">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
