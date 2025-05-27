"use client";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { useState } from "react";

export default function PDFParserClient() {
  const [status, setStatus] = useState("idle");
  const [isUploading, setIsUploading] = useState(false);

  const handleClick = async () => {
    setStatus("Uploading & Parsing...");
    setIsUploading(true);
    const res = await fetch("/api/parse-pdf");
    setIsUploading(false);
    const data = await res.json();
    setStatus(data.status === "completed" ? "✅ Done!" : "❌ Failed.");
    console.log("Final Result:", data);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-2">
      <Button onClick={handleClick} disabled={isUploading}>
        {isUploading ? (
          <>
            <Loader className="w-2 h-2 animate-spin" /> Wait
          </>
        ) : (
          "Start Parsing PDF"
        )}
      </Button>
      <p>Status: {status}</p>
    </div>
  );
}
