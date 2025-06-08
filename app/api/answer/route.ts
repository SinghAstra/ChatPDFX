import { classifyQuery } from "@/lib/query-classifier";
import { retrieveChunks } from "@/lib/retrieval-engine";
import { QueryClassification } from "@/lib/types";
import { GoogleGenAI } from "@google/genai";
import { sleep } from "../process-text/route";

export async function generateResponse(prompt: string) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const model = "gemini-1.5-flash";

  if (!GEMINI_API_KEY) {
    throw new Error("Missing GEMINI_API_KEY environment variable.");
  }

  const geminiClient = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  for (let i = 0; i < 5; i++) {
    try {
      const response = await geminiClient.models.generateContent({
        model,
        contents: prompt,
        config: {
          temperature: 0.3,
        },
      });

      if (response && response.text) return response.text;
      throw new Error("Invalid response format");
    } catch (error) {
      if (error instanceof Error) {
        console.log("--------------------------------");
        console.log("error.stack is ", error.stack);
        console.log("error.message is ", error.message);
        console.log("--------------------------------");
      }
      if (
        error instanceof Error &&
        (error.message.includes("429") ||
          error.message.includes("GoogleGenerativeAI Error") ||
          error.message.includes("Invalid"))
      ) {
        await sleep(i + 1);
        continue;
      }
      continue;
    }
  }

  return "Could not generate answer.";
}

export async function GET() {
  try {
    const query = "What is operating system?";

    // Step 1: Classify the query
    const classification = await classifyQuery(query);
    console.log("Query classification:", classification);

    // Step 2: Retrieve relevant chunks using intelligent retrieval
    const retrievedChunks = await retrieveChunks(query, classification, 8);

    // Why are we supplying source in here ?

    // Step 3: Build context from retrieved chunks
    const context = retrievedChunks
      .map(
        (chunk, i) =>
          `[${chunk.source.toUpperCase()} ${
            i + 1
          }] (Score: ${chunk.combinedScore.toFixed(3)}):\n${chunk.text}`
      )
      .join("\n\n");

    // Step 4: Generate response with enhanced prompt
    const enhancedPrompt = buildEnhancedPrompt(query, context, classification);
    const answer = await generateResponse(enhancedPrompt);

    return Response.json({
      success: true,
      query,
      classification,
      answer,
      retrievalMetadata: {
        totalChunks: retrievedChunks.length,
        chunkScores: retrievedChunks.map((c) => ({
          id: c.id,
          combinedScore: c.combinedScore,
          source: c.source,
        })),
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      console.log("--------------------------------");
      console.log("error.stack is ", error.stack);
      console.log("error.message is ", error.message);
      console.log("--------------------------------");
    }

    throw new Error(
      error instanceof Error
        ? error.message
        : "Unexpected error occurred while generating answer."
    );
  }
}

function buildEnhancedPrompt(
  query: string,
  context: string,
  classification: QueryClassification
): string {
  const answerTypeInstructions = {
    paragraph:
      "Provide a detailed explanation in 2-3 well-structured paragraphs.",
    sentence: "Provide a concise, direct answer in 1-2 sentences.",
    list: "Structure your answer as a clear, numbered or bulleted list.",
    code_snippet:
      "Include relevant code examples or technical snippets in your answer.",
  };

  const intentInstructions = {
    find_definition: "Focus on clearly defining the concept or term.",
    compare_concepts:
      "Highlight similarities, differences, and key distinguishing features.",
    ask_summary: "Provide a comprehensive overview covering the main points.",
    locate_fact:
      "Extract and present the specific factual information requested.",
    general_inquiry: "Provide a helpful and informative response.",
  };

  return `Context Information:
${context}

Query: ${query}

Instructions:
- Query Type: ${classification.queryType}
- Intent: ${classification.intent} - ${
    intentInstructions[classification.intent]
  }
- Expected Format: ${classification.expectedAnswerType} - ${
    answerTypeInstructions[classification.expectedAnswerType]
  }

Please provide a comprehensive answer based on the context above. If the context doesn't fully address the question, supplement with your knowledge while clearly indicating when you're going beyond the provided context.

Answer:`;
}
