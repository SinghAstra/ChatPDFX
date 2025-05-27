import fs from "fs";
import { NextResponse } from "next/server";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public/sample.pdf");
    const fileBuffer = fs.readFileSync(filePath);

    console.log("File read successfully, size:", fileBuffer.length);

    const form = new FormData();
    form.append("file", new Blob([fileBuffer]), "sample.pdf");

    const uploadRes = await fetch(
      "https://api.cloud.llamaindex.ai/api/v1/parsing/upload",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.LLAMA_CLOUD_API_KEY}`,
        },
        body: form,
      }
    );

    console.log("Upload response status", uploadRes.status);

    const uploadJson = await uploadRes.json();
    const jobId = uploadJson.id;
    console.log("Job ID:", jobId);

    let status = "queued";
    let result = null;

    while (status !== "completed" && status !== "failed") {
      await new Promise((r) => setTimeout(r, 3000)); // Wait 3 seconds
      const statusRes = await fetch(
        `https://api.cloud.llamaindex.ai/api/v1/parsing/job/${jobId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.LLAMA_CLOUD_API_KEY}`,
          },
        }
      );
      const statusJson = await statusRes.json();
      console.log("Status response:", statusJson);
      status = statusJson.status;
      if (status === "completed") {
        result = statusJson;
      }
    }

    return NextResponse.json({ status, result });
  } catch (error) {
    if (error instanceof Error) {
      console.log("error.stack is ", error.stack);
      console.log("error.message is ", error.message);
    }
    return NextResponse.json(
      { message: "Failed to parse PDF" },
      { status: 500 }
    );
  }
}
