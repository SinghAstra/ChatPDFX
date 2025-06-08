import { generateEmbedding } from "@/app/api/process-text/route";
import keyword_extractor from "keyword-extractor";
import { prisma } from "./prisma";
import { QueryClassification, RetrievalResult } from "./types";

export async function retrieveChunks(
  query: string,
  classification: QueryClassification,
  topK: number = 10
): Promise<RetrievalResult[]> {
  const results: RetrievalResult[] = [];

  // Generate query embedding
  const queryEmbedding = await generateEmbedding(query);
  if (!queryEmbedding) {
    throw new Error("Failed to generate query embedding");
  }

  const embeddingString = `[${queryEmbedding.join(",")}]`;

  // Extract keywords from query
  const queryKeywords = extractKeywords(query);

  console.log(`Query classification: ${classification.queryType}`);
  console.log(`Query keywords:`, queryKeywords);

  // Retrieve based on classification
  switch (classification.queryType) {
    case "factual":
      // Use both keyword + vector retrieval
      await addVectorResults(results, embeddingString, topK);
      await addKeywordResults(results, queryKeywords, topK);
      break;

    case "broad":
      // Use vector + tree (summary) retrieval
      await addVectorResults(results, embeddingString, topK);
      await addSummaryResults(results, embeddingString, topK);
      break;

    case "summary":
      // Use tree index only
      await addSummaryResults(results, embeddingString, topK);
      break;
  }

  // Normalize and combine scores
  const normalizedResults = normalizeAndCombineScores(results, classification);

  // Sort by combined score and return top results
  return normalizedResults
    .sort((a, b) => b.combinedScore - a.combinedScore)
    .slice(0, topK);
}

async function addVectorResults(
  results: RetrievalResult[],
  embeddingString: string,
  topK: number
): Promise<void> {
  const vectorResults = await prisma.$queryRawUnsafe<
    Array<{
      id: string;
      text: string;
      similarity: number;
    }>
  >(
    `
        SELECT id, text, 1 - (embedding <=> $1::vector) AS similarity
        FROM "ChunkNode"
        ORDER BY embedding <=> $1::vector
        LIMIT $2
        `,
    embeddingString,
    topK
  );

  for (const result of vectorResults) {
    const existingIndex = results.findIndex((r) => r.id === result.id);
    if (existingIndex >= 0) {
      results[existingIndex].vectorScore = result.similarity;
    } else {
      results.push({
        id: result.id,
        text: result.text,
        vectorScore: result.similarity,
        keywordScore: 0,
        summaryScore: 0,
        combinedScore: 0,
        source: "chunk",
      });
    }
  }
}

async function addKeywordResults(
  results: RetrievalResult[],
  queryKeywords: string[],
  topK: number
): Promise<void> {
  if (queryKeywords.length === 0) return;

  const keywordResults = await prisma.$queryRawUnsafe<
    Array<{
      id: string;
      text: string;
      keywords: string[];
      jaccard_similarity: number;
    }>
  >(
    `
        SELECT 
            id,
            text,
            keywords,
            (
            CASE 
                WHEN array_length(keywords, 1) IS NULL OR array_length($1::text[], 1) IS NULL THEN 0
                ELSE (
                SELECT COUNT(*)::float 
                FROM unnest(keywords) AS ck
                WHERE ck = ANY($1::text[])
                ) / (
                array_length(keywords, 1) + array_length($1::text[], 1) - (
                    SELECT COUNT(*)::float 
                    FROM unnest(keywords) AS ck
                    WHERE ck = ANY($1::text[])
                )
                )
            END
            ) AS jaccard_similarity
        FROM "ChunkNode"
        WHERE keywords && $1::text[]
        ORDER BY jaccard_similarity DESC
        LIMIT $2
        `,
    queryKeywords,
    topK
  );

  for (const result of keywordResults) {
    const existingIndex = results.findIndex((r) => r.id === result.id);
    if (existingIndex >= 0) {
      results[existingIndex].keywordScore = result.jaccard_similarity;
    } else {
      results.push({
        id: result.id,
        text: result.text,
        vectorScore: 0,
        keywordScore: result.jaccard_similarity,
        summaryScore: 0,
        combinedScore: 0,
        source: "chunk",
      });
    }
  }
}

async function addSummaryResults(
  results: RetrievalResult[],
  embeddingString: string,
  topK: number
): Promise<void> {
  const summaryResults = await prisma.$queryRawUnsafe<
    Array<{
      id: string;
      text: string;
      similarity: number;
    }>
  >(
    `
        SELECT id, summary as text, 1 - (embedding <=> $1::vector) AS similarity
        FROM "SummaryNode"
        WHERE level >= 1
        ORDER BY embedding <=> $1::vector
        LIMIT $2
        `,
    embeddingString,
    topK
  );

  for (const result of summaryResults) {
    const existingIndex = results.findIndex((r) => r.id === result.id);
    if (existingIndex >= 0) {
      results[existingIndex].summaryScore = result.similarity;
    } else {
      results.push({
        id: result.id,
        text: result.text,
        vectorScore: 0,
        keywordScore: 0,
        summaryScore: result.similarity,
        combinedScore: 0,
        source: "summary",
      });
    }
  }
}

function normalizeAndCombineScores(
  results: RetrievalResult[],
  classification: QueryClassification
): RetrievalResult[] {
  if (results.length === 0) return results;

  // Extract scores for normalization
  const vectorScores = results.map((r) => r.vectorScore).filter((s) => s > 0);
  const keywordScores = results.map((r) => r.keywordScore).filter((s) => s > 0);
  const summaryScores = results.map((r) => r.summaryScore).filter((s) => s > 0);

  // Normalize scores to 0-1 range
  const normalizeScore = (score: number, scores: number[]): number => {
    if (scores.length === 0 || score === 0) return 0;
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    return max === min ? 1 : (score - min) / (max - min);
  };

  // Define weights based on query type
  let vectorWeight = 0.5;
  let keywordWeight = 0.3;
  let summaryWeight = 0.2;

  switch (classification.queryType) {
    case "factual":
      vectorWeight = 0.4;
      keywordWeight = 0.6;
      summaryWeight = 0.0;
      break;
    case "broad":
      vectorWeight = 0.6;
      keywordWeight = 0.1;
      summaryWeight = 0.3;
      break;
    case "summary":
      vectorWeight = 0.2;
      keywordWeight = 0.0;
      summaryWeight = 0.8;
      break;
  }

  // Calculate combined scores
  return results.map((result) => {
    const normalizedVector = normalizeScore(result.vectorScore, vectorScores);
    const normalizedKeyword = normalizeScore(
      result.keywordScore,
      keywordScores
    );
    const normalizedSummary = normalizeScore(
      result.summaryScore,
      summaryScores
    );

    const combinedScore =
      normalizedVector * vectorWeight +
      normalizedKeyword * keywordWeight +
      normalizedSummary * summaryWeight;

    return {
      ...result,
      combinedScore,
    };
  });
}

function extractKeywords(text: string): string[] {
  return keyword_extractor.extract(text, {
    language: "english",
    remove_digits: true,
    return_changed_case: true,
    remove_duplicates: true,
  });
}
