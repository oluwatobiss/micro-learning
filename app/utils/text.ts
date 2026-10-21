import type { SourceInputData, SourceValidationErrors } from "../types/generator";

export const MIN_WORD_COUNT = 200;
export const MAX_WORD_COUNT = 10000;

/**
 * Counts words in a string according to consistent whitespace boundary semantics.
 * Strips leading/trailing whitespace, splits on any sequence of whitespace characters,
 * and filters out any empty tokens.
 */
export function countWords(text: string): number {
  if (!text) return 0;
  const trimmed = text.trim();
  if (trimmed.length === 0) return 0;

  const tokens = trimmed.split(/\s+/);
  return tokens.filter((token) => token.length > 0).length;
}

/**
 * Validates that a string is a valid HTTP or HTTPS URL with a hostname.
 */
export function isValidUrl(urlString: string): boolean {
  if (!urlString || typeof urlString !== "string") return false;
  const trimmed = urlString.trim();
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return false;
  }
  try {
    const parsed = new URL(trimmed);
    return Boolean(parsed.hostname && parsed.hostname.includes("."));
  } catch {
    return false;
  }
}

/**
 * Validates Creator Studio source input data according to all requirements:
 * - Non-empty, non-whitespace title (at least 5 characters)
 * - Non-empty, non-whitespace author attribution
 * - Valid HTTP/HTTPS source URL
 * - Source text between 200 and 10,000 words
 * - Explicit ownership / permission acknowledgment
 */
export function validateSourceInput(data: SourceInputData): {
  isValid: boolean;
  errors: SourceValidationErrors;
  wordCount: number;
} {
  const errors: SourceValidationErrors = {};
  const wordCount = countWords(data.sourceText);

  // 1. Title validation
  if (!data.title || data.title.trim().length === 0) {
    errors.title = "Lesson title is required and cannot be empty.";
  } else if (data.title.trim().length < 5) {
    errors.title = "Lesson title should be at least 5 characters long.";
  }

  // 2. Author validation
  if (!data.author || data.author.trim().length === 0) {
    errors.author = "Original author or creator attribution is required.";
  }

  // 3. Source URL validation
  if (!data.sourceUrl || data.sourceUrl.trim().length === 0) {
    errors.sourceUrl = "Original source URL is required.";
  } else if (!isValidUrl(data.sourceUrl)) {
    errors.sourceUrl = "Source URL must ba a valid web address starting with http:// or https://.";
  }

  // 4. Source text word-count validation
  if (!data.sourceText || data.sourceText.trim().length === 0) {
    errors.sourceText = `Source text is required (minimum ${MIN_WORD_COUNT} words).`;
  } else if (wordCount < MIN_WORD_COUNT) {
    errors.sourceText = `Source text is too short (${wordCount} words). A minimum of ${MIN_WORD_COUNT} words is required for meaningful lesson synthesis.`;
  } else if (wordCount > MAX_WORD_COUNT) {
    errors.sourceText = `Source text exceeds maximum limit (${wordCount} words). Please reduce text to under ${MAX_WORD_COUNT} words.`;
  }

  // 5. Ownership / permission acknowledgment
  if (!data.permissionConfirmed) {
    errors.permissionConfirmed = "You must acknowledge that you have permission or rights to adapt this material.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    wordCount,
  };
}
