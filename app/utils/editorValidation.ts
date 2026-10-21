import type { Lesson, LessonCard } from "../types/lesson";
import type { DeckValidationResult } from "../types/editor";
import { validateMediaSpec } from "../types/media.ts";
import { countWords } from "./text.ts";

/**
 * Recalculates estimated read time in minutes from card content.
 * Average adult microlearning read speed ~ 180 words per minute.
 */
export function recalculateEstimatedMinutes(cards: LessonCard[]): number {
  let totalWords = 0;
  for (const card of cards) {
    totalWords += countWords(card.title || "");
    totalWords += countWords(card.content || "");
    if (card.checkpoint) {
      totalWords += countWords(card.checkpoint.question || "");
      for (const opt of card.checkpoint.options || []) {
        totalWords += countWords(opt.text || "");
      }
      totalWords += countWords(card.checkpoint.explanation || "");
    }
  }
  return Math.max(1, Math.round(totalWords / 180));
}

/**
 * Validates an edited Lesson and returns blocking errors, advisory warnings,
 * and field-level card errors.
 */
export function validateEditedLesson(lesson: Lesson): DeckValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const cardErrors: Record<string, string[]> = {};

  // Lesson-level validations
  if (!lesson.title || lesson.title.trim().length === 0) {
    errors.push("Lesson title is required.");
  }

  if (!lesson.author || lesson.author.trim().length === 0) {
    errors.push("Original author/attribution is required.");
  }

  if (!Array.isArray(lesson.cards) || lesson.cards.length === 0) {
    errors.push("Lesson must contain at least one card.");
    return {
      isValid: false,
      errors,
      warnings,
      cardErrors,
    };
  }

  // Card count advisories
  if (lesson.cards.length < 3) {
    warnings.push(
      `Microlearning decks are most engaging with 3–8 cards. Currently has ${lesson.cards.length} card(s).`,
    );
  } else if (lesson.cards.length > 12) {
    warnings.push(
      `Long decks with ${lesson.cards.length} cards may cause cognitive fatigue. Consider splitting into two micro-lessons.`,
    );
  }

  let hasCheckpoint = false;
  const seenCardIds = new Set<string>();

  // Card-level validations
  lesson.cards.forEach((card, idx) => {
    const cErrors: string[] = [];

    // Unique ID check
    if (!card.id || card.id.trim().length === 0) {
      cErrors.push("Card must have a valid identifier.");
    } else if (seenCardIds.has(card.id)) {
      cErrors.push(`Duplicate card identifier detected: "${card.id}".`);
    } else {
      seenCardIds.add(card.id);
    }

    // Title check
    if (!card.title || card.title.trim().length === 0) {
      cErrors.push(`Card #${idx + 1} title cannot be empty.`);
    }

    // Content check
    if (!card.content || card.content.trim().length === 0) {
      cErrors.push(`Card #${idx + 1} content cannot be empty.`);
    }

    // Checkpoint validations
    if (card.type === "checkpoint") {
      hasCheckpoint = true;
      if (!card.checkpoint) {
        cErrors.push(
          `Card #${idx + 1} is marked as Checkpoint but missing checkpoint data.`,
        );
      } else {
        const cp = card.checkpoint;
        if (!cp.question || cp.question.trim().length === 0) {
          cErrors.push(`Checkpoint #${idx + 1} question cannot be empty.`);
        }

        if (!Array.isArray(cp.options) || cp.options.length < 2) {
          cErrors.push(
            `Checkpoint #${idx + 1} must have at least 2 answer options.`,
          );
        } else if (cp.options.length > 4) {
          cErrors.push(
            `Checkpoint #${idx + 1} cannot have more than 4 answer options.`,
          );
        } else {
          let correctCount = 0;
          const seenOptionIds = new Set<string>();

          cp.options.forEach((opt, optIdx) => {
            if (!opt.text || opt.text.trim().length === 0) {
              cErrors.push(
                `Option ${optIdx + 1} on Card #${idx + 1} cannot be empty.`,
              );
            }
            if (opt.isCorrect) {
              correctCount++;
            }
            if (opt.id) {
              if (seenOptionIds.has(opt.id)) {
                cErrors.push(
                  `Duplicate option ID "${opt.id}" in Card #${idx + 1}.`,
                );
              }
              seenOptionIds.add(opt.id);
            }
          });

          if (correctCount === 0) {
            cErrors.push(
              `Checkpoint #${idx + 1} must designate exactly one correct answer.`,
            );
          } else if (correctCount > 1) {
            cErrors.push(
              `Checkpoint #${idx + 1} has multiple correct answers. Please select exactly one.`,
            );
          }
        }

        if (!cp.explanation || cp.explanation.trim().length === 0) {
          cErrors.push(
            `Checkpoint #${idx + 1} must include an educational explanation.`,
          );
        }
      }
    }

    // Visual media validations
    if (card.visualMedia) {
      const mediaValidation = validateMediaSpec(card.visualMedia);
      if (!mediaValidation.valid) {
        cErrors.push(
          ...mediaValidation.errors.map(
            (e) => `Visual media error on Card #${idx + 1}: ${e}`,
          ),
        );
      }
    }

    if (cErrors.length > 0) {
      cardErrors[card.id] = cErrors;
      errors.push(...cErrors);
    }
  });

  if (!hasCheckpoint) {
    warnings.push(
      "Recommended: Add at least one comprehension checkpoint to test learner retention.",
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    cardErrors,
  };
}
