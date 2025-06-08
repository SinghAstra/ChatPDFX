export interface QueryClassification {
  queryType: "factual" | "broad" | "summary";
  intent:
    | "find_definition"
    | "compare_concepts"
    | "ask_summary"
    | "locate_fact"
    | "general_inquiry";
  expectedAnswerType: "paragraph" | "sentence" | "list" | "code_snippet";
}

export interface RetrievalResult {
  id: string;
  text: string;
  vectorScore: number;
  keywordScore: number;
  summaryScore: number;
  combinedScore: number;
  source: "chunk" | "summary";
}

export interface NormalizedScores {
  vectorScores: number[];
  keywordScores: number[];
  summaryScores: number[];
}
