import type { Card } from "@/types";

export function parseVocabText(text: string): Partial<Card>[] {
  if (!text) return [];

  const lines = text.split("\n");
  const cards: Partial<Card>[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Skip empty lines or comments
    if (!trimmedLine || trimmedLine.startsWith("#")) {
      continue;
    }

    // Split by delimiter (default |)
    const parts = trimmedLine.split("|").map((part) => part.trim());

    // Basic validation: Must have at least Term and Definition
    if (parts.length < 2) {
      console.warn(`Skipping invalid line: ${line}`);
      continue;
    }

    const [term, definition, ipa, collocation, example, clozeHint] = parts;

    // Auto-detection logic
    let type: "vocab" | "grammar" | "sentence" = "vocab";
    const wordCount = term.trim().split(/\s+/).length;

    if (term.includes("+")) {
      type = "grammar";
    } else if (wordCount > 4) {
      type = "sentence";
    }

    cards.push({
      term,
      definition,
      type,
      ipa: ipa || undefined,
      collocation: collocation || undefined,
      example: example || undefined,
      clozeHint: clozeHint || undefined,
    });
  }

  return cards;
}
