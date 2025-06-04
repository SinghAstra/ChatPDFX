"use client";

import { SummaryNodeWithChildren } from "@/app/node/page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, FileText, Layers } from "lucide-react";
import { useState } from "react";

interface TreeNodeProps {
  node: SummaryNodeWithChildren;
  level: number;
}

export function TreeNode({ node, level }: TreeNodeProps) {
  const [isOpen, setIsOpen] = useState(level < 2);

  const hasChildren = node.children && node.children.length > 0;
  const hasChunks = node.chunk && node.chunk.length > 0;
  const indentClass = level > 0 ? `ml-${Math.min(level * 4, 16)}` : "";

  return (
    <div
      className={`${indentClass}  border-l-4 border border-muted border-l-red-400`}
    >
      <div className="p-4">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex items-start gap-3">
            {(hasChildren || hasChunks) && (
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 shrink-0"
                >
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Layers className="h-4 w-4 text-blue-600 shrink-0" />
                <h3 className="font-medium text-sm leading-tight">
                  Summary Node (Level {node.level})
                </h3>
                <Badge variant="outline" className="text-xs">
                  ID: {node.id.slice(0, 8)}...
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {node.summary}
              </p>

              {(hasChildren || hasChunks) && (
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  {hasChildren && (
                    <span>
                      {node.children.length} child node
                      {node.children.length !== 1 ? "s" : ""}
                    </span>
                  )}
                  {hasChunks && (
                    <span>
                      {node.chunk.length} chunk
                      {node.chunk.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <CollapsibleContent className="mt-4 space-y-3">
            {/* Render chunks */}
            {hasChunks && (
              <div className="space-y-2">
                {node.chunk.map((chunk) => (
                  <div
                    key={chunk.id}
                    className="border-l-4 border-l-green-500 bg-muted/30 p-3"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-3 w-3 text-green-600" />
                      <span className="text-xs font-medium">
                        Chunk {chunk.chunkIndex}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {chunk.startChar}-{chunk.endChar}
                      </Badge>
                      {chunk.keywords.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {chunk.keywords.length} keywords
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {chunk.text.length > 200
                        ? `${chunk.text.slice(0, 200)}...`
                        : chunk.text}
                    </p>
                    {chunk.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {chunk.keywords.slice(0, 5).map((keyword, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-xs"
                          >
                            {keyword}
                          </Badge>
                        ))}
                        {chunk.keywords.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{chunk.keywords.length - 5} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Render child nodes */}
            {hasChildren && (
              <div className="space-y-2">
                {node.children.map((child) => (
                  <TreeNode key={child.id} node={child} level={level + 1} />
                ))}
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
