import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { v4 as uuidv4 } from "uuid";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function chunkTextWithMetadata(
  text: string,
  chunkSize = 1024,
  overlap = 100
) {
  const chunks = [];
  let start = 0;
  let index = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunkText = text.slice(start, end);

    chunks.push({
      id: uuidv4(),
      text: chunkText,
      metadata: {
        chunk_index: index,
        start_char: start,
        end_char: end,
      },
    });

    index += 1;
    start += chunkSize - overlap;
  }

  return chunks;
}
