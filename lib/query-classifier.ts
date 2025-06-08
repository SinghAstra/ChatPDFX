import { GoogleGenAI, Type } from "@google/genai";
import { QueryClassification } from "./types";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY environment variable.");
}

const geminiClient = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// async function sleep(times: number) {
//   console.log(`Sleeping for ${2 * times} seconds...`);
//   await new Promise((resolve) => setTimeout(resolve, 2000 * times));
// }

const classificationSystemPrompt = `
You are a query classification expert. Analyze the user's question and classify it according to these categories:

Query Types:
- "factual": Specific facts, definitions, technical details, how-to questions
- "broad": Conceptual questions, comparisons, explanations of complex topics
- "summary": Questions asking for overviews, summaries, or high-level explanations

Intent:
- "find_definition": Looking for what something is
- "compare_concepts": Comparing two or more things
- "ask_summary": Wanting an overview or summary
- "locate_fact": Looking for specific factual information
- "general_inquiry": General questions or exploratory queries

Expected Answer Type:
- "paragraph": Detailed explanation (2+ sentences)
- "sentence": Brief, direct answer
- "list": Enumerated items or steps
- "code_snippet": Code examples or technical snippets

Respond with a JSON object containing queryType, intent, expectedAnswerType, and confidence (0.0-1.0).
`;

export async function classifyQuery(
  query: string
): Promise<QueryClassification> {
  const model = "gemini-1.5-flash";

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      queryType: { type: Type.STRING },
      intent: { type: Type.STRING },
      expectedAnswerType: { type: Type.STRING },
    },
    propertyOrdering: ["queryType", "intent", "expectedAnswerType"],
  };

  // for (let i = 0; i < 100; i++) {
  try {
    const response = await geminiClient.models.generateContent({
      model,
      contents: `Classify this query: "${query}"`,
      config: {
        responseMimeType: "application/json",
        temperature: 0.1,
        responseSchema,
        systemInstruction: classificationSystemPrompt,
      },
    });

    console.log("response.text is ", response.text);

    if (!response || !response.text) {
      throw new Error("TypeError: No response text received");
    }

    const queryClassificationParsedResponse = JSON.parse(response.text);
    if (
      !queryClassificationParsedResponse.queryType ||
      !queryClassificationParsedResponse.intent ||
      !queryClassificationParsedResponse.expectedAnswerType
    ) {
      throw new Error("TypeError: Missing or invalid classification fields");
    }

    console.log(
      "queryClassificationParsedResponse is ",
      queryClassificationParsedResponse
    );

    return queryClassificationParsedResponse as QueryClassification;
  } catch (error) {
    if (error instanceof Error) {
      console.log("error.stack is ", error.stack);
      console.log("error.message is ", error.message);
    }

    if (
      error instanceof Error &&
      (error.message.includes("GoogleGenerativeAI Error") ||
        error.message.includes("429 Too Many Requests") ||
        error.message.includes("TypeError"))
    ) {
      // console.log(`Trying again for ${i + 1} time --generateBatchSummaries`);
      // await handleRequestExceeded();
      // sleep(i + 1);
      // continue;
    }

    // continue;
  }
  // }

  throw new Error("Failed to classify query after retries");
}
